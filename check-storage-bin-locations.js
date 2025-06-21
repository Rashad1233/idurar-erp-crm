// check-storage-bin-locations.js
// This script checks the structure of storage and bin location tables and any associations

const { Pool } = require('pg');

// Configure PostgreSQL connection
const pool = new Pool({
  host: 'localhost',
  database: 'erpdb',
  port: 5432,
  user: 'postgres',
  password: 'UHm8g167'
});

async function checkTableStructure(tableName) {
  try {
    console.log(`\nChecking structure for "${tableName}" table...`);
    
    const result = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable
      FROM 
        information_schema.columns
      WHERE 
        table_name = $1
      ORDER BY 
        ordinal_position
    `, [tableName]);
    
    if (result.rows.length === 0) {
      console.log(`❌ Table "${tableName}" not found!`);
      return false;
    }
    
    console.log(`✅ Table "${tableName}" exists with ${result.rows.length} columns:`);
    console.table(result.rows);
    
    // Get sample data
    const sampleData = await pool.query(`
      SELECT * FROM "${tableName}" LIMIT 3
    `);
    
    if (sampleData.rows.length > 0) {
      console.log(`\nSample data from "${tableName}" (${sampleData.rows.length} rows):`);
      console.table(sampleData.rows);
    } else {
      console.log(`\n⚠️ No data found in "${tableName}" table.`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error checking "${tableName}" table:`, error.message);
    return false;
  }
}

async function checkInventoryAssociations() {
  try {
    console.log('\nChecking Inventory associations with storage and bin locations...');
    
    const result = await pool.query(`
      SELECT 
        i.id as "inventoryId",
        i."inventoryNumber",
        i."storageLocationId",
        i."binLocationId",
        i."binLocationText",
        sl.id as "storageLocationTableId",
        sl."name" as "storageLocationName",
        bl.id as "binLocationTableId",
        bl."name" as "binLocationName"
      FROM 
        "Inventories" i
      LEFT JOIN 
        "StorageLocations" sl ON i."storageLocationId" = sl.id
      LEFT JOIN 
        "BinLocations" bl ON i."binLocationId" = bl.id
      LIMIT 5
    `);
    
    console.log(`Found ${result.rows.length} inventory items with potential associations:`);
    console.table(result.rows);
    
    // Count items with valid associations
    const validStorageCount = result.rows.filter(r => r.storageLocationTableId).length;
    const validBinCount = result.rows.filter(r => r.binLocationTableId).length;
    
    console.log(`\nAssociation summary:`);
    console.log(`- ${validStorageCount} out of ${result.rows.length} items have valid storage location associations`);
    console.log(`- ${validBinCount} out of ${result.rows.length} items have valid bin location associations`);
    
  } catch (error) {
    console.error('❌ Error checking inventory associations:', error.message);
  }
}

async function main() {
  console.log('===== CHECKING STORAGE AND BIN LOCATIONS =====');
  
  // Check tables structure
  await checkTableStructure('StorageLocations');
  await checkTableStructure('BinLocations');
  await checkTableStructure('Inventories');
  
  // Check associations
  await checkInventoryAssociations();
  
  // Close database connection
  await pool.end();
  console.log('\n===== CHECK COMPLETE =====');
}

main().catch(console.error);
