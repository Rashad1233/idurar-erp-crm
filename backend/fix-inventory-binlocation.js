const { Inventory } = require('./models/sequelize');
const { sequelize } = require('./config/db');

async function fixInventoryBinLocationField() {
  console.log('Starting migration of inventory binLocation field to binLocationText...');
  
  try {
    // First, check if there are any inventory records with binLocation data
    const inventoryItemsWithBinLocation = await sequelize.query(
      'SELECT id, "binLocation" FROM "Inventories" WHERE "binLocation" IS NOT NULL AND "binLocation" != \'\';',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(`Found ${inventoryItemsWithBinLocation.length} inventory items with binLocation data`);
    
    if (inventoryItemsWithBinLocation.length === 0) {
      console.log('No data migration needed');
      return;
    }
    
    // Update items one by one
    let successCount = 0;
    let errorCount = 0;
    
    for (const item of inventoryItemsWithBinLocation) {
      try {
        await sequelize.query(
          'UPDATE "Inventories" SET "binLocationText" = :binLocation WHERE id = :id',
          { 
            replacements: { 
              id: item.id, 
              binLocation: item.binLocation 
            },
            type: sequelize.QueryTypes.UPDATE 
          }
        );
        successCount++;
      } catch (error) {
        console.error(`Error updating item ${item.id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Migration completed: ${successCount} successful, ${errorCount} failed`);
    
    // Clear the old binLocation field for all records
    console.log('Clearing old binLocation field...');
    await sequelize.query('UPDATE "Inventories" SET "binLocation" = \'\' WHERE "binLocation" IS NOT NULL;');
    
    console.log('Data migration complete!');
    
  } catch (error) {
    console.error('Error in binLocation migration script:', error);
  } finally {
    // Close database connection
    await sequelize.close();
  }
}

// Run the migration
fixInventoryBinLocationField();
