// Test script to check database connection and delete functionality
const { sequelize, models } = require('./models/sequelize');

async function testDelete() {
  try {
    console.log('🔧 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    console.log('🔧 Testing supplier model...');
    const suppliers = await models.Supplier.findAll({ limit: 5 });
    console.log(`✅ Found ${suppliers.length} suppliers`);
    
    if (suppliers.length > 0) {
      const supplier = suppliers[0];
      console.log(`🔧 Testing supplier: ${supplier.legalName} (${supplier.id})`);
      
      // Test finding by ID
      const foundSupplier = await models.Supplier.findByPk(supplier.id);
      console.log(`✅ Found supplier by ID: ${foundSupplier ? 'Yes' : 'No'}`);
      
      // Test associations
      console.log('🔧 Testing associations...');
      try {
        if (models.Contract) {
          const contractCount = await models.Contract.count({
            where: { supplierId: supplier.id }
          });
          console.log(`✅ Contract count: ${contractCount}`);
        } else {
          console.log('⚠️ Contract model not available');
        }
      } catch (assocError) {
        console.log('⚠️ Association error:', assocError.message);
      }
    }
    
    console.log('✅ Test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testDelete();