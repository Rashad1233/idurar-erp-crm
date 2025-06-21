// Test model loading with associations
const db = require('./backend/models/sequelize');

async function testAssociations() {
  try {
    console.log('🔍 Testing model loading with associations...');
    console.log('Available models:', Object.keys(db));
    
    console.log('BinLocation model exists:', !!db.BinLocation);
    console.log('StorageLocation model exists:', !!db.StorageLocation);
    console.log('User model exists:', !!db.User);
    
    if (db.BinLocation) {
      console.log('🔍 Testing BinLocation model...');
      const bins = await db.BinLocation.findAll({ limit: 1 });
      console.log(`Found ${bins.length} bins`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testAssociations();
