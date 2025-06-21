const db = require('../models/sequelize');
const { User, ItemMaster, Inventory, StorageLocation, BinLocation, Transaction, TransactionItem } = db;
const sequelize = require('../config/postgresql');
const { DataTypes } = require('sequelize');

console.log('🔍 Warehouse Controller - Loading models...');
console.log('✅ StorageLocation from import:', StorageLocation ? 'Loaded' : 'Undefined');
console.log('✅ BinLocation from import:', BinLocation ? 'Loaded' : 'Undefined');

// Always load models directly to ensure they're available
let warehouseModels;
try {
  console.log('🔍 Trying to load Warehouse models directly...');
  warehouseModels = require('../models/sequelize/Warehouse')(sequelize, DataTypes);
  console.log('✅ Direct warehouse models loaded:', Object.keys(warehouseModels).join(', '));
} catch (error) {
  console.error('❌ Error loading warehouse models directly:', error.message);
}

// Set up models with fallbacks
const StorageLocationModel = StorageLocation || (warehouseModels && warehouseModels.StorageLocation);
const BinLocationModel = BinLocation || (warehouseModels && warehouseModels.BinLocation);

console.log('✅ Final StorageLocationModel:', StorageLocationModel ? 'Available' : 'Undefined');
console.log('✅ Final BinLocationModel:', BinLocationModel ? 'Available' : 'Undefined');

// Create models object with both capitalized and lowercase aliases
const models = {
  User,
  user: User,
  ItemMaster,
  itemmaster: ItemMaster,
  Inventory,
  inventory: Inventory,
  StorageLocation: StorageLocationModel,
  storagelocation: StorageLocationModel,
  BinLocation: BinLocationModel,
  binlocation: BinLocationModel,
  Transaction,
  transaction: Transaction,
  TransactionItem,
  transactionitem: TransactionItem
};

// @desc    Create a new storage location
// @route   POST /api/warehouse/storage-location
// @access  Private
exports.createStorageLocation = async (req, res) => {
  try {
    console.log('🔍 Creating storage location with data:', req.body);
      // Validate model exists
    if (!StorageLocationModel) {
      console.error('❌ StorageLocationModel is undefined');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: StorageLocationModel not available'
      });
    }
    
    const { code, description, street, city, postalCode, country } = req.body;
      // Check if storage location already exists
    try {
      const existingLocation = await StorageLocationModel.findOne({ where: { code } });
      if (existingLocation) {
        return res.status(400).json({
          success: false,
          message: 'Storage location with this code already exists',
        });
      }
    } catch (error) {
      console.error('❌ Error checking for existing location:', error);
    }
      // Get the user ID from the request, or use a default admin ID if not available
    let createdById = req.user?.id;
    
    // If no user ID is available, use a hardcoded ID for testing
    if (!createdById) {
      createdById = '00000000-0000-0000-0000-000000000001'; // Hardcoded UUID for testing
      console.log('🔑 Using hardcoded admin ID for testing:', createdById);
    }
      // Create new storage location
    try {
      console.log('📝 Creating storage location with:', { code, description, createdById });
      const storageLocation = await StorageLocationModel.create({
        code,
        description,
        street: street || '',
        city: city || '',
        postalCode: postalCode || '',
        country: country || '',
        createdById,
      });
      
      console.log('✅ Storage location created successfully:', storageLocation.id);
      
      res.status(201).json({
        success: true,
        data: storageLocation,
      });
    } catch (createError) {
      console.error('❌ Error during storage location creation:', createError);
      res.status(400).json({
        success: false,
        message: createError.message,
        details: String(createError)
      });
    }
  } catch (error) {
    console.error('Error creating storage location:', error);
    res.status(400).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
};

// @desc    Get all storage locations
// @route   GET /api/warehouse/storage-location
// @access  Private
exports.getStorageLocations = async (req, res) => {
  try {    
    // Validate model exists
    if (!StorageLocationModel) {
      console.error('❌ StorageLocationModel is undefined');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: StorageLocationModel not available'
      });
    }
    
    const locations = await StorageLocationModel.findAll({
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['code', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    console.error('Error getting storage locations:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get a storage location by ID
// @route   GET /api/warehouse/storage-location/:id
// @access  Private
exports.getStorageLocation = async (req, res) => {
  try {    
    console.log('🔍 Getting storage location with ID:', req.params.id);
    
    // Validate model exists
    if (!StorageLocationModel) {
      console.error('❌ StorageLocationModel is undefined');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: StorageLocationModel not available'
      });
    }
    
    // Fetch storage location without associations to avoid association errors
    const storageLocation = await StorageLocationModel.findByPk(req.params.id);
    
    if (!storageLocation) {
      console.log('❌ Storage location not found with ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Storage location not found',
      });
    }

    // Manually fetch created by user if needed
    let createdBy = null;
    if (storageLocation.createdById) {
      try {
        createdBy = await User.findByPk(storageLocation.createdById, {
          attributes: ['id', 'name', 'email']
        });
      } catch (error) {
        console.warn('⚠️ Could not fetch created by user:', error.message);
      }
    }

    // Combine the data manually
    const result = {
      ...storageLocation.toJSON(),
      createdBy: createdBy ? createdBy.toJSON() : null
    };
    
    console.log('✅ Storage location found:', storageLocation.id);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error getting storage location:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update a storage location
// @route   PUT /api/warehouse/storage-location/:id
// @access  Private
exports.updateStorageLocation = async (req, res) => {
  try {
    console.log('🔍 Updating storage location with ID:', req.params.id);
    console.log('🔍 Update data:', req.body);
    
    // Validate model exists
    if (!StorageLocationModel) {
      console.error('❌ StorageLocationModel is undefined');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: StorageLocationModel not available'
      });
    }
    
    const { code, description, street, city, postalCode, country, isActive } = req.body;
    
    const storageLocation = await StorageLocationModel.findByPk(req.params.id);
    
    if (!storageLocation) {
      console.log('❌ Storage location not found with ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Storage location not found',
      });
    }
    
    // Check if code is being changed and already exists
    if (code && code !== storageLocation.code) {
      const existingLocation = await StorageLocationModel.findOne({ where: { code } });
      if (existingLocation) {
        console.log('❌ Storage location with code already exists:', code);
        return res.status(400).json({
          success: false,
          message: 'Storage location with this code already exists',
        });
      }
    }
    
    // Update the storage location
    await storageLocation.update({
      code: code || storageLocation.code,
      description: description || storageLocation.description,
      street: street !== undefined ? street : storageLocation.street,
      city: city !== undefined ? city : storageLocation.city,
      postalCode: postalCode !== undefined ? postalCode : storageLocation.postalCode,
      country: country !== undefined ? country : storageLocation.country,
      isActive: isActive !== undefined ? isActive : storageLocation.isActive,
    });
    
    res.status(200).json({
      success: true,
      data: storageLocation,
      message: 'Storage location updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a storage location
// @route   DELETE /api/warehouse/storage-location/:id
// @access  Private
exports.deleteStorageLocation = async (req, res) => {
  try {
    console.log('🔍 Deleting storage location with ID:', req.params.id);
    
    // Validate models exist
    if (!BinLocationModel) {
      console.error('❌ BinLocationModel is undefined');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: BinLocationModel not available'
      });
    }
    
    if (!StorageLocationModel) {
      console.error('❌ StorageLocationModel is undefined');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: StorageLocationModel not available'
      });
    }
    
    // Check if any bins are associated with this location
    const binCount = await BinLocationModel.count({
      where: { storageLocationId: req.params.id }
    });
    
    if (binCount > 0) {
      console.log('❌ Cannot delete: Storage location has associated bins:', binCount);
      return res.status(400).json({
        success: false,
        message: 'Cannot delete storage location with associated bins. Please delete the bins first.',
      });
    }    // Check if any inventory items reference this location
    try {
      // Use db.Inventory instead of models.Inventory and check if it exists first
      if (db.Inventory) {
        const inventoryCount = await db.Inventory.count({
          where: { storageLocationId: req.params.id }
        });
        
        if (inventoryCount > 0) {
          console.log('❌ Cannot delete: Storage location has associated inventory items:', inventoryCount);
          return res.status(400).json({
            success: false,
            message: `Cannot delete storage location. ${inventoryCount} inventory item(s) are currently assigned to this location. Please move or remove the inventory items first.`,
          });
        }
      } else {
        console.log('⚠️ Inventory model not available. Skipping inventory check.');
      }
    } catch (error) {
      console.error('❌ Error checking inventory references:', error.message);
    }
    
    // Try to delete the storage location
    try {
      const result = await StorageLocationModel.destroy({
        where: { id: req.params.id }
      });
      
      if (result === 0) {
        return res.status(404).json({
          success: false,
          message: 'Storage location not found',
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Storage location deleted successfully',
      });
    } catch (deleteError) {
      // Handle foreign key constraint errors specifically
      if (deleteError.message && (
        deleteError.message.includes('violates foreign key constraint') ||
        deleteError.message.includes('FOREIGN KEY constraint failed')
      )) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete storage location because it is referenced by other records. Please remove or update the related bins and inventory items first.',
        });
      }
      
      // Re-throw other errors
      throw deleteError;
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a new bin location
// @route   POST /api/warehouse/bin-location
// @access  Private
exports.createBinLocation = async (req, res) => {
  try {
    const { binCode, storageLocationId, description } = req.body;
    
    // Check if storage location exists
    const storageLocation = await StorageLocationModel.findByPk(storageLocationId);
    if (!storageLocation) {
      return res.status(404).json({
        success: false,
        message: 'Storage location not found',
      });
    }
      // Check if bin already exists in this storage location
    const existingBin = await BinLocationModel.findOne({
      where: {
        binCode,
        storageLocationId,
      }
    });
    
    if (existingBin) {
      return res.status(400).json({
        success: false,
        message: 'Bin with this code already exists in this storage location',
      });
    }
    
    // Create new bin location
    const binLocation = await BinLocationModel.create({
      binCode,
      storageLocationId,
      description: description || '',
      createdById: req.user.id,
    });    // Fetch the created bin with storage location data manually
    const createdBin = await BinLocationModel.findByPk(binLocation.id);
    const storageLocationData = await StorageLocationModel.findByPk(storageLocationId);
    const userData = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email']
    });
    
    // Manually construct the response with associated data
    const populatedBin = {
      ...createdBin.toJSON(),
      storageLocation: storageLocationData ? {
        id: storageLocationData.id,
        code: storageLocationData.code,
        description: storageLocationData.description
      } : null,
      createdBy: userData ? {
        id: userData.id,
        name: userData.name,
        email: userData.email
      } : null
    };
    
    res.status(201).json({
      success: true,
      data: populatedBin,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all bin locations
// @route   GET /api/warehouse/bin-location
// @access  Private
exports.getBinLocations = async (req, res) => {
  try {
    const { storageLocationId } = req.query;
    
    // Validate storageLocationId if provided
    if (storageLocationId) {
      const storageLocation = await StorageLocation.findByPk(storageLocationId);
      if (!storageLocation) {
        return res.status(404).json({
          success: false,
          message: 'Storage location not found'
        });
      }
    }
    
    const whereClause = {};
    if (storageLocationId) {
      whereClause.storageLocationId = storageLocationId;
    }
      const bins = await BinLocation.findAll({
      where: whereClause,
      include: [
        {
          model: StorageLocation,
          as: 'storageLocation',
          attributes: ['id', 'code', 'description']
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['binCode', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      count: bins.length,
      data: bins
    });
  } catch (error) {
    console.error('Error fetching bin locations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bin locations',
      error: error.message
    });
  }
};

// @desc    Get a bin location by ID
// @route   GET /api/warehouse/bin-location/:id
// @access  Private
exports.getBinLocation = async (req, res) => {  
  try {
    console.log('🔍 Getting bin location with ID:', req.params.id);
    
    // Validate model exists
    if (!BinLocationModel) {
      console.error('❌ BinLocationModel is undefined');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: BinLocationModel not available'
      });
    }
    
    // Fetch bin location without associations to avoid association errors
    const binLocation = await BinLocationModel.findByPk(req.params.id);
    
    if (!binLocation) {
      return res.status(404).json({
        success: false,
        message: 'Bin location not found'
      });
    }

    // Manually fetch related data to avoid association issues
    let storageLocation = null;
    let createdBy = null;

    if (binLocation.storageLocationId) {
      try {
        storageLocation = await StorageLocationModel.findByPk(binLocation.storageLocationId, {
          attributes: ['id', 'code', 'description']
        });
      } catch (error) {
        console.warn('⚠️ Could not fetch storage location:', error.message);
      }
    }

    if (binLocation.createdById) {
      try {
        createdBy = await User.findByPk(binLocation.createdById, {
          attributes: ['id', 'name', 'email']
        });
      } catch (error) {
        console.warn('⚠️ Could not fetch created by user:', error.message);
      }
    }

    // Combine the data manually
    const result = {
      ...binLocation.toJSON(),
      storageLocation: storageLocation ? storageLocation.toJSON() : null,
      createdBy: createdBy ? createdBy.toJSON() : null
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Error getting bin location:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500
    });
  }
};

// @desc    Update a bin location
// @route   PUT /api/warehouse/bin-location/:id
// @access  Private
exports.updateBinLocation = async (req, res) => {
  try {
    const { binCode, description, storageLocationId, isActive } = req.body;
    
    const binLocation = await BinLocationModel.findByPk(req.params.id);
    
    if (!binLocation) {
      return res.status(404).json({
        success: false,
        message: 'Bin location not found',
      });
    }
    
    // If storage location is being changed, check if it exists
    if (storageLocationId && storageLocationId !== binLocation.storageLocationId) {
      const storageLocation = await StorageLocationModel.findByPk(storageLocationId);
      if (!storageLocation) {
        return res.status(404).json({
          success: false,
          message: 'Storage location not found',
        });
      }
      
      // Check if bin code already exists in the new storage location
      if (binCode) {
        const existingBin = await BinLocationModel.findOne({
          where: {
            binCode: binCode,
            storageLocationId: storageLocationId
          }
        });
        
        if (existingBin && existingBin.id !== req.params.id) {
          return res.status(400).json({
            success: false,
            message: 'Bin with this code already exists in the selected storage location',
          });
        }
      }
    } else if (binCode && binCode !== binLocation.binCode) {
      // If only bin code is changing, check if it exists in the same storage location
      const existingBin = await BinLocationModel.findOne({
        where: {
          binCode: binCode,
          storageLocationId: binLocation.storageLocationId
        }
      });
      
      if (existingBin && existingBin.id !== req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'Bin with this code already exists in this storage location',
        });
      }
    }
    
    // Update the bin location
    await binLocation.update({
      binCode: binCode || binLocation.binCode,
      description: description !== undefined ? description : binLocation.description,
      storageLocationId: storageLocationId || binLocation.storageLocationId,
      isActive: isActive !== undefined ? isActive : binLocation.isActive,
    });

    // Fetch the updated bin without associations to avoid errors
    const updatedBin = await BinLocationModel.findByPk(binLocation.id);
    
    // Manually fetch related data
    let storageLocation = null;
    let createdBy = null;

    if (updatedBin.storageLocationId) {
      try {
        storageLocation = await StorageLocationModel.findByPk(updatedBin.storageLocationId, {
          attributes: ['id', 'code', 'description']
        });
      } catch (error) {
        console.warn('⚠️ Could not fetch storage location:', error.message);
      }
    }

    if (updatedBin.createdById) {
      try {
        createdBy = await User.findByPk(updatedBin.createdById, {
          attributes: ['id', 'name', 'email']
        });
      } catch (error) {
        console.warn('⚠️ Could not fetch created by user:', error.message);
      }
    }

    // Combine the data manually
    const result = {
      ...updatedBin.toJSON(),
      storageLocation: storageLocation ? storageLocation.toJSON() : null,
      createdBy: createdBy ? createdBy.toJSON() : null
    };
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Bin location updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete a bin location
// @route   DELETE /api/warehouse/bin-location/:id
// @access  Private
exports.deleteBinLocation = async (req, res) => {
  try {
    // Check if any inventory items reference this bin
    try {
      // Use db.Inventory instead of models.Inventory and check if it exists first
      if (db.Inventory) {
        const inventoryCount = await db.Inventory.count({
          where: { binLocationId: req.params.id }
        });
        
        if (inventoryCount > 0) {
          console.log('❌ Cannot delete: Bin location has associated inventory items:', inventoryCount);
          return res.status(400).json({
            success: false,
            message: `Cannot delete bin location. ${inventoryCount} inventory item(s) are currently assigned to this bin. Please move or remove the inventory items first.`,
          });
        }
      } else {
        console.log('⚠️ Inventory model not available. Skipping inventory check.');
      }
    } catch (error) {
      console.error('❌ Error checking inventory references:', error.message);
      
      // If it's a foreign key constraint error, provide a user-friendly message
      if (error.message && error.message.includes('violates foreign key constraint')) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete bin location because it is referenced by other records. Please remove or update the related inventory items first.',
        });
      }
    }
    
    // Try to delete the bin location
    try {
      const result = await BinLocationModel.destroy({
        where: { id: req.params.id }
      });
      
      if (result === 0) {
        return res.status(404).json({
          success: false,
          message: 'Bin location not found',
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Bin location deleted successfully',
      });
    } catch (deleteError) {
      // Handle foreign key constraint errors specifically
      if (deleteError.message && (
        deleteError.message.includes('violates foreign key constraint') ||
        deleteError.message.includes('FOREIGN KEY constraint failed')
      )) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete bin location because it is referenced by inventory items. Please move or remove the inventory items first.',
        });
      }
      
      // Re-throw other errors
      throw deleteError;
    }
  } catch (error) {
    console.error('❌ Delete bin location error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a new transaction (GR, GI, GE, GT)
// @route   POST /api/warehouse/transaction
// @access  Private
exports.createTransaction = async (req, res) => {
  try {
    const { 
      transactionType, 
      referenceNumber, 
      items,
      costCenter
    } = req.body;
    
    // Validate transaction type
    if (!['GR', 'GI', 'GE', 'GT'].includes(transactionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction type',
      });
    }
    
    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items provided for transaction',
      });
    }
    
    // Check if all inventory items exist
    for (const item of items) {
      const inventory = await models.Inventory.findByPk(item.inventoryId);
      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: `Inventory item with ID ${item.inventoryId} not found`,
        });
      }
      
      // Check source location exists
      const sourceLocation = await StorageLocation.findByPk(item.sourceLocationId);
      if (!sourceLocation) {
        return res.status(404).json({
          success: false,
          message: `Source location with ID ${item.sourceLocationId} not found`,
        });
      }
      
      // Check destination location exists if it's a transfer
      if (transactionType === 'GT' && !item.destinationLocationId) {
        return res.status(400).json({
          success: false,
          message: 'Destination location is required for Goods Transfer',
        });
      }
      
      if (item.destinationLocationId) {
        const destLocation = await StorageLocation.findByPk(item.destinationLocationId);
        if (!destLocation) {
          return res.status(404).json({
            success: false,
            message: `Destination location with ID ${item.destinationLocationId} not found`,
          });
        }
      }
    }
    
    // Create transaction
    const transaction = await Transaction.create({
      transactionType,
      referenceNumber: referenceNumber || '',
      costCenter: costCenter || '',
      status: 'DRAFT',
      createdById: req.user.id,
    });
    
    // Create transaction items
    const transactionItems = await Promise.all(
      items.map(item => TransactionItem.create({
        transactionId: transaction.id,
        inventoryId: item.inventoryId,
        sourceLocationId: item.sourceLocationId,
        destinationLocationId: item.destinationLocationId || null,
        sourceBinId: item.sourceBinId || null,
        destinationBinId: item.destinationBinId || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice || 0,
        notes: item.notes || ''
      }))
    );
    
    // Fetch the created transaction with all associations
    const populatedTransaction = await Transaction.findByPk(transaction.id, {
      include: [
        {
          model: TransactionItem,
          as: 'items',
          include: [
            {
              model: Inventory,
              as: 'inventory',
              include: [
                {
                  model: ItemMaster,
                  as: 'itemMaster',
                  attributes: ['id', 'itemNumber', 'shortDescription']
                }
              ]
            },
            {
              model: StorageLocation,
              as: 'sourceLocation',
              attributes: ['id', 'code', 'description']
            },
            {
              model: StorageLocation,
              as: 'destinationLocation',
              attributes: ['id', 'code', 'description']
            }
          ]
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      data: populatedTransaction,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Complete a transaction
// @route   PUT /api/warehouse/transaction/:id/complete
// @access  Private
exports.completeTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [
        {
          model: TransactionItem,
          as: 'items',
          include: [
            {
              model: Inventory,
              as: 'inventory'
            }
          ]
        }
      ]
    });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }
    
    // Check if user has permission
    if (req.user.role !== 'admin' && !req.user.permissions?.warehouseTransactions) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete transactions',
      });
    }
    
    if (transaction.status !== 'DRAFT' && transaction.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Transaction is already ${transaction.status}`,
      });
    }
    
    // Update inventory quantities based on transaction type
    for (const item of transaction.items) {
      const inventory = item.inventory;
      
      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: `Inventory item not found for transaction item`,
        });
      }
      
      switch (transaction.transactionType) {
        case 'GR': // Goods Receipt - Increase quantity
          await inventory.update({
            physicalBalance: inventory.physicalBalance + parseFloat(item.quantity)
          });
          break;
          
        case 'GI': // Goods Issue - Decrease quantity
          if (inventory.physicalBalance < parseFloat(item.quantity)) {
            return res.status(400).json({              success: false,
              message: `Insufficient quantity for item ${inventory.inventoryNumber}`,
            });
          }
          await inventory.update({
            physicalBalance: inventory.physicalBalance - parseFloat(item.quantity)
          });
          break;
          
        case 'GE': // Goods Return - Increase quantity
          await inventory.update({
            physicalBalance: inventory.physicalBalance + parseFloat(item.quantity)
          });
          break;
          
        case 'GT': // Goods Transfer - Move between locations
          if (inventory.physicalBalance < parseFloat(item.quantity)) {
            return res.status(400).json({
              success: false,
              message: `Insufficient quantity for item ${inventory.inventoryNumber}`,
            });
          }
          
          // For a transfer, we need to handle the source and destination
          await inventory.update({
            physicalBalance: inventory.physicalBalance - parseFloat(item.quantity)
          });
          
          // Check if we need to create a new inventory record at the destination
          const destinationInventory = await models.Inventory.findOne({
            where: {
              itemMasterId: inventory.itemMasterId,
              storageLocationId: item.destinationLocationId,
            }
          });
          
          if (destinationInventory) {
            // Update existing inventory at destination
            await destinationmodels.Inventory.update({
              physicalBalance: destinationInventory.physicalBalance + parseFloat(item.quantity)
            });
          } else {
            // Create new inventory record at destination
            const destinationLocation = await StorageLocation.findByPk(item.destinationLocationId);
            await models.Inventory.create({
              itemMasterId: inventory.itemMasterId,
              inventoryNumber: `INV-${inventory.inventoryNumber}-${new Date().getTime()}`,
              physicalBalance: parseFloat(item.quantity),
              unitPrice: inventory.unitPrice,
              condition: inventory.condition,
              minimumLevel: inventory.minimumLevel,
              maximumLevel: inventory.maximumLevel,
              storageLocationId: item.destinationLocationId,
              binLocationId: item.destinationBinId || null,
              warehouse: destinationLocation.code,
              lastUpdatedById: req.user.id,
            });
          }
          break;
      }
    }
    
    // Update transaction status
    await transaction.update({
      status: 'COMPLETED',
      completedById: req.user.id,
      completedAt: new Date()
    });
    
    // Return the updated transaction
    const updatedTransaction = await Transaction.findByPk(req.params.id, {
      include: [
        {
          model: TransactionItem,
          as: 'items',
          include: [
            {
              model: Inventory,
              as: 'inventory',
              include: [
                {
                  model: ItemMaster,
                  as: 'itemMaster',
                  attributes: ['id', 'itemNumber', 'shortDescription']
                }
              ]
            },
            {
              model: StorageLocation,
              as: 'sourceLocation',
              attributes: ['id', 'code', 'description']
            },
            {
              model: StorageLocation,
              as: 'destinationLocation',
              attributes: ['id', 'code', 'description']
            }
          ]
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        },        {
          model: User,
          as: 'completedBy',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: updatedTransaction,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get transactions
// @route   GET /api/warehouse/transaction
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const { 
      transactionType, 
      status, 
      referenceNumber,
      startDate,
      endDate
    } = req.query;
    
    const { Op } = require('sequelize');
    const whereClause = {};
    
    if (transactionType) {
      whereClause.transactionType = transactionType;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    if (referenceNumber) {
      whereClause.referenceNumber = {
        [Op.like]: `%${referenceNumber}%`
      };
    }
    
    // Date range filter
    if (startDate || endDate) {
      whereClause.createdAt = {};
      
      if (startDate) {
        whereClause.createdAt[Op.gte] = new Date(startDate);
      }
      
      if (endDate) {
        whereClause.createdAt[Op.lte] = new Date(endDate);
      }
    }
    
    const transactions = await Transaction.findAll({
      where: whereClause,
      include: [
        {
          model: TransactionItem,
          as: 'items',
          include: [
            {
              model: Inventory,
              as: 'inventory',
              include: [
                {
                  model: ItemMaster,
                  as: 'itemMaster',
                  attributes: ['id', 'itemNumber', 'shortDescription']
                }
              ]
            },
            {
              model: StorageLocation,
              as: 'sourceLocation',
              attributes: ['id', 'code', 'description']
            },
            {
              model: StorageLocation,
              as: 'destinationLocation',
              attributes: ['id', 'code', 'description']
            }
          ]
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'completedBy',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get a transaction by ID
// @route   GET /api/warehouse/transaction/:id
// @access  Private
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [
        {
          model: TransactionItem,
          as: 'items',
          include: [
            {
              model: Inventory,
              as: 'inventory',
              include: [
                {
                  model: ItemMaster,
                  as: 'itemMaster',
                  attributes: ['id', 'itemNumber', 'shortDescription']
                }
              ]
            },
            {
              model: StorageLocation,
              as: 'sourceLocation',
              attributes: ['id', 'code', 'description']
            },
            {
              model: StorageLocation,
              as: 'destinationLocation',
              attributes: ['id', 'code', 'description']
            },
            {
              model: BinLocation,
              as: 'sourceBin',
              attributes: ['id', 'binCode', 'description']
            },
            {
              model: BinLocation,
              as: 'destinationBin',
              attributes: ['id', 'binCode', 'description']
            }
          ]
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'completedBy',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get transactions by type
// @route   GET /api/warehouse/transaction/type/:type
// @access  Private
exports.getTransactionsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    // Validate transaction type
    if (!['GR', 'GI', 'GE', 'GT'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction type',
      });
    }
    
    const transactions = await Transaction.findAll({
      where: { transactionType: type },
      include: [
        {
          model: TransactionItem,
          as: 'items',
          include: [
            {
              model: Inventory,
              as: 'inventory',
              include: [
                {
                  model: ItemMaster,
                  as: 'itemMaster',
                  attributes: ['id', 'itemNumber', 'shortDescription']
                }
              ]
            }
          ]
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get bins by storage location
// @route   GET /api/warehouse/storage-location/:id/bins
// @access  Private
exports.getBinsByStorageLocation = async (req, res) => {
  try {
    const storageLocationId = req.params.id;
    
    console.log('🔍 Getting bins for storage location:', storageLocationId);
      // Check if storage location exists
    const storageLocation = await StorageLocationModel.findByPk(storageLocationId);
    if (!storageLocation) {
      console.log('❌ Storage location not found');
      return res.status(404).json({
        success: false,
        message: 'Storage location not found',
      });
    }
    
    console.log('✅ Storage location found:', storageLocation.code);
      // Get all bins for this storage location (without associations for now)
    const bins = await BinLocationModel.findAll({
      where: { storageLocationId },
      order: [['binCode', 'ASC']]
    });
    
    console.log(`✅ Found ${bins.length} bins for storage location`);
    
    res.status(200).json({
      success: true,
      count: bins.length,
      data: bins,
    });
  } catch (error) {
    console.error('❌ Error in getBinsByStorageLocation:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.name
    });
  }
};
