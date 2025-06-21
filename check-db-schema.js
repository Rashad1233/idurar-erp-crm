const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'erpdb',
  password: 'UHm8g167',
  port: 5432,
});

async function checkSchema() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'item_master'
      ORDER BY ordinal_position;
    `);
    
    console.log('item_master table columns:');
    console.log(result.rows);
    
    const result2 = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'unspsc_codes'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nunspsc_codes table columns:');
    console.log(result2.rows);
    
    // Also check if the tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('item_master', 'unspsc_codes');
    `);
    
    console.log('\nExisting tables:');
    console.log(tablesResult.rows);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
