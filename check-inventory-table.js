// check-inventory-table.js
// This script checks the Inventories table structure to confirm columns

const { Pool } = require('pg');

// Get database credentials from config file
const dbConfig = require('./backend/config/database');
const config = dbConfig.development;

// Create a PostgreSQL pool
const pool = new Pool({
  user: config.username,
  host: config.host,
  database: config.database,
  password: config.password,
  port: config.port
});

async function checkInventoryTable() {
  console.log('Checking Inventories table structure...');
  
  try {
    // Query to get the column information for the Inventories table
    const tableInfoQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Inventories'
      ORDER BY ordinal_position;
    `;
    
    const { rows } = await pool.query(tableInfoQuery);
    
    console.log('Inventory table structure:');
    console.table(rows);
    
    // Check for specific columns we need
    const requiredColumns = ['inventoryNumber', 'physicalBalance', 'unitPrice', 'itemMasterId', 'binLocationId', 'storageLocationId'];
    const missingColumns = [];
    
    for (const col of requiredColumns) {
      if (!rows.some(row => row.column_name === col)) {
        missingColumns.push(col);
      }
    }
    
    if (missingColumns.length > 0) {
      console.log(`❌ Missing required columns: ${missingColumns.join(', ')}`);
    } else {
      console.log('✅ All required columns are present in the table');
    }
    
    // Now check for some sample data
    console.log('\nChecking for sample data in Inventories table...');
    const { rows: dataRows } = await pool.query('SELECT * FROM "Inventories" LIMIT 5');
    
    if (dataRows.length > 0) {
      console.log(`✅ Found ${dataRows.length} inventory records`);
      console.log('Sample data:');
      console.table(dataRows.map(item => ({
        id: item.id,
        inventoryNumber: item.inventoryNumber,
        physicalBalance: item.physicalBalance,
        unitPrice: item.unitPrice,
        itemMasterId: item.itemMasterId,
        binLocationId: item.binLocationId,
        storageLocationId: item.storageLocationId
      })));
    } else {
      console.log('❌ No inventory records found in the table');
    }
    
  } catch (error) {
    console.error('Error checking inventory table:', error.message);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the check
checkInventoryTable().catch(console.error);
