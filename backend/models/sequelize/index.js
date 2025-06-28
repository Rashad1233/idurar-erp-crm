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

// Load procurement models with error handling
console.log('🔍 Loading procurement models with error handling...');

try {
  db.PurchaseRequisition = require('./PurchaseRequisition')(sequelize, Sequelize.DataTypes);
  console.log('✅ PurchaseRequisition loaded');
} catch (err) { console.error('❌ PurchaseRequisition error:', err.message); }

try {
  db.PurchaseRequisitionItem = require('./PurchaseRequisitionItem')(sequelize, Sequelize.DataTypes);
  console.log('✅ PurchaseRequisitionItem loaded');
} catch (err) { console.error('❌ PurchaseRequisitionItem error:', err.message); }

try {
  db.RequestForQuotation = require('./RequestForQuotation')(sequelize, Sequelize.DataTypes);
  console.log('✅ RequestForQuotation loaded');
} catch (err) { console.error('❌ RequestForQuotation error:', err.message); console.error('❌ Stack:', err.stack); }

try {
  db.RfqItem = require('./RfqItem')(sequelize, Sequelize.DataTypes);
  console.log('✅ RfqItem loaded');
} catch (err) { console.error('❌ RfqItem error:', err.message); console.error('❌ Stack:', err.stack); }

try {
  db.RfqSupplier = require('./RfqSupplier')(sequelize, Sequelize.DataTypes);
  console.log('✅ RfqSupplier loaded');
} catch (err) { console.error('❌ RfqSupplier error:', err.message); console.error('❌ Stack:', err.stack); }

try {
  db.RfqQuoteItem = require('./RfqQuoteItem')(sequelize, Sequelize.DataTypes);
  console.log('✅ RfqQuoteItem loaded');
} catch (err) { console.error('❌ RfqQuoteItem error:', err.message); console.error('❌ Stack:', err.stack); }

try {
  db.Supplier = require('./Supplier')(sequelize, Sequelize.DataTypes);
  console.log('✅ Supplier loaded');
} catch (err) { console.error('❌ Supplier error:', err.message); }

try {
  db.PurchaseOrder = require('./PurchaseOrder')(sequelize, Sequelize.DataTypes);
  console.log('✅ PurchaseOrder loaded');
} catch (err) { console.error('❌ PurchaseOrder error:', err.message); console.error('❌ Stack:', err.stack); }

try {
  db.PurchaseOrderItem = require('./PurchaseOrderItem')(sequelize, Sequelize.DataTypes);
  console.log('✅ PurchaseOrderItem loaded');
} catch (err) { console.error('❌ PurchaseOrderItem error:', err.message); console.error('❌ Stack:', err.stack); }

try {
  db.Contract = require('./Contract')(sequelize, Sequelize.DataTypes);
  console.log('✅ Contract loaded');
} catch (err) { console.error('❌ Contract error:', err.message); }

try {
  db.ContractItem = require('./ContractItem')(sequelize, Sequelize.DataTypes);
  console.log('✅ ContractItem loaded');
} catch (err) { console.error('❌ ContractItem error:', err.message); }

try {
  db.ApprovalHistory = require('./ApprovalHistory')(sequelize, Sequelize.DataTypes);
  console.log('✅ ApprovalHistory loaded');
} catch (err) { console.error('❌ ApprovalHistory error:', err.message); }

try {
  db.DelegationOfAuthority = require('./DelegationOfAuthority')(sequelize, Sequelize.DataTypes);
  console.log('✅ DelegationOfAuthority loaded');
} catch (err) { console.error('❌ DelegationOfAuthority error:', err.message); }

try {
  db.Notification = require('./Notification')(sequelize, Sequelize.DataTypes);
  console.log('✅ Notification loaded');
} catch (err) { console.error('❌ Notification error:', err.message); }

try {
  db.ApprovalWorkflow = require('./ApprovalWorkflow')(sequelize, Sequelize.DataTypes);
  console.log('✅ ApprovalWorkflow loaded');
} catch (err) { console.error('❌ ApprovalWorkflow error:', err.message); }

try {
  db.ApprovalThreshold = require('./ApprovalThreshold')(sequelize, Sequelize.DataTypes);
  console.log('✅ ApprovalThreshold loaded');
} catch (err) { console.error('❌ ApprovalThreshold error:', err.message); }

try {
  db.NotificationLog = require('./NotificationLog')(sequelize, Sequelize.DataTypes);
  console.log('✅ NotificationLog loaded');
} catch (err) { console.error('❌ NotificationLog error:', err.message); }

// Load sales models
console.log('🔍 Loading sales models...');
try {
  db.Customer = require('./Customer')(sequelize, Sequelize.DataTypes);
  console.log('✅ Customer loaded');
} catch (err) { console.error('❌ Customer error:', err.message); }

try {
  db.SalesOrder = require('./SalesOrder')(sequelize, Sequelize.DataTypes);
  console.log('✅ SalesOrder loaded');
} catch (err) { console.error('❌ SalesOrder error:', err.message); }

try {
  db.SalesOrderItem = require('./SalesOrderItem')(sequelize, Sequelize.DataTypes);
  console.log('✅ SalesOrderItem loaded');
} catch (err) { console.error('❌ SalesOrderItem error:', err.message); }

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

// Debug: Show what models are loaded before associations
console.log('🔍 Models loaded before associations:', Object.keys(db).filter(key => !['sequelize', 'Sequelize'].includes(key)));

// Initialize associations
console.log('🔍 Initializing model associations...');
try {
  require('./associations')(db);
  console.log('✅ Model associations initialized successfully');
} catch (error) {
  console.error('❌ Error initializing associations:', error.message);
  console.error('❌ Error stack:', error.stack);
}

// Debug: Show what models are available after associations
console.log('🔍 Models available after associations:', Object.keys(db).filter(key => !['sequelize', 'Sequelize'].includes(key)));

// Include sequelize instance and class in exports
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Include legacy models for backward compatibility
try {
  const RejectionNotification = require('../rejectionNotification');
  db.RejectionNotification = RejectionNotification(sequelize);
} catch (err) {
  console.warn('Could not load legacy RejectionNotification model:', err.message);
}

module.exports = db;
