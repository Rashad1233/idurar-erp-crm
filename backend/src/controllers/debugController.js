const express = require('express');
const router = express.Router();
const db = require('../../models/sequelize');
const { Client } = require('pg');
const pgConfig = {
  host: 'localhost',
  port: 5432,
  database: 'erpdb',
  user: 'postgres',
  password: 'UHm8g167'
};

// Debug route to check Purchase Requisition list with Sequelize
router.get('/pr-list-sequelize', async (req, res) => {
  try {
    const prs = await db.PurchaseRequisition.findAll({
      include: [{ all: true, nested: true }],
      limit: 10
    });
    res.json({ success: true, data: prs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sequelize PR list error', error: error.message });
  }
});

// Debug route to check Purchase Requisition list with direct SQL (pg)
router.get('/pr-list-simple', async (req, res) => {
  const client = new Client(pgConfig);
  try {
    await client.connect();
    const result = await client.query('SELECT * FROM "PurchaseRequisitions" WHERE removed = false LIMIT 10');
    await client.end();
    res.json({ success: true, data: result.rows });
  } catch (error) {
    await client.end();
    res.status(500).json({ success: false, message: 'Direct SQL PR list error', error: error.message });
  }
});

// Debug route to check backend server status
router.get('/status', (req, res) => {
  res.json({ success: true, message: 'Backend server is running' });
});

module.exports = router;
