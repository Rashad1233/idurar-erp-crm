/**
 * Script to check if the UNSPSC code is properly included in the backend and frontend
 */
const { Pool } = require('pg');

// Configure PostgreSQL connection
const pool = new Pool({
  host: 'localhost',
  database: 'erpdb',
  port: 5432,
  user: 'postgres',
  password: 'UHm8g167'
});

async function checkItemMastersTable() {
  console.log('Checking ItemMasters for UNSPSC code values...');
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        "itemNumber", 
        "shortDescription", 
        "unspscCode", 
        "unspscCodeId"
      FROM 
        "ItemMasters"
      WHERE 
        "unspscCode" IS NOT NULL 
      LIMIT 10
    `);

    if (result.rows.length === 0) {
      console.log('❌ No items found with UNSPSC code values!');
    } else {
      console.log(`✅ Found ${result.rows.length} items with UNSPSC code values:`);
      console.table(result.rows);
    }

    // Check if there are items with missing UNSPSC code
    const missingUnspscResult = await pool.query(`
      SELECT 
        id, 
        "itemNumber", 
        "shortDescription", 
        "unspscCode", 
        "unspscCodeId"
      FROM 
        "ItemMasters"
      WHERE 
        "unspscCode" IS NULL 
      LIMIT 10
    `);
    
    if (missingUnspscResult.rows.length > 0) {
      console.log(`\n⚠️ Found ${missingUnspscResult.rows.length} items with MISSING UNSPSC code values:`);
      console.table(missingUnspscResult.rows);
    } else {
      console.log('✅ All items have UNSPSC code values');
    }

    // Check UNSPSC Codes table
    console.log('\nChecking UnspscCodes table...');
    const unspscCodeFields = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'UnspscCodes'
    `);
    console.log('UnspscCodes table columns:');
    console.table(unspscCodeFields.rows);

    // Get sample UNSPSC data for the code in our item
    if (result.rows.length > 0) {
      const unspscCode = result.rows[0].unspscCode;
      console.log(`\nChecking UNSPSC data for code: ${unspscCode}`);
      
      const unspscData = await pool.query(`
        SELECT code, title, definition, level
        FROM "UnspscCodes" 
        WHERE code = $1
      `, [unspscCode]);
      
      if (unspscData.rows.length > 0) {
        console.log('UNSPSC data found:');
        console.table(unspscData.rows);
      } else {
        console.log(`❌ No UNSPSC data found for code ${unspscCode}!`);
      }
    }

  } catch (error) {
    console.error('❌ Database query error:', error.message);
  }
}

async function checkBackendRoutes() {
  console.log('\nChecking if backend routes file exists...');
  const fs = require('fs');
  const path = require('path');
  
  const routesPath = path.join(__dirname, 'backend', 'routes', 'simpleItemMasterRoutes.js');
  if (fs.existsSync(routesPath)) {
    console.log(`✅ simpleItemMasterRoutes.js exists at ${routesPath}`);
    
    // Check if the route is properly registered in index.js
    const indexPath = path.join(__dirname, 'backend', 'src', 'index.js');
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      if (indexContent.includes('simpleItemMasterRoutes')) {
        console.log('✅ simpleItemMasterRoutes is registered in index.js');
      } else {
        console.log('❌ simpleItemMasterRoutes is NOT registered in index.js');
      }
    }
  } else {
    console.log(`❌ simpleItemMasterRoutes.js NOT found at ${routesPath}`);
  }
  
  // Check if frontend components look for unspsc
  const itemMasterPath = path.join(__dirname, 'frontend', 'src', 'pages', 'ItemMaster', 'index.jsx');
  if (fs.existsSync(itemMasterPath)) {
    const itemMasterContent = fs.readFileSync(itemMasterPath, 'utf8');
    if (itemMasterContent.includes('unspsc')) {
      console.log('✅ Frontend ItemMaster component references "unspsc"');
    } else {
      console.log('❌ Frontend ItemMaster component does NOT reference "unspsc"');
    }
  }
}

async function main() {
  console.log('===== UNSPSC CODE VERIFICATION SCRIPT =====');
  await checkItemMastersTable();
  await checkBackendRoutes();
  
  // Close the database pool
  await pool.end();
  console.log('\n===== VERIFICATION COMPLETE =====');
}

main().catch(console.error);
