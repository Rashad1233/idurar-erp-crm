const db = require('./models/sequelize');

console.log('Testing model loading...');
console.log('Available models:', Object.keys(db));
console.log('ItemMaster:', typeof db.ItemMaster);
console.log('StorageLocation:', typeof db.StorageLocation);
console.log('BinLocation:', typeof db.BinLocation);
console.log('Inventory:', typeof db.Inventory);

if (db.ItemMaster && db.ItemMaster.findByPk) {
  console.log('✅ ItemMaster.findByPk is available');
} else {
  console.log('❌ ItemMaster.findByPk is NOT available');
}

if (db.StorageLocation && db.StorageLocation.findByPk) {
  console.log('✅ StorageLocation.findByPk is available');
} else {
  console.log('❌ StorageLocation.findByPk is NOT available');
}

process.exit(0);
