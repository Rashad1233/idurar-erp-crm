const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'erpdb',
  password: 'UHm8g167',
  port: 5432,
});

async function checkUnspscTables() {
  try {
    // Check UNSPSC foreign keys
    const fkResult = await pool.query(`
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE constraint_type = 'FOREIGN KEY' 
      AND (tc.table_name = 'ItemMasters' OR ccu.table_name LIKE '%nspsc%');
    `);
    
    console.log('UNSPSC-related foreign key constraints:');
    console.log(fkResult.rows);
    
    // Check structure of both UNSPSC tables
    const unspscCodesStructure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'UnspscCodes'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nUnspscCodes table structure:');
    console.log(unspscCodesStructure.rows);
    
    const unspscCodesSnakeStructure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'unspsc_codes'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nunspsc_codes table structure:');
    console.log(unspscCodesSnakeStructure.rows);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUnspscTables();
