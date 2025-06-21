const { Pool } = require('pg');
const config = require('../backend/src/config/config');

// Create a connection pool
const pool = new Pool({
  user: config.development.username,
  host: config.development.host,
  database: config.development.database,
  password: config.development.password,
  port: config.development.port,
});

async function checkItemMastersTable() {
  try {
    console.log('Connecting to database...');
    
    // Query to get column information for ItemMasters table
    const query = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'ItemMasters'
      ORDER BY ordinal_position;
    `;
    
    const result = await pool.query(query);
    
    console.log('ItemMasters Table Structure:');
    console.table(result.rows);
    
    return result.rows;
  } catch (error) {
    console.error('Error checking ItemMasters table:', error);
  } finally {
    await pool.end();
  }
}

// Run the function
checkItemMastersTable();
