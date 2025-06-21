const { Inventory, ItemMaster } = require('./models/sequelize');

async function debugInventoryError() {
  try {
    console.log('Testing Sequelize associations...');
    
    // Test basic ItemMaster query
    console.log('\n1. Testing ItemMaster.findByPk...');
    const itemMaster = await ItemMaster.findByPk('bcc4f9d9-b443-4e19-aa5e-2747b1070249');
    console.log('ItemMaster found:', itemMaster ? 'Yes' : 'No');
    if (itemMaster) {
      console.log('ItemMaster data:', {
        id: itemMaster.id,
        itemNumber: itemMaster.itemNumber,
        shortDescription: itemMaster.shortDescription
      });
    }
      // Test Inventory model associations
    console.log('\n2. Testing Inventory associations...');
    const testInventoryData = {
      itemMasterId: 'bcc4f9d9-b443-4e19-aa5e-2747b1070249',
      itemId: 'bcc4f9d9-b443-4e19-aa5e-2747b1070249', // Add both for compatibility
      inventoryNumber: `TEST-${Date.now()}`,
      physicalBalance: 10,
      unitPrice: 10,
      condition: 'A',
      minimumLevel: 4,
      maximumLevel: 100,
      lastUpdatedById: '123e4567-e89b-12d3-a456-426614174000' // Dummy user ID
    };
    
    console.log('Test inventory data:', testInventoryData);
    
    // Try to create inventory
    console.log('\n3. Creating test inventory...');
    const newInventory = await Inventory.create(testInventoryData);
    console.log('Inventory created successfully:', newInventory.id);
    
    // Test with associations
    console.log('\n4. Testing inventory with associations...');
    const inventoryWithAssoc = await Inventory.findByPk(newInventory.id, {
      include: [
        {
          model: ItemMaster,
          as: 'itemMaster',
          attributes: ['id', 'itemNumber', 'shortDescription']
        }
      ]
    });
    
    console.log('Inventory with associations:', {
      id: inventoryWithAssoc.id,
      inventoryNumber: inventoryWithAssoc.inventoryNumber,
      itemMaster: inventoryWithAssoc.itemMaster
    });
    
  } catch (error) {
    console.error('\n❌ Error occurred:', error.message);
    console.error('Error name:', error.name);
    console.error('Error stack:', error.stack);
    
    if (error.original) {
      console.error('Original error:', error.original.message);
    }
    
    if (error.sql) {
      console.error('SQL that failed:', error.sql);
    }
  } finally {
    process.exit(0);
  }
}

debugInventoryError();
