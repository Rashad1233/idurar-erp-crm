const { ItemMaster, UnspscCode, User } = require('../models/sequelize');

// Test creating an item master with simplified UNSPSC approach
async function testItemCreation() {
  try {
    console.log('Testing item creation with simplified UNSPSC...');
    
    // First, create or find a test user
    let testUser = await User.findOne({ where: { email: 'test@example.com' } });
    if (!testUser) {      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'staff'
      });
      console.log('Created test user');
    }
    
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
      
      const segment = unspscCode.substring(0, 2);
      const family = unspscCode.substring(2, 4);
      const classCode = unspscCode.substring(4, 6);
      const commodity = unspscCode.substring(6, 8);
      
      unspscCodeRecord = await UnspscCode.create({
        code: unspscCode,
        segment,
        family,
        class: classCode,
        commodity,
        title: 'Computer monitors',
        description: 'Computer monitors and displays',
        level: 'COMMODITY',
        isActive: true
      });
      
      console.log(`Created UNSPSC code: ${unspscCode}`);
    } else {
      console.log(`Found existing UNSPSC code: ${unspscCode}`);
    }
    
    unspscCodeId = unspscCodeRecord.id;
    
    // Generate a random item number
    const generateItemNumber = () => {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const prefix = 
        letters.charAt(Math.floor(Math.random() * letters.length)) + 
        letters.charAt(Math.floor(Math.random() * letters.length));
      const randomNumber = Math.floor(Math.random() * 900000) + 100000;
      return `${prefix}-${randomNumber}`;
    };
    
    // Create test item data
    const itemData = {
      itemNumber: generateItemNumber(),
      shortDescription: 'Test Computer Monitor 24"',
      longDescription: 'High-quality 24-inch computer monitor for office use',
      standardDescription: 'Test Computer Monitor 24"',
      manufacturerName: 'Dell',
      manufacturerPartNumber: 'P2414H',
      equipmentCategory: 'ELECTRICAL',
      equipmentSubCategory: 'Monitors',
      unspscCodeId: unspscCodeId,
      unspscCode: unspscCode,
      uom: 'EA',
      equipmentTag: 'MON-001',
      serialNumber: 'N',
      criticality: 'LOW',
      stockItem: 'Y',
      plannedStock: 'Y',
      status: 'DRAFT',
      createdById: testUser.id
    };
    
    console.log('Creating item master with data:', itemData);
    
    // Create the item master
    const item = await ItemMaster.create(itemData);
    
    console.log('✅ Item master created successfully!');
    console.log('Item ID:', item.id);
    console.log('Item Number:', item.itemNumber);
    console.log('UNSPSC Code:', item.unspscCode);
    console.log('Stock Item:', item.stockItem);
    
    // Verify the item was created with relations
    const createdItem = await ItemMaster.findByPk(item.id, {
      include: [
        { model: UnspscCode, as: 'unspsc' },
        { model: User, as: 'createdBy', attributes: ['name', 'email'] }
      ]
    });
    
    console.log('✅ Verification successful!');
    console.log('Item with relations:', {
      id: createdItem.id,
      itemNumber: createdItem.itemNumber,
      description: createdItem.shortDescription,
      unspsc: createdItem.unspsc ? {
        code: createdItem.unspsc.code,
        title: createdItem.unspsc.title
      } : null,
      createdBy: createdItem.createdBy ? createdItem.createdBy.name : null,
      stockItem: createdItem.stockItem
    });
    
    return item;
    
  } catch (error) {
    console.error('❌ Error creating item master:', error);
    console.error('Error details:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors.map(e => e.message));
    }
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testItemCreation()
    .then(() => {
      console.log('Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testItemCreation };
