const sequelize = require('./config/postgresql');

async function testInventoryCreation() {
  try {
    console.log('Testing inventory creation...');
    
    // First, test if we can query the item_master table
    console.log('Testing item_master query...');
    const [itemMasterTest] = await sequelize.query(`
      SELECT id, item_number, description 
      FROM item_master 
      LIMIT 1
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('item_master query result:', itemMasterTest);
    
    // Test if we can query the ItemMasters table
    console.log('\nTesting ItemMasters query...');
    const [itemMastersTest] = await sequelize.query(`
      SELECT id, "itemNumber", "shortDescription" 
      FROM "ItemMasters" 
      LIMIT 1
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('ItemMasters query result:', itemMastersTest);
    
    // Test the specific query that's failing
    console.log('\nTesting the specific failing query...');
    try {
      const [testQuery] = await sequelize.query(`
        SELECT i.*,  
               im.id as "itemMasterId",
               im."item_number" as "itemNumber", 
               im."description" as "itemDescription", 
               COALESCE(im."manufacturer", '') as "manufacturer",
               COALESCE(im."uom", '') as "uom"
        FROM "inventory" i
        LEFT JOIN "item_master" im ON i."itemId" = im.id
        LIMIT 1
      `);
      
      console.log('Test query successful:', testQuery);
    } catch (queryError) {
      console.error('Test query failed:', queryError.message);
    }
    
  } catch (error) {
    console.error('Error testing inventory creation:', error);
  } finally {
    await sequelize.close();
  }
}

testInventoryCreation();
