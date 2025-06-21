const { sequelize, Inventory, ItemMaster } = require('./backend/models/sequelize');

async function debugInventoryAssociations() {
  try {
    console.log('Checking database connection...');
    await sequelize.authenticate();
    console.log('Database connection is OK');

    console.log('\nChecking Inventory model definition...');
    console.log('Table name:', Inventory.tableName);
    console.log('Primary key:', Object.keys(Inventory.primaryKeys)[0]);
    
    console.log('\nChecking ItemMaster model definition...');
    console.log('Table name:', ItemMaster.tableName);
    console.log('Primary key:', Object.keys(ItemMaster.primaryKeys)[0]);
    
    console.log('\nChecking associations...');
    const inventoryAssociations = Inventory.associations;
    console.log('Inventory associations:', Object.keys(inventoryAssociations));
    
    if (inventoryAssociations.item) {
      console.log('- item association details:');
      console.log('  - foreignKey:', inventoryAssociations.item.foreignKey);
      console.log('  - targetKey:', inventoryAssociations.item.targetKey);
      console.log('  - source model:', inventoryAssociations.item.source.name);
      console.log('  - target model:', inventoryAssociations.item.target.name);
    } else {
      console.log('❌ No "item" association found in Inventory model');
    }
    
    console.log('\nChecking database tables...');
    // Check inventory table structure
    const [inventoryColumns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'inventory'
    `);
    
    console.log('\nInventory table columns:');
    inventoryColumns.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
    // Check if itemId exists in inventory table
    const itemIdColumn = inventoryColumns.find(col => col.column_name === 'itemId' || col.column_name === 'item_id');
    if (itemIdColumn) {
      console.log(`\n✅ Found foreign key in inventory table: ${itemIdColumn.column_name}`);
    } else {
      console.log('\n❌ No itemId or item_id column found in inventory table');
    }
    
    console.log('\nTrying a simple query...');
    try {
      const inventories = await Inventory.findAll({
        limit: 1,
        raw: true
      });
      
      console.log('Sample inventory record:');
      console.log(inventories[0]);
    } catch (error) {
      console.error('Error querying inventory:', error.message);
    }
    
    console.log('\nTrying a join query using direct SQL...');
    try {
      const [results] = await sequelize.query(`
        SELECT i.*, im.* 
        FROM inventory i
        LEFT JOIN item_master im ON i."itemId" = im.id
        LIMIT 1
      `);
      
      if (results.length > 0) {
        console.log('Join query successful!');
      } else {
        console.log('Join query returned no results');
      }
    } catch (error) {
      console.error('Error with join query:', error.message);
    }
    
    console.log('\nCreating a special direct SQL route for inventory items...');
    console.log('Use this route in the frontend for reliable inventory data retrieval');
    console.log('Route: GET /api/direct/inventory');
    
  } catch (error) {
    console.error('Error during debug:', error);
  } finally {
    await sequelize.close();
    console.log('\nDebug process completed');
  }
}

debugInventoryAssociations().catch(console.error);
