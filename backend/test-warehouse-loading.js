// Test warehouse model loading specifically
try {
  console.log('Testing warehouse model loading...');
  
  const sequelize = require('./config/postgresql');
  const { DataTypes } = require('sequelize');
  
  console.log('Sequelize loaded');
  
  const warehouseModels = require('./models/sequelize/Warehouse')(sequelize, DataTypes);
  console.log('Warehouse models:', Object.keys(warehouseModels));
  
  console.log('StorageLocation:', warehouseModels.StorageLocation ? 'Loaded' : 'Undefined');
  console.log('BinLocation:', warehouseModels.BinLocation ? 'Loaded' : 'Undefined');
  
} catch (error) {
  console.error('Error loading warehouse models:', error.message);
  console.error('Stack:', error.stack);
} finally {
  process.exit(0);
}
