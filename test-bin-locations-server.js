const express = require('express');
const { sequelize } = require('./backend/models/sequelize');

// Create a simple express server to test our routes
const app = express();
const PORT = 9999;

// Add CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Simple fixed route for bin locations
app.get('/api/fixed-bin-locations', async (req, res) => {
  try {
    console.log('🔍 Fixed bin locations route called');
    const { storageLocationId } = req.query;
    
    // Try different queries in sequence until one works
    // Query 1: Standard column names
    try {
      console.log('Trying standard column query...');
      const query1 = `
        SELECT 
          bl.*,
          sl.code as "storageLocationCode",
          sl.description as "storageLocationDescription"
        FROM 
          "BinLocations" bl
        LEFT JOIN 
          "StorageLocations" sl ON bl."storageLocationId" = sl.id
        ${storageLocationId ? 'WHERE bl."storageLocationId" = $1' : ''}
        ORDER BY 
          COALESCE(bl.code, bl."binCode") ASC
      `;
      
      const [bins] = await sequelize.query(
        query1, 
        { 
          replacements: storageLocationId ? [storageLocationId] : undefined,
          type: sequelize.QueryTypes.SELECT 
        }
      );
      
      console.log(`✅ Query 1 succeeded! Retrieved ${bins.length} bin locations`);
      
      return res.status(200).json({
        success: true,
        count: bins.length,
        data: bins
      });
    } catch (error1) {
      console.error('❌ Query 1 failed:', error1.message);
      
      // Query 2: Try with binCode column
      try {
        console.log('Trying binCode column query...');
        const query2 = `
          SELECT 
            bl.*,
            sl.code as "storageLocationCode",
            sl.description as "storageLocationDescription"
          FROM 
            "BinLocations" bl
          LEFT JOIN 
            "StorageLocations" sl ON bl."storageLocationId" = sl.id
          ${storageLocationId ? 'WHERE bl."storageLocationId" = $1' : ''}
          ORDER BY 
            bl."binCode" ASC
        `;
        
        const [bins] = await sequelize.query(
          query2, 
          { 
            replacements: storageLocationId ? [storageLocationId] : undefined,
            type: sequelize.QueryTypes.SELECT 
          }
        );
        
        console.log(`✅ Query 2 succeeded! Retrieved ${bins.length} bin locations`);
        
        return res.status(200).json({
          success: true,
          count: bins.length,
          data: bins
        });
      } catch (error2) {
        console.error('❌ Query 2 failed:', error2.message);
        
        // Query 3: Simplest possible query
        try {
          console.log('Trying simplest possible query...');
          const query3 = `
            SELECT * FROM "BinLocations"
            ${storageLocationId ? 'WHERE "storageLocationId" = $1' : ''}
            LIMIT 100
          `;
          
          const [bins] = await sequelize.query(
            query3, 
            { 
              replacements: storageLocationId ? [storageLocationId] : undefined,
              type: sequelize.QueryTypes.SELECT 
            }
          );
          
          console.log(`✅ Query 3 succeeded! Retrieved ${bins.length} bin locations`);
          
          return res.status(200).json({
            success: true,
            count: bins.length,
            data: bins
          });
        } catch (error3) {
          console.error('❌ Query 3 failed:', error3.message);
          throw error3;
        }
      }
    }
  } catch (error) {
    console.error('❌ All queries failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching bin locations',
      error: error.message
    });
  }
});

// Add a route to check bin locations table structure
app.get('/api/check-bin-table', async (req, res) => {
  try {
    // Query for table columns
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'BinLocations'
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    // Count rows in table
    const [rowCount] = await sequelize.query(`
      SELECT COUNT(*) as count FROM "BinLocations"
    `);
    
    // Sample data
    const [sampleData] = await sequelize.query(`
      SELECT * FROM "BinLocations" LIMIT 1
    `);
    
    return res.status(200).json({
      success: true,
      columns,
      rowCount: rowCount[0].count,
      sampleData: sampleData.length > 0 ? sampleData[0] : null
    });
  } catch (error) {
    console.error('❌ Error checking bin table:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error checking bin table',
      error: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log(`Try accessing: http://localhost:${PORT}/api/fixed-bin-locations`);
  console.log(`And check table structure: http://localhost:${PORT}/api/check-bin-table`);
});
