/**
 * Script to verify UNSPSC code in ItemMasters and the backend routes
 */
const axios = require('axios');
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

    // Check UNSPSC Codes table
    console.log('Checking UnspscCodes table structure...');
    const unspscCodeFields = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'UnspscCodes'
    `);
    console.log('UnspscCodes table columns:');
    console.table(unspscCodeFields.rows);

    // Get sample UNSPSC data
    const unspscSample = await pool.query(`
      SELECT * FROM "UnspscCodes" LIMIT 5
    `);
    console.log('Sample UNSPSC data:');
    console.table(unspscSample.rows);

  } catch (error) {
    console.error('❌ Database query error:', error.message);
  }
}

async function testDirectItemMasterRoute() {
  console.log('\nTesting direct item master route (/item-master)...');
  try {    // Get authentication token
    console.log('Getting authentication token...');
    const authResponse = await axios.post('http://localhost:8888/api/auth/login', {
      email: 'admin@demo.com',
      password: 'admin123'
    });
    
    const token = authResponse.data.token;
    console.log('Authentication token obtained');
    
    // Test direct item master route
    const response = await axios.get('http://localhost:8888/api/item-master', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`✅ Item Master API responded with ${response.data.data.length} items`);
    
    // Check first 3 items for UNSPSC structure
    const items = response.data.data.slice(0, 3);
    console.log('Sample items with UNSPSC data:');
    items.forEach((item, index) => {
      console.log(`\nItem ${index + 1}: ${item.itemNumber}`);
      console.log(`  UNSPSC: ${JSON.stringify(item.unspsc, null, 2)}`);
      console.log(`  unspscCode: ${item.unspscCode}`);
      console.log(`  unspscCodeId: ${item.unspscCodeId}`);
    });
    
  } catch (error) {
    console.error('❌ API test error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

async function main() {
  console.log('===== UNSPSC CODE VERIFICATION SCRIPT =====');
  await checkItemMastersTable();
  await testDirectItemMasterRoute();
  
  // Close the database pool
  await pool.end();
  console.log('\n===== VERIFICATION COMPLETE =====');
}

main().catch(console.error);
