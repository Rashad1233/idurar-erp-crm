const db = require('../models/sequelize/index');
const { Inventory, ItemMaster, ReorderRequest, ReorderRequestItem, User, UnspscCode } = db;
// Create models object with both capitalized and lowercase aliases
const models = {
  Inventory: db.Inventory,
  inventory: db.Inventory,
  ItemMaster: db.ItemMaster,
  itemmaster: db.ItemMaster,
  ReorderRequest: db.ReorderRequest,
  reorderrequest: db.ReorderRequest,
  ReorderRequestItem: db.ReorderRequestItem,
  reorderrequestitem: db.ReorderRequestItem,
  StorageLocation: db.StorageLocation,
  storagelocation: db.StorageLocation,
  BinLocation: db.BinLocation,
  binlocation: db.BinLocation,
  User: db.User,
  user: db.User,
  UnspscCode: db.UnspscCode,
  unspsccode: db.UnspscCode
};// Updated to use sequelize index
const { Op } = require('sequelize');
const reorderRequestController = require('./reorderRequestController');
const { sequelize } = require('../config/db');

// Export reorder functions from reorderRequestController
exports.scanReorderItems = reorderRequestController.scanReorderItems;
exports.createReorderRequest = reorderRequestController.createReorderRequest;
exports.submitReorderRequest = reorderRequestController.submitReorderRequest;
exports.approveReorderRequest = reorderRequestController.approveReorderRequest;
exports.cancelReorderRequest = reorderRequestController.cancelReorderRequest;
exports.getReorderRequests = reorderRequestController.getReorderRequests;
exports.getReorderRequest = reorderRequestController.getReorderRequest;

// @desc    Create inventory record for an item master
// @route   POST /api/inventory
// @access  Private
exports.createInventory = async (req, res) => {
  try {    const {
      itemMasterId,
      physicalBalance,
      unitPrice,
      condition,
      minimumLevel,
      maximumLevel,
      storageLocationId,
      binLocationId,
      binLocationText,
      warehouse,
      serialNumber
    } = req.body;

    // Debug - log all incoming data
    console.log('Creating inventory with data:', JSON.stringify(req.body, null, 2));
    console.log('User info:', req.user ? JSON.stringify({id: req.user.id, name: req.user.name}) : 'No user found');

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. User ID not found.'
      });
    }    // Check if item master exists
    const itemMaster = await models.ItemMaster.findByPk(itemMasterId);
    if (!itemMaster) {
      return res.status(404).json({
        success: false,
        message: 'Item master not found',
      });
    }

    // ✅ VALIDATION: Only approved items can be added to inventory
    if (itemMaster.status !== 'APPROVED') {
      console.log(`❌ Inventory creation blocked: Item ${itemMaster.itemNumber} status is ${itemMaster.status}, not APPROVED`);
      return res.status(403).json({
        success: false,
        message: `Cannot create inventory for non-approved items. Item status: ${itemMaster.status}`,
        error: 'ITEM_NOT_APPROVED',
        data: {
          itemId: itemMaster.id,
          itemNumber: itemMaster.itemNumber,
          currentStatus: itemMaster.status,
          requiredStatus: 'APPROVED',
          shortDescription: itemMaster.shortDescription
        }
      });
    }

    console.log(`✅ Item ${itemMaster.itemNumber} is approved, proceeding with inventory creation`);    // Check if storage location exists (only if StorageLocation model is available)
    if (storageLocationId && models.StorageLocation) {
      const storageLocation = await models.StorageLocation.findByPk(storageLocationId);
      if (!storageLocation) {
        return res.status(404).json({
          success: false,
          message: 'Storage location not found',
        });
      }
    } else if (storageLocationId && !models.StorageLocation) {
      console.warn('StorageLocation model not available, skipping storage location validation');
    }// Generate inventory number based on item number with a timestamp to ensure uniqueness
    const timestamp = new Date().getTime();
    const inventoryNumber = `INV-${itemMaster.itemNumber}-${timestamp}`;
    
    console.log('Creating inventory with number:', inventoryNumber);      // Prepare inventory data with defaults for nullable fields
    const inventoryData = {
      itemMasterId,
      itemId: itemMasterId, // Add both for compatibility with different models
      inventoryNumber,
      physicalBalance: physicalBalance !== undefined ? physicalBalance : 0,
      unitPrice,
      condition: condition || 'A',
      minimumLevel: minimumLevel !== undefined ? minimumLevel : 0,
      maximumLevel: maximumLevel !== undefined ? maximumLevel : 0,
      storageLocationId,
      binLocationId,
      binLocationText,
      warehouse,
      serialNumber,
      lastUpdatedById: req.user.id,
    };
    
    // Filter out undefined values
    Object.keys(inventoryData).forEach(key => 
      inventoryData[key] === undefined && delete inventoryData[key]
    );
    
    console.log('Final inventory data being saved:', JSON.stringify(inventoryData, null, 2));
    
    // Create new inventory record
    const inventory = await models.Inventory.create(inventoryData);res.status(201).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error('Error creating inventory:', error);
    console.error('Error stack:', error.stack);
    
    // Log detailed information about the request
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    console.error('User info:', req.user ? JSON.stringify({id: req.user.id, name: req.user.name}) : 'No user found');
    
    // Check for Sequelize validation errors
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      console.error('Validation error details:', JSON.stringify(error.errors, null, 2));
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message,
          value: e.value
        }))
      });
    }
    
    // Handle null constraint violations
    if (error.name === 'SequelizeDatabaseError' && error.message.includes('null')) {
      console.error('Database error - likely null constraint violation');
      const fieldMatch = error.message.match(/"([^"]+)" cannot be null/);
      const field = fieldMatch ? fieldMatch[1] : 'unknown field';
      
      return res.status(400).json({
        success: false,
        message: `Required field missing: ${field} cannot be null`,
        errorDetail: error.message,
        errorName: error.name
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message,
      errorName: error.name,
      errorDetail: error.original ? error.original.detail : null
    });
  }
};

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
exports.getInventoryItems = async (req, res) => {
  try {
    // Extract search parameters from query
    const {
      inventoryNumber,
      description,
      manufacturerName,
      unspscCode,
      criticality,
      condition,
      warehouse,
      belowMinimum,
      stockLevel,
      page = 1,
      limit = 20
    } = req.query;

    // Create where clauses for both inventory and item master
    const inventoryWhere = {};
    const itemMasterWhere = {};

    // Build where clauses based on query parameters
    if (inventoryNumber) {
      inventoryWhere.inventoryNumber = { [Op.like]: `%${inventoryNumber}%` };
    }

    if (condition) {
      inventoryWhere.condition = condition;
    }

    if (warehouse) {
      inventoryWhere.warehouse = warehouse;
    }

    if (description) {
      itemMasterWhere.shortDescription = { [Op.like]: `%${description}%` };
    }

    if (manufacturerName) {
      itemMasterWhere.manufacturerName = { [Op.like]: `%${manufacturerName}%` };
    }

    if (unspscCode) {
      itemMasterWhere.unspscCode = { [Op.like]: `%${unspscCode}%` };
    }

    if (criticality) {
      itemMasterWhere.criticality = criticality;
    }    // Stock level filters
    if (stockLevel === 'belowMin') {
      // Use a where condition with literal SQL for column comparison
      inventoryWhere.physicalBalance = sequelize.literal('"physicalBalance" < "minimumLevel"');
    } else if (stockLevel === 'aboveMax') {
      // Use a where condition with literal SQL for column comparison
      inventoryWhere.physicalBalance = sequelize.literal('"physicalBalance" > "maximumLevel"');
    } else if (stockLevel === 'zeroBalance') {
      inventoryWhere.physicalBalance = 0;
    } else if (stockLevel === 'negativeBalance') {
      inventoryWhere.physicalBalance = { [Op.lt]: 0 };
    }

    // Pagination
    const offset = (page - 1) * limit;    // Find inventory items with pagination - using direct SQL to avoid association issues
    try {
      console.log('Attempting to use findAndCountAll with associations...');
      const { count, rows } = await models.Inventory.findAndCountAll({
        where: inventoryWhere,
        include: [
          {
            model: models.ItemMaster,
            as: 'item',
            where: Object.keys(itemMasterWhere).length ? itemMasterWhere : undefined,
            attributes: ['id', 'itemNumber', 'description', 'uom', 'category', 'subcategory']
          }
        ],        limit: parseInt(limit),
        offset: offset,
        order: [['createdAt', 'DESC']]
      });
      
      // Calculate pagination info
      const totalPages = Math.ceil(count / limit);
  
      return res.status(200).json({
        success: true,
        count,
        totalPages,
        currentPage: page,
        data: rows
      });
    } catch (error) {
      console.error('Error with Sequelize associations, falling back to direct SQL:', error);
      
      // Fallback to direct SQL if there's an association error
      const { sequelize } = require('../models/sequelize');      const [inventoryItems, metadata] = await sequelize.query(`
        SELECT 
          i.*, 
          im."itemNumber", 
          im."shortDescription" as "itemDescription", 
          im."uom", 
          im."equipmentCategory" as "category", 
          im."equipmentSubCategory" as "subcategory"
        FROM 
          "Inventories" i
        LEFT JOIN 
          "ItemMasters" im ON i."itemMasterId" = im.id
        ORDER BY 
          i."createdAt" DESC
        LIMIT ${limit} OFFSET ${offset}
      `);
        // Get total count for pagination
      const [countResult] = await sequelize.query(`
        SELECT COUNT(*) as total FROM "Inventories"
      `);
      
      const totalCount = parseInt(countResult[0].total);
      const totalPages = Math.ceil(totalCount / limit);
      
      return res.status(200).json({
        success: true,
        count: totalCount,
        totalPages,
        currentPage: page,
        data: inventoryItems,
        note: 'Data retrieved using direct SQL due to association issues'
      });
    }
  } catch (error) {
    console.error('Error getting inventory items:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get inventory items',
      error: error.message
    });
  }
};

// @desc    Get a single inventory item
// @route   GET /api/inventory/:id
// @access  Private
exports.getInventoryItem = async (req, res) => {
  try {
    const inventory = await models.Inventory.findByPk(req.params.id, {
      include: [        {
          model: ItemMaster,
          as: 'itemMaster',
          attributes: ['itemNumber', 'shortDescription', 'manufacturerName', 'manufacturerPartNumber', 'equipmentCategory', 'criticality', 'unspscCode'],
          include: [
            {
              model: UnspscCode,
              as: 'unspsc',
              attributes: ['id', 'code', 'title']
            }
          ]
        },
        {
          model: StorageLocation,
          as: 'storageLocation',
          attributes: ['code', 'description'],
        },        {
          model: User,
          as: 'lastUpdatedBy',
          attributes: ['name', 'email'],
        }
      ]
    });
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update an inventory item
// @route   PUT /api/inventory/:id
// @access  Private
exports.updateInventoryItem = async (req, res) => {
  try {
    const inventory = await models.Inventory.findByPk(req.params.id);
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }
      // Check if user has permission to update inventory
    // Assuming permissions are stored in req.user.permissions as an object or array
    if (req.user.role !== 'admin' && (!req.user.permissions || !req.user.permissions.setInventoryLevels)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update inventory',
      });
    }
    
    // Update last updated by
    req.body.lastUpdatedById = req.user.id; // Corrected: Using lastUpdatedById instead of lastUpdatedBy
    
    // Update inventory item
    const [updatedRows] = await models.Inventory.update(req.body, {
      where: { id: req.params.id },
    });

    if (updatedRows === 0) {
        // Should not happen if findByPk succeeded, but good for robustness
        return res.status(404).json({
            success: false,
            message: 'Inventory item not found for update or no changes made.',
        });
    }

    const updatedInventory = await models.Inventory.findByPk(req.params.id, {
        include: [
            { model: ItemMaster, as: 'itemMaster', attributes: ['itemNumber', 'shortDescription', 'manufacturerName', 'manufacturerPartNumber'] },            { model: StorageLocation, as: 'storageLocation', attributes: ['code', 'description'] },
            { model: User, as: 'lastUpdatedBy', attributes: ['name', 'email'] }
        ]
    });
    
    res.status(200).json({
      success: true,
      data: updatedInventory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Generate reorder request based on min/max levels
// @route   POST /api/inventory/reorder-request
// @access  Private
exports.createReorderRequest = async (req, res) => {
  try {
    const { storageLocationId } = req.body;
    
    if (!storageLocationId) {
      return res.status(400).json({
        success: false,
        message: 'Storage location ID is required',
      });    }
    
    // Check if storage location exists (only if StorageLocation model is available)
    if (!models.StorageLocation) {
      return res.status(500).json({
        success: false,
        message: 'StorageLocation model not available',
      });
    }
    
    const storageLocation = await models.StorageLocation.findByPk(storageLocationId);
    if (!storageLocation) {
      return res.status(404).json({
        success: false,
        message: 'Storage location not found',
      });
    }
      // Find all inventory items for this storage location that need reordering
    const inventoryItems = await models.Inventory.findAll({
      where: {
        storageLocationId: storageLocationId,
        physicalBalance: { [Op.lt]: sequelize.col('minimumLevel') } // physicalBalance < minimumLevel
      },
      include: [
        {
          model: ItemMaster,
          as: 'itemMaster',
          attributes: ['itemNumber', 'shortDescription'],
        }
      ]
    });
    
    if (inventoryItems.length === 0) {
      return res.status(200).json({ // Changed to 200 as it's not an error, just no items to reorder
        success: true,
        message: 'No items require reordering at this location',
        data: []
      });
    }
    
    // Create reorder request
    const reorderRequest = await ReorderRequest.create({
      storageLocationId,
      items: inventoryItems.map(item => ({
        inventoryId: item.id, // Corrected: Sequelize uses foreign key name directly
        currentQuantity: item.physicalBalance,
        minimumLevel: item.minimumLevel,
        maximumLevel: item.maximumLevel,
        reorderQuantity: item.maximumLevel - item.physicalBalance,
      })),
      status: 'DRAFT',
      createdById: req.user.id, // Corrected: Assuming req.user.id and matching association
    });
    
    // Populate the response
    const populatedRequest = await ReorderRequest.findByPk(reorderRequest.id, {
        include: [
            {
                model: Inventory, // This assumes ReorderRequest has a direct association or through a junction table
                as: 'items', // Alias for the association
                include: [
                    { model: ItemMaster, as: 'itemMaster', attributes: ['itemNumber', 'shortDescription'] }
                ]
            },
            { model: StorageLocation, as: 'storageLocation', attributes: ['code', 'description'] },
            { model: User, as: 'createdBy', attributes: ['name', 'email'] }
        ]
    });
    
    res.status(201).json({
      success: true,
      data: populatedRequest,
    });
  } catch (error) {
    console.error("Error in createReorderRequest:", error); // Added console log for debugging
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all reorder requests
// @route   GET /api/inventory/reorder-requests
// @access  Private
exports.getReorderRequests = async (req, res) => {
  try {
    const { status, storageLocationId } = req.query;
    let whereClause = {};

    if (status) {
      whereClause.status = status;
    }
    if (storageLocationId) {
      whereClause.storageLocationId = storageLocationId;
    }

    const reorderRequests = await ReorderRequest.findAll({
      where: whereClause,
      include: [
        {
          model: StorageLocation,
          as: 'storageLocation',
          attributes: ['code', 'description'],
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['name', 'email'],
        },
        // Assuming 'items' in ReorderRequest refers to an association that includes Inventory details
        // This might need a through model (e.g., ReorderRequestItem) if it's a many-to-many relationship
        // For now, let's assume 'items' is a direct JSONB or similar field, or a one-to-many where ReorderRequestItem has inventoryId
        // If 'items' is an association to another table (e.g. ReorderRequestItems which then links to Inventory)
        // then the include structure needs to be:
        // { model: ReorderRequestItem, as: 'requestItems', include: [{ model: Inventory, as: 'inventoryDetails', include: [ItemMaster] }] }
        // For simplicity, if 'items' is a JSONB field as per the createReorderRequest, direct population isn't standard.
        // We will fetch the ReorderRequest and then manually enrich the items if needed, or adjust the model.
        // For now, this will fetch the ReorderRequest and its direct associations.
        // The 'items' field as structured in createReorderRequest is an array of objects, not a direct Sequelize association.
        // To properly populate this, you'd typically have a ReorderRequestItem model.
      ],
      order: [['createdAt', 'DESC']],
    });

    // If 'items' in ReorderRequest is a JSONB field storing inventory details,
    // and you need to populate ItemMaster for each item in that JSONB array,
    // you would iterate through reorderRequests and their items, then fetch ItemMaster for each.
    // This is less efficient than a proper relational setup.

    res.status(200).json({
      success: true,
      count: reorderRequests.length,
      data: reorderRequests,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// @desc    Get a single reorder request
// @route   GET /api/inventory/reorder-requests/:id
// @access  Private
exports.getReorderRequest = async (req, res) => {
  try {
    const reorderRequest = await ReorderRequest.findByPk(req.params.id, {
      include: [
        {
          model: StorageLocation,
          as: 'storageLocation',
          attributes: ['code', 'description'],
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['name', 'email'],
        },
        // Similar to getReorderRequests, handling 'items' depends on its structure.
        // If ReorderRequest has many ReorderRequestItems, and ReorderRequestItem belongs to Inventory:
        // { model: ReorderRequestItem, as: 'requestItems', include: [{ model: Inventory, as: 'inventory', include: [{model: ItemMaster, as: 'itemMaster'}] }] }
      ]
    });

    if (!reorderRequest) {
      return res.status(404).json({
        success: false,
        message: 'Reorder request not found',
      });
    }
    
    // If 'items' is a JSONB field and needs manual population:
    // Example:
    // if (reorderRequest.items && Array.isArray(reorderRequest.items)) {
    //   for (let i = 0; i < reorderRequest.items.length; i++) {
    //     const itemDetail = reorderRequest.items[i];
    //     if (itemDetail.inventoryId) { // Assuming inventoryId is stored
    //       const inventoryRecord = await models.Inventory.findByPk(itemDetail.inventoryId, {
    //         include: [{ model: ItemMaster, as: 'itemMaster' }]
    //       });
    //       itemDetail.inventoryDetails = inventoryRecord; // Manually add inventory details
    //     }
    //   }
    // }
    
    res.status(200).json({
      success: true,
      data: reorderRequest,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update reorder request status
// @route   PUT /api/inventory/reorder-requests/:id/status
// @access  Private
exports.updateReorderRequestStatus = async (req, res) => {
  try {
    const { status, comments } = req.body;

    if (!['SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status provided.',
      });
    }

    const reorderRequest = await ReorderRequest.findByPk(req.params.id);

    if (!reorderRequest) {
      return res.status(404).json({
        success: false,
        message: 'Reorder request not found',
      });
    }

    // Add permission checks here based on user role and desired status
    // Example: Only admins or specific roles can approve/reject
    // if ((status === 'APPROVED' || status === 'REJECTED') && req.user.role !== 'admin') {
    //   return res.status(403).json({ success: false, message: 'Not authorized to approve/reject.' });
    // }

    reorderRequest.status = status;
    if (comments) {
      reorderRequest.comments = comments; // Assuming a comments field exists
    }
    reorderRequest.lastUpdatedBy = req.user.id; // Track who updated

    await reorderRequest.save();

    const populatedRequest = await ReorderRequest.findByPk(reorderRequest.id, {
        include: [
            // Include associations as in getReorderRequest
             { model: StorageLocation, as: 'storageLocation', attributes: ['code', 'description'] },
             { model: User, as: 'createdBy', attributes: ['name', 'email'] },
             { model: User, as: 'updatedBy', attributes: ['name', 'email'] } // If you have lastUpdatedBy association
        ]
    });

    res.status(200).json({
      success: true,
      data: populatedRequest,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Submit reorder request for approval
// @route   PUT /api/inventory/reorder-request/:id/submit
// @access  Private
exports.submitReorderRequest = async (req, res) => {
  try {
    const reorderRequest = await ReorderRequest.findByPk(req.params.id);

    if (!reorderRequest) {
      return res.status(404).json({
        success: false,
        message: 'Reorder request not found',
      });
    }

    // Check if user has permission to submit (creator or admin)
    if (reorderRequest.createdById !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit this reorder request',
      });
    }

    if (reorderRequest.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: 'Only draft reorder requests can be submitted',
      });
    }

    reorderRequest.status = 'PENDING_APPROVAL';
    await reorderRequest.save();

    const populatedRequest = await ReorderRequest.findByPk(reorderRequest.id, {
      include: [
        { model: StorageLocation, as: 'storageLocation', attributes: ['code', 'description'] },
        { model: User, as: 'createdBy', attributes: ['name', 'email'] }
      ]
    });

    res.status(200).json({
      success: true,
      data: populatedRequest,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Approve or reject reorder request
// @route   PUT /api/inventory/reorder-request/:id/approve
// @access  Private
exports.approveReorderRequest = async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be APPROVED or REJECTED',
      });
    }

    // Check if user has permission to approve
    if (req.user.role !== 'admin' && (!req.user.permissions || !req.user.permissions.approveReorderRequests)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve/reject reorder requests',
      });
    }

    const reorderRequest = await ReorderRequest.findByPk(req.params.id);

    if (!reorderRequest) {
      return res.status(404).json({
        success: false,
        message: 'Reorder request not found',
      });
    }

    if (reorderRequest.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({
        success: false,
        message: 'Only pending approval requests can be approved/rejected',
      });
    }

    reorderRequest.status = status;
    reorderRequest.approvedById = req.user.id;
    reorderRequest.approvedAt = new Date();
    if (notes) {
      reorderRequest.notes = notes;
    }

    await reorderRequest.save();

    const populatedRequest = await ReorderRequest.findByPk(reorderRequest.id, {
      include: [
        { model: StorageLocation, as: 'storageLocation', attributes: ['code', 'description'] },
        { model: User, as: 'createdBy', attributes: ['name', 'email'] },
        { model: User, as: 'approvedBy', attributes: ['name', 'email'] }
      ]
    });

    res.status(200).json({
      success: true,
      data: populatedRequest,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete inventory record
// @route   DELETE /api/inventory/:id
// @access  Private
exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. User ID not found.'
      });
    }    // Find the inventory record
    const inventory = await models.Inventory.findByPk(id, {
      include: [
        {
          model: ItemMaster,
          as: 'itemMaster',
          attributes: ['itemNumber', 'shortDescription']
        }
      ]
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory record not found',
      });
    }    // Check if there are any related reorder request items for this inventory
    const relatedReorderRequestItems = await ReorderRequestItem.findOne({
      where: {
        inventoryId: inventory.id
      }
    });

    if (relatedReorderRequestItems) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete inventory record with associated reorder requests. Please handle related reorder requests first.',
      });
    }

    // Delete the inventory record
    await inventory.destroy();    res.status(200).json({
      success: true,
      message: `Inventory record for ${inventory.itemMaster?.shortDescription || 'item'} deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting inventory record',
      error: error.message,
    });
  }
};

// @desc    Delete an inventory item
// @route   DELETE /api/inventory/:id
// @access  Private
exports.deleteInventoryItem = async (req, res) => {
  try {
    const inventory = await models.Inventory.findByPk(req.params.id);
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    // Check if user has permission to delete inventory
    if (req.user.role !== 'admin' && (!req.user.permissions || !req.user.permissions.setInventoryLevels)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete inventory',
      });
    }

    // Delete the inventory item
    await inventory.destroy();

    res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    console.error('❌ Error deleting inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting inventory item',
      error: error.message
    });
  }
};

// @desc    Get inventory report data
// @route   GET /api/inventory/reports
// @access  Private
exports.getInventoryReportData = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;
    
    if (!reportType) {
      return res.status(400).json({
        success: false,
        message: 'Report type is required'
      });
    }
    
    // Parse dates if provided
    const startDateObj = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDateObj = endDate ? new Date(endDate) : new Date();
    
    let data = {};
    
    switch (reportType) {
      case 'stockLevel':
        // Get stock level report data
        const stockLevelItems = await models.Inventory.findAll({
          include: [
            {
              model: ItemMaster,
              as: 'itemMaster',
              attributes: ['itemNumber', 'shortDescription', 'equipmentCategory', 'unitOfMeasure']
            }
          ],
          attributes: [
            'id', 'inventoryNumber', 'physicalBalance', 'minimumLevel', 'maximumLevel', 
            'unitPrice', 'lastCountDate', 'storageLocationId', 'warehouse'
          ]
        });
        
        // Transform data for reporting
        const stockLevelData = stockLevelItems.map(item => {
          const itemData = item.toJSON();
          const currentStock = itemData.physicalBalance || 0;
          const minLevel = itemData.minimumLevel || 0;
          const maxLevel = itemData.maximumLevel || 0;          // Determine stock status
          let stockStatus = 'normal';
          
          // Ensure proper numeric comparison
          const numCurrentStock = Number(currentStock);
          const numMinLevel = Number(minLevel);
          const numMaxLevel = Number(maxLevel);
          
          // Debug log for stock comparisons
          console.log(`Backend - Stock comparison for ${itemData.inventoryNumber}: currentStock=${numCurrentStock}, minLevel=${numMinLevel}, maxLevel=${numMaxLevel}`);
          
          if (numCurrentStock < numMinLevel) {
            console.log(`Backend - Item ${itemData.inventoryNumber} marked as LOW STOCK: ${numCurrentStock} < ${numMinLevel}`);
            stockStatus = 'low';
          }
          if (numCurrentStock >= numMaxLevel) {
            console.log(`Backend - Item ${itemData.inventoryNumber} marked as OVERSTOCK: ${numCurrentStock} >= ${numMaxLevel}`);
            stockStatus = 'over';
          }
          
          // Calculate value
          const value = (currentStock * (itemData.unitPrice || 0));
          
          return {
            key: itemData.id,
            itemNumber: itemData.itemMaster?.itemNumber || 'N/A',
            description: itemData.itemMaster?.shortDescription || 'N/A',
            currentStock,
            minLevel,
            maxLevel,
            reorderPoint: minLevel, // For now, using minLevel as reorderPoint
            value,
            lastCountDate: itemData.lastCountDate ? new Date(itemData.lastCountDate).toISOString().split('T')[0] : null,
            category: itemData.itemMaster?.equipmentCategory || 'UNCATEGORIZED',
            stockStatus
          };
        });
        
        data.stockLevelData = stockLevelData;
        break;
        
      case 'movement':
        // This would require inventory transaction history data
        // For now, returning mock data
        data.movementData = [];
        break;
        
      case 'valuation':
        // Group items by category for valuation report
        const inventoryItems = await models.Inventory.findAll({
          include: [
            {
              model: ItemMaster,
              as: 'itemMaster',
              attributes: ['equipmentCategory']
            }
          ],
          attributes: [
            'physicalBalance', 'unitPrice'
          ]
        });
        
        // Group by category
        const categoryMap = inventoryItems.reduce((acc, item) => {
          const itemData = item.toJSON();
          const category = itemData.itemMaster?.equipmentCategory || 'UNCATEGORIZED';
          const value = (itemData.physicalBalance || 0) * (itemData.unitPrice || 0);
          
          if (!acc[category]) {
            acc[category] = {
              itemCount: 0,
              totalValue: 0
            };
          }
          
          acc[category].itemCount++;
          acc[category].totalValue += value;
          
          return acc;
        }, {});
        
        // Calculate total value for percentage calculation
        const totalInventoryValue = Object.values(categoryMap).reduce(
          (sum, category) => sum + category.totalValue, 0
        );
        
        // Transform to array format
        const valuationData = Object.entries(categoryMap).map(([category, data], index) => ({
          key: String(index + 1),
          category,
          itemCount: data.itemCount,
          totalValue: data.totalValue,
          avgValue: data.itemCount > 0 ? data.totalValue / data.itemCount : 0,
          percentOfTotal: totalInventoryValue > 0 
            ? parseFloat(((data.totalValue / totalInventoryValue) * 100).toFixed(1))
            : 0
        }));
        
        data.valuationData = valuationData;
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error generating inventory report:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get inventory summary metrics
// @route   GET /api/inventory/reports/summary
// @access  Private
exports.getInventorySummaryMetrics = async (req, res) => {
  try {
    // Get all inventory items with their prices
    const inventoryItems = await models.Inventory.findAll({
      attributes: ['physicalBalance', 'unitPrice', 'minimumLevel', 'maximumLevel']
    });
    
    // Calculate summary metrics
    let totalValue = 0;
    let lowStockCount = 0;
    let overStockCount = 0;
    
    inventoryItems.forEach(item => {
      const itemData = item.toJSON();
      const currentStock = itemData.physicalBalance || 0;
      const minLevel = itemData.minimumLevel || 0;
      const maxLevel = itemData.maximumLevel || 0;
      const value = currentStock * (itemData.unitPrice || 0);
      
      totalValue += value;
      
      if (currentStock <= minLevel) lowStockCount++;
      if (currentStock >= maxLevel) overStockCount++;
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalItems: inventoryItems.length,
        totalValue,
        lowStockCount,
        overStockCount,
        avgItemValue: inventoryItems.length > 0 ? totalValue / inventoryItems.length : 0
      }
    });
  } catch (error) {
    console.error('Error generating inventory summary metrics:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get inventory trends data
// @route   GET /api/inventory/reports/trends
// @access  Private
exports.getInventoryTrendData = async (req, res) => {
  try {
    const { reportType, months = 6 } = req.query;
    
    if (!reportType) {
      return res.status(400).json({
        success: false,
        message: 'Report type is required'
      });
    }
    
    // This would be implemented with real database queries in production
    // For now, returning mock data that matches the frontend format
    const monthsData = Array(parseInt(months)).fill().map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (parseInt(months) - 1 - i));
      return date.toLocaleString('en-us', { month: 'short' });
    });
    
    let trendData = [];
    
    switch (reportType) {
      case 'stockLevel':
        trendData = [
          {
            name: 'PUMP',
            data: [5, 6, 4, 8, 7, 5],
            months: monthsData
          },
          {
            name: 'VALVE',
            data: [3, 4, 5, 4, 6, 4],
            months: monthsData
          },
          {
            name: 'ELECTRICAL',
            data: [7, 8, 9, 8, 10, 25],
            months: monthsData
          },
          {
            name: 'INSTRUMENT',
            data: [10, 9, 8, 9, 12, 12],
            months: monthsData
          }
        ];
        break;
        
      case 'movement':
        trendData = [
          {
            name: 'Receipts',
            data: [12, 15, 10, 18, 20, 22],
            months: monthsData
          },
          {
            name: 'Issues',
            data: [8, 10, 12, 15, 16, 18],
            months: monthsData
          },
          {
            name: 'Returns',
            data: [2, 3, 1, 4, 2, 3],
            months: monthsData
          }
        ];
        break;
        
      case 'valuation':
        trendData = [
          {
            name: 'Total Value',
            data: [45000, 47000, 48000, 51000, 53000, 54000],
            months: monthsData
          },
          {
            name: 'Average Value',
            data: [420, 425, 435, 450, 470, 480],
            months: monthsData
          }
        ];
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }
    
    res.status(200).json({
      success: true,
      data: trendData
    });
  } catch (error) {
    console.error('Error generating inventory trend data:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Export inventory report
// @route   GET /api/inventory/reports/export
// @access  Private
exports.exportInventoryReport = async (req, res) => {
  try {
    const { reportType, format } = req.query;
    
    if (!reportType) {
      return res.status(400).json({
        success: false,
        message: 'Report type is required'
      });
    }
    
    // For now, just return success message
    // In a real implementation, this would generate and return a file
    res.status(200).json({
      success: true,
      message: `Export of ${reportType} report in ${format || 'excel'} format would be generated here`
    });
  } catch (error) {
    console.error('Error exporting inventory report:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get inventory data grouped by UNSPSC categories
// @route   GET /api/inventory/reports/unspsc-categories
// @access  Private
exports.getUnspscCategoryData = async (req, res) => {
  try {
    console.log('Fetching inventory data grouped by UNSPSC categories');
    
    // Get all inventory items with their item masters and UNSPSC codes
    const inventoryItems = await models.Inventory.findAll({
      include: [
        {
          model: ItemMaster,
          as: 'itemMaster',
          include: [
            {
              model: UnspscCode,
              as: 'unspsc'
            }
          ]
        }
      ]
    });

    // Process inventory items to extract UNSPSC data
    const unspscCategoryMap = {};
    
    inventoryItems.forEach(item => {
      // Skip items without item master or UNSPSC data
      if (!item.itemMaster) return;
      
      // Get UNSPSC code from item master
      const unspscCode = item.itemMaster.unspscCode || 'unknown';
      const unspscTitle = item.itemMaster.unspsc ? item.itemMaster.unspsc.title : 'Unknown Category';
      const unspscDescription = item.itemMaster.unspsc ? item.itemMaster.unspsc.description : '';
      
      // Extract item data
      const physicalBalance = Number(item.physicalBalance || 0);
      const itemDescription = item.itemMaster.shortDescription || item.description || 'No description';
      
      // Create or update category entry
      if (!unspscCategoryMap[unspscCode]) {
        unspscCategoryMap[unspscCode] = {
          code: unspscCode,
          name: unspscTitle,
          description: unspscDescription,
          value: 0,
          itemCount: 0,
          items: [] // Store items for detailed reporting
        };
      }
      
      // Add to totals
      unspscCategoryMap[unspscCode].value += physicalBalance;
      unspscCategoryMap[unspscCode].itemCount += 1;
      
      // Store item details (limited to keep response size reasonable)
      if (unspscCategoryMap[unspscCode].items.length < 10) {
        unspscCategoryMap[unspscCode].items.push({
          id: item.id,
          inventoryNumber: item.inventoryNumber,
          description: itemDescription,
          quantity: physicalBalance,
          value: item.unitPrice * physicalBalance
        });
      }
    });
    
    // Convert map to array for response
    const categoryData = Object.values(unspscCategoryMap).map(category => {
      // Calculate additional metrics
      const avgPerItem = category.itemCount > 0 ? category.value / category.itemCount : 0;
      
      // Extract a combined description from items if not provided by UNSPSC code
      const sampledItems = category.items.slice(0, 3).map(i => i.description).join(', ');
      const itemsDescription = category.items.length > 3 ? `${sampledItems}...` : sampledItems;
      
      return {
        code: category.code,
        name: category.name,
        description: category.description || `Contains: ${itemsDescription}`,
        value: category.value,
        itemCount: category.itemCount,
        avgPerItem: avgPerItem.toFixed(2),
        // Don't include full items array in response to keep it lightweight
        sampleItems: category.items.slice(0, 3).map(i => ({ 
          description: i.description,
          quantity: i.quantity
        }))
      };
    });
    
    // Sort categories by value in descending order
    categoryData.sort((a, b) => b.value - a.value);
    
    res.status(200).json({
      success: true,
      data: categoryData
    });
  } catch (error) {
    console.error('Error fetching UNSPSC category data:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get time-series data for UNSPSC categories
// @route   GET /api/inventory/unspsc-category-timeseries
// @access  Private
exports.getUnspscCategoryTimeSeries = async (req, res) => {
  try {
    console.log('Fetching time-series data for UNSPSC categories');
    
    // Define the time periods (monthly data for the past 12 months)
    const timeRanges = [];
    const today = new Date();
    
    // Generate dates for the past 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      timeRanges.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        startDate: new Date(date.getFullYear(), date.getMonth(), 1),
        endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0)
      });
    }
    
    // Main categories to track (can be extended or made dynamic based on query parameters)
    const mainCategories = [
      { code: '40', name: 'PUMP' },
      { code: '41', name: 'VALVE' },
      { code: '39', name: 'ELECTRICAL' },
      { code: '42', name: 'INSTRUMENT' }
    ];
    
    // For demonstration, generate simulated time-series data
    // In a real system, this would query historical inventory snapshots or transaction logs
    const timeSeriesData = timeRanges.map(timeRange => {
      const monthData = {
        name: `${timeRange.month} ${timeRange.year}`,
        month: timeRange.month,
        year: timeRange.year
      };
      
      // Generate data for each category
      mainCategories.forEach(category => {
        // Generate realistic inventory values with a trend
        // Base value + random variation + seasonal trend
        const baseValue = Math.floor(Math.random() * 5000) + 1000;
        const seasonalFactor = 1 + 0.2 * Math.sin((timeRange.startDate.getMonth() / 12) * 2 * Math.PI);
        const trend = timeRange.startDate.getMonth() / 12 * 500; // Upward trend through the year
        
        monthData[category.name] = Math.floor((baseValue + trend) * seasonalFactor);
      });
      
      return monthData;
    });
    
    // Return formatted time-series data
    return res.status(200).json({
      success: true,
      data: timeSeriesData,
      categories: mainCategories
    });
    
  } catch (error) {
    console.error('Error fetching UNSPSC category time-series data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch UNSPSC category time-series data',
      error: error.message
    });
  }
};

// @desc    Search inventory items by keyword (for autocomplete/search)
// @route   GET /api/inventory/search
// @access  Private
exports.searchInventoryItems = async (req, res) => {
  try {
    const { keyword, limit = 20 } = req.query;

    if (!keyword || keyword.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Keyword must be at least 2 characters long'
      });
    }

    const searchKeyword = `%${keyword.trim()}%`;

    const inventories = await models.Inventory.findAll({
      where: {
        [Op.or]: [
          { inventoryNumber: { [Op.like]: searchKeyword } },
          { warehouse: { [Op.like]: searchKeyword } },
          { binLocationText: { [Op.like]: searchKeyword } }
        ]
      },
      include: [
        {
          model: ItemMaster,
          as: 'itemMaster',
          where: {
            [Op.or]: [
              { itemNumber: { [Op.like]: searchKeyword } },
              { shortDescription: { [Op.like]: searchKeyword } },
              { longDescription: { [Op.like]: searchKeyword } },
              { manufacturerName: { [Op.like]: searchKeyword } },
              { manufacturerPartNumber: { [Op.like]: searchKeyword } }
            ]
          },
          required: false, // LEFT JOIN so we get inventories even if itemMaster doesn't match
          attributes: ['itemNumber', 'shortDescription', 'longDescription', 'manufacturerName', 'manufacturerPartNumber', 'equipmentCategory', 'criticality', 'unspscCode', 'uom'],
          include: [
            {
              model: UnspscCode,
              as: 'unspsc',
              attributes: ['id', 'code', 'title'],
              required: false
            }
          ]
        },
        {
          model: StorageLocation,
          as: 'storageLocation',
          attributes: ['code', 'description'],
          required: false
        },
        {
          model: User,
          as: 'lastUpdatedBy',
          attributes: ['name', 'email'],
          required: false
        }
      ],
      limit: parseInt(limit),
      order: [['inventoryNumber', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: inventories,
      count: inventories.length
    });
  } catch (error) {
    console.error('Error searching inventory items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search inventory items',
      error: error.message
    });
  }
};

// @desc    Advanced search for inventory items
// @route   GET /api/inventory/advanced-search
// @access  Private
exports.advancedSearchInventoryItems = async (req, res) => {
  try {
    const {
      inventoryNumber,
      description,
      itemNumber,
      shortDescription,
      manufacturerName,
      unspscCode,
      criticality,
      condition,
      warehouse,
      belowMinimum,
      stockLevel,
      page = 1,
      limit = 20
    } = req.query;

    // Create where clauses for both inventory and item master
    const inventoryWhere = {};
    const itemMasterWhere = {};

    // Build where clauses based on query parameters
    if (inventoryNumber) {
      inventoryWhere.inventoryNumber = { [Op.like]: `%${inventoryNumber}%` };
    }

    if (condition) {
      inventoryWhere.condition = condition;
    }

    if (warehouse) {
      inventoryWhere.warehouse = { [Op.like]: `%${warehouse}%` };
    }

    if (description || shortDescription) {
      const descKeyword = description || shortDescription;
      itemMasterWhere.shortDescription = { [Op.like]: `%${descKeyword}%` };
    }

    if (itemNumber) {
      itemMasterWhere.itemNumber = { [Op.like]: `%${itemNumber}%` };
    }

    if (manufacturerName) {
      itemMasterWhere.manufacturerName = { [Op.like]: `%${manufacturerName}%` };
    }

    if (unspscCode) {
      itemMasterWhere.unspscCode = { [Op.like]: `%${unspscCode}%` };
    }

    if (criticality) {
      itemMasterWhere.criticality = criticality;
    }

    // Stock level filters
    if (belowMinimum === 'true' || stockLevel === 'belowMin') {
      inventoryWhere.physicalBalance = sequelize.literal('"Inventory"."physicalBalance" < "Inventory"."minimumLevel"');
    } else if (stockLevel === 'aboveMax') {
      inventoryWhere.physicalBalance = sequelize.literal('"Inventory"."physicalBalance" > "Inventory"."maximumLevel"');
    } else if (stockLevel === 'zeroBalance') {
      inventoryWhere.physicalBalance = 0;
    }

    // Calculate offset for pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: inventories } = await models.Inventory.findAndCountAll({
      where: inventoryWhere,
      include: [
        {
          model: ItemMaster,
          as: 'itemMaster',
          where: Object.keys(itemMasterWhere).length > 0 ? itemMasterWhere : undefined,
          required: Object.keys(itemMasterWhere).length > 0, // INNER JOIN if itemMaster filters exist
          attributes: ['itemNumber', 'shortDescription', 'longDescription', 'manufacturerName', 'manufacturerPartNumber', 'equipmentCategory', 'criticality', 'unspscCode', 'uom'],
          include: [
            {
              model: UnspscCode,
              as: 'unspsc',
              attributes: ['id', 'code', 'title'],
              required: false
            }
          ]
        },
        {
          model: StorageLocation,
          as: 'storageLocation',
          attributes: ['code', 'description'],
          required: false
        },
        {
          model: User,
          as: 'lastUpdatedBy',
          attributes: ['name', 'email'],
          required: false
        }
      ],
      offset,
      limit: parseInt(limit),
      order: [['inventoryNumber', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: inventories,
      count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error performing advanced search:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform advanced search',
      error: error.message
    });
  }
};

// @desc    Get all bin locations
// @route   GET /api/bin-location
// @access  Private
exports.getBinLocations = async (req, res) => {
  try {
    const binLocations = await models.BinLocation.findAll({
      attributes: ['id', 'binCode', 'description', 'storageLocationId'],
      include: [
        {
          model: models.StorageLocation,
          as: 'storageLocation',
          attributes: ['code', 'description']
        }
      ],
      order: [['binCode', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: binLocations,
      count: binLocations.length
    });
  } catch (error) {
    console.error('❌ Error fetching bin locations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bin locations',
      error: error.message
    });
  }
};

// @desc    Create a new bin location
// @route   POST /api/bin-location
// @access  Private
exports.createBinLocation = async (req, res) => {
  try {
    const { binCode, description, storageLocationId } = req.body;

    if (!binCode || !description) {
      return res.status(400).json({
        success: false,
        message: 'Bin code and description are required'
      });
    }

    const binLocation = await models.BinLocation.create({
      binCode,
      description,
      storageLocationId
    });

    res.status(201).json({
      success: true,
      data: binLocation,
      message: 'Bin location created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating bin location:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating bin location',
      error: error.message
    });
  }
};
