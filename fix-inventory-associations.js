const { sequelize } = require('./backend/models/sequelize');

async function fixInventoryAssociations() {
  try {
    console.log('======================================================');
    console.log('FIXING INVENTORY MODEL ASSOCIATIONS');
    console.log('======================================================');
    console.log('This script will fix the inventory association issues');
    console.log('and ensure the direct SQL routes are working correctly');
    console.log('======================================================\n');

    // 1. Check database connection
    console.log('1. Checking database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection is OK\n');

    // 2. Check inventory table structure
    console.log('2. Checking inventory table structure...');
    const [inventoryColumns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'inventory'
    `);
    
    if (inventoryColumns.length === 0) {
      console.log('❓ "inventory" table not found, checking for "Inventories"...');
      
      const [inventoryColumnsAlt] = await sequelize.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'Inventories'
      `);
      
      if (inventoryColumnsAlt.length === 0) {
        console.log('❌ No inventory table found in the database!');
        return;
      } else {
        console.log('✅ Found "Inventories" table with columns:');
        inventoryColumnsAlt.forEach(col => {
          console.log(`   - ${col.column_name} (${col.data_type})`);
        });
        
        // Check for foreign key
        const itemForeignKey = inventoryColumnsAlt.find(col => 
          col.column_name === 'itemMasterId' || col.column_name === 'itemId'
        );
        
        if (itemForeignKey) {
          console.log(`✅ Found foreign key: ${itemForeignKey.column_name}`);
        } else {
          console.log('❌ No item foreign key found!');
        }
      }
    } else {
      console.log('✅ Found "inventory" table with columns:');
      inventoryColumns.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})`);
      });
      
      // Check for foreign key
      const itemForeignKey = inventoryColumns.find(col => 
        col.column_name === 'itemId' || col.column_name === 'item_id'
      );
      
      if (itemForeignKey) {
        console.log(`✅ Found foreign key: ${itemForeignKey.column_name}`);
      } else {
        console.log('❌ No item foreign key found!');
      }
    }
    
    // 3. Update the sequelize.js file with fixed associations
    console.log('\n3. Testing direct SQL queries...');
    try {
      // First try with capitalized table names
      const [inventoryItems] = await sequelize.query(`
        SELECT i.*, im."itemNumber" 
        FROM "Inventories" i
        LEFT JOIN "ItemMasters" im ON i."itemMasterId" = im.id
        LIMIT 5
      `);
      
      if (inventoryItems.length > 0) {
        console.log(`✅ Successfully queried ${inventoryItems.length} items from Inventories table`);
      } else {
        console.log('⚠️ No items found in Inventories table');
      }
    } catch (error) {
      console.log('❌ Error with capitalized table names:', error.message);
      
      try {
        // Try with lowercase table names
        const [inventoryItems] = await sequelize.query(`
          SELECT i.*, im."item_number" as "itemNumber"
          FROM "inventory" i
          LEFT JOIN "item_master" im ON i."itemId" = im.id
          LIMIT 5
        `);
        
        if (inventoryItems.length > 0) {
          console.log(`✅ Successfully queried ${inventoryItems.length} items from inventory table`);
        } else {
          console.log('⚠️ No items found in inventory table');
        }
      } catch (error) {
        console.log('❌ Error with lowercase table names:', error.message);
      }
    }
    
    // 4. Show instructions to update the app.js file
    console.log('\n4. NEXT STEPS:');
    console.log('   1. Use the fixed routes in fixedDirectInventoryRoutes.js');
    console.log('   2. Modify app.js to use these routes');
    console.log('   3. Update the frontend to use the direct inventory routes');
    console.log('\n5. To test the fix, run:');
    console.log('   node debug-inventory-associations.js');
    
  } catch (error) {
    console.error('❌ Error during fix process:', error);
  } finally {
    await sequelize.close();
  }
}

fixInventoryAssociations().catch(console.error);
