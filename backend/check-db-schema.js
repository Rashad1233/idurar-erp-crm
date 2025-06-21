// This script directly lists the columns in the UnspscCodes table
const { Pool } = require('pg');
require('dotenv').config();

async function checkTableSchema() {
  // Create a PostgreSQL connection pool
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'erpdb',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
  });

  try {
    console.log('Checking UnspscCodes table schema...');
    
    // Check if the table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'UnspscCodes'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    
    if (!tableExists) {
      console.error('❌ Table "UnspscCodes" does not exist in the database');
      return;
    }
    
    // Get table columns
    const columns = await pool.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'UnspscCodes'
      ORDER BY ordinal_position;
    `);
    
    console.log('UnspscCodes table columns:');
    console.table(columns.rows);
    
    // Check count of records
    const countResult = await pool.query(`SELECT COUNT(*) FROM "UnspscCodes"`);
    console.log(`Table has ${countResult.rows[0].count} rows`);
    
    // Get sample data if there are records
    if (parseInt(countResult.rows[0].count) > 0) {
      const sample = await pool.query(`SELECT * FROM "UnspscCodes" LIMIT 1`);
      console.log('\nSample record:');
      console.log(JSON.stringify(sample.rows[0], null, 2));
    }
    
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    await pool.end();
  }
}

// Run the function
checkTableSchema();
