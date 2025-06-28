// Debug model loading step by step
console.log('🔍 Debug model loading step by step...');

const Sequelize = require('sequelize');
const sequelize = require('./backend/config/postgresql');

console.log('1. Sequelize and connection loaded');

const db = {};

// Load basic models first
try {
  db.User = require('./backend/models/sequelize/User')(sequelize, Sequelize.DataTypes);
  console.log('✅ User loaded');
} catch (err) { 
  console.error('❌ User error:', err.message); 
}

// Load RFQ models one by one
try {
  console.log('2. Loading RequestForQuotation...');
  const RequestForQuotationModel = require('./backend/models/sequelize/RequestForQuotation');
  console.log('✅ RequestForQuotation file loaded');
  
  db.RequestForQuotation = RequestForQuotationModel(sequelize, Sequelize.DataTypes);
  console.log('✅ RequestForQuotation model created');
  console.log('   - Type:', typeof db.RequestForQuotation);
  console.log('   - findAll:', typeof db.RequestForQuotation.findAll);
} catch (err) { 
  console.error('❌ RequestForQuotation error:', err.message); 
  console.error('❌ Stack:', err.stack);
}

try {
  console.log('3. Loading RfqItem...');
  const RfqItemModel = require('./backend/models/sequelize/RfqItem');
  console.log('✅ RfqItem file loaded');
  
  db.RfqItem = RfqItemModel(sequelize, Sequelize.DataTypes);
  console.log('✅ RfqItem model created');
} catch (err) { 
  console.error('❌ RfqItem error:', err.message); 
  console.error('❌ Stack:', err.stack);
}

try {
  console.log('4. Loading RfqSupplier...');
  const RfqSupplierModel = require('./backend/models/sequelize/RfqSupplier');
  console.log('✅ RfqSupplier file loaded');
  
  db.RfqSupplier = RfqSupplierModel(sequelize, Sequelize.DataTypes);
  console.log('✅ RfqSupplier model created');
} catch (err) { 
  console.error('❌ RfqSupplier error:', err.message); 
  console.error('❌ Stack:', err.stack);
}

console.log('\n5. Final db object keys:', Object.keys(db));
console.log('RequestForQuotation in db:', !!db.RequestForQuotation);
console.log('RfqItem in db:', !!db.RfqItem);
console.log('RfqSupplier in db:', !!db.RfqSupplier);