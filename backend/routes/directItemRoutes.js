const express = require('express');
const router = express.Router();

// Direct item data retrieval with SQL
router.get('/item-direct', async (req, res) => {
  try {
    const { sequelize } = require('../models/sequelize');
    
    // Get item data with direct SQL
    const [items] = await sequelize.query(`
      SELECT i.*, 
             i."shortDescription" as "description",
             c.name as "createdByName", c.email as "createdByEmail",
             u.name as "updatedByName", u.email as "updatedByEmail"
      FROM "ItemMasters" i
      LEFT JOIN "Users" c ON i."createdById" = c.id
      LEFT JOIN "Users" u ON i."updatedById" = u.id
      ORDER BY i."createdAt" DESC
    `);
    
    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
      note: 'Data retrieved via direct SQL query'
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Override the regular item endpoint
router.get('/item', async (req, res) => {
  try {
    const { sequelize } = require('../models/sequelize');
    
    // Get item data with direct SQL
    const [items] = await sequelize.query(`
      SELECT i.*, 
             i."shortDescription" as "description",
             c.name as "createdByName", c.email as "createdByEmail",
             u.name as "updatedByName", u.email as "updatedByEmail"
      FROM "ItemMasters" i
      LEFT JOIN "Users" c ON i."createdById" = c.id
      LEFT JOIN "Users" u ON i."updatedById" = u.id
      ORDER BY i."createdAt" DESC
    `);
    
    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
      note: 'Data retrieved via direct SQL query'
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
