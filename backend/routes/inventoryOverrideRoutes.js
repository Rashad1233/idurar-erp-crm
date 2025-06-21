const express = require('express');
const router = express.Router();

// Function to wrap routes with error handling
const wrapAsync = (fn) => {
  return function(req, res, next) {
    fn(req, res, next).catch(next);
  };
};

// Comprehensive direct route for inventory page data
router.get('/inventory-all-data', wrapAsync(async (req, res) => {
  try {
    const { sequelize } = require('../models/sequelize');
    
    // Get inventory data
    const [inventoryItems] = await sequelize.query(`
      SELECT i.*, 
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
      ORDER BY i."updatedAt" DESC
      LIMIT 100
    `);
    
    // Get storage locations
    const [storageLocations] = await sequelize.query(`
      SELECT * FROM "StorageLocations" 
      ORDER BY "name" ASC
    `);
    
    // Get bin locations
    const [binLocations] = await sequelize.query(`
      SELECT bl.*, sl."name" as "locationName" 
      FROM "BinLocations" bl
      LEFT JOIN "StorageLocations" sl ON bl."storageLocationId" = sl.id
      ORDER BY sl."name" ASC, bl."code" ASC
    `);
    
    // Return all data
    return res.status(200).json({
      success: true,
      inventoryItems: {
        data: inventoryItems,
        count: inventoryItems.length
      },
      storageLocations: {
        data: storageLocations,
        count: storageLocations.length
      },
      binLocations: {
        data: binLocations,
        count: binLocations.length
      }
    });
  } catch (error) {
    console.error('❌ Error loading inventory page data:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching inventory page data',
      error: error.message
    });
  }
}));

// Special route that overrides the main /inventory route
router.get('/inventory-items', wrapAsync(async (req, res) => {
  try {
    const { sequelize } = require('../models/sequelize');
    
    // Get inventory data
    const [inventoryItems] = await sequelize.query(`
      SELECT 
        i.*,
        im.id as "itemMasterId",
        im."itemNumber",
        im."shortDescription",
        im."longDescription",
        COALESCE(im."manufacturerName", '') as "manufacturerName",
        COALESCE(im."manufacturerPartNumber", '') as "manufacturerPartNumber",
        COALESCE(im."uom", '') as "uom",
        COALESCE(im."criticality", 'medium') as "criticality",
        COALESCE(sl."name", '') as "storageName",
        COALESCE(sl."code", '') as "storageCode",
        COALESCE(bl."code", '') as "binCode",
        COALESCE(u."name", '') as "lastUpdatedByName"
      FROM 
        "Inventories" i
      LEFT JOIN 
        "ItemMasters" im ON i."itemMasterId" = im.id
      LEFT JOIN 
        "StorageLocations" sl ON i."storageLocationId" = sl.id
      LEFT JOIN 
        "BinLocations" bl ON i."binLocationId" = bl.id
      LEFT JOIN 
        "Users" u ON i."lastUpdatedById" = u.id
      ORDER BY 
        i."updatedAt" DESC
      LIMIT 100
    `);
    
    console.log(`✅ Retrieved ${inventoryItems.length} inventory items via direct SQL`);
    
    return res.status(200).json({
      success: true,
      data: inventoryItems,
      count: inventoryItems.length,
      totalPages: 1,
      currentPage: 1
    });
  } catch (error) {
    console.error('❌ Error loading inventory items:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching inventory items',
      error: error.message
    });
  }
}));

// Override the main inventory route
router.get('/inventory', (req, res) => {
  // Just forward to the inventory-items endpoint
  const { method, url, baseUrl, query, params, headers, body } = req;
  
  // Log the request for debugging
  console.log(`🔍 Redirecting /inventory to /api/inventory-items`);
  console.log(`   Original URL: ${url}, Query:`, query);
  
  // Forward to the more specific handler
  router.handle(
    { ...req, url: '/inventory-items' }, 
    res
  );
});

module.exports = router;
