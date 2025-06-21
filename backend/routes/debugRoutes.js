const express = require('express');
const { sequelize } = require('../models/sequelize');

const router = express.Router();

// Debug endpoint to check database connection and tables
router.get('/inventory-debug', async (req, res) => {
  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log('✅ Database connection test successful');
    
    // Get all tables in the database
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    // Get columns for the PurchaseRequisitions table
    let prColumns = [];
    try {
      [prColumns] = await sequelize.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'PurchaseRequisitions'
        ORDER BY ordinal_position
      `);
    } catch (err) {
      console.error('❌ Error getting PurchaseRequisitions columns:', err.message);
    }
    
    // Get columns for the Suppliers table
    let supplierColumns = [];
    try {
      [supplierColumns] = await sequelize.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'Suppliers'
        ORDER BY ordinal_position
      `);
    } catch (err) {
      console.error('❌ Error getting Suppliers columns:', err.message);
    }
    
    // Get columns for the Inventories table
    let inventoryColumns = [];
    try {
      [inventoryColumns] = await sequelize.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'Inventories'
        ORDER BY ordinal_position
      `);
    } catch (err) {
      console.error('❌ Error getting Inventories columns:', err.message);
    }

    // Send response with database info
    res.status(200).json({
      message: 'Database check successful',
      tables: tables.map(t => t.table_name),
      purchaseRequisitionColumns: prColumns,
      supplierColumns: supplierColumns,
      inventoryColumns: inventoryColumns
    });
  } catch (error) {
    console.error('❌ Database check failed:', error);
    res.status(500).json({
      message: 'Database check failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
