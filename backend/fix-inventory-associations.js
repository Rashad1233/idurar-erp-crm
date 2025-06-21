const { Inventory, BinLocation, StorageLocation } = require('./models/sequelize');
const { sequelize } = require('./config/db');

async function fixInventoryAssociations() {
  console.log('Starting fix for inventory associations...');
  
  try {
    // Now let's fix the relationship mapping
    console.log('Fixing inventory-binLocation association in database...');
    
    // Find inventory items with binLocationId but no storageLocationId
    const itemsToFix = await Inventory.findAll({
      where: {
        binLocationId: {[sequelize.Op.ne]: null},
        storageLocationId: null
      }
    });
    
    console.log(`Found ${itemsToFix.length} items with bin location but no storage location`);
    
    // For each item, get the bin location and its storage location
    for (const item of itemsToFix) {
      try {
        const bin = await BinLocation.findByPk(item.binLocationId);
        if (bin && bin.storageLocationId) {
          console.log(`Setting storage location ${bin.storageLocationId} for inventory item ${item.id}`);
          await item.update({ storageLocationId: bin.storageLocationId });
        }
      } catch (error) {
        console.error(`Error fixing item ${item.id}:`, error);
      }
    }
    
    // Set warehouse field from storage location if empty
    console.log('Updating warehouse field from storageLocation where missing...');
    const itemsWithoutWarehouse = await Inventory.findAll({
      where: {
        storageLocationId: {[sequelize.Op.ne]: null},
        warehouse: {[sequelize.Op.or]: [null, '']}
      },
      include: [
        {
          model: StorageLocation,
          as: 'storageLocation'
        }
      ]
    });
    
    console.log(`Found ${itemsWithoutWarehouse.length} items with storage location but no warehouse code`);
    
    for (const item of itemsWithoutWarehouse) {
      try {
        if (item.storageLocation && item.storageLocation.code) {
          console.log(`Setting warehouse to ${item.storageLocation.code} for inventory item ${item.id}`);
          await item.update({ warehouse: item.storageLocation.code });
        }
      } catch (error) {
        console.error(`Error updating warehouse for item ${item.id}:`, error);
      }
    }
    
    console.log('Done fixing inventory associations in database');
    
  } catch (error) {
    console.error('Error in inventory associations fix script:', error);
  } finally {
    // We don't close the connection here to avoid issues
    console.log('Fix script completed');
  }
}

// Run the fix
fixInventoryAssociations()
  .then(() => {
    console.log('Association fix script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Association fix script failed:', error);
    process.exit(1);
  });
