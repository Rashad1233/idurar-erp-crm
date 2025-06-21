const express = require('express');
const router = express.Router();
const { sequelize } = require('../models/sequelize');

// Route to get the structure of the ItemMasters table
router.get('/debug/item-masters-schema', async (req, res) => {
  try {
    console.log('Retrieving ItemMasters table schema...');
    
    // Query to get column information
    const query = `
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM 
        information_schema.columns
      WHERE 
        table_name = 'ItemMasters'
      ORDER BY 
        ordinal_position;
    `;
    
    const columns = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT
    });
    
    // Query to get a sample row
    const sampleQuery = `
      SELECT *
      FROM "ItemMasters"
      LIMIT 1;
    `;
    
    let sample = [];
    try {
      sample = await sequelize.query(sampleQuery, {
        type: sequelize.QueryTypes.SELECT
      });
    } catch (err) {
      console.log('No sample data available:', err.message);
    }
    
    return res.status(200).json({
      success: true,
      message: 'ItemMasters table schema retrieved successfully',
      data: {
        columns,
        sampleRow: sample[0] || null,
        tableExists: columns.length > 0
      }
    });
  } catch (error) {
    console.error('Error retrieving ItemMasters table schema:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve ItemMasters table schema',
      error: error.message
    });
  }
});

// Route to get all ItemMasters records
router.get('/debug/item-masters', async (req, res) => {
  try {
    console.log('Retrieving all ItemMasters records...');
    
    const query = `
      SELECT *
      FROM "ItemMasters"
      ORDER BY "createdAt" DESC
      LIMIT 100;
    `;
    
    const records = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT
    });
    
    return res.status(200).json({
      success: true,
      message: 'ItemMasters records retrieved successfully',
      data: {
        count: records.length,
        records
      }
    });
  } catch (error) {
    console.error('Error retrieving ItemMasters records:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve ItemMasters records',
      error: error.message
    });
  }
});

module.exports = router;
