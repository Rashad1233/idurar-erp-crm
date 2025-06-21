const express = require('express');
const router = express.Router();

// Direct item master route with UNSPSC data included
router.get('/item-master', async (req, res) => {
  try {
    console.log('🔍 Simple direct item-master route called');
    const { sequelize } = require('../models/sequelize');
    
    // Get item master data with expanded UNSPSC information
    const [items] = await sequelize.query(`
      SELECT 
        im.*,
        u.name as "createdByName",
        u.email as "createdByEmail",
        uc.code as "unspscFullCode",
        uc.title as "unspscTitle"
      FROM 
        "ItemMasters" im
      LEFT JOIN 
        "Users" u ON im."createdById" = u.id
      LEFT JOIN 
        "UnspscCodes" uc ON im."unspscCode" = uc.code
      ORDER BY 
        im."createdAt" DESC
    `);
    
    console.log(`✅ Retrieved ${items.length} item masters via direct SQL`);
    
    // Process the data to ensure consistent format
    const processedItems = items.map(item => {
      // Log the raw UNSPSC data for debugging
      console.log(`Processing item ${item.itemNumber}, UNSPSC code: ${item.unspscCode}`);
      
      // Create formatted UNSPSC object
      const unspsc = {
        code: item.unspscCode || item.unspscFullCode || 'Unknown',
        title: item.unspscTitle || item.equipmentCategory || 'No title',
        description: item.unspscDescription || ''
      };
      
      // Debug log the UNSPSC object
      console.log('Created UNSPSC object:', JSON.stringify(unspsc));
      
      // Return the item with added fields
      return {
        ...item,
        unspsc
      };
    });
    
    return res.status(200).json({
      success: true,
      data: processedItems,
      count: processedItems.length
    });
  } catch (error) {
    console.error('❌ Error loading item master data:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching item master data',
      error: error.message
    });
  }
});

// Direct item master detail route
router.get('/item-master/:id', async (req, res) => {
  try {
    console.log(`🔍 Simple direct item-master detail route called for ID: ${req.params.id}`);
    const { sequelize } = require('../models/sequelize');
    const { id } = req.params;
    
    // Get item master data with expanded UNSPSC information
    const [items] = await sequelize.query(`
      SELECT 
        im.*,
        u.name as "createdByName",
        u.email as "createdByEmail",
        uc.code as "unspscFullCode",
        uc.title as "unspscTitle"
      FROM 
        "ItemMasters" im
      LEFT JOIN 
        "Users" u ON im."createdById" = u.id
      LEFT JOIN 
        "UnspscCodes" uc ON im."unspscCode" = uc.code
      WHERE 
        im.id = :id
    `, {
      replacements: { id }
    });
    
    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item master not found'
      });
    }
    
    // Process the data to ensure consistent format
    const item = items[0];
    
    // Create formatted UNSPSC object
    const unspsc = (item.unspscCode || item.unspscFullCode) ? {
      code: item.unspscCode || item.unspscFullCode || 'Unknown',
      title: item.unspscTitle || 'No title',
      description: item.unspscDescription || 'No description'
    } : null;
    
    // Return the item with added fields
    const processedItem = {
      ...item,
      unspsc
    };
    
    return res.status(200).json({
      success: true,
      data: processedItem
    });
  } catch (error) {
    console.error('❌ Error loading item master:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching item master',
      error: error.message
    });
  }
});

// Add a simple POST route for creating item masters
router.post('/item-master', async (req, res) => {
  const { protect } = require('../middleware/authMiddleware');
  
  try {
    // Call the middleware manually
    protect(req, res, async () => {
      try {
        const { sequelize } = require('../models/sequelize');
        const { v4: uuidv4 } = require('uuid');
        
        // Extract data from request
        const {
          itemNumber = `IM-${Math.floor(100000 + Math.random() * 900000)}`,
          shortDescription,
          longDescription,
          standardDescription,
          manufacturerName,
          manufacturerPartNumber,
          equipmentCategory,
          equipmentSubCategory,
          unspscCode,
          unspscCodeId,
          uom,
          serialNumber = 'N',
          criticality = 'NO',
          stockItem = 'N',
          plannedStock = 'N'
        } = req.body;
        
        // Validate required fields
        if (!shortDescription || !uom) {
          return res.status(400).json({
            success: false,
            message: 'Short description and UOM are required'
          });
        }
        
        // Generate a UUID for the new item
        const itemId = uuidv4();
        const now = new Date().toISOString();
        
        // Use the short description as the standard description if not provided
        const finalStandardDescription = standardDescription || shortDescription;
        
        // Insert the item into the database
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
            "unspscCodeId",
            "uom", 
            "serialNumber", 
            "criticality", 
            "stockItem", 
            "plannedStock", 
            "status", 
            "createdById", 
            "createdAt", 
            "updatedAt"
          ) VALUES (
            :id, 
            :itemNumber, 
            :description,
            :shortDescription, 
            :longDescription, 
            :standardDescription,
            :manufacturerName, 
            :manufacturerPartNumber, 
            :equipmentCategory, 
            :equipmentSubCategory, 
            :unspscCode, 
            :unspscCodeId,
            :uom, 
            :serialNumber, 
            :criticality, 
            :stockItem, 
            :plannedStock, 
            'DRAFT', 
            :createdById, 
            NOW(), 
            NOW()
          ) RETURNING "id", "itemNumber";
        `;
        
        const [result] = await sequelize.query(query, {
          replacements: {
            id: itemId,
            itemNumber,
            description: shortDescription, // Use shortDescription for the required description field
            shortDescription,
            longDescription: longDescription || shortDescription,
            standardDescription: finalStandardDescription,
            manufacturerName: manufacturerName || '',
            manufacturerPartNumber: manufacturerPartNumber || '',
            equipmentCategory: equipmentCategory || '',
            equipmentSubCategory: equipmentSubCategory || '',
            unspscCode: unspscCode || null,
            unspscCodeId: unspscCodeId || null,
            uom,
            serialNumber,
            criticality,
            stockItem,
            plannedStock,
            createdById: req.user.id
          },
          type: sequelize.QueryTypes.INSERT
        });
        
        return res.status(201).json({
          success: true,
          message: 'Item master created successfully',
          data: {
            id: itemId,
            itemNumber: result[0].itemNumber
          }
        });
      } catch (error) {
        console.error('Error in protected route:', error);
        return res.status(500).json({
          success: false,
          message: 'Server error while creating item master',
          error: error.message
        });
      }
    });
  } catch (error) {
    console.error('Error calling protect middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;