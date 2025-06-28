// Direct test of individual model loading
console.log('Testing direct model loading...\n');

const Sequelize = require('sequelize');
const sequelize = require('./config/postgresql');

// Test PurchaseOrder
try {
  console.log('1. Testing PurchaseOrder require...');
  const PurchaseOrderModel = require('./models/sequelize/PurchaseOrder');
  console.log('✅ PurchaseOrder require successful');
  
  console.log('2. Testing PurchaseOrder initialization...');
  const PurchaseOrder = PurchaseOrderModel(sequelize, Sequelize.DataTypes);
  console.log('✅ PurchaseOrder initialization successful');
  
} catch (error) {
  console.error('❌ PurchaseOrder error:', error.message);
  console.error('Stack:', error.stack);
}

// Test RequestForQuotation
try {
  console.log('\n3. Testing RequestForQuotation require...');
  const RFQModel = require('./models/sequelize/RequestForQuotation');
  console.log('✅ RequestForQuotation require successful');
  
  console.log('4. Testing RequestForQuotation initialization...');
  const RFQ = RFQModel(sequelize, Sequelize.DataTypes);
  console.log('✅ RequestForQuotation initialization successful');
  
} catch (error) {
  console.error('❌ RequestForQuotation error:', error.message);
  console.error('Stack:', error.stack);
}

// Test manual loading into object
console.log('\n5. Testing manual loading into object...');
const db = {};

try {
  db.sequelize = sequelize;
  db.Sequelize = Sequelize;
  
  console.log('Loading PurchaseOrder manually...');
  db.PurchaseOrder = require('./models/sequelize/PurchaseOrder')(sequelize, Sequelize.DataTypes);
  console.log('✅ PurchaseOrder loaded manually');
  
  console.log('Loading RequestForQuotation manually...');
  db.RequestForQuotation = require('./models/sequelize/RequestForQuotation')(sequelize, Sequelize.DataTypes);
  console.log('✅ RequestForQuotation loaded manually');
  
  console.log('Loading RfqSupplier manually...');
  db.RfqSupplier = require('./models/sequelize/RfqSupplier')(sequelize, Sequelize.DataTypes);
  console.log('✅ RfqSupplier loaded manually');
  
  console.log('\nManual db object keys:', Object.keys(db));
  console.log('PurchaseOrder available:', !!db.PurchaseOrder);
  console.log('RequestForQuotation available:', !!db.RequestForQuotation);
  console.log('RfqSupplier available:', !!db.RfqSupplier);
  
} catch (error) {
  console.error('❌ Manual loading error:', error.message);
  console.error('Stack:', error.stack);
}