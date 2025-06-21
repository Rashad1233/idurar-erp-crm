const sequelize = require('./config/postgresql');

async function checkInventoryTable() {
  try {
    console.log('Checking Inventories table structure...');
    
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Inventories'
      ORDER BY ordinal_position;
    `);
    
    console.log('Inventories table columns:', columns.map(c => c.column_name));
    
    // Check if there's an itemId column
    const hasItemId = columns.some(c => c.column_name === 'itemId');
    const hasItemMasterId = columns.some(c => c.column_name === 'itemMasterId');
    
    console.log('Has itemId column:', hasItemId);
    console.log('Has itemMasterId column:', hasItemMasterId);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkInventoryTable();
