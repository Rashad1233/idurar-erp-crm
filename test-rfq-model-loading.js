// Test RFQ model loading specifically
async function testRFQModels() {
  console.log('🔍 Testing RFQ model loading...');

  const Sequelize = require('sequelize');
  const sequelize = require('./backend/config/postgresql');

  try {
    console.log('1. Testing direct model loading...');
    
    // Test loading RequestForQuotation directly
    const RequestForQuotationModel = require('./backend/models/sequelize/RequestForQuotation');
    console.log('✅ RequestForQuotation file loaded');
    
    const RequestForQuotation = RequestForQuotationModel(sequelize);
    console.log('✅ RequestForQuotation model initialized');
    console.log('  - findAll method:', typeof RequestForQuotation.findAll);
    
    // Test loading RfqItem
    const RfqItemModel = require('./backend/models/sequelize/RfqItem');
    console.log('✅ RfqItem file loaded');
    
    const RfqItem = RfqItemModel(sequelize);
    console.log('✅ RfqItem model initialized');
    
    // Test loading RfqSupplier
    const RfqSupplierModel = require('./backend/models/sequelize/RfqSupplier');
    console.log('✅ RfqSupplier file loaded');
    
    const RfqSupplier = RfqSupplierModel(sequelize);
    console.log('✅ RfqSupplier model initialized');
    
    console.log('\n2. Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    console.log('\n3. Testing model query...');
    const count = await RequestForQuotation.count();
    console.log('✅ RequestForQuotation count:', count);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('❌ Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testRFQModels();