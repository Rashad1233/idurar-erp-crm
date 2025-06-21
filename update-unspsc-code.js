/**
 * Script to update or set UNSPSC code in the ItemMasters table
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

async function updateUnspscCode() {
  try {
    console.log('Connecting to database...');
    
    // Check if there are any items with missing UNSPSC code
    const checkResult = await pool.query(`
      SELECT id, "itemNumber" 
      FROM "ItemMasters" 
      WHERE "unspscCode" IS NULL
    `);
    
    if (checkResult.rows.length > 0) {
      console.log(`Found ${checkResult.rows.length} items with missing UNSPSC code.`);
      
      // Update these items with a default UNSPSC code
      for (const item of checkResult.rows) {
        console.log(`Updating item ${item.itemNumber} with default UNSPSC code`);
        
        // Get a valid UNSPSC code from the table
        const unspscResult = await pool.query(`
          SELECT code FROM "UnspscCodes" 
          WHERE code IS NOT NULL 
          LIMIT 1
        `);
        
        if (unspscResult.rows.length > 0) {
          const unspscCode = unspscResult.rows[0].code;
          
          await pool.query(`
            UPDATE "ItemMasters"
            SET "unspscCode" = $1
            WHERE id = $2
          `, [unspscCode, item.id]);
          
          console.log(`✅ Updated item ${item.itemNumber} with UNSPSC code ${unspscCode}`);
        }
      }
    } else {
      console.log('All items already have UNSPSC codes.');
    }
    
    // Now list all items with their UNSPSC code
    const itemsResult = await pool.query(`
      SELECT id, "itemNumber", "unspscCode"
      FROM "ItemMasters"
      ORDER BY "createdAt" DESC
      LIMIT 10
    `);
    
    console.log('\nItems with their UNSPSC codes:');
    console.table(itemsResult.rows);
    
    // Disconnect from the database
    await pool.end();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error updating UNSPSC code:', error);
    await pool.end();
  }
}

updateUnspscCode();
