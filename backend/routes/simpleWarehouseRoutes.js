const express = require('express');
const router = express.Router();

// Function to wrap routes with error handling
const wrapAsync = (fn) => {
  return function(req, res, next) {
    fn(req, res, next).catch(next);
  };
};

// Simple direct SQL route for storage locations
router.get('/simple-storage-locations', wrapAsync(async (req, res) => {
  try {
    console.log('🔍 Simple storage locations route called');
    const { sequelize } = require('../models/sequelize');
    
    // Get storage locations with direct SQL - no associations to avoid errors
    const [locations] = await sequelize.query(`
      SELECT 
        sl.*,
        u.name as "createdByName"
      FROM 
        "StorageLocations" sl
      LEFT JOIN 
        "Users" u ON sl."createdById" = u.id
      ORDER BY 
        sl.code ASC
    `);
    
    console.log(`✅ Retrieved ${locations.length} storage locations via direct SQL`);
    
    // Process the results to handle missing or empty address fields
    const processedLocations = locations.map(location => {
      // Ensure address fields are never null - use empty strings as fallback
      return {
        ...location,
        street: location.street || '',
        city: location.city || '',
        postalCode: location.postalCode || '',
        country: location.country || '',
        // Add a formatted address field that combines all address components
        formattedAddress: [
          location.street, 
          location.city, 
          location.postalCode, 
          location.country
        ].filter(Boolean).join(', ') || 'No address provided'
      };
    });
    
    return res.status(200).json({
      success: true,
      count: processedLocations.length,
      data: processedLocations
    });
  } catch (error) {
    console.error('❌ Error with capitalized table names, trying lowercase...');
    
    try {
      const { sequelize } = require('../models/sequelize');
      // Fallback to lowercase table names
      const [locations] = await sequelize.query(`
        SELECT 
          sl.*,
          u.name as "created_by_name"
        FROM 
          "storage_locations" sl
        LEFT JOIN 
          "users" u ON sl."created_by_id" = u.id
        ORDER BY 
          sl.code ASC
      `);
      
      console.log(`✅ Retrieved ${locations.length} storage locations via direct SQL (lowercase)`);
      
      // Process the results to handle missing or empty address fields
      const processedLocations = locations.map(location => {
        // Ensure address fields are never null - use empty strings as fallback
        return {
          ...location,
          street: location.street || '',
          city: location.city || '',
          postalCode: location.postalCode || '',
          country: location.country || '',
          // Add a formatted address field that combines all address components
          formattedAddress: [
            location.street, 
            location.city, 
            location.postalCode, 
            location.country
          ].filter(Boolean).join(', ') || 'No address provided'
        };
      });
      
      return res.status(200).json({
        success: true,
        count: processedLocations.length,
        data: processedLocations
      });
    } catch (error2) {
      console.error('❌ Error loading storage locations:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching storage locations',
        error: error.message
      });
    }
  }
}));

// Simple direct SQL route for bin locations
router.get('/simple-bin-locations', wrapAsync(async (req, res) => {
  try {
    console.log('🔍 Simple bin locations route called');
    const { sequelize } = require('../models/sequelize');
    const { storageLocationId } = req.query;
    
    // Try a series of increasingly simpler queries until one works
    
    // Query 1: Try with simpler query (no user join, fewer columns)
    try {
      console.log('Attempting simplified bin locations query...');
      
      // Build WHERE clause if storageLocationId is provided
      let whereClause = '';
      const params = [];
      
      if (storageLocationId) {
        whereClause = ' WHERE bl."storageLocationId" = ?';
        params.push(storageLocationId);
      }
      
      const [bins] = await sequelize.query(`
        SELECT 
          bl.*,
          sl.code as "storageLocationCode",
          sl.description as "storageLocationDescription"
        FROM 
          "BinLocations" bl
        LEFT JOIN 
          "StorageLocations" sl ON bl."storageLocationId" = sl.id
        ${whereClause}
        ORDER BY 
          bl.id ASC
      `, {
        replacements: params
      });
      
      console.log(`✅ Retrieved ${bins.length} bin locations via simplified query`);
      
      // Process the results to ensure consistent data format
      const processedBins = bins.map(bin => {
        return {
          ...bin,
          binCode: bin.binCode || 'No code',
          description: bin.description || 'No description',
          storageLocationCode: bin.storageLocationCode || 'Unknown',
          storageLocationDescription: bin.storageLocationDescription || 'Unknown location'
        };
      });
      
      return res.status(200).json({
        success: true,
        count: processedBins.length,
        data: processedBins
      });
    } catch (error1) {
      console.error('❌ Simplified query failed:', error1.message);
      
      // Query 2: Try with the most basic query possible
      try {
        console.log('Attempting basic bin locations query...');
        
        let whereClause = '';
        const params = [];
        
        if (storageLocationId) {
          whereClause = ' WHERE "storageLocationId" = ?';
          params.push(storageLocationId);
        }
        
        const [bins] = await sequelize.query(`
          SELECT * FROM "BinLocations"
          ${whereClause}
          LIMIT 100
        `, {
          replacements: params
        });
        
        console.log(`✅ Retrieved ${bins.length} bin locations via basic query`);
        
        return res.status(200).json({
          success: true,
          count: bins.length,
          data: bins
        });
      } catch (error2) {
        console.error('❌ Basic query failed:', error2.message);
        
        // Query 3: Try with a completely different approach - checking if table exists
        try {
          console.log('Checking if BinLocations table exists...');
          
          const [tableCheck] = await sequelize.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'BinLocations'
            ) as exists
          `);
          
          if (tableCheck[0].exists) {
            console.log('✅ BinLocations table exists, attempting direct SELECT query...');
            
            const [bins] = await sequelize.query(`
              SELECT * FROM "BinLocations" LIMIT 10
            `);
            
            console.log(`✅ Retrieved ${bins.length} bin locations via direct table query`);
            
            return res.status(200).json({
              success: true,
              count: bins.length,
              data: bins,
              tableExists: true
            });
          } else {
            console.error('❌ BinLocations table does not exist');
            return res.status(404).json({
              success: false,
              message: 'BinLocations table does not exist',
              tableExists: false
            });
          }
        } catch (error3) {
          console.error('❌ Table check failed:', error3.message);
          throw error3;
        }
      }
    }
  } catch (error) {
    console.error('❌ All bin location queries failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching bin locations',
      error: error.message
    });
  }
}));

// Simple detail routes for a single storage location
router.get('/simple-storage-location/:id', wrapAsync(async (req, res) => {
  try {
    console.log(`🔍 Simple storage location detail route called for ID: ${req.params.id}`);
    const { sequelize } = require('../models/sequelize');
    const { id } = req.params;
    
    // Get storage location with direct SQL
    const [locations] = await sequelize.query(`
      SELECT 
        sl.*,
        u.name as "createdByName"
      FROM 
        "StorageLocations" sl
      LEFT JOIN 
        "Users" u ON sl."createdById" = u.id
      WHERE 
        sl.id = :id
    `, {
      replacements: { id }
    });
    
    if (locations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Storage location not found'
      });
    }
    
    console.log('✅ Retrieved storage location detail via direct SQL');
    
    return res.status(200).json({
      success: true,
      data: locations[0]
    });
  } catch (error) {
    console.error('❌ Error loading storage location:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching storage location',
      error: error.message
    });
  }
}));

// Simple detail routes for a single bin location
router.get('/simple-bin-location/:id', wrapAsync(async (req, res) => {
  try {
    console.log(`🔍 Simple bin location detail route called for ID: ${req.params.id}`);
    const { sequelize } = require('../models/sequelize');
    const { id } = req.params;
    
    // Get bin location with direct SQL
    const [bins] = await sequelize.query(`
      SELECT 
        bl.*,
        sl.code as "storageLocationCode",
        sl.description as "storageLocationDescription",
        u.name as "createdByName"
      FROM 
        "BinLocations" bl
      LEFT JOIN 
        "StorageLocations" sl ON bl."storageLocationId" = sl.id
      LEFT JOIN 
        "Users" u ON bl."createdById" = u.id
      WHERE 
        bl.id = :id
    `, {
      replacements: { id }
    });
    
    if (bins.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bin location not found'
      });
    }
    
    console.log('✅ Retrieved bin location detail via direct SQL');
    
    return res.status(200).json({
      success: true,
      data: bins[0]
    });
  } catch (error) {
    console.error('❌ Error loading bin location:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching bin location',
      error: error.message
    });
  }
}));

// Alias route for frontend compatibility - storage-locations
router.get('/storage-locations', wrapAsync(async (req, res) => {
  try {
    console.log('🔍 Storage locations alias route called');
    const { sequelize } = require('../models/sequelize');
    
    // Get storage locations with direct SQL
    const [locations] = await sequelize.query(`
      SELECT 
        sl.*,
        u.name as "createdByName"
      FROM 
        "StorageLocations" sl
      LEFT JOIN 
        "Users" u ON sl."createdById" = u.id
      ORDER BY 
        sl.code ASC
    `);
    
    console.log(`✅ Retrieved ${locations.length} storage locations via alias route`);
    
    // Process the results
    const processedLocations = locations.map(location => ({
      ...location,
      street: location.street || '',
      city: location.city || '',
      postalCode: location.postalCode || '',
      country: location.country || '',
      formattedAddress: [
        location.street, 
        location.city, 
        location.postalCode, 
        location.country
      ].filter(Boolean).join(', ') || 'No address provided'
    }));
    
    return res.status(200).json({
      success: true,
      count: processedLocations.length,
      data: processedLocations
    });
  } catch (error) {
    console.error('❌ Error in storage-locations alias route:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching storage locations',
      error: error.message
    });
  }
}));

// Alias route for bin locations
router.get('/bin-locations', wrapAsync(async (req, res) => {
  try {
    console.log('🔍 Bin locations route called with query:', req.query);
    const { sequelize } = require('../models/sequelize');
    const { storageLocationId } = req.query;
    
    if (!storageLocationId) {
      return res.status(400).json({
        success: false,
        message: 'Storage location ID is required'
      });
    }
    
    try {
      // Get bin locations for the specified storage location - try capitalized table names first
      const [binLocations] = await sequelize.query(`
        SELECT 
          bl.*,
          sl.code as "storageLocationCode",
          sl.description as "storageLocationDescription"
        FROM 
          "BinLocations" bl
        LEFT JOIN 
          "StorageLocations" sl ON bl."storageLocationId" = sl.id
        WHERE 
          bl."storageLocationId" = :storageLocationId
        ORDER BY 
          bl.id ASC
      `, {
        replacements: { storageLocationId }
      });
      
      console.log(`✅ Retrieved ${binLocations.length} bin locations for storage location ${storageLocationId}`);
      
      return res.status(200).json({
        success: true,
        count: binLocations.length,
        data: binLocations
      });
    } catch (error) {
      console.log('Trying with different column names for bin locations...');
      
      try {
        // Try without the code field
        const [binLocations] = await sequelize.query(`
          SELECT 
            bl.*,
            sl.code as "storageLocationCode",
            sl.description as "storageLocationDescription"
          FROM 
            "BinLocations" bl
          LEFT JOIN 
            "StorageLocations" sl ON bl."storageLocationId" = sl.id
          WHERE 
            bl."storageLocationId" = :storageLocationId
          ORDER BY 
            bl.id ASC
        `, {
          replacements: { storageLocationId }
        });
        
        return res.status(200).json({
          success: true,
          count: binLocations.length,
          data: binLocations
        });
      } catch (error2) {
        console.log('Trying with lowercase table names for bin locations...');
        
        // Try lowercase table names
        const [binLocations] = await sequelize.query(`
          SELECT 
            bl.*,
            sl.code as "storage_location_code",
            sl.description as "storage_location_description"
          FROM 
            "bin_locations" bl
          LEFT JOIN 
            "storage_locations" sl ON bl."storage_location_id" = sl.id
          WHERE 
            bl."storage_location_id" = :storageLocationId
          ORDER BY 
            bl.id ASC
        `, {
          replacements: { storageLocationId }
        });
        
        return res.status(200).json({
          success: true,
          count: binLocations.length,
          data: binLocations
        });
      }
    }
  } catch (error) {
    console.error('❌ Error in bin-locations route:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching bin locations',
      error: error.message
    });
  }
}));

// Alias route for single storage location detail
router.get('/storage-locations/:id', wrapAsync(async (req, res) => {
  try {
    console.log(`🔍 Storage location detail alias route called for ID: ${req.params.id}`);
    const { sequelize } = require('../models/sequelize');
    const { id } = req.params;
    
    // Get storage location with direct SQL
    const [locations] = await sequelize.query(`
      SELECT 
        sl.*,
        u.name as "createdByName"
      FROM 
        "StorageLocations" sl
      LEFT JOIN 
        "Users" u ON sl."createdById" = u.id
      WHERE 
        sl.id = :id
    `, {
      replacements: { id }
    });
    
    if (locations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Storage location not found'
      });
    }
    
    console.log('✅ Retrieved storage location detail via alias route');
    
    return res.status(200).json({
      success: true,
      data: locations[0]
    });
  } catch (error) {
    console.error('❌ Error in storage location detail alias route:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching storage location detail',
      error: error.message
    });
  }
}));

// Alias route for single bin location detail
router.get('/bin-locations/:id', wrapAsync(async (req, res) => {
  try {
    console.log(`🔍 Bin location detail alias route called for ID: ${req.params.id}`);
    const { sequelize } = require('../models/sequelize');
    const { id } = req.params;
    
    // Get bin location with storage location details
    const [binLocations] = await sequelize.query(`
      SELECT 
        bl.*,
        sl.code as "storageLocationCode",
        sl.description as "storageLocationDescription",
        u.name as "createdByName"
      FROM 
        "BinLocations" bl
      LEFT JOIN 
        "StorageLocations" sl ON bl."storageLocationId" = sl.id
      LEFT JOIN 
        "Users" u ON bl."createdById" = u.id
      WHERE 
        bl.id = :id
    `, {
      replacements: { id }
    });
    
    if (binLocations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bin location not found'
      });
    }
    
    console.log('✅ Retrieved bin location detail via alias route');
    
    return res.status(200).json({
      success: true,
      data: binLocations[0]
    });
  } catch (error) {
    console.error('❌ Error in bin location detail alias route:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching bin location detail',
      error: error.message
    });
  }
}));

// Update storage location endpoint
router.put('/storage-locations/:id', wrapAsync(async (req, res) => {
  try {
    console.log(`🔍 Storage location update route called for ID: ${req.params.id}`);
    const { sequelize } = require('../models/sequelize');
    const { id } = req.params;
    const { code, description, street, city, postalCode, country, isActive } = req.body;
    
    // Update storage location with direct SQL
    const [updatedRows] = await sequelize.query(`
      UPDATE "StorageLocations" 
      SET 
        code = :code,
        description = :description,
        street = :street,
        city = :city,
        "postalCode" = :postalCode,
        country = :country,
        "isActive" = :isActive,
        "updatedAt" = NOW()
      WHERE id = :id
    `, {
      replacements: { id, code, description, street, city, postalCode, country, isActive }
    });
    
    if (updatedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Storage location not found'
      });
    }
    
    // Get the updated record
    const [locations] = await sequelize.query(`
      SELECT 
        sl.*,
        u.name as "createdByName"
      FROM 
        "StorageLocations" sl
      LEFT JOIN 
        "Users" u ON sl."createdById" = u.id
      WHERE 
        sl.id = :id
    `, {
      replacements: { id }
    });
    
    console.log('✅ Storage location updated successfully');
    
    return res.status(200).json({
      success: true,
      data: locations[0],
      message: 'Storage location updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating storage location:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating storage location',
      error: error.message
    });
  }
}));

// Update bin location endpoint
router.put('/bin-locations/:id', wrapAsync(async (req, res) => {
  try {
    console.log(`🔍 Bin location update route called for ID: ${req.params.id}`);
    const { sequelize } = require('../models/sequelize');
    const { id } = req.params;
    const { binCode, description, storageLocationId, isActive } = req.body;
    
    // Update bin location with direct SQL
    const [updatedRows] = await sequelize.query(`
      UPDATE "BinLocations" 
      SET 
        "binCode" = :binCode,
        description = :description,
        "storageLocationId" = :storageLocationId,
        "isActive" = :isActive,
        "updatedAt" = NOW()
      WHERE id = :id
    `, {
      replacements: { id, binCode, description, storageLocationId, isActive }
    });
    
    if (updatedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bin location not found'
      });
    }
    
    // Get the updated record with storage location details
    const [binLocations] = await sequelize.query(`
      SELECT 
        bl.*,
        sl.code as "storageLocationCode",
        sl.description as "storageLocationDescription",
        u.name as "createdByName"
      FROM 
        "BinLocations" bl
      LEFT JOIN 
        "StorageLocations" sl ON bl."storageLocationId" = sl.id
      LEFT JOIN 
        "Users" u ON bl."createdById" = u.id
      WHERE 
        bl.id = :id
    `, {
      replacements: { id }
    });
    
    console.log('✅ Bin location updated successfully');
    
    return res.status(200).json({
      success: true,
      data: binLocations[0],
      message: 'Bin location updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating bin location:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating bin location',
      error: error.message
    });
  }
}));

module.exports = router;
