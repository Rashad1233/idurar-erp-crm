const express = require('express');
const router = express.Router();

// Direct procurement data retrieval with SQL
router.get('/procurement/supplier', async (req, res) => {
  try {
    const { sequelize } = require('../models/sequelize');
    
    // Get supplier data with direct SQL
    const [suppliers] = await sequelize.query(`
      SELECT s.*, 
             c.name as "createdByName", c.email as "createdByEmail",
             u.name as "updatedByName", u.email as "updatedByEmail"
      FROM "Suppliers" s
      LEFT JOIN "Users" c ON s."createdById" = c.id
      LEFT JOIN "Users" u ON s."updatedById" = u.id
      ORDER BY s."createdAt" DESC
    `);
    
    return res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
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

// Get a single supplier
router.get('/procurement/supplier/:id', async (req, res) => {
  try {
    const { sequelize } = require('../models/sequelize');
    const supplierId = req.params.id;
    
    // Get supplier data with direct SQL
    const [suppliers] = await sequelize.query(`
      SELECT s.*, 
             c.name as "createdByName", c.email as "createdByEmail",
             u.name as "updatedByName", u.email as "updatedByEmail"
      FROM "Suppliers" s
      LEFT JOIN "Users" c ON s."createdById" = c.id
      LEFT JOIN "Users" u ON s."updatedById" = u.id
      WHERE s.id = :supplierId
    `, {
      replacements: { supplierId }
    });
    
    if (suppliers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: suppliers[0],
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

// Add routes for purchase requisition
router.get('/procurement/purchase-requisition', async (req, res) => {
  try {
    const { sequelize } = require('../models/sequelize');
    
    // Get PR data with direct SQL
    const [prs] = await sequelize.query(`
      SELECT pr.*, 
             r.name as "requestorName", 
             c.name as "createdByName",
             a.name as "approverName"
      FROM "PurchaseRequisitions" pr
      LEFT JOIN "Users" r ON pr."requestorId" = r.id
      LEFT JOIN "Users" c ON pr."createdById" = c.id
      LEFT JOIN "Users" a ON pr."currentApproverId" = a.id
      ORDER BY pr."createdAt" DESC
    `);
    
    return res.status(200).json({
      success: true,
      count: prs.length,
      data: prs,
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

// Also override any existing route calls with this middleware
router.use('/procurement/:route', (req, res, next) => {
  console.log(`🔍 Debug: Checking procurement route: ${req.params.route}`);
  next();
});

module.exports = router;
