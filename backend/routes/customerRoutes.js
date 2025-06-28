const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { protect } = require('../middleware/authMiddleware');
const sequelize = require('../config/postgresql');
const { DataTypes } = require('sequelize');

// All routes are protected
router.use(protect);

// Define Customer model
const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: DataTypes.STRING(255),
  phone: DataTypes.STRING(50),
  address: DataTypes.TEXT,
  city: DataTypes.STRING(100),
  state: DataTypes.STRING(100),
  postal_code: DataTypes.STRING(20),
  country: DataTypes.STRING(100),
  contact_person: DataTypes.STRING(255),
  tax_id: DataTypes.STRING(100),
  payment_terms: DataTypes.STRING(100),
  credit_limit: DataTypes.DECIMAL(15, 2),
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'customers',
  timestamps: true,
  underscored: true
});

/**
 * Get list of Customers
 * GET /api/customer/list
 */
router.get('/list', async (req, res) => {
  try {
    console.log('🔍 Customer Route Handler: Received list request');
    const { page = 1, items = 10, filter = {} } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(items);
    const limit = parseInt(items);

    const whereClause = {};
    if (filter && typeof filter === 'object') {
      Object.keys(filter).forEach(key => {
        if (filter[key] !== undefined && filter[key] !== null && filter[key] !== '') {
          if (key === 'name' || key === 'email' || key === 'contact_person') {
            whereClause[key] = {
              [Op.iLike]: `%${filter[key]}%`
            };
          } else {
            whereClause[key] = filter[key];
          }
        }
      });
    }

    const { count, rows } = await Customer.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    console.log(`✅ Customer Route Handler: Found ${count} customers`);
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
    console.error('❌ Customer Route Handler: Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
});

/**
 * Get Customer by ID
 * GET /api/customer/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      result: customer
    });
  } catch (error) {
    console.error('❌ Customer Route Handler: Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer',
      error: error.message
    });
  }
});

/**
 * Create new Customer
 * POST /api/customer/create
 */
router.post('/create', async (req, res) => {
  try {
    const customerData = req.body;
    const customer = await Customer.create(customerData);

    res.status(201).json({
      success: true,
      result: customer,
      message: 'Customer created successfully'
    });
  } catch (error) {
    console.error('❌ Customer Route Handler: Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating customer',
      error: error.message
    });
  }
});

/**
 * Update Customer
 * PATCH /api/customer/:id
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const [affectedRows] = await Customer.update(updateData, {
      where: { id },
      returning: true
    });

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const updatedCustomer = await Customer.findByPk(id);
    res.json({
      success: true,
      result: updatedCustomer,
      message: 'Customer updated successfully'
    });
  } catch (error) {
    console.error('❌ Customer Route Handler: Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: error.message
    });
  }
});

/**
 * Delete Customer
 * DELETE /api/customer/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const affectedRows = await Customer.destroy({
      where: { id }
    });

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('❌ Customer Route Handler: Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: error.message
    });
  }
});

module.exports = router;
