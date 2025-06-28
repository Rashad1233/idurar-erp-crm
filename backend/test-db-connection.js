// Test database connection and table structure compatibility
const Sequelize = require('sequelize');

console.log('🔍 Testing database connection and model compatibility...\n');

async function testDatabaseAndModels() {
  try {
    // Test database connection
    console.log('1. Testing PostgreSQL connection...');
    const sequelize = require('./config/postgresql');
    
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test table existence
    console.log('\n2. Checking table existence...');
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('RequestForQuotations', 'PurchaseOrders', 'RfqSuppliers')
      ORDER BY table_name;
    `);
    
    console.log('Available tables:', results.map(r => r.table_name));
    
    // Test individual model loading with proper error handling
    console.log('\n3. Testing individual model loading...');
    
    // Test PurchaseOrder
    try {
      const PurchaseOrderModel = require('./models/sequelize/PurchaseOrder');
      console.log('✅ PurchaseOrder file loaded');
      
      const PurchaseOrder = PurchaseOrderModel(sequelize, Sequelize.DataTypes);
      console.log('✅ PurchaseOrder model initialized');
      console.log('   - Methods available:', typeof PurchaseOrder.findAndCountAll);
      
      // Test sync to see if there are schema mismatches
      await PurchaseOrder.sync({ alter: false });
      console.log('✅ PurchaseOrder schema matches database');
      
    } catch (err) {
      console.error('❌ PurchaseOrder model error:', err.message);
    }
    
    // Test RequestForQuotation
    try {
      const RFQModel = require('./models/sequelize/RequestForQuotation');
      console.log('✅ RequestForQuotation file loaded');
      
      const RequestForQuotation = RFQModel(sequelize, Sequelize.DataTypes);
      console.log('✅ RequestForQuotation model initialized');
      
      // Test sync to see if there are schema mismatches
      await RequestForQuotation.sync({ alter: false });
      console.log('✅ RequestForQuotation schema matches database');
      
    } catch (err) {
      console.error('❌ RequestForQuotation model error:', err.message);
    }
    
    // Test the full models index
    console.log('\n4. Testing full models module...');
    try {
      const models = require('./models/sequelize');
      console.log('✅ Models module loaded');
      
      const availableModels = Object.keys(models).filter(key => 
        !['sequelize', 'Sequelize'].includes(key) && typeof models[key] === 'function'
      );
      console.log('Available models:', availableModels);
      
      console.log('\n5. Checking required models:');
      console.log('   - PurchaseOrder:', !!models.PurchaseOrder, typeof models.PurchaseOrder);
      console.log('   - RequestForQuotation:', !!models.RequestForQuotation, typeof models.RequestForQuotation);
      console.log('   - RfqSupplier:', !!models.RfqSupplier, typeof models.RfqSupplier);
      console.log('   - Supplier:', !!models.Supplier, typeof models.Supplier);
      
      if (models.PurchaseOrder) {
        console.log('✅ PurchaseOrder is available in models export');
        console.log('   - findAndCountAll method:', typeof models.PurchaseOrder.findAndCountAll);
      } else {
        console.log('❌ PurchaseOrder is NOT available in models export');
      }
      
    } catch (err) {
      console.error('❌ Models module error:', err.message);
      console.error('Stack:', err.stack);
    }
    
  } catch (error) {
    console.error('❌ Main test error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDatabaseAndModels();