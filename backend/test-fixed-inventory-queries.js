const sequelize = require('./config/postgresql');

async function testInventoryCreationFixed() {
  try {
    console.log('Testing fixed inventory creation queries...');
    
    // Test the fixed query from inventoryController
    console.log('Testing inventoryController query...');    const [inventoryItems] = await sequelize.query(`
      SELECT 
        i.*, 
        im."itemNumber", 
        im."shortDescription" as "itemDescription", 
        im."uom", 
        im."equipmentCategory" as "category", 
        im."equipmentSubCategory" as "subcategory"
      FROM 
        "Inventories" i
      LEFT JOIN 
        "ItemMasters" im ON i."itemMasterId" = im.id
      ORDER BY 
        i."createdAt" DESC
      LIMIT 1
    `);
    
    console.log('✅ inventoryController query successful:', inventoryItems.length, 'items found');
    if (inventoryItems.length > 0) {
      console.log('Sample result:', inventoryItems[0]);
    }
    
    // Test the fixed query from directInventoryRoutes
    console.log('\nTesting directInventoryRoutes query...');
    const [directInventoryItems] = await sequelize.query(`
      SELECT i.*,  
             im.id as "itemMasterId",
             im."itemNumber" as "itemNumber", 
             im."shortDescription" as "itemDescription", 
             COALESCE(im."manufacturerName", '') as "manufacturer",
             COALESCE(im."uom", '') as "uom"
      FROM "Inventories" i
      LEFT JOIN "ItemMasters" im ON i."itemMasterId" = im.id
      ORDER BY i."updatedAt" DESC
      LIMIT 1
    `);
    
    console.log('✅ directInventoryRoutes query successful:', directInventoryItems.length, 'items found');
    
  } catch (error) {
    console.error('❌ Error testing fixed queries:', error.message);
  } finally {
    await sequelize.close();
  }
}

testInventoryCreationFixed();
