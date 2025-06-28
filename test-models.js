// Test model loading
console.log('🔍 Testing model loading...');

try {
  const models = require('./backend/models/sequelize');
  
  console.log('✅ Models loaded successfully');
  console.log('Available models:', Object.keys(models).filter(key => !['sequelize', 'Sequelize'].includes(key)));
  
  console.log('\n🔍 Checking specific RFQ models:');
  console.log('RequestForQuotation:', !!models.RequestForQuotation, typeof models.RequestForQuotation);
  console.log('RfqItem:', !!models.RfqItem, typeof models.RfqItem);
  console.log('RfqSupplier:', !!models.RfqSupplier, typeof models.RfqSupplier);
  console.log('RfqQuoteItem:', !!models.RfqQuoteItem, typeof models.RfqQuoteItem);
  
  if (models.RequestForQuotation) {
    console.log('✅ RequestForQuotation model is available');
    console.log('  - findAll method:', typeof models.RequestForQuotation.findAll);
  } else {
    console.log('❌ RequestForQuotation model is NOT available');
  }
  
} catch (error) {
  console.error('❌ Error loading models:', error.message);
  console.error('❌ Stack:', error.stack);
}