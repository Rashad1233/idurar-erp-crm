// Test model loading
try {
  console.log('Testing model imports...');
  
  const { Inventory, ItemMaster, StorageLocation, BinLocation, User, UnspscCode } = require('./models/sequelize');
  
  console.log('Inventory:', Inventory ? 'Loaded' : 'Undefined');
  console.log('ItemMaster:', ItemMaster ? 'Loaded' : 'Undefined');
  console.log('StorageLocation:', StorageLocation ? 'Loaded' : 'Undefined');
  console.log('BinLocation:', BinLocation ? 'Loaded' : 'Undefined');
  console.log('User:', User ? 'Loaded' : 'Undefined');
  console.log('UnspscCode:', UnspscCode ? 'Loaded' : 'Undefined');
  
  if (ItemMaster) {
    console.log('ItemMaster methods:', Object.getOwnPropertyNames(ItemMaster).filter(name => typeof ItemMaster[name] === 'function'));
  }
  
} catch (error) {
  console.error('Error loading models:', error.message);
  console.error('Stack:', error.stack);
}
