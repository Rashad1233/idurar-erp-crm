const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../models/sequelize');

// The most basic, direct item creation route possible
router.post('/ultra-simple-item-create', async (req, res) => {
  try {
    console.log('🔥 ULTRA SIMPLE ROUTE: Creating item with direct SQL...');
    console.log('Request body:', req.body);
    
    // Get data from request
    const {
      itemNumber = `AUTO-${Date.now()}`,
      shortDescription = 'Default Item',
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
    } = req.body;    // Create UUIDs and timestamps
    const itemId = uuidv4();
    const createdById = req.body.createdById || '5a772bde-25ca-4ccb-ad50-e11b01899a87'; // Use an existing user ID
    const now = new Date().toISOString();

    // Following the EXACT table structure we got from database inspection
    const query = `
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
    `;

    // Make sure we're passing the right values in the right order
    const values = [
      itemId,                                  // id
      itemNumber,                              // itemNumber
      shortDescription,                        // shortDescription
      longDescription || '',                   // longDescription
      standardDescription || shortDescription, // standardDescription
      manufacturerName || '',                  // manufacturerName
      manufacturerPartNumber || '',            // manufacturerPartNumber
      equipmentCategory || '',                 // equipmentCategory
      equipmentSubCategory || '',              // equipmentSubCategory
      unspscCodeId,                            // unspscCodeId
      unspscCode || '',                        // unspscCode
      uom || 'EA',                             // uom
      equipmentTag || '',                      // equipmentTag
      serialNumber || 'N',                     // serialNumber
      criticality || 'NO',                     // criticality
      stockItem || 'N',                        // stockItem
      plannedStock || 'N',                     // plannedStock
      stockCode || 'NS3',                      // stockCode
      status || 'DRAFT',                       // status
      contractNumber || '',                    // contractNumber
      supplierName || '',                      // supplierName
      createdById,                             // createdById - REQUIRED!
      now,                                     // createdAt
      now,                                     // updatedAt
      now,                                     // created_at
      now                                      // updated_at
    ];    console.log('Executing query with values:', values);
    
    // Execute SQL query using proper binding for security
    const result = await sequelize.query(query, {
      bind: values,
      type: sequelize.QueryTypes.INSERT
    });

    console.log('🎉 SUCCESS! Item created:', result[0][0]);
    
    return res.status(201).json({
      success: true,
      message: 'Item created successfully via ultra simple route',
      data: {
        id: itemId,
        itemNumber: itemNumber,
        item: result[0][0]
      }
    });
  } catch (error) {
    console.error('❌ ERROR creating item:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create item',
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
