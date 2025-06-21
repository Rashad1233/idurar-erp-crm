const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Import the itemMasterController - DISABLED due to syntax error
// const itemMasterController = require('../controllers/itemMasterController');

// Debug middleware to fix the item master issues
router.get('/item', async (req, res, next) => {
  console.log('🔍 Debug: Intercepting /api/item GET request');
  
  try {
    // Try direct SQL query instead of using the controller
    const { sequelize } = require('../models/sequelize');
    
    const [items] = await sequelize.query(`
      SELECT i.*, 
             c.name as "createdByName", c.email as "createdByEmail",
             u.name as "updatedByName", u.email as "updatedByEmail"
      FROM "ItemMasters" i
      LEFT JOIN "Users" c ON i."createdById" = c.id
      LEFT JOIN "Users" u ON i."updatedById" = u.id
      ORDER BY i."createdAt" DESC
    `);
    
    console.log(`✅ Retrieved ${items.length} items via direct SQL`);
    
    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
      note: 'Data retrieved via debug route SQL query'
    });
  } catch (error) {
    console.error('❌ Debug route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in debug route',
      error: error.message
    });
  }
});

router.get('/inventory/item', async (req, res, next) => {
  console.log('🔍 Debug: Intercepting /api/inventory/item GET request');
  
  try {
    // Try direct SQL query
    const { sequelize } = require('../models/sequelize');
    
    const [items] = await sequelize.query(`
      SELECT i.*, 
             c.name as "createdByName", c.email as "createdByEmail",
             u.name as "updatedByName", u.email as "updatedByEmail"
      FROM "ItemMasters" i
      LEFT JOIN "Users" c ON i."createdById" = c.id
      LEFT JOIN "Users" u ON i."updatedById" = u.id
      ORDER BY i."createdAt" DESC
    `);
    
    console.log(`✅ Retrieved ${items.length} items via direct SQL for inventory`);
    
    return res.status(200).json(items);
  } catch (error) {
    console.error('❌ Debug inventory route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in debug inventory route',
      error: error.message
    });
  }
});

module.exports = router;
