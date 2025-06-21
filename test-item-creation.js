const db = require('./backend/models/sequelize');

async function testItemCreation() {
  try {
    console.log('Testing database connection...');
    await db.sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Get available models
    console.log('Available models:', Object.keys(db));
    
    console.log('Creating test item...');
    const testItem = await db.ItemMaster.create({
      itemNumber: 'TEST-001',
      description: 'Test Item Description',
      shortDescription: 'Test Item',
      uom: 'EA',
      status: 'DRAFT'
    });
    
    console.log('✅ Item created successfully:', testItem.toJSON());
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error details:', error);
  } finally {
    await db.sequelize.close();
  }
}

testItemCreation();
