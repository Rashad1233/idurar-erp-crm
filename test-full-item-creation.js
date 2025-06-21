const db = require('./backend/models/sequelize');

async function testFullItemCreation() {
  try {
    console.log('Testing full item creation through controller logic...');
    await db.sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Simulate the same data that would come from the frontend
    const itemData = {
      shortDescription: 'Test Item Description',
      longDescription: 'This is a longer description for the test item',
      standardDescription: 'Standard Description',
      manufacturerName: 'Test Manufacturer',
      manufacturerPartNumber: 'TM-001',
      equipmentCategory: 'ELECTRONICS',
      equipmentSubCategory: 'COMPONENTS',
      uom: 'EA',
      equipmentTag: 'TAG-001',
      serialNumber: 'N',
      criticality: 'LOW',
      stockItem: 'Y',
      plannedStock: 'N',
      unspscCode: '43211501'
    };

    console.log('Creating test item with data:', itemData);    const testItem = await db.ItemMaster.create({
      itemNumber: 'TEST-' + Date.now(),
      shortDescription: itemData.shortDescription,
      longDescription: itemData.longDescription,
      standardDescription: itemData.standardDescription,      manufacturerName: itemData.manufacturerName,
      manufacturerPartNumber: itemData.manufacturerPartNumber,
      equipmentCategory: itemData.equipmentCategory,
      equipmentSubCategory: itemData.equipmentSubCategory,
      unspscCode: itemData.unspscCode,
      uom: itemData.uom,
      equipmentTag: itemData.equipmentTag,
      serialNumber: itemData.serialNumber,
      criticality: itemData.criticality,
      stockItem: itemData.stockItem,      plannedStock: itemData.plannedStock,
      status: 'DRAFT',
      createdById: '5a772bde-25ca-4ccb-ad50-e11b01899a87' // Use actual user ID
    });
    
    console.log('✅ Item created successfully:', testItem.toJSON());
    
    // Test creating inventory record
    if (itemData.stockItem === 'Y') {
      console.log('Creating inventory record for stock item...');      const inventoryData = {
        itemMasterId: testItem.id,
        inventoryNumber: testItem.itemNumber,
        physicalBalance: 0,
        unitPrice: 0,
        linePrice: 0,
        condition: 'A',
        minimumLevel: 0,
        maximumLevel: 0,
        warehouse: 'MAIN',
        binLocationText: 'DEFAULT',
        serialNumber: itemData.serialNumber === 'Y' ? 'REQUIRED' : 'NOT_REQUIRED',
        lastUpdatedById: '5a772bde-25ca-4ccb-ad50-e11b01899a87' // Use actual user ID
      };
      
      const inventoryRecord = await db.Inventory.create(inventoryData);
      console.log('✅ Inventory record created successfully:', inventoryRecord.toJSON());
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error details:', error);
  } finally {
    await db.sequelize.close();
  }
}

testFullItemCreation();
