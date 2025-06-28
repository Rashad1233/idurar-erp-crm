// Test RFQ controller model imports
console.log('🔍 Testing RFQ controller model imports...');

try {
  console.log('1. Testing model import...');
  const models = require('./backend/models/sequelize');
  
  console.log('Available models:', Object.keys(models).filter(key => !['sequelize', 'Sequelize'].includes(key)));
  
  console.log('\n2. Testing specific RFQ models:');
  console.log('RequestForQuotation:', !!models.RequestForQuotation, typeof models.RequestForQuotation);
  console.log('RfqItem:', !!models.RfqItem, typeof models.RfqItem);
  console.log('RfqSupplier:', !!models.RfqSupplier, typeof models.RfqSupplier);
  
  if (models.RequestForQuotation) {
    console.log('\n3. Testing RequestForQuotation methods:');
    console.log('findAll:', typeof models.RequestForQuotation.findAll);
    console.log('findByPk:', typeof models.RequestForQuotation.findByPk);
    console.log('create:', typeof models.RequestForQuotation.create);
  }
  
  console.log('\n4. Testing destructuring import:');
  const { RequestForQuotation, RfqItem, RfqSupplier, User, PurchaseRequisition, Supplier } = models;
  console.log('Destructured RequestForQuotation:', !!RequestForQuotation, typeof RequestForQuotation);
  console.log('Destructured RfqItem:', !!RfqItem, typeof RfqItem);
  console.log('Destructured RfqSupplier:', !!RfqSupplier, typeof RfqSupplier);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('❌ Stack:', error.stack);
}