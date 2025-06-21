const sequelize = require('./config/postgresql');

console.log('Testing warehouse models directly...');
try {
  const warehouseModels = require('./models/sequelize/Warehouse')(sequelize, sequelize.Sequelize.DataTypes);
  console.log('Warehouse models:', Object.keys(warehouseModels));
  console.log('StorageLocation type:', typeof warehouseModels.StorageLocation);
  console.log('BinLocation type:', typeof warehouseModels.BinLocation);
  
  if (warehouseModels.StorageLocation && warehouseModels.StorageLocation.findByPk) {
    console.log('✅ StorageLocation.findByPk is available');
  } else {
    console.log('❌ StorageLocation.findByPk is NOT available');
  }
  
} catch (error) {
  console.error('Error loading warehouse models:', error.message);
  console.error(error.stack);
}

process.exit(0);
