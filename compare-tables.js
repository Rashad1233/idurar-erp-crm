const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'erpdb',
  password: 'UHm8g167',
  port: 5432,
});

async function compareTables() {
  try {
    // Check structure of ItemMasters
    const itemMastersStructure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'ItemMasters'
      ORDER BY ordinal_position;
    `);
    
    console.log('ItemMasters table structure:');
    console.log(itemMastersStructure.rows);
    
    // Check structure of item_master
    const itemMasterStructure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'item_master'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nitem_master table structure:');
    console.log(itemMasterStructure.rows);
    
    // Check data count in both tables
    const itemMastersCount = await pool.query('SELECT COUNT(*) FROM "ItemMasters"');
    const itemMasterCount = await pool.query('SELECT COUNT(*) FROM "item_master"');
    
    console.log('\nData counts:');
    console.log('ItemMasters:', itemMastersCount.rows[0].count);
    console.log('item_master:', itemMasterCount.rows[0].count);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

compareTables();
