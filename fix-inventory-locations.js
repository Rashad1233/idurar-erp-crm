const express = require('express');
const router = express.Router();

// Simple direct inventory route - avoids all enum issues
router.get('/simple-inventory', async (req, res) => {
  try {
    console.log('🔍 Simple direct inventory route called');
    const { sequelize } = require('../models/sequelize');
      // Get inventory data with expanded fields including ItemMaster details
    const [inventoryItems] = await sequelize.query(`
      SELECT 
        i.id, 
        i."inventoryNumber",
        i."physicalBalance",
        i."unitPrice",
        i."linePrice",
        i."condition",
        i."minimumLevel",
        i."maximumLevel",
        i."warehouse",
        i."serialNumber",
        i."createdAt",
        i."updatedAt",
        i."itemMasterId",
        i."storageLocationId",
        i."binLocationId",
        i."binLocationText",
        im.id as "itemMasterIdRaw",
        im."itemNumber",
        im."shortDescription",
        im."unspscCode",
        im."uom",
        im."manufacturerName",
        im."manufacturerPartNumber",
        sl.code as "storageLocationCode",
        sl.description as "storageLocationDescription",
        bl."binCode" as "binLocationCode",
        bl.description as "binLocationDescription"
      FROM "Inventories" i
      LEFT JOIN "ItemMasters" im ON i."itemMasterId" = im.id
      LEFT JOIN "StorageLocations" sl ON i."storageLocationId" = sl.id
      LEFT JOIN "BinLocations" bl ON i."binLocationId" = bl.id
      ORDER BY i."updatedAt" DESC
      LIMIT 100
    `);
    
    console.log(`✅ Retrieved ${inventoryItems.length} inventory items via simple SQL`);
    
    // Process the data to ensure consistent format
    const processedItems = inventoryItems.map(item => {
      // Create properly structured itemMaster object
      const itemMaster = {
        id: item.itemMasterId || item.itemMasterIdRaw,
        itemNumber: item.itemNumber || 'No item number',
        shortDescription: item.shortDescription || 'No description',
        unspsc: {
          code: item.unspscCode || 'No UNSPSC code'
        },
        uom: item.uom || 'EA',
        manufacturerName: item.manufacturerName || 'Not specified',
        manufacturerPartNumber: item.manufacturerPartNumber || 'Not specified'
      };
      
      // Format storage location info
      const storageLocation = item.storageLocationId ? {
        id: item.storageLocationId,
        code: item.storageLocationCode,
        description: item.storageLocationDescription
      } : null;
      
      // Format bin location info
      const binLocation = item.binLocationId ? {
        id: item.binLocationId,
        code: item.binLocationCode,
        description: item.binLocationDescription
      } : null;
      
      // Calculate line price if not already available
      const linePrice = item.linePrice || parseFloat(item.physicalBalance || 0) * parseFloat(item.unitPrice || 0);
      
      // Return the item with added fields
      return {
        ...item,
        itemMaster,
        storageLocation: storageLocation ? `${storageLocation.code} - ${storageLocation.description}` : 'Not specified',
        binLocation: binLocation ? `${binLocation.code} - ${binLocation.description}` : 'Not specified',
        linePrice: linePrice
      };
    });
    
    return res.status(200).json({
      success: true,
      data: processedItems,
      count: processedItems.length,
      totalPages: 1,
      currentPage: 1
    });
  } catch (error) {
    console.error('❌ Error loading inventory data:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching inventory data',
      error: error.message
    });
  }
});

// Get a single inventory item with all related data
router.get('/simple-inventory/:id', async (req, res) => {
  try {
    console.log(`🔍 Simple direct inventory detail route called for ID: ${req.params.id}`);
    const { sequelize } = require('../models/sequelize');
    const { id } = req.params;
    
    // Get item with JOINS to get ItemMaster and location info
    const [items] = await sequelize.query(`
      SELECT 
        i.*,
        im.id as "itemMasterIdRaw",
        im."itemNumber",
        im."shortDescription",
        im."unspscCode",
        im."uom",
        im."manufacturerName",
        im."manufacturerPartNumber",
        sl.code as "storageLocationCode",
        sl.description as "storageLocationDescription",
        bl."binCode" as "binLocationCode",
        bl.description as "binLocationDescription"
      FROM 
        "Inventories" i
      LEFT JOIN 
        "ItemMasters" im ON i."itemMasterId" = im.id
      LEFT JOIN 
        "StorageLocations" sl ON i."storageLocationId" = sl.id
      LEFT JOIN 
        "BinLocations" bl ON i."binLocationId" = bl.id
      WHERE 
        i.id = :id
    `, {
      replacements: { id }
    });
    
    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    // Process the data to ensure consistent format
    const item = items[0];
    
    // Create properly structured itemMaster object
    const itemMaster = {
      id: item.itemMasterId || item.itemMasterIdRaw,
      itemNumber: item.itemNumber || 'No item number',
      shortDescription: item.shortDescription || 'No description',
      unspsc: {
        code: item.unspscCode || 'No UNSPSC code'
      },
      uom: item.uom || 'EA',
      manufacturerName: item.manufacturerName || 'Not specified',
      manufacturerPartNumber: item.manufacturerPartNumber || 'Not specified'
    };
    
    // Format storage location info
    const storageLocation = item.storageLocationId ? {
      id: item.storageLocationId,
      code: item.storageLocationCode,
      description: item.storageLocationDescription
    } : null;
    
    // Format bin location info
    const binLocation = item.binLocationId ? {
      id: item.binLocationId,
      code: item.binLocationCode,
      description: item.binLocationDescription
    } : null;
    
    // Calculate line price if not already available
    const linePrice = item.linePrice || parseFloat(item.physicalBalance || 0) * parseFloat(item.unitPrice || 0);
    
    // Return the item with added fields
    const processedItem = {
      ...item,
      itemMaster,
      storageLocation: storageLocation ? `${storageLocation.code} - ${storageLocation.description}` : 'Not specified',
      binLocation: binLocation ? `${binLocation.code} - ${binLocation.description}` : 'Not specified',
      linePrice: linePrice
    };
    
    return res.status(200).json({
      success: true,
      data: processedItem
    });
  } catch (error) {
    console.error('❌ Error loading inventory item detail:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching inventory item',
      error: error.message
    });
  }
});

module.exports = router;
