// c:\Users\rasha\Desktop\test erp\backend\models\sequelize\index.js
const Sequelize = require('sequelize');
const sequelize = require('../../config/postgresql');

// Initialize an empty db object
const db = {};

// Load models
db.User = require('./User')(sequelize, Sequelize.DataTypes);
db.UnspscCode = require('./UnspscCode')(sequelize, Sequelize.DataTypes);
db.ItemMaster = require('./ItemMaster')(sequelize, Sequelize.DataTypes);
db.Inventory = require('./Inventory')(sequelize, Sequelize.DataTypes);
db.UserUnspscFavorite = require('./UserUnspscFavorite')(sequelize, Sequelize.DataTypes);
db.UserUnspscHierarchy = require('./UserUnspscHierarchy')(sequelize, Sequelize.DataTypes);

// Load procurement models
db.PurchaseRequisition = require('./PurchaseRequisition')(sequelize, Sequelize.DataTypes);
db.PurchaseRequisitionItem = require('./PurchaseRequisitionItem')(sequelize, Sequelize.DataTypes);
db.RequestForQuotation = require('./RequestForQuotation')(sequelize, Sequelize.DataTypes);
db.RfqItem = require('./RfqItem')(sequelize, Sequelize.DataTypes);
db.RfqSupplier = require('./RfqSupplier')(sequelize, Sequelize.DataTypes);
db.RfqQuoteItem = require('./RfqQuoteItem')(sequelize, Sequelize.DataTypes);
db.Supplier = require('./Supplier')(sequelize, Sequelize.DataTypes);
db.PurchaseOrder = require('./PurchaseOrder')(sequelize, Sequelize.DataTypes);
db.PurchaseOrderItem = require('./PurchaseOrderItem')(sequelize, Sequelize.DataTypes);
db.Contract = require('./Contract')(sequelize, Sequelize.DataTypes);
db.ContractItem = require('./ContractItem')(sequelize, Sequelize.DataTypes);
db.ApprovalHistory = require('./ApprovalHistory')(sequelize, Sequelize.DataTypes);
db.DelegationOfAuthority = require('./DelegationOfAuthority')(sequelize, Sequelize.DataTypes);

// Load models that return multiple models
console.log('🔍 Loading warehouse models...');
try {
  const warehouseModels = require('./Warehouse')(sequelize, Sequelize.DataTypes);
  console.log('✅ Warehouse models loaded:', Object.keys(warehouseModels));
  db.StorageLocation = warehouseModels.StorageLocation;
  db.BinLocation = warehouseModels.BinLocation;
  db.Warehouse = warehouseModels.Warehouse;
  console.log('✅ Warehouse models assigned to db');
  console.log('✅ StorageLocation in db:', !!db.StorageLocation);
  console.log('✅ BinLocation in db:', !!db.BinLocation);
  
  // Set up associations for warehouse models
  if (db.StorageLocation && db.BinLocation && db.User) {
    console.log('🔍 Setting up warehouse model associations...');
    
    // BinLocation belongs to StorageLocation
    db.BinLocation.belongsTo(db.StorageLocation, {
      foreignKey: 'storageLocationId',
      as: 'storageLocation'
    });
  
    
    // StorageLocation and BinLocation belong to User (created by)
    db.StorageLocation.belongsTo(db.User, {
      foreignKey: 'createdById',
      as: 'createdBy'
    });
    
    db.BinLocation.belongsTo(db.User, {
      foreignKey: 'createdById',
      as: 'createdBy'
    });
    
    console.log('✅ Warehouse model associations set up successfully');
  } else {
    console.error('❌ Could not set up warehouse model associations - one or more models missing');
  }
} catch (error) {
  console.error('❌ Error loading warehouse models:', error.message);
  console.error('❌ Error stack:', error.stack);
}

const transactionModels = require('./Transaction')(sequelize, Sequelize.DataTypes);
db.Transaction = transactionModels.Transaction;
db.TransactionItem = transactionModels.TransactionItem;

const reorderRequestModels = require('./ReorderRequest')(sequelize, Sequelize.DataTypes);
db.ReorderRequest = reorderRequestModels.ReorderRequest;
db.ReorderRequestItem = reorderRequestModels.ReorderRequestItem;

// Initialize associations
console.log('🔍 Initializing model associations...');
try {
  require('./associations')(db);
  console.log('✅ Model associations initialized successfully');
} catch (error) {
  console.error('❌ Error initializing associations:', error.message);
  console.error('❌ Error stack:', error.stack);
}

// Include sequelize instance and class in exports
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
