const { ItemMaster, Inventory, sequelize } = require('../models/sequelize');

// Set min/max stock levels for ST2 items
exports.setStockLevels = async (req, res) => {
  console.log('📊 setStockLevels CALLED');
  try {
    const { itemId } = req.params;
    const { minimumStock, maximumStock, reorderPoint, safetyStock, location } = req.body;
    
    // Get item details
    const item = await ItemMaster.findByPk(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    if (item.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Only approved items can have stock levels set'
      });
    }
    
    if (item.plannedStock !== 'Y') {
      return res.status(400).json({
        success: false,
        message: 'Stock levels can only be set for planned stock items (ST2)'
      });
    }
    
    // Validation
    if (minimumStock >= maximumStock) {
      return res.status(400).json({
        success: false,
        message: 'Maximum stock must be greater than minimum stock'
      });
    }
    
    if (reorderPoint && (reorderPoint < minimumStock || reorderPoint > maximumStock)) {
      return res.status(400).json({
        success: false,
        message: 'Reorder point must be between minimum and maximum stock levels'
      });
    }
    
    // Create or update stock levels
    const [stockLevels] = await sequelize.query(`
      INSERT INTO "StockLevels" 
      ("itemId", "itemNumber", "minimumStock", "maximumStock", "reorderPoint", "safetyStock", "location", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT ("itemId", "location") 
      DO UPDATE SET 
        "minimumStock" = $3,
        "maximumStock" = $4,
        "reorderPoint" = $5,
        "safetyStock" = $6,
        "updatedAt" = NOW()
      RETURNING *
    `, {
      bind: [
        itemId,
        item.itemNumber,
        minimumStock,
        maximumStock,
        reorderPoint || null,
        safetyStock || 0,
        location || 'MAIN'
      ]
    });
    
    console.log(`✅ Stock levels set for item ${item.itemNumber}`);
    
    res.status(200).json({
      success: true,
      data: stockLevels[0],
      message: 'Stock levels set successfully'
    });
    
  } catch (error) {
    console.error('❌ Error setting stock levels:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting stock levels',
      error: error.message
    });
  }
};

// Get stock levels for an item
exports.getStockLevels = async (req, res) => {
  console.log('📈 getStockLevels CALLED');
  try {
    const { itemId } = req.params;
    
    const stockLevels = await sequelize.query(`
      SELECT sl.*, i."currentStock", i.quantity as "currentQuantity",
             im."itemNumber", im."shortDescription", im."plannedStock"
      FROM "StockLevels" sl
      LEFT JOIN "Inventories" i ON sl."itemId" = i."itemId"
      LEFT JOIN "ItemMasters" im ON sl."itemId" = im.id
      WHERE sl."itemId" = $1
      ORDER BY sl.location
    `, {
      bind: [itemId]
    });
    
    console.log(`✅ Found ${stockLevels[0].length} stock level records`);
    
    res.status(200).json({
      success: true,
      data: stockLevels[0],
      message: `${stockLevels[0].length} stock level records found`
    });
    
  } catch (error) {
    console.error('❌ Error getting stock levels:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stock levels',
      error: error.message
    });
  }
};

// Get items that need reordering
exports.getReorderItems = async (req, res) => {
  console.log('🔔 getReorderItems CALLED');
  try {
    const reorderItems = await sequelize.query(`
      SELECT im."itemNumber", im."shortDescription", im."manufacturerName",
             sl."minimumStock", sl."maximumStock", sl."reorderPoint", sl.location,
             COALESCE(i.quantity, 0) as "currentStock",
             (sl."maximumStock" - COALESCE(i.quantity, 0)) as "suggestedOrderQuantity"
      FROM "StockLevels" sl
      LEFT JOIN "ItemMasters" im ON sl."itemId" = im.id
      LEFT JOIN "Inventories" i ON sl."itemId" = i."itemId" AND (i.location = sl.location OR i.location IS NULL)
      WHERE im.status = 'APPROVED' 
        AND im."plannedStock" = 'Y'
        AND COALESCE(i.quantity, 0) <= sl."reorderPoint"
      ORDER BY (sl."reorderPoint" - COALESCE(i.quantity, 0)) DESC
    `);
    
    console.log(`✅ Found ${reorderItems[0].length} items needing reorder`);
    
    res.status(200).json({
      success: true,
      data: reorderItems[0],
      count: reorderItems[0].length,
      message: `${reorderItems[0].length} items need reordering`
    });
    
  } catch (error) {
    console.error('❌ Error getting reorder items:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reorder items',
      error: error.message
    });
  }
};

// Update current stock quantity
exports.updateStockQuantity = async (req, res) => {
  console.log('📦 updateStockQuantity CALLED');
  try {
    const { itemId } = req.params;
    const { quantity, location, transactionType, notes } = req.body;
    
    // Get item details
    const item = await ItemMaster.findByPk(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    if (item.stockItem !== 'Y' && item.plannedStock !== 'Y') {
      return res.status(400).json({
        success: false,
        message: 'Stock updates only allowed for stock items (ST1/ST2)'
      });
    }
    
    // Update inventory
    const [inventory] = await sequelize.query(`
      INSERT INTO "Inventories" 
      ("itemId", quantity, location, "lastStockUpdate", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, NOW(), NOW(), NOW())
      ON CONFLICT ("itemId", location) 
      DO UPDATE SET 
        quantity = CASE 
          WHEN $4 = 'ADD' THEN "Inventories".quantity + $2
          WHEN $4 = 'SUBTRACT' THEN "Inventories".quantity - $2
          ELSE $2
        END,
        "lastStockUpdate" = NOW(),
        "updatedAt" = NOW()
      RETURNING *
    `, {
      bind: [itemId, quantity, location || 'MAIN', transactionType || 'SET']
    });
    
    // Log the transaction
    await sequelize.query(`
      INSERT INTO "StockTransactions" 
      ("itemId", "itemNumber", "transactionType", quantity, location, notes, "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, {
      bind: [
        itemId,
        item.itemNumber,
        transactionType || 'ADJUSTMENT',
        quantity,
        location || 'MAIN',
        notes || 'Manual stock update'
      ]
    });
    
    console.log(`✅ Stock updated for item ${item.itemNumber}: ${quantity}`);
    
    res.status(200).json({
      success: true,
      data: inventory[0],
      message: 'Stock quantity updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error updating stock quantity:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating stock quantity',
      error: error.message
    });
  }
};
