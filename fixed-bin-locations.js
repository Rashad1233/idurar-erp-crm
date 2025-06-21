const express = require('express');
const router = express.Router();
const { sequelize } = require('./backend/models/sequelize');

// Simple fixed route for bin locations
router.get('/api/fixed-bin-locations', async (req, res) => {
  try {
    console.log('🔍 Fixed bin locations route called');
    const { storageLocationId } = req.query;
    
    // Build WHERE clause if storageLocationId is provided
    let whereClause = '';
    const params = [];
    
    if (storageLocationId) {
      whereClause = ' WHERE bl."storageLocationId" = ?';
      params.push(storageLocationId);
    }
    
    // Try query with original table name and column names
    try {
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
          bl.code ASC
      `, {
        replacements: params
      });
      
      console.log(`✅ Retrieved ${bins.length} bin locations via direct SQL`);
      
      return res.status(200).json({
        success: true,
        count: bins.length,
        data: bins
      });
    } catch (error) {
      console.error('❌ Error with initial query:', error.message);
      
      // Try with the actual column names in BinLocations
      try {
        const [columns] = await sequelize.query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'BinLocations'
          AND table_schema = 'public'
        `);
        
        console.log('Available columns:', columns.map(c => c.column_name).join(', '));
        
        // Based on the actual columns, adjust the query
        // This is a fallback query with minimal joins
        const [bins] = await sequelize.query(`
          SELECT *
          FROM "BinLocations"
          ${storageLocationId ? 'WHERE "storageLocationId" = ?' : ''}
          ORDER BY "createdAt" DESC
        `, {
          replacements: storageLocationId ? [storageLocationId] : []
        });
        
        console.log(`✅ Retrieved ${bins.length} bin locations with simplified query`);
        
        return res.status(200).json({
          success: true,
          count: bins.length,
          data: bins
        });
      } catch (error2) {
        console.error('❌ Error with fallback query:', error2.message);
        throw error; // Re-throw original error
      }
    }
  } catch (error) {
    console.error('❌ Error loading bin locations:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching bin locations',
      error: error.message
    });
  }
});

// Export the router
module.exports = router;
