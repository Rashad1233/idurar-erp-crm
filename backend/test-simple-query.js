const sequelize = require('./config/postgresql');

async function testSimpleQuery() {
  try {
    console.log('Testing simple raw SQL query...');
    
    // Test direct query to ItemMasters table
    const [items] = await sequelize.query(`
      SELECT id, "itemNumber", "shortDescription" 
      FROM "ItemMasters" 
      LIMIT 1
    `);
    
    console.log('Direct SQL query result:', items[0]);
    
    // Test what columns exist in ItemMasters table
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'ItemMasters'
      ORDER BY ordinal_position;
    `);
    
    console.log('ItemMasters table columns:', columns.map(c => c.column_name));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testSimpleQuery();
