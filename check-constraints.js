const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'erpdb',
  password: 'UHm8g167',
  port: 5432,
});

async function checkConstraints() {
  try {
    const result = await pool.query(`
      SELECT column_name, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'ItemMasters'
      AND column_name = 'createdById';
    `);
    
    console.log('createdById column info:');
    console.log(result.rows);
    
    // Create a test user first
    const userResult = await pool.query(`
      SELECT id FROM "Users" LIMIT 1;
    `);
    
    console.log('Available users:');
    console.log(userResult.rows);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkConstraints();
