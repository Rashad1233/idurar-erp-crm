/**
 * Fixed direct route for item master creation
 * Bypasses the complexity of Sequelize models with proper column names
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../models/sequelize');
const { protect } = require('../middleware/authMiddleware');

// Create a new item master (direct SQL without ORM)
router.post('/fixed-create', protect, async (req, res) => {
  try {
    // Extract data from request
    const {
      itemNumber,
      shortDescription,
      longDescription,
      unspscCode,
      uom,
      equipmentCategory,
      equipmentSubCategory,
      manufacturerName,
      manufacturerPartNumber,
      criticality,
      stockItem,
      plannedStock,
    } = req.body;

    if (!shortDescription || !uom) {
      return res.status(400).json({ 
        success: false, 
        message: 'Required fields missing: shortDescription and uom are required' 
      });
    }
    
    // Generate UUID
    const id = uuidv4();
    const now = new Date().toISOString();
    const userId = req.user.id;
    
    // Get or create UNSPSC code
    let unspscCodeId = null;
    if (unspscCode) {
      try {
        // Check if UNSPSC code exists
        const [existingCodes] = await sequelize.query(
          `SELECT id FROM "UnspscCodes" WHERE code = $1 LIMIT 1`,
          { 
            replacements: [unspscCode],
            type: sequelize.QueryTypes.SELECT
          }
        );
        
        if (existingCodes && existingCodes.id) {
          unspscCodeId = existingCodes.id;
        } else {
          // Create new UNSPSC code
          const unspscId = uuidv4();
          await sequelize.query(
            `INSERT INTO "UnspscCodes" (
              id, code, title, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5)`,
            { 
              replacements: [
                unspscId,
                unspscCode,
                `Auto-created: ${unspscCode}`,
                now,
                now
              ]
            }
          );
          unspscCodeId = unspscId;
        }
      } catch (error) {
        console.error('Error handling UNSPSC code:', error);
      }
    }
      // Use direct SQL with correct column names
    const query = `
      INSERT INTO "ItemMasters" (
        "id", "itemNumber", "shortDescription", "longDescription", "standardDescription",
        "manufacturerName", "manufacturerPartNumber", 
        "equipmentCategory", "equipmentSubCategory", 
        "unspscCode", "unspscCodeId", 
        "uom", "serialNumber", "criticality", 
        "stockItem", "plannedStock", "status", 
        "createdById", "createdAt", "updatedAt"
      ) VALUES (
        :id, :itemNumber, :shortDescription, :longDescription, :standardDescription,
        :manufacturerName, :manufacturerPartNumber,
        :equipmentCategory, :equipmentSubCategory, 
        :unspscCode, :unspscCodeId,
        :uom, :serialNumber, :criticality, 
        :stockItem, :plannedStock, :status, 
        :createdById, :createdAt, :updatedAt
      ) RETURNING "id", "itemNumber";
    `;
      const [result] = await sequelize.query(query, { 
      replacements: {
        id,
        itemNumber: itemNumber || `FX-${Math.floor(100000 + Math.random() * 900000)}`,
        shortDescription,
        longDescription: longDescription || shortDescription,
        standardDescription: req.body.standardDescription || shortDescription, // Use shortDescription as fallback
        manufacturerName: manufacturerName || 'N/A',
        manufacturerPartNumber: manufacturerPartNumber || 'N/A',
        equipmentCategory: equipmentCategory || 'OTHER',
        equipmentSubCategory: equipmentSubCategory || '',
        unspscCode: unspscCode || null,
        unspscCodeId,
        uom,
        serialNumber: 'N',
        criticality: criticality || 'NO',
        stockItem: stockItem ? 'Y' : 'N',
        plannedStock: plannedStock ? 'Y' : 'N',
        status: 'DRAFT',
        createdById: userId,
        createdAt: now,
        updatedAt: now
      },
      type: sequelize.QueryTypes.INSERT
    });
    
    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Item master created successfully',
      data: {
        id,
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

module.exports = router;
