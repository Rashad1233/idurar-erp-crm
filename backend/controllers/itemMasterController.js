const { ItemMaster, User, UnspscCode, Inventory, sequelize } = require('../models/sequelize');
// Create models object with both capitalized and lowercase aliases
const models = {
  ItemMaster,
  itemmaster: ItemMaster,
  User,
  user: User,
  UnspscCode,
  unspsccode: UnspscCode,
  Inventory,
  inventory: Inventory
};// Updated to use Sequelize index
const { Op } = require('sequelize');

// Generate a unique temporary item number 
const generateTemporaryItemNumber = async () => {
  try {
    // Generate format: TEMP-YYYYMMDD-XXX
    const today = new Date();
    const dateStr = today.getFullYear().toString() + 
                   (today.getMonth() + 1).toString().padStart(2, '0') + 
                   today.getDate().toString().padStart(2, '0');
    
    // Find the latest temp number for today
    const latestItem = await ItemMaster.findOne({
      where: {
        itemNumber: {
          [Op.like]: `TEMP-${dateStr}-%`
        }
      },
      order: [['itemNumber', 'DESC']]
    });
    
    let sequence = 1;
    if (latestItem) {
      const lastNumber = latestItem.itemNumber;
      const lastSequence = parseInt(lastNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    const tempNumber = `TEMP-${dateStr}-${sequence.toString().padStart(3, '0')}`;
    console.log(`Generated temporary item number: ${tempNumber}`);
    return tempNumber;
  } catch (error) {
    console.error('Error generating temporary item number:', error);
    // Fallback to timestamp-based number
    return `TEMP-${Date.now()}`;
  }
};

// @desc    Create a new item master
// @route   POST /api/item  (assuming route changed from /api/inventory/item-master)
// @access  Private
exports.createItemMaster = async (req, res) => {
  try {
    console.log('Create Item Master Request Body:', req.body);
    console.log('Auth User:', req.user ? { id: req.user.id, email: req.user.email } : 'No user in request');
      const {
      itemNumber,
      shortDescription,
      longDescription,
      technicalDescription,
      standardDescription,
      manufacturerName,
      manufacturerPartNumber,
      equipmentCategory,
      equipmentSubCategory,
      unspscCodeId,
      unspscCode, // Also accept the code directly
      uom,
      equipmentTag,
      serialNumber,
      criticality,
      stockItem,
      plannedStock,
    } = req.body;

    // Validate required fields
    if (!shortDescription) {
      return res.status(400).json({ 
        success: false, 
        message: 'Short description is required' 
      });
    }

    if (!uom) {
      return res.status(400).json({ 
        success: false, 
        message: 'Unit of Measure (UOM) is required' 
      });
    }

    // Enhanced stock item handling
    const isStockItem = stockItem === 'Y' || stockItem === true;
    const isPlannedStock = plannedStock === 'Y' || plannedStock === true;
    
    // Validate stock item requirements
    if (isStockItem && !equipmentCategory) {
      return res.status(400).json({ 
        success: false, 
        message: 'Equipment category is required for stock items' 
      });    }    // Try to get or create UNSPSC code if we have a code but no ID
    let finalUnspscCodeId = unspscCodeId;
    
    if (unspscCode) {
      try {
        // ALWAYS look up the code in the database, even if we have an ID
        // This prevents foreign key constraint violations from stale/wrong IDs
        const existingCode = await UnspscCode.findOne({ 
          where: { code: unspscCode }
        });
        
        if (existingCode) {
          finalUnspscCodeId = existingCode.id;
          console.log(`✅ Found existing UNSPSC code: ${unspscCode}, ID: ${finalUnspscCodeId}`);
        } else {
          // Try to create the code with simplified descriptions
          console.log(`⚠️ UNSPSC code ${unspscCode} not found, creating new entry with simple descriptions...`);
          const segment = unspscCode.substring(0, 2);
          const family = unspscCode.substring(2, 4);
          const classCode = unspscCode.substring(4, 6);
          const commodity = unspscCode.substring(6, 8);
            const newCode = await UnspscCode.create({
            code: unspscCode,
            segment,
            family,
            class: classCode,
            commodity,
            title: unspscTitle || equipmentCategory || `UNSPSC Code: ${unspscCode}`,
            definition: shortDescription || 'No description provided',
            level: 'COMMODITY',
            isActive: true
          });
          
          finalUnspscCodeId = newCode.id;
          console.log(`✅ Created new UNSPSC code: ${unspscCode}, ID: ${finalUnspscCodeId}`);
        }
      } catch (unspscError) {
        console.error('❌ Error processing UNSPSC code:', unspscError);
        // Clear the unspscCodeId to prevent foreign key errors
        finalUnspscCodeId = null;
        console.log('⚠️ Continuing without UNSPSC code due to error');
      }
    }    // Generate temporary item number if not provided (do this only on save, not while typing)
    let finalItemNumber = itemNumber;
    if (!finalItemNumber) {
      finalItemNumber = await generateTemporaryItemNumber();
      console.log(`Generated temporary item number: ${finalItemNumber}`);
    }    // Set default values for required fields
    const itemData = {
      itemNumber: finalItemNumber,
      shortDescription,
      longDescription: longDescription || '',
      standardDescription: standardDescription || shortDescription,      manufacturerName: manufacturerName || 'N/A',
      manufacturerPartNumber: manufacturerPartNumber || 'N/A',
      equipmentCategory: equipmentCategory || 'OTHER', 
      equipmentSubCategory: equipmentSubCategory || '',
      unspscCode: unspscCode || '',
      uom,
      equipmentTag: equipmentTag || '',
      serialNumber: serialNumber || 'N',
      criticality: criticality || 'NO',
      stockItem: isStockItem ? 'Y' : 'N',
      plannedStock: isPlannedStock ? 'Y' : 'N',      status: 'DRAFT', // All new items start in DRAFT status for review workflow
      createdById: req.user?.id, // User ID is required
    };

    // Validate that we have a user ID
    if (!itemData.createdById) {
      return res.status(400).json({ 
        success: false, 
        message: 'User authentication required' 
      });
    }

    // Only set unspscCodeId if we have a valid ID
    if (finalUnspscCodeId) {
      itemData.unspscCodeId = finalUnspscCodeId;
    }

    console.log('Creating item master with data:', itemData);

    // Create the item master record
    const item = await ItemMaster.create(itemData);    console.log('Item master created successfully:', item.id);

    // ❌ REMOVED: Automatic inventory creation for stock items
    // Only approved items should have inventory records
    // Inventory will be created manually after approval via the inventory module
    
    console.log(`✅ Item master created with status: ${item.status}. Inventory creation will be available after approval.`);

    console.log('Final item master record:', item.toJSON());

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Error creating item master:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all item masters
// @route   GET /api/item
// @access  Private
exports.getItemMasters = async (req, res) => {
  try {
    const { 
      itemNumber, 
      description, 
      category,
      manufacturer,
      manufacturerPartNumber,
      search 
    } = req.query;
    
    const whereClause = {};
    
    // Apply filters if provided
    if (itemNumber) {
      whereClause.itemNumber = { [Op.like]: `%${itemNumber}%` };
    }
    
    if (description) {
      whereClause.description = { [Op.iLike]: `%${description}%` }; // Case-insensitive for PostgreSQL
    }
    
    if (category) {
      whereClause.category = { [Op.iLike]: `%${category}%` };
    }
    
    if (manufacturer) {
      whereClause.manufacturer = { [Op.iLike]: `%${manufacturer}%` };
    }
    
    if (manufacturerPartNumber) {
      whereClause.manufacturerPartNumber = { [Op.like]: `%${manufacturerPartNumber}%` };
    }
    
    if (search) {
      whereClause[Op.or] = [
        { itemNumber: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { manufacturer: { [Op.iLike]: `%${search}%` } },
        { manufacturerPartNumber: { [Op.iLike]: `%${search}%` } },
      ];
    }

    try {
      // First try with associations
      const items = await models.ItemMaster.findAll({
        where: whereClause,
        include: [
          { model: models.User, as: 'createdBy', attributes: ['id', 'name', 'email'], required: false },
          { model: models.User, as: 'updatedBy', attributes: ['id', 'name', 'email'], required: false }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        count: items.length,
        data: items
      });
    } catch (associationError) {
      console.error('❌ Error with associations:', associationError.message);
      
      // Fall back to direct SQL query
      const [rawItems] = await sequelize.query(`
        SELECT i.*, 
               c.name as "createdByName", c.email as "createdByEmail",
               u.name as "updatedByName", u.email as "updatedByEmail"
        FROM "ItemMasters" i
        LEFT JOIN "Users" c ON i."createdById" = c.id
        LEFT JOIN "Users" u ON i."updatedById" = u.id
        ORDER BY i."createdAt" DESC
      `);
      
      return res.status(200).json({
        success: true,
        count: rawItems.length,
        data: rawItems,
        note: 'Data retrieved via fallback direct SQL query'
      });
    }
  } catch (error) {
    console.error('Error fetching item masters:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching item masters',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get a single item master
// @route   GET /api/item/:id
// @access  Private
exports.getItemMaster = async (req, res) => {
  try {
    const item = await ItemMaster.findByPk(req.params.id, {
      include: [
        { model: User, as: 'createdBy', attributes: ['name', 'email'] },
        { model: User, as: 'reviewedBy', attributes: ['name', 'email'] },
        { model: User, as: 'approvedBy', attributes: ['name', 'email'] },
        { model: UnspscCode, as: 'unspsc' } // Include UNSPSC details
      ]
    });
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item master not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update an item master
// @route   PUT /api/item/:id
// @access  Private
exports.updateItemMaster = async (req, res) => {
  try {
    const item = await ItemMaster.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item master not found',
      });
    }
    
    // Check if user has permission to edit
    // Assuming permissions are stored in req.user.permissions as an object or array
    if (item.status !== 'DRAFT' && req.user.role !== 'admin' && (!req.user.permissions || !req.user.permissions.editItemMaster)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this item',
      });
    }

    const { unspscCodeId, ...updateData } = req.body;
    if (unspscCodeId) {
        const unspsc = await UnspscCode.findByPk(unspscCodeId);
        if (!unspsc) {
            return res.status(400).json({ success: false, message: 'Invalid UNSPSC code ID provided for update.' });
        }
        updateData.unspscCodeId = unspscCodeId;
    } else if (req.body.hasOwnProperty('unspscCodeId') && req.body.unspscCodeId === null) {
        // Allow unsetting UNSPSC code
        updateData.unspscCodeId = null;
    }
    
    // Update the item
    const [updatedRows] = await ItemMaster.update(updateData, {
      where: { id: req.params.id },
    });

    if (updatedRows === 0) {
        // This case might mean the item wasn't found or data was identical.
        // For robustness, re-fetch to confirm or send a specific message.
        // However, findByPk already confirmed existence.
    }

    const updatedItem = await ItemMaster.findByPk(req.params.id, {
        include: [
            { model: User, as: 'createdBy', attributes: ['name', 'email'] },
            { model: User, as: 'reviewedBy', attributes: ['name', 'email'] },
            { model: User, as: 'approvedBy', attributes: ['name', 'email'] },
            { model: UnspscCode, as: 'unspsc' }
        ]
    });
    
    res.status(200).json({
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Submit item master for review
// @route   PUT /api/item/:id/submit
// @access  Private
exports.submitItemMaster = async (req, res) => {
  try {
    const item = await ItemMaster.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item master not found',
      });
    }
    
    // Check if user is the creator or has permission
    if (item.createdById.toString() !== req.user.id.toString() && 
        req.user.role !== 'admin' && 
        (!req.user.permissions || !req.user.permissions.editItemMaster)) { // Assuming editItemMaster implies submit
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit this item',
      });
    }
    
    // Update status to pending review
    item.status = 'PENDING_REVIEW';
    await item.save();
    
    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Review and approve/reject an item master
// @route   PUT /api/item/:id/review
// @access  Private (requires reviewer role)
exports.reviewItemMaster = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, comments, stockCode, finalItemNumber } = req.body; // action: 'approve' or 'reject'
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "approve" or "reject"'
      });
    }

    const item = await ItemMaster.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    if (item.status !== 'DRAFT' && item.status !== 'PENDING_REVIEW') {
      return res.status(400).json({
        success: false,
        message: `Cannot review item with status: ${item.status}`
      });
    }

    if (action === 'approve') {      // Generate final item number if not provided
      let newItemNumber = finalItemNumber;
      if (!newItemNumber || item.itemNumber.startsWith('TEMP-')) {
        newItemNumber = generateFinalItemNumber(item);
      }

      // Determine stock code based on business rules
      let determinedStockCode = stockCode;
      if (!determinedStockCode) {
        if (item.plannedStock === 'Y') {
          determinedStockCode = 'ST2'; // Planned stock with min/max levels
        } else if (item.stockItem === 'Y') {
          determinedStockCode = 'ST1'; // Stock item but no planned levels
        } else {
          determinedStockCode = 'NS3'; // Non-stock item
        }
      }

      // Update item with approval
      await item.update({
        status: 'APPROVED',
        itemNumber: newItemNumber,
        stockCode: determinedStockCode,
        reviewComments: comments || '',
        reviewedById: req.user?.id || 1,
        reviewedAt: new Date(),
        approvedAt: new Date()
      });

      // If this is a stock item, ensure inventory record exists
      if (item.stockItem === 'Y') {
        try {
          const { Inventory } = require('../models/sequelize');
          
          const existingInventory = await Inventory.findOne({
            where: { itemMasterId: item.id }
          });

          if (!existingInventory) {
            await Inventory.create({
              itemMasterId: item.id,
              itemNumber: newItemNumber,
              currentStock: 0,
              physicalBalance: 0,
              reservedStock: 0,
              availableStock: 0,
              unitCost: 0,
              totalValue: 0,
              lastUpdated: new Date(),
              minimumLevel: 0,
              maximumLevel: 0,
              reorderPoint: 0,
              reorderQuantity: 0
            });
            console.log('Created inventory record for approved item:', newItemNumber);
          }
        } catch (inventoryError) {
          console.error('Error creating inventory for approved item:', inventoryError);
        }
      }

      res.json({
        success: true,
        message: `Item approved with final number: ${newItemNumber}`,
        result: {
          id: item.id,
          itemNumber: newItemNumber,
          stockCode: determinedStockCode,
          status: 'APPROVED'
        }
      });

    } else { // reject
      await item.update({
        status: 'REJECTED',
        reviewComments: comments || '',
        reviewedById: req.user?.id || 1,
        reviewedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Item rejected',
        result: {
          id: item.id,
          status: 'REJECTED',
          comments: comments
        }
      });
    }

  } catch (error) {
    console.error('Review item master error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reviewing item master',
      error: error.message
    });
  }
};

// @desc    Get items pending review
// @route   GET /api/item/pending-review
// @access  Private (requires reviewer role)
exports.getItemsPendingReview = async (req, res) => {
  console.log('🔥 WORKING getItemsPendingReview CALLED!');
  try {
    console.log('🚀 DEBUG: Function called successfully');
    
    const { page = 1, items: itemsPerPage = 20, category, criticality, search } = req.query;
    const offset = (page - 1) * itemsPerPage;
    
    console.log('Query params:', { page, itemsPerPage, category, criticality, search });
    
    // Build where conditions
    let whereConditions = [`i.status = 'PENDING_REVIEW'`];
    
    if (category) {
      whereConditions.push(`i."equipmentCategory" = '${category}'`);
    }
    
    if (criticality) {
      whereConditions.push(`i.criticality = '${criticality}'`);
    }
    
    if (search) {
      whereConditions.push(`(
        i."itemNumber" ILIKE '%${search}%' OR 
        i."shortDescription" ILIKE '%${search}%' OR 
        i."standardDescription" ILIKE '%${search}%' OR 
        i."manufacturerName" ILIKE '%${search}%' OR 
        i."manufacturerPartNumber" ILIKE '%${search}%'
      )`);
    }
    
    const whereClause = whereConditions.join(' AND ');
    console.log('📋 SQL WHERE clause:', whereClause);

    // Use direct SQL query
    const [rawItems] = await sequelize.query(`
      SELECT i.*, 
             c.name as "createdByName", c.email as "createdByEmail",
             r.name as "reviewedByName", r.email as "reviewedByEmail",
             u.name as "updatedByName", u.email as "updatedByEmail"
      FROM "ItemMasters" i
      LEFT JOIN "Users" c ON i."createdById" = c.id
      LEFT JOIN "Users" r ON i."reviewedById" = r.id
      LEFT JOIN "Users" u ON i."updatedById" = u.id
      WHERE ${whereClause}
      ORDER BY i."updatedAt" ASC, 
               CASE i.criticality 
                 WHEN 'HIGH' THEN 1 
                 WHEN 'MEDIUM' THEN 2 
                 WHEN 'LOW' THEN 3 
                 ELSE 4 
               END,
               i."createdAt" ASC
      LIMIT ${itemsPerPage} OFFSET ${offset}
    `);
    
    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM "ItemMasters" i
      WHERE ${whereClause}
    `);
    
    const totalCount = parseInt(countResult[0]?.count || 0);
    
    console.log(`✅ Found ${totalCount} items pending review, returning ${rawItems.length} items`);

    res.status(200).json({
      success: true,
      count: totalCount,
      data: rawItems,
      pagination: {
        page: parseInt(page),
        items: parseInt(itemsPerPage),
        total: totalCount,
        totalPages: Math.ceil(totalCount / itemsPerPage)
      },
      message: `${totalCount} items pending review`
    });

  } catch (error) {
    console.error('❌ Get pending review items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching items pending review',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
    const offset = (page - 1) * itemsPerPage;
    
    console.log('Query params:', { page, itemsPerPage, category, criticality, search });
    
    // Build where conditions for SQL - avoid associations
    let whereConditions = [`i.status = 'PENDING_REVIEW'`];
    
    if (category) {
      whereConditions.push(`i."equipmentCategory" = '${category}'`);
    }
    
    if (criticality) {
      whereConditions.push(`i.criticality = '${criticality}'`);
    }
    
    if (search) {
      whereConditions.push(`(
        i."itemNumber" ILIKE '%${search}%' OR 
        i."shortDescription" ILIKE '%${search}%' OR 
        i."standardDescription" ILIKE '%${search}%' OR 
        i."manufacturerName" ILIKE '%${search}%' OR 
        i."manufacturerPartNumber" ILIKE '%${search}%'
      )`);
    }
    
    const whereClause = whereConditions.join(' AND ');
    console.log('📋 SQL WHERE clause:', whereClause);

    // Use direct SQL query to avoid association issues
    const [rawItems] = await sequelize.query(`
      SELECT i.*, 
             c.name as "createdByName", c.email as "createdByEmail",
             r.name as "reviewedByName", r.email as "reviewedByEmail",
             u.name as "updatedByName", u.email as "updatedByEmail"
      FROM "ItemMasters" i
      LEFT JOIN "Users" c ON i."createdById" = c.id
      LEFT JOIN "Users" r ON i."reviewedById" = r.id
      LEFT JOIN "Users" u ON i."updatedById" = u.id
      WHERE ${whereClause}
      ORDER BY i."updatedAt" ASC, 
               CASE i.criticality 
                 WHEN 'HIGH' THEN 1 
                 WHEN 'MEDIUM' THEN 2 
                 WHEN 'LOW' THEN 3 
                 ELSE 4 
               END,
               i."createdAt" ASC
      LIMIT ${itemsPerPage} OFFSET ${offset}
    `);
    
    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM "ItemMasters" i
      WHERE ${whereClause}
    `);
    
    const totalCount = parseInt(countResult[0]?.count || 0);
    
    console.log(`✅ Found ${totalCount} items pending review, returning ${rawItems.length} items`);

    res.json({
      success: true,
      count: totalCount,
      data: rawItems,
      pagination: {
        page: parseInt(page),
        items: parseInt(itemsPerPage),
        total: totalCount,
        totalPages: Math.ceil(totalCount / itemsPerPage)
      },
      message: `${totalCount} items pending review`
    });

  } catch (error) {
    console.error('❌ Get pending review items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching items pending review',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Delete an item master
// @route   DELETE /api/inventory/item-master/:id
// @access  Private
exports.deleteItemMaster = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await ItemMaster.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if item is in use (has inventory records, purchase orders, etc.)
    // Only allow deletion of DRAFT items or items not yet in use
    if (item.status === 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete approved items. Items in use cannot be deleted for audit trail purposes.'
      });
    }

    // Check for related inventory records
    try {
      const { Inventory } = require('../models/sequelize');
      const inventoryRecords = await Inventory.findAll({
        where: { itemMasterId: id }
      });

      if (inventoryRecords.length > 0) {
        // Check if any have transactions
        const hasTransactions = inventoryRecords.some(inv => 
          inv.currentStock > 0 || inv.reservedStock > 0
        );

        if (hasTransactions) {
          return res.status(400).json({
            success: false,
            message: 'Cannot delete item with existing inventory transactions'
          });
        }

        // Delete inventory records if no transactions
        await Inventory.destroy({
          where: { itemMasterId: id }
        });
      }
    } catch (inventoryError) {
      console.error('Error checking inventory records:', inventoryError);
      // Continue with deletion even if inventory check fails
    }

    await item.destroy();

    res.json({
      success: true,
      message: 'Item master deleted successfully'
    });

  } catch (error) {
    console.error('Delete item master error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting item master',
      error: error.message
    });
  }
};

// @desc    Search item masters with advanced filtering
// @route   GET /api/item/search
// @access  Private
exports.searchItemMasters = async (req, res) => {
  try {
    const { 
      searchTerm = '', 
      searchType = 'description', 
      limit = 50 
    } = req.query;

    if (!searchTerm || searchTerm.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search term must be at least 2 characters long'
      });
    }

    let whereClause = {};

    // Define search logic based on type
    switch (searchType) {
      case 'number':
        // Exact match for item numbers
        whereClause = {
          itemNumber: {
            [Op.iLike]: `%${searchTerm}%`
          }
        };
        break;

      case 'description':
        // Search in both short and long descriptions
        whereClause = {
          [Op.or]: [
            { shortDescription: { [Op.iLike]: `%${searchTerm}%` } },
            { longDescription: { [Op.iLike]: `%${searchTerm}%` } },
            { standardDescription: { [Op.iLike]: `%${searchTerm}%` } }
          ]
        };
        break;

      case 'partNumber':
        // Search manufacturer part numbers
        whereClause = {
          manufacturerPartNumber: {
            [Op.iLike]: `%${searchTerm}%`
          }
        };
        break;

      case 'manufacturer':
        // Search manufacturer names
        whereClause = {
          manufacturerName: {
            [Op.iLike]: `%${searchTerm}%`
          }
        };
        break;

      case 'category':
        // Search equipment categories
        whereClause = {
          [Op.or]: [
            { equipmentCategory: { [Op.iLike]: `%${searchTerm}%` } },
            { equipmentSubCategory: { [Op.iLike]: `%${searchTerm}%` } }
          ]
        };
        break;

      default:
        // General search across multiple fields
        whereClause = {
          [Op.or]: [
            { itemNumber: { [Op.iLike]: `%${searchTerm}%` } },
            { shortDescription: { [Op.iLike]: `%${searchTerm}%` } },
            { longDescription: { [Op.iLike]: `%${searchTerm}%` } },
            { manufacturerName: { [Op.iLike]: `%${searchTerm}%` } },
            { manufacturerPartNumber: { [Op.iLike]: `%${searchTerm}%` } }
          ]
        };
    }

    const items = await ItemMaster.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: UnspscCode,
          as: 'unspscCodeDetails',
          attributes: ['id', 'code', 'title', 'description']
        }
      ],
      limit: parseInt(limit),
      order: [
        // Prioritize exact matches in item number and part number
        ...(searchType === 'number' ? [['itemNumber', 'ASC']] : []),
        ...(searchType === 'partNumber' ? [['manufacturerPartNumber', 'ASC']] : []),
        ['shortDescription', 'ASC']
      ]
    });

    const formattedItems = items.map(item => ({
      id: item.id,
      itemNumber: item.itemNumber,
      shortDescription: item.shortDescription,
      longDescription: item.longDescription,
      standardDescription: item.standardDescription,
      technicalDescription: item.technicalDescription,
      manufacturerName: item.manufacturerName,
      manufacturerPartNumber: item.manufacturerPartNumber,
      equipmentCategory: item.equipmentCategory,
      equipmentSubCategory: item.equipmentSubCategory,
      uom: item.uom,
      equipmentTag: item.equipmentTag,
      serialNumber: item.serialNumber,
      criticality: item.criticality,
      stockItem: item.stockItem,
      plannedStock: item.plannedStock,
      stockCode: item.stockCode,
      status: item.status,
      unspscCode: item.unspscCode,
      contractNumber: item.contractNumber,
      supplierName: item.supplierName,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      createdBy: item.createdBy,
      unspscCodeDetails: item.unspscCodeDetails
    }));

    // Log search analytics
    console.log(`🔍 Item search: "${searchTerm}" (type: ${searchType}) - ${items.length} results`);

    // Return appropriate message based on search type and results
    let message = '';
    if (formattedItems.length === 0) {
      message = `No items found matching "${searchTerm}"`;
    } else if (searchType === 'number' && formattedItems.length === 1) {
      message = `Found unique item for number "${searchTerm}"`;
    } else if (searchType === 'partNumber' && formattedItems.length === 1) {
      message = `Found unique item for part number "${searchTerm}"`;
    } else {
      message = `Found ${formattedItems.length} item(s) matching "${searchTerm}"`;
    }

    res.json({
      success: true,
      result: formattedItems,
      pagination: {
        total: formattedItems.length,
        limit: parseInt(limit),
        searchTerm,
        searchType,
        isUniqueResult: (searchType === 'number' || searchType === 'partNumber') && formattedItems.length === 1
      },
      message
    });

  } catch (error) {
    console.error('Search item masters error:', error);
    res.status(500).json({      success: false,
      message: 'Error searching item masters',
      error: error.message
    });
  }
};

// @desc    Get items pending review
// @route   GET /api/item/pending-review
// @access  Private (Reviewers only)
const getPendingReviewItems = async (req, res) => {
  try {
    console.log('� DEBUG: getPendingReviewItems function called!');
    console.log('�📋 Fetching items pending review...');
    
    const { page = 1, items: itemsPerPage = 20, category, criticality, search } = req.query;
    const offset = (page - 1) * itemsPerPage;
    
    // Build where conditions for SQL
    let whereConditions = [`i.status = 'PENDING_REVIEW'`];
    
    if (category) {
      whereConditions.push(`i."equipmentCategory" = '${category}'`);
    }
    
    if (criticality) {
      whereConditions.push(`i.criticality = '${criticality}'`);
    }
    
    if (search) {
      whereConditions.push(`(
        i."itemNumber" ILIKE '%${search}%' OR 
        i."shortDescription" ILIKE '%${search}%' OR 
        i."standardDescription" ILIKE '%${search}%' OR 
        i."manufacturerName" ILIKE '%${search}%' OR 
        i."manufacturerPartNumber" ILIKE '%${search}%'
      )`);
    }
    
    const whereClause = whereConditions.join(' AND ');

    console.log('📋 SQL WHERE clause:', whereClause);

    // Use direct SQL query for better reliability
    const [rawItems] = await sequelize.query(`
      SELECT i.*, 
             c.name as "createdByName", c.email as "createdByEmail",
             r.name as "reviewedByName", r.email as "reviewedByEmail",
             u.name as "updatedByName", u.email as "updatedByEmail"
      FROM "ItemMasters" i
      LEFT JOIN "Users" c ON i."createdById" = c.id
      LEFT JOIN "Users" r ON i."reviewedById" = r.id
      LEFT JOIN "Users" u ON i."updatedById" = u.id
      WHERE ${whereClause}
      ORDER BY i."updatedAt" ASC, 
               CASE i.criticality 
                 WHEN 'HIGH' THEN 1 
                 WHEN 'MEDIUM' THEN 2 
                 WHEN 'LOW' THEN 3 
                 ELSE 4 
               END,
               i."createdAt" ASC
      LIMIT ${itemsPerPage} OFFSET ${offset}
    `);
    
    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM "ItemMasters" i
      WHERE ${whereClause}
    `);
    
    const totalCount = parseInt(countResult[0].count);
    
    console.log(`✅ Found ${totalCount} items pending review, returning ${rawItems.length} items`);
    
    return res.status(200).json({
      success: true,
      count: totalCount,
      data: rawItems,
      pagination: {
        page: parseInt(page),
        items: parseInt(itemsPerPage),
        total: totalCount,
        totalPages: Math.ceil(totalCount / itemsPerPage)
      },
      message: `${totalCount} items pending review`
    });
    
  } catch (error) {
    console.error('❌ Error fetching pending review items:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching pending review items',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Generate final item number based on category
// @route   Private function (used internally)
const generateFinalItemNumber = (item) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const category = (item.equipmentCategory || 'ITEM').toUpperCase();
  const subCategory = (item.equipmentSubCategory || '').toUpperCase();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  if (subCategory) {
    return `${category}-${subCategory}-${year}${month}${day}-${random}`;
  } else {
    return `${category}-${year}${month}${day}-${random}`;
  }
};

module.exports = {
  createItemMaster: exports.createItemMaster,
  getItemMasters: exports.getItemMasters,
  getItemMaster: exports.getItemMaster,
  updateItemMaster: exports.updateItemMaster,
  submitItemMaster: exports.submitItemMaster,
  reviewItemMaster: exports.reviewItemMaster,
  getItemsPendingReview: exports.getItemsPendingReview,
  deleteItemMaster: exports.deleteItemMaster,
  searchItemMasters: exports.searchItemMasters
};
