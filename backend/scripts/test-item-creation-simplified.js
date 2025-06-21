
const { ItemMaster, UnspscCode } = require('../models/sequelize');
const { generateUUID } = require('../utils/common');

// Test creating an item master with simplified UNSPSC approach
async function testItemCreation() {
  try {
    console.log('Testing item creation with simplified UNSPSC...');
    
    // UNSPSC code to use
    const unspscCode = '43211706'; // Computer monitors
    
    // Check if the UNSPSC code exists
    let unspscCodeRecord = await UnspscCode.findOne({
      where: { code: unspscCode }
    });
    
    let unspscCodeId = null;
    
    // If code doesn't exist, create it
    if (!unspscCodeRecord) {
      console.log(`UNSPSC code ${unspscCode} not found, creating...`);
      
      // Extract components
      const segment = unspscCode.substring(0, 2);
      const family = unspscCode.substring(2, 4);
      const classCode = unspscCode.substring(4, 6);
      const commodity = unspscCode.substring(6, 8);
      
      // Create the code
      unspscCodeRecord = await UnspscCode.create({
        code: unspscCode,
        segment,
        family,
        class: classCode,
        commodity,
        title: `Test UNSPSC Code: ${unspscCode}`,
        level: 'COMMODITY',
        isActive: true
      });
      
      console.log(`Created UNSPSC code with ID: ${unspscCodeRecord.id}`);
    } else {
      console.log(`Found existing UNSPSC code: ${unspscCode}, ID: ${unspscCodeRecord.id}`);
    }
    
    unspscCodeId = unspscCodeRecord.id;
    
    // Generate a mock system user ID for createdById
    const systemUserId = '00000000-0000-0000-0000-000000000000';
    
    // Create test item
    const itemData = {
      itemNumber: `TS-${Math.floor(Math.random() * 1000000)}`,
      shortDescription: 'Test Computer Monitor',
      longDescription: 'Test description for a computer monitor',
      standardDescription: 'Standard Computer Monitor',
      manufacturerName: 'Test Manufacturer',
      manufacturerPartNumber: 'TEST-123',
      equipmentCategory: 'HARDWARE',
      equipmentSubCategory: 'MONITOR',
      unspscCodeId,
      unspscCode,
      uom: 'EA',
      equipmentTag: '',
      serialNumber: 'N',
      criticality: 'NO',
      stockItem: 'Y',
      plannedStock: 'N',
      status: 'DRAFT',
      createdById: systemUserId
    };
    
    console.log('Creating item with data:', itemData);
    
    const newItem = await ItemMaster.create(itemData);
    
    console.log('Successfully created item:', {
      id: newItem.id,
      itemNumber: newItem.itemNumber,
      shortDescription: newItem.shortDescription,
      unspscCode: newItem.unspscCode,
      unspscCodeId: newItem.unspscCodeId
    });
    
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    process.exit(0);
  }
}

// Run the test
testItemCreation();
