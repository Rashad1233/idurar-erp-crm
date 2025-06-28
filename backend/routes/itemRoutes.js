const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { protect } = require('../middleware/authMiddleware');
const sequelize = require('../config/postgresql');
const { DataTypes } = require('sequelize');

// All routes are protected
router.use(protect);

// Define Item model
const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: DataTypes.TEXT,
  sku: {
    type: DataTypes.STRING(100),
    unique: true
  },
  barcode: DataTypes.STRING(100),
  category: DataTypes.STRING(100),
  unit: DataTypes.STRING(50),
  price: DataTypes.DECIMAL(15, 2),
  cost: DataTypes.DECIMAL(15, 2),
  stock_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  min_stock_level: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'items',
  timestamps: true,
  underscored: true
});

/**
 * Get list of Items
 * GET /api/item/list
 */
router.get('/list', async (req, res) => {
  try {
    console.log('🔍 Item Route Handler: Received list request');
    const { page = 1, items = 10, filter = {} } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(items);
    const limit = parseInt(items);

    const whereClause = {};
    if (filter && typeof filter === 'object') {
      Object.keys(filter).forEach(key => {
        if (filter[key] !== undefined && filter[key] !== null && filter[key] !== '') {
          if (key === 'name' || key === 'description') {
            whereClause[key] = {
              [Op.iLike]: `%${filter[key]}%`
            };
          } else {
            whereClause[key] = filter[key];
          }
        }
      });
    }

    const { count, rows } = await Item.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    console.log(`✅ Item Route Handler: Found ${count} items`);
    res.json({
      success: true,
      result: rows,
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(items),
        total: count
      }
    });
  } catch (error) {
    console.error('❌ Item Route Handler: Error fetching items:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching items',
      error: error.message
    });
  }
});

/**
 * Get Item by ID
 * GET /api/item/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findByPk(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      result: item
    });
  } catch (error) {
    console.error('❌ Item Route Handler: Error fetching item:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching item',
      error: error.message
    });
  }
});

/**
 * Create new Item
 * POST /api/item/create
 */
router.post('/create', async (req, res) => {
  try {
    const itemData = req.body;
    const item = await Item.create(itemData);

    res.status(201).json({
      success: true,
      result: item,
      message: 'Item created successfully'
    });
  } catch (error) {
    console.error('❌ Item Route Handler: Error creating item:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating item',
      error: error.message
    });
  }
});

/**
 * Update Item
 * PATCH /api/item/:id
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const [affectedRows] = await Item.update(updateData, {
      where: { id },
      returning: true
    });

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    const updatedItem = await Item.findByPk(id);
    res.json({
      success: true,
      result: updatedItem,
      message: 'Item updated successfully'
    });
  } catch (error) {
    console.error('❌ Item Route Handler: Error updating item:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating item',
      error: error.message
    });
  }
});

/**
 * Delete Item
 * DELETE /api/item/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const affectedRows = await Item.destroy({
      where: { id }
    });

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('❌ Item Route Handler: Error deleting item:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting item',
      error: error.message
    });
  }
});

/**
 * Search items by barcode
 * GET /api/item/barcode/:barcode
 */
router.get('/barcode/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params;
    const item = await Item.findOne({
      where: { barcode }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      result: item
    });
  } catch (error) {
    console.error('❌ Item Route Handler: Error searching by barcode:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching by barcode',
      error: error.message
    });
  }
});

module.exports = router;
