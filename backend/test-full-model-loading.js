console.log('Testing full model loading with error catching...');

try {
  console.log('Step 1: Loading sequelize...');
  const Sequelize = require('sequelize');
  const sequelize = require('./config/postgresql');
  
  console.log('Step 2: Initializing db object...');
  const db = {};
  
  console.log('Step 3: Loading individual models...');
  db.User = require('./models/sequelize/User')(sequelize, Sequelize.DataTypes);
  console.log('✅ User loaded');
  
  db.ItemMaster = require('./models/sequelize/ItemMaster')(sequelize, Sequelize.DataTypes);
  console.log('✅ ItemMaster loaded');
  
  db.Inventory = require('./models/sequelize/Inventory')(sequelize, Sequelize.DataTypes);
  console.log('✅ Inventory loaded');
  
  console.log('Step 4: Loading warehouse models...');
  const warehouseModels = require('./models/sequelize/Warehouse')(sequelize, Sequelize.DataTypes);
  db.StorageLocation = warehouseModels.StorageLocation;
  db.BinLocation = warehouseModels.BinLocation;
  db.Warehouse = warehouseModels.Warehouse;
  console.log('✅ Warehouse models loaded');
  
  console.log('Step 5: Loading other models...');
  db.UnspscCode = require('./models/sequelize/UnspscCode')(sequelize, Sequelize.DataTypes);
  console.log('✅ UnspscCode loaded');
  
  console.log('Step 6: Setting up associations...');
  require('./models/sequelize/associations')(db);
  console.log('✅ Associations loaded');
  
  console.log('Final check:');
  console.log('StorageLocation type:', typeof db.StorageLocation);
  console.log('BinLocation type:', typeof db.BinLocation);
  
} catch (error) {
  console.error('❌ Error during model loading:', error.message);
  console.error(error.stack);
}

process.exit(0);
