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
      const [inventoryItems] = await sequelize.query(`        SELECT i.*,  
               im.id as "itemMasterId",
               im."itemNumber", 
               im."shortDescription" as "itemDescription", 
               COALESCE(im."manufacturerName", '') as "manufacturer",
               COALESCE(im."uom", '') as "uom",
               COALESCE(sl."name", '') as "storageLocationName",
               COALESCE(bl."code", '') as "binCode",
               COALESCE(u."name", '') as "lastUpdatedByName",
               -- Safely handle criticality enum with CASE statement
               CASE 
                 WHEN im."criticality" IS NULL THEN NULL
                 WHEN im."criticality" = 'medium' THEN 'Medium'
                 WHEN im."criticality" = 'high' THEN 'High'
                 WHEN im."criticality" = 'low' THEN 'Low'
                 ELSE im."criticality"::text
               END as "criticality"
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
        
        // Get total count for pagination
        const [countResult] = await sequelize.query(`
          SELECT COUNT(*) as total 
          FROM "inventory" i
          LEFT JOIN "item_master" im ON i."itemId" = im.id
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

// Inventory search routes (must come before /inventory/:id to avoid routing conflicts)
router.get('/inventory/search', async (req, res) => {
  try {
    const { keyword, limit = 20 } = req.query;

    if (!keyword || keyword.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Keyword must be at least 2 characters long'
      });
    }

    const { sequelize } = require('../models/sequelize');
    const { Op } = require('sequelize');
    const searchKeyword = `%${keyword.trim()}%`;    // Search inventory items with direct SQL
    const inventoryItems = await sequelize.query(`
      SELECT 
        i.id, 
        i."inventoryNumber",
        i."physicalBalance",
        i."unitPrice",
        i."condition",
        i."warehouse",
        i."binLocationText",
        i."minimumLevel",
        i."maximumLevel",
        im."itemNumber",
        im."shortDescription" as "itemName",
        im."longDescription" as "description",
        im."manufacturerName",
        im."manufacturerPartNumber",
        im."uom",
        im."criticality",
        im."unspscCode",
        sl.code as "storageLocationCode",
        sl.description as "storageLocationDescription",
        bl."binCode" as "binLocationCode",
        bl.description as "binLocationDescription"
      FROM "Inventories" i
      LEFT JOIN "ItemMasters" im ON i."itemMasterId" = im.id
      LEFT JOIN "StorageLocations" sl ON i."storageLocationId" = sl.id
      LEFT JOIN "BinLocations" bl ON i."binLocationId" = bl.id
      WHERE (
        i."inventoryNumber" ILIKE $1 OR
        i."warehouse" ILIKE $1 OR
        i."binLocationText" ILIKE $1 OR
        im."itemNumber" ILIKE $1 OR
        im."shortDescription" ILIKE $1 OR
        im."longDescription" ILIKE $1 OR
        im."manufacturerName" ILIKE $1 OR
        im."manufacturerPartNumber" ILIKE $1
      )
      ORDER BY 
        CASE 
          WHEN i."inventoryNumber" ILIKE $1 THEN 1
          WHEN im."itemNumber" ILIKE $1 THEN 2
          WHEN im."shortDescription" ILIKE $1 THEN 3
          ELSE 4
        END,
        i."updatedAt" DESC
      LIMIT $2
    `, {
      bind: [searchKeyword, parseInt(limit)],
      type: sequelize.QueryTypes.SELECT
    });

    console.log('🔍 Search results:', inventoryItems?.length || 0, 'items found');

    // Ensure inventoryItems is an array
    const items = Array.isArray(inventoryItems) ? inventoryItems : [];

    // Format the results for frontend consumption
    const formattedResults = items.map(item => ({
      id: item.id,
      inventoryNumber: item.inventoryNumber,
      physicalBalance: parseFloat(item.physicalBalance) || 0,
      unitPrice: parseFloat(item.unitPrice) || 0,
      condition: item.condition,
      warehouse: item.warehouse,
      binLocationText: item.binLocationText,
      minimumLevel: parseFloat(item.minimumLevel) || 0,
      maximumLevel: parseFloat(item.maximumLevel) || 0,
      itemMaster: {
        itemNumber: item.itemNumber,
        shortDescription: item.itemName,
        longDescription: item.description,
        manufacturerName: item.manufacturerName,
        manufacturerPartNumber: item.manufacturerPartNumber,
        uom: item.uom,
        criticality: item.criticality,
        unspscCode: item.unspscCode
      },
      storageLocation: item.storageLocationCode ? {
        code: item.storageLocationCode,
        description: item.storageLocationDescription
      } : null,
      binLocation: item.binLocationCode ? {
        binCode: item.binLocationCode,
        description: item.binLocationDescription
      } : null
    }));

    return res.status(200).json({
      success: true,
      data: formattedResults,
      count: formattedResults.length,
      message: `Found ${formattedResults.length} items matching "${keyword}"`
    });

  } catch (error) {
    console.error('❌ Error searching inventory items:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while searching inventory items',
      error: error.message
    });
  }
});

// Advanced search for inventory items
router.get('/inventory/advanced-search', async (req, res) => {
  try {
    const {
      inventoryNumber,
      description,
      itemNumber,
      manufacturerName,
      criticality,
      condition,
      warehouse,
      belowMinimum,
      page = 1,
      limit = 20
    } = req.query;

    const { sequelize } = require('../models/sequelize');
    const offset = (page - 1) * limit;

    // Build WHERE clauses based on search parameters
    let whereConditions = [];
    let bindings = [];
    let bindIndex = 1;

    if (inventoryNumber) {
      whereConditions.push(`i."inventoryNumber" ILIKE $${bindIndex}`);
      bindings.push(`%${inventoryNumber}%`);
      bindIndex++;
    }

    if (condition) {
      whereConditions.push(`i."condition" = $${bindIndex}`);
      bindings.push(condition);
      bindIndex++;
    }

    if (warehouse) {
      whereConditions.push(`i."warehouse" ILIKE $${bindIndex}`);
      bindings.push(`%${warehouse}%`);
      bindIndex++;
    }

    if (description) {
      whereConditions.push(`(im."shortDescription" ILIKE $${bindIndex} OR im."longDescription" ILIKE $${bindIndex})`);
      bindings.push(`%${description}%`);
      bindIndex++;
    }

    if (itemNumber) {
      whereConditions.push(`im."itemNumber" ILIKE $${bindIndex}`);
      bindings.push(`%${itemNumber}%`);
      bindIndex++;
    }

    if (manufacturerName) {
      whereConditions.push(`im."manufacturerName" ILIKE $${bindIndex}`);
      bindings.push(`%${manufacturerName}%`);
      bindIndex++;
    }

    if (criticality) {
      whereConditions.push(`im."criticality" = $${bindIndex}`);
      bindings.push(criticality);
      bindIndex++;
    }

    if (belowMinimum === 'true') {
      whereConditions.push(`i."physicalBalance" < i."minimumLevel"`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Add LIMIT and OFFSET to bindings
    bindings.push(parseInt(limit), parseInt(offset));

    const query = `
      SELECT 
        i.id, 
        i."inventoryNumber",
        i."physicalBalance",
        i."unitPrice",
        i."condition",
        i."warehouse",
        i."binLocationText",
        i."minimumLevel",
        i."maximumLevel",
        im."itemNumber",
        im."shortDescription" as "itemName",
        im."longDescription" as "description",
        im."manufacturerName",
        im."manufacturerPartNumber",
        im."uom",
        im."criticality",
        im."unspscCode",
        sl.code as "storageLocationCode",
        sl.description as "storageLocationDescription",
        bl."binCode" as "binLocationCode",
        bl.description as "binLocationDescription"
      FROM "Inventories" i
      LEFT JOIN "ItemMasters" im ON i."itemMasterId" = im.id
      LEFT JOIN "StorageLocations" sl ON i."storageLocationId" = sl.id
      LEFT JOIN "BinLocations" bl ON i."binLocationId" = bl.id
      ${whereClause}
      ORDER BY i."updatedAt" DESC
      LIMIT $${bindIndex} OFFSET $${bindIndex + 1}
    `;    const inventoryItems = await sequelize.query(query, {
      bind: bindings,
      type: sequelize.QueryTypes.SELECT
    });

    console.log('🔍 Advanced search results:', inventoryItems?.length || 0, 'items found');

    // Ensure inventoryItems is an array
    const items = Array.isArray(inventoryItems) ? inventoryItems : [];

    // Format the results for frontend consumption
    const formattedResults = items.map(item => ({
      id: item.id,
      inventoryNumber: item.inventoryNumber,
      physicalBalance: parseFloat(item.physicalBalance) || 0,
      unitPrice: parseFloat(item.unitPrice) || 0,
      condition: item.condition,
      warehouse: item.warehouse,
      binLocationText: item.binLocationText,
      minimumLevel: parseFloat(item.minimumLevel) || 0,
      maximumLevel: parseFloat(item.maximumLevel) || 0,
      itemMaster: {
        itemNumber: item.itemNumber,
        shortDescription: item.itemName,
        longDescription: item.description,
        manufacturerName: item.manufacturerName,
        manufacturerPartNumber: item.manufacturerPartNumber,
        uom: item.uom,
        criticality: item.criticality,
        unspscCode: item.unspscCode
      },
      storageLocation: item.storageLocationCode ? {
        code: item.storageLocationCode,
        description: item.storageLocationDescription
      } : null,
      binLocation: item.binLocationCode ? {
        binCode: item.binLocationCode,
        description: item.binLocationDescription
      } : null
    }));

    return res.status(200).json({
      success: true,
      data: formattedResults,
      count: formattedResults.length,
      total: formattedResults.length, // In a real implementation, you'd do a separate count query
      page: parseInt(page),
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error('❌ Error performing advanced search:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while performing advanced search',
      error: error.message
    });
  }
});

// Route for inventory selection modal - shows all items by default
router.get('/inventory/all-items', async (req, res) => {
  try {
    const { sequelize } = require('../models/sequelize');
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    console.log('🔍 Getting all inventory items for selection modal');
    
    const inventoryItems = await sequelize.query(`
      SELECT 
        i.id,
        i."inventoryNumber",
        i."physicalBalance",
        i."unitPrice",
        i."linePrice",
        i.condition,
        i."minimumLevel",
        i."maximumLevel",
        i.warehouse,
        i."binLocationText",
        i."itemMasterId",
        im."itemNumber",
        im."shortDescription" as description,
        im."longDescription",
        im."manufacturerName",
        im."manufacturerPartNumber",
        im.uom,
        im.criticality,
        im."equipmentCategory",
        CASE 
          WHEN i."physicalBalance" <= i."minimumLevel" THEN true 
          ELSE false 
        END as "belowMinimum"
      FROM "Inventories" i
      LEFT JOIN "ItemMasters" im ON i."itemMasterId" = im.id
      ORDER BY i."updatedAt" DESC
      LIMIT ${limit} OFFSET ${offset}
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    // Get total count for pagination
    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as total 
      FROM "Inventories" i
      LEFT JOIN "ItemMasters" im ON i."itemMasterId" = im.id
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    const total = parseInt(countResult.total);
    
    res.json({
      success: true,
      data: inventoryItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error getting all inventory items:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory items',
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
