const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../models/sequelize');

// Simple, direct item creation route with absolutely no middleware
router.post('/super-simple-item-create', async (req, res) => {
  console.log('🔥 SUPER SIMPLE ITEM CREATE ROUTE HIT');
  console.log('🔥 RECEIVED DATA:', req.body);
  
  try {    // Generate UUID and timestamp
    const itemId = uuidv4();
    const createdById = req.body.createdById || '5a772bde-25ca-4ccb-ad50-e11b01899a87'; // Use an existing user ID
    const now = new Date();
    
    // Extract data from request with defaults
    const {
      itemNumber = `AUTO-${Date.now()}`,
      shortDescription = 'Default Description', 
      longDescription = '',
      standardDescription = 'Standard Description',
      uom = 'EA',
      equipmentCategory = '',
      equipmentSubCategory = '', 
      unspscCode = '',
      unspscCodeId = null,
      manufacturerName = '',
      manufacturerPartNumber = '',
      criticality = 'NO',
      stockItem = 'N',
      plannedStock = 'N',
      stockCode = 'NS3',
      equipmentTag = '',
      serialNumber = 'N',
      status = 'DRAFT',
      contractNumber = '',
      supplierName = ''
    } = req.body;
    
    // Direct raw SQL insert - as simple as possible
    const result = await sequelize.query(`
      INSERT INTO "ItemMasters" (
        "id", 
        "itemNumber", 
        "shortDescription",
        "longDescription", 
        "standardDescription",
        "manufacturerName",
        "manufacturerPartNumber",
        "equipmentCategory",
        "equipmentSubCategory", 
        "unspscCodeId",
        "unspscCode",
        "uom",
        "equipmentTag",
        "serialNumber", 
        "criticality",
        "stockItem", 
        "plannedStock",
        "stockCode",
        "status", 
        "contractNumber",
        "supplierName",
        "createdById",
        "createdAt",
        "updatedAt",
        "created_at",
        "updated_at"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
      ) RETURNING *    
    `, {
      bind: [
        itemId, 
        itemNumber, 
        shortDescription,                    // shortDescription 
        longDescription || '',               // longDescription
        standardDescription || shortDescription, // standardDescription
        manufacturerName || '',              // manufacturerName
        manufacturerPartNumber || '',        // manufacturerPartNumber
        equipmentCategory || '',             // equipmentCategory
        equipmentSubCategory || '',          // equipmentSubCategory
        unspscCodeId,                        // unspscCodeId
        unspscCode || '',                    // unspscCode
        uom || 'EA',                         // uom
        equipmentTag || '',                  // equipmentTag
        serialNumber || 'N',                 // serialNumber
        criticality || 'NO',                 // criticality
        stockItem || 'N',                    // stockItem
        plannedStock || 'N',                 // plannedStock
        stockCode || 'NS3',                  // stockCode
        status || 'DRAFT',                   // status
        contractNumber || '',                // contractNumber
        supplierName || '',                  // supplierName
        createdById,                         // createdById - REQUIRED!
        now,                                 // createdAt
        now,                                 // updatedAt
        now,                                 // created_at
        now                                  // updated_at
      ],
      type: sequelize.QueryTypes.INSERT
    });
    
    console.log('🎉 ITEM CREATED SUCCESSFULLY');
    
    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: {
        id: itemId,
        itemNumber: itemNumber
      }
    });
  } catch (error) {
    console.error('💥 ERROR CREATING ITEM:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create item',
      error: error.toString()
    });
  }
});

module.exports = router;
