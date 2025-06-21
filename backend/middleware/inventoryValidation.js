const { ItemMaster, Inventory, sequelize } = require('../models/sequelize');

// Middleware to validate item is approved before inventory operations
exports.validateApprovedItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }

    // Check if item exists and is approved
    const item = await ItemMaster.findByPk(itemId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    if (item.status !== 'APPROVED') {
      return res.status(403).json({
        success: false,
        message: `Only approved items can be added to inventory. Current status: ${item.status}`,
        data: {
          itemId: item.id,
          itemNumber: item.itemNumber,
          currentStatus: item.status,
          requiredStatus: 'APPROVED'
        }
      });
    }

    // Attach item to request for use in controller
    req.validatedItem = item;
    next();
    
  } catch (error) {
    console.error('❌ Item validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating item status',
      error: error.message
    });
  }
};

// Validate item for min/max level configuration (must be approved AND planned stock)
exports.validatePlannedStockItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }

    // Check if item exists, is approved, and is planned stock
    const item = await ItemMaster.findByPk(itemId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    if (item.status !== 'APPROVED') {
      return res.status(403).json({
        success: false,
        message: `Only approved items can have min/max levels configured. Current status: ${item.status}`,
        data: {
          itemId: item.id,
          itemNumber: item.itemNumber,
          currentStatus: item.status,
          requiredStatus: 'APPROVED'
        }
      });
    }

    if (item.plannedStock !== 'Y') {
      return res.status(403).json({
        success: false,
        message: 'Only planned stock items (ST2) can have min/max levels configured',
        data: {
          itemId: item.id,
          itemNumber: item.itemNumber,
          currentStockType: item.plannedStock === 'Y' ? 'ST2' : (item.stockItem === 'Y' ? 'ST1' : 'NS3'),
          requiredStockType: 'ST2 (Planned Stock)'
        }
      });
    }

    // Attach item to request for use in controller
    req.validatedItem = item;
    next();
    
  } catch (error) {
    console.error('❌ Planned stock validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating item for min/max configuration',
      error: error.message
    });
  }
};

// Get approved items eligible for inventory
exports.getApprovedItemsForInventory = async (req, res) => {
  try {
    const { search, stockType, category } = req.query;
    
    let whereClause = 'i.status = \'APPROVED\'';
    
    // Filter by stock type
    if (stockType) {
      switch (stockType) {
        case 'ST1':
          whereClause += ' AND i."stockItem" = \'Y\' AND i."plannedStock" != \'Y\'';
          break;
        case 'ST2':
          whereClause += ' AND i."plannedStock" = \'Y\'';
          break;
        case 'NS3':
          whereClause += ' AND i."stockItem" != \'Y\'';
          break;
      }
    }
    
    // Filter by category
    if (category) {
      whereClause += ` AND i."equipmentCategory" = '${category}'`;
    }
    
    // Search filter
    if (search) {
      whereClause += ` AND (
        i."itemNumber" ILIKE '%${search}%' OR 
        i."shortDescription" ILIKE '%${search}%' OR 
        i."manufacturerName" ILIKE '%${search}%' OR 
        i."manufacturerPartNumber" ILIKE '%${search}%'
      )`;
    }

    const [items] = await sequelize.query(`
      SELECT 
        i.*,
        CASE 
          WHEN i."plannedStock" = 'Y' THEN 'ST2'
          WHEN i."stockItem" = 'Y' THEN 'ST1'
          ELSE 'NS3'
        END as "stockCode",
        CASE 
          WHEN inv.id IS NOT NULL THEN true
          ELSE false
        END as "hasInventoryRecord"
      FROM "ItemMasters" i
      LEFT JOIN "Inventories" inv ON i.id = inv."itemId"
      WHERE ${whereClause}
      ORDER BY i."itemNumber" ASC
      LIMIT 100
    `);

    console.log(`✅ Found ${items.length} approved items eligible for inventory`);

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
      message: `Found ${items.length} approved items eligible for inventory`
    });

  } catch (error) {
    console.error('❌ Get approved items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching approved items for inventory',
      error: error.message
    });
  }
};

// Validate item before any inventory operation
exports.validateInventoryOperation = async (itemId, operation) => {
  try {
    const item = await ItemMaster.findByPk(itemId);
    
    if (!item) {
      return {
        valid: false,
        error: 'Item not found',
        code: 'ITEM_NOT_FOUND'
      };
    }

    if (item.status !== 'APPROVED') {
      return {
        valid: false,
        error: `Only approved items can be used for ${operation}. Current status: ${item.status}`,
        code: 'ITEM_NOT_APPROVED',
        data: {
          itemId: item.id,
          itemNumber: item.itemNumber,
          currentStatus: item.status
        }
      };
    }

    // Additional validation for min/max operations
    if (operation === 'min-max-config' && item.plannedStock !== 'Y') {
      return {
        valid: false,
        error: 'Only planned stock items (ST2) can have min/max levels configured',
        code: 'NOT_PLANNED_STOCK',
        data: {
          itemId: item.id,
          itemNumber: item.itemNumber,
          stockType: item.plannedStock === 'Y' ? 'ST2' : (item.stockItem === 'Y' ? 'ST1' : 'NS3')
        }
      };
    }

    return {
      valid: true,
      item: item
    };
    
  } catch (error) {
    return {
      valid: false,
      error: 'Database error during validation',
      code: 'DATABASE_ERROR',
      details: error.message
    };
  }
};
