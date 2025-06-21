const express = require('express');
const router = express.Router();
const { Sequelize } = require('sequelize');
const sequelize = require('../models/sequelize');

// Direct route to create an item master bypassing all complex logic
router.post('/direct-item-create', async (req, res) => {
  try {
    console.log('📝 Received direct item create request with data:', req.body);
    
    // Essential fields - add default values if missing
    const itemData = {
      itemNumber: req.body.itemNumber || `ITEM-${Date.now()}`,
      itemDescription: req.body.itemDescription || 'Default description',
      standardDescription: req.body.standardDescription || req.body.itemDescription || 'Default standard description',
      unspscCode: req.body.unspscCode || '00000000',
      uom: req.body.uom || 'EA',
      active: req.body.active !== undefined ? req.body.active : true,
      createdBy: req.body.createdBy || 'system',
      updatedBy: req.body.updatedBy || 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Direct SQL insertion to bypass all ORM complexity
    const result = await sequelize.query(
      `INSERT INTO "ItemMasters" (
        "itemNumber", 
        "itemDescription", 
        "standardDescription",
        "unspscCode",
        "uom",
        "active",
        "createdBy",
        "updatedBy",
        "createdAt",
        "updatedAt"
      ) VALUES (
        :itemNumber,
        :itemDescription,
        :standardDescription,
        :unspscCode,
        :uom,
        :active,
        :createdBy,
        :updatedBy,
        :createdAt,
        :updatedAt
      ) RETURNING *`,
      {
        replacements: itemData,
        type: Sequelize.QueryTypes.INSERT
      }
    );
    
    console.log('✅ Item successfully created:', result[0][0]);
    
    res.status(201).json({
      success: true,
      data: result[0][0],
      message: 'Item created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating item:', error.message);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create item'
    });
  }
});

module.exports = router;
