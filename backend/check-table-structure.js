const sequelize = require('./config/postgresql');

async function checkTableStructure() {
  try {
    console.log('Checking table structure...');
    
    // Check ItemMasters table structure
    const itemMasterColumns = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ItemMasters' OR table_name = 'item_master'
      ORDER BY ordinal_position;
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('ItemMasters/item_master table columns:');
    console.log(itemMasterColumns);
    
    // Check Inventories table structure
    const inventoryColumns = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Inventories' OR table_name = 'inventory'
      ORDER BY ordinal_position;
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('\nInventories/inventory table columns:');
    console.log(inventoryColumns);
    
    // List all tables
    const tables = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('\nAll tables in database:');
    console.log(tables);
    
  } catch (error) {
    console.error('Error checking table structure:', error);
  } finally {
    await sequelize.close();
  }
}

checkTableStructure();
