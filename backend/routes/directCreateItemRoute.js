const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../models/sequelize');

// Direct item master creation route - no middleware
router.post('/item-direct-create', async (req, res) => {
  try {
    console.log('Creating item master with direct SQL...');
    const { 
      itemNumber, 
      shortDescription, 
      longDescription,
      standardDescription,
      uom, 
      equipmentCategory,
      equipmentSubCategory,
      unspscCode,
      manufacturerName,
      manufacturerPartNumber,
      criticality = 'NO',
      stockItem = 'N',
      plannedStock = 'N'
    } = req.body;

    // Generate a UUID for the item
    const itemId = uuidv4();
    const now = new Date().toISOString();

    // Validate required fields
    if (!shortDescription) {
      return res.status(400).json({
        success: false,
        message: 'Short description is required'
      });
    }

    // Use direct SQL to insert the item
    const query = `
      INSERT INTO "ItemMasters" (
        "id", 
        "itemNumber",
        "description",
        "shortDescription",
        "longDescription",
        "standardDescription",
        "manufacturerName",
        "manufacturerPartNumber",
        "equipmentCategory",
        "equipmentSubCategory",
        "unspscCode",
        "uom",
        "serialNumber",
        "criticality",
        "stockItem",
        "plannedStock",
        "status",
        "createdAt", 
        "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      ) RETURNING "id", "itemNumber"
    `;

    const values = [
      itemId,
      itemNumber || `AUTO-${Math.floor(100000 + Math.random() * 900000)}`,
      shortDescription, // Use short description for the required description field
      shortDescription,
      longDescription || shortDescription,
      standardDescription || shortDescription, // Use shortDescription as fallback
      manufacturerName || '',
      manufacturerPartNumber || '',
      equipmentCategory || '',
      equipmentSubCategory || '',
      unspscCode || null,
      uom || 'EA',
      'N',
      criticality || 'NO',
      stockItem || 'N',
      plannedStock || 'N',
      'DRAFT',
      now,
      now
    ];

    const [result] = await sequelize.query(query, {
      bind: values,
      type: sequelize.QueryTypes.INSERT
    });

    console.log('Item master created successfully:', result);
    
    return res.status(201).json({
      success: true,
      message: 'Item master created successfully',
      data: {
        id: itemId,
        itemNumber: result[0].itemNumber
      }
    });
  } catch (error) {
    console.error('Error creating item master:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create item master',
      error: error.message
    });
  }
});

// Add a second route with the correct endpoint path
router.post('/direct-item-create', async (req, res) => {
  try {
    console.log('Creating item master with direct SQL via fixed route...');
    const { 
      itemNumber, 
      shortDescription, 
      longDescription,
      standardDescription,
      uom, 
      equipmentCategory,
      equipmentSubCategory,
      unspscCode,
      manufacturerName,
      manufacturerPartNumber,
      criticality = 'NO',
      stockItem = 'N',
      plannedStock = 'N'
    } = req.body;

    // Generate a UUID for the item
    const itemId = uuidv4();
    const now = new Date().toISOString();

    // Validate required fields
    if (!shortDescription) {
      return res.status(400).json({
        success: false,
        message: 'Short description is required'
      });
    }

    // Use direct SQL to insert the item
    const query = `
      INSERT INTO "ItemMasters" (
        "id", 
        "itemNumber",
        "description",
        "shortDescription",
        "longDescription",
        "standardDescription",
        "manufacturerName",
        "manufacturerPartNumber",
        "equipmentCategory",
        "equipmentSubCategory",
        "unspscCode",
        "uom",
        "serialNumber",
        "criticality",
        "stockItem",
        "plannedStock",
        "status",
        "createdAt", 
        "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      ) RETURNING "id", "itemNumber"
    `;

    const values = [
      itemId,
      itemNumber || `AUTO-${Math.floor(100000 + Math.random() * 900000)}`,
      shortDescription, // Use short description for the required description field
      shortDescription,
      longDescription || shortDescription,
      standardDescription || shortDescription, // Use shortDescription as fallback
      manufacturerName || '',
      manufacturerPartNumber || '',
      equipmentCategory || '',
      equipmentSubCategory || '',
      unspscCode || null,
      uom || 'EA',
      'N',
      criticality || 'NO',
      stockItem || 'N',
      plannedStock || 'N',
      'DRAFT',
      now,
      now
    ];

    const [result] = await sequelize.query(query, {
      bind: values,
      type: sequelize.QueryTypes.INSERT
    });

    console.log('Item master created successfully (fixed route):', result);
    
    return res.status(201).json({
      success: true,
      message: 'Item master created successfully',
      data: {
        id: itemId,
        itemNumber: result[0].itemNumber
      }
    });
  } catch (error) {
    console.error('Error creating item master (fixed route):', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create item master',
      error: error.message
    });
  }
});

module.exports = router;
