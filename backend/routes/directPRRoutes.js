const express = require('express');
const router = express.Router();
const { Client } = require('pg');

// Direct PostgreSQL connection
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'erpdb',
  user: 'postgres',
  password: 'UHm8g167'
};

// Direct route to get PRs from PostgreSQL
router.get('/direct-list', async (req, res) => {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL directly');
    
    // Simple query to get all PRs
    const query = `
      SELECT 
        id,
        "prNumber",
        description,
        status,
        "totalAmount",
        "requestedBy",
        department,
        "dateRequired",
        "dateSubmitted",
        removed,
        "createdAt",
        "updatedAt"
      FROM "PurchaseRequisitions"
      WHERE removed = false
      ORDER BY "createdAt" DESC
    `;
    
    const result = await client.query(query);
    
    // Format for frontend compatibility
    const formattedResult = result.rows.map(row => ({
      _id: row.id,
      id: row.id,
      prNumber: row.prNumber,
      description: row.description,
      status: row.status,
      totalAmount: row.totalAmount,
      requestedBy: row.requestedBy,
      department: row.department,
      dateRequired: row.dateRequired,
      dateSubmitted: row.dateSubmitted,
      removed: row.removed,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
    
    res.json({
      success: true,
      result: formattedResult,
      pagination: {
        page: 1,
        pages: 1,
        count: formattedResult.length
      }
    });
    
  } catch (error) {
    console.error('❌ Direct PR query error:', error);
    res.status(500).json({
      success: false,
      message: 'Database query failed',
      error: error.message,
      stack: error.stack
    });
  } finally {
    await client.end();
  }
});

// Get only approved PRs for Purchase Order dropdown
router.get('/approved-list', async (req, res) => {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    
    const query = `
      SELECT 
        id,
        "prNumber",
        description,
        status,
        "totalAmount",
        "dateRequired"
      FROM "PurchaseRequisitions"
      WHERE removed = false AND status = 'approved'
      ORDER BY "createdAt" DESC
    `;
    
    const result = await client.query(query);
    
    const formattedResult = result.rows.map(row => ({
      _id: row.id,
      id: row.id,
      prNumber: row.prNumber,
      description: row.description,
      status: row.status,
      totalAmount: row.totalAmount,
      dateRequired: row.dateRequired
    }));
    
    res.json({
      success: true,
      result: formattedResult,
      count: formattedResult.length
    });
    
  } catch (error) {
    console.error('❌ Direct approved PR query error:', error);
    res.status(500).json({
      success: false,
      message: 'Database query failed',
      error: error.message
    });
  } finally {
    await client.end();
  }
});

module.exports = router;
