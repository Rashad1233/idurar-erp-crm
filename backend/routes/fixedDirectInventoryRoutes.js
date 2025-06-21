const express = require('express');
const router = express.Router();

// Direct inventory data retrieval with SQL - improved version
router.get('/inventory', async (req, res) => {
  try {
    console.log('🔍 Direct inventory route called');
    const { sequelize } = require('../models/sequelize');
    
    // Extract pagination and filter parameters
    const {
      page = 1,
      limit = 20,
      inventoryNumber,
      description,
      condition,
      warehouse
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Build WHERE clause based on filters
    let whereClause = '';
    const whereParams = [];
    
    if (inventoryNumber) {
      whereClause += ' AND i."inventoryNumber" ILIKE ?';
      whereParams.push(`%${inventoryNumber}%`);
    }
    
    if (description) {
      whereClause += ' AND im."shortDescription" ILIKE ?';
      whereParams.push(`%${description}%`);
    }
    
    if (condition) {
      whereClause += ' AND i."condition" = ?';
      whereParams.push(condition);
    }
    
    if (warehouse) {
      whereClause += ' AND i."warehouse" ILIKE ?';
      whereParams.push(`%${warehouse}%`);
    }
    
    // Try both table naming conventions
    try {
      console.log('Attempting with capitalized table names first...');
      // Get inventory data with direct SQL using capitalized table names
      const [inventoryItems] = await sequelize.query(`
        SELECT i.*,  
               im.id as "itemMasterId",
               im."itemNumber", 
               im."shortDescription" as "itemDescription", 
               COALESCE(im."manufacturerName", '') as "manufacturer",
               COALESCE(im."uom", '') as "uom",
               COALESCE(sl."name", '') as "storageLocationName",
               COALESCE(bl."code", '') as "binCode",
               COALESCE(u."name", '') as "lastUpdatedByName"
        FROM "Inventories" i
        LEFT JOIN "ItemMasters" im ON i."itemMasterId" = im.id
        LEFT JOIN "StorageLocations" sl ON i."storageLocationId" = sl.id
        LEFT JOIN "BinLocations" bl ON i."binLocationId" = bl.id
        LEFT JOIN "Users" u ON i."lastUpdatedById" = u.id
        WHERE 1=1 ${whereClause}
        ORDER BY i."updatedAt" DESC
        LIMIT ${limit} OFFSET ${offset}
      `, { 
        replacements: whereParams 
      });
      
      // Get total count for pagination
      const [countResult] = await sequelize.query(`
        SELECT COUNT(*) as total 
        FROM "Inventories" i
        LEFT JOIN "ItemMasters" im ON i."itemMasterId" = im.id
        WHERE 1=1 ${whereClause}
      `, {
        replacements: whereParams
      });
      
      const totalCount = parseInt(countResult[0].total);
      const totalPages = Math.ceil(totalCount / limit);
      
      console.log(`✅ Retrieved ${inventoryItems.length} inventory items via direct SQL`);
      
      return res.status(200).json({
        success: true,
        data: inventoryItems,
        count: totalCount,
        totalPages,
        currentPage: parseInt(page)
      });
    } catch (error) {
      console.error('❌ Error with capitalized table names, trying lowercase...');
      
      try {        // Fallback to lowercase/underscored table names
        const [inventoryItems] = await sequelize.query(`
          SELECT i.*,  
                 im.id as "itemMasterId",
                 im."itemNumber" as "itemNumber", 
                 im."shortDescription" as "itemDescription", 
                 COALESCE(im."manufacturerName", '') as "manufacturer",
                 COALESCE(im."uom", '') as "uom"
          FROM "Inventories" i
          LEFT JOIN "ItemMasters" im ON i."itemMasterId" = im.id
          WHERE 1=1 ${whereClause}
          ORDER BY i."updatedAt" DESC
          LIMIT ${limit} OFFSET ${offset}
        `, { 
          replacements: whereParams 
        });
        
        // Get total count for pagination        const [countResult] = await sequelize.query(`
          SELECT COUNT(*) as total 
          FROM "Inventories" i
          LEFT JOIN "ItemMasters" im ON i."itemMasterId" = im.id
          WHERE 1=1 ${whereClause}
        `, {
          replacements: whereParams
        });
        
        const totalCount = parseInt(countResult[0].total);
        const totalPages = Math.ceil(totalCount / limit);
        
        console.log(`✅ Retrieved ${inventoryItems.length} inventory items via direct SQL (lowercase tables)`);
        
        return res.status(200).json({
          success: true,
          data: inventoryItems,
          count: totalCount,
          totalPages,
          currentPage: parseInt(page)
        });
      } catch (error2) {
        throw error; // Throw the original error if both attempts fail
      }
    }
  } catch (error) {
    console.error('❌ Error loading inventory data:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching inventory data',
      error: error.message
    });
  }
});

// Direct route for inventory item details - improved with fallback
router.get('/inventory/:id', async (req, res) => {
  try {
    const { sequelize } = require('../models/sequelize');
    const { id } = req.params;
    
    try {
      // Try with capitalized table names first
      console.log('Attempting with capitalized table names first for item lookup...');
      
      // Get inventory item with direct SQL
      const [inventoryItems] = await sequelize.query(`
        SELECT i.*, 
               im."itemNumber", 
               im."shortDescription" as "description", 
               im."manufacturerName" as "manufacturer",
               im."uom",
               sl."name" as "locationName",
               bl."code" as "binLocation",
               u."name" as "lastUpdatedByName"
        FROM "Inventories" i
        LEFT JOIN "ItemMasters" im ON i."itemMasterId" = im.id
        LEFT JOIN "StorageLocations" sl ON i."storageLocationId" = sl.id
        LEFT JOIN "BinLocations" bl ON i."binLocationId" = bl.id
        LEFT JOIN "Users" u ON i."lastUpdatedById" = u.id
        WHERE i.id = :id
      `, {
        replacements: { id }
      });
      
      if (inventoryItems.length === 0) {
        throw new Error('Item not found with capitalized table names');
      }
      
      return res.status(200).json({
        success: true,
        data: inventoryItems[0]
      });
    } catch (error) {
      console.log('Falling back to lowercase table names...');
        // Fallback to lowercase table names
      const [inventoryItems] = await sequelize.query(`
        SELECT i.*, 
               im."itemNumber" as "itemNumber", 
               im."shortDescription" as "description", 
               im."manufacturerName" as "manufacturer",
               im."uom"
        FROM "Inventories" i
        LEFT JOIN "ItemMasters" im ON i."itemMasterId" = im.id
        WHERE i.id = :id
      `, {
        replacements: { id }
      });
      
      if (inventoryItems.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Inventory item not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: inventoryItems[0]
      });
    }
  } catch (error) {
    console.error('❌ Error loading inventory item:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching inventory item',
      error: error.message
    });
  }
});

// Get storage locations for inventory - with fallback
router.get('/warehouse/storage-locations', async (req, res) => {
  try {
    const { sequelize } = require('../models/sequelize');
    
    try {
      // Get storage locations with direct SQL - capitalized table names
      const [locations] = await sequelize.query(`
        SELECT sl.*, 
               u."name" as "createdByName"
        FROM "StorageLocations" sl
        LEFT JOIN "Users" u ON sl."createdById" = u.id
        ORDER BY sl."name" ASC
      `);
      
      return res.status(200).json({
        success: true,
        count: locations.length,
        data: locations
      });
    } catch (error) {
      console.log('Falling back to lowercase table names for storage locations...');
      
      // Fallback to lowercase table names
      const [locations] = await sequelize.query(`
        SELECT sl.*, 
               u."name" as "created_by_name"
        FROM "storage_locations" sl
        LEFT JOIN "users" u ON sl."created_by_id" = u.id
        ORDER BY sl."name" ASC
      `);
      
      return res.status(200).json({
        success: true,
        count: locations.length,
        data: locations
      });
    }
  } catch (error) {
    console.error('❌ Error loading storage locations:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching storage locations',
      error: error.message
    });
  }
});

// Get bin locations for inventory - with fallback
router.get('/warehouse/bin-locations', async (req, res) => {
  try {
    const { sequelize } = require('../models/sequelize');
    
    try {
      // Get bin locations with direct SQL - capitalized table names
      const [bins] = await sequelize.query(`
        SELECT bl.*, 
               sl."name" as "storageLocationName",
               u."name" as "createdByName"
        FROM "BinLocations" bl
        LEFT JOIN "StorageLocations" sl ON bl."storageLocationId" = sl.id
        LEFT JOIN "Users" u ON bl."createdById" = u.id
        ORDER BY sl."name" ASC, bl."code" ASC
      `);
      
      return res.status(200).json({
        success: true,
        count: bins.length,
        data: bins
      });
    } catch (error) {
      console.log('Falling back to lowercase table names for bin locations...');
      
      // Fallback to lowercase table names
      const [bins] = await sequelize.query(`
        SELECT bl.*, 
               sl."name" as "storage_location_name",
               u."name" as "created_by_name"
        FROM "bin_locations" bl
        LEFT JOIN "storage_locations" sl ON bl."storage_location_id" = sl.id
        LEFT JOIN "users" u ON bl."created_by_id" = u.id
        ORDER BY sl."name" ASC, bl."code" ASC
      `);
      
      return res.status(200).json({
        success: true,
        count: bins.length,
        data: bins
      });
    }
  } catch (error) {
    console.error('❌ Error loading bin locations:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching bin locations',
      error: error.message
    });
  }
});

module.exports = router;
