const sequelize = require('./config/postgresql');

async function checkItemMasterColumns() {
  try {
    console.log('Checking ItemMasters table columns...');
    
    const columns = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ItemMasters'
      ORDER BY ordinal_position;
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('ItemMasters table columns:');
    columns.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });
    
  } catch (error) {
    console.error('Error checking columns:', error);
  } finally {
    await sequelize.close();
  }
}

checkItemMasterColumns();
