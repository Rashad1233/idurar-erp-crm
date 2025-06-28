// Test what's in sequelize.models vs db object
console.log('Testing sequelize.models vs db object...\n');

const sequelize = require('./config/postgresql');
const db = require('./models/sequelize');

console.log('1. sequelize.models keys:', Object.keys(sequelize.models));
console.log('2. db object keys:', Object.keys(db).filter(k => !['sequelize', 'Sequelize'].includes(k)));

console.log('\n3. Comparison:');
console.log('   - PurchaseOrder in sequelize.models:', !!sequelize.models.PurchaseOrder);
console.log('   - PurchaseOrder in db:', !!db.PurchaseOrder);
console.log('   - RequestForQuotation in sequelize.models:', !!sequelize.models.RequestForQuotation);
console.log('   - RequestForQuotation in db:', !!db.RequestForQuotation);

console.log('\n4. Are they the same objects?');
if (sequelize.models.PurchaseRequisition && db.PurchaseRequisition) {
  console.log('   - PurchaseRequisition same object:', sequelize.models.PurchaseRequisition === db.PurchaseRequisition);
}

// Test if models are being loaded correctly into sequelize instance
console.log('\n5. Direct model definition test:');
const { DataTypes } = require('sequelize');
try {
  const TestPO = sequelize.define('TestPurchaseOrder', {
    id: { type: DataTypes.UUID, primaryKey: true },
    poNumber: { type: DataTypes.STRING }
  });
  console.log('   - Direct model definition works:', !!TestPO);
  console.log('   - TestPurchaseOrder in sequelize.models:', !!sequelize.models.TestPurchaseOrder);
} catch (err) {
  console.error('   - Direct model definition error:', err.message);
}