// Debug Models Loading Process
(async () => {
  console.log('🔍 Starting Models Loading Debug...');

  try {
    const sequelize = require('./backend/config/postgresql');
    const Sequelize = require('sequelize');
    
    console.log('✅ Database and Sequelize loaded');
    
    // Test loading models one by one to see where it fails
    console.log('\n🔍 Testing individual model loading...');
    
    const db = {};
    
    // Load basic models first
    try {
      db.User = require('./backend/models/sequelize/User')(sequelize, Sequelize.DataTypes);
      console.log('✅ User model loaded');
    } catch (err) {
      console.error('❌ User model error:', err.message);
    }
    
    // Test PurchaseOrder loading with detailed error handling
    console.log('\n🔍 Testing PurchaseOrder model loading...');
    try {
      const PurchaseOrderModel = require('./backend/models/sequelize/PurchaseOrder');
      console.log('✅ PurchaseOrder model file imported');
      
      const PurchaseOrder = PurchaseOrderModel(sequelize);
      console.log('✅ PurchaseOrder model instantiated');
      
      db.PurchaseOrder = PurchaseOrder;
      console.log('✅ PurchaseOrder added to db object');
      console.log('  - Model name:', PurchaseOrder.name);
      console.log('  - Table name:', PurchaseOrder.tableName);
      
    } catch (err) {
      console.error('❌ PurchaseOrder detailed error:', err.message);
      console.error('❌ Stack:', err.stack);
    }
    
    // Test PurchaseOrderItem loading
    console.log('\n🔍 Testing PurchaseOrderItem model loading...');
    try {
      const PurchaseOrderItemModel = require('./backend/models/sequelize/PurchaseOrderItem');
      console.log('✅ PurchaseOrderItem model file imported');
      
      const PurchaseOrderItem = PurchaseOrderItemModel(sequelize);
      console.log('✅ PurchaseOrderItem model instantiated');
      
      db.PurchaseOrderItem = PurchaseOrderItem;
      console.log('✅ PurchaseOrderItem added to db object');
      console.log('  - Model name:', PurchaseOrderItem.name);
      console.log('  - Table name:', PurchaseOrderItem.tableName);
      
    } catch (err) {
      console.error('❌ PurchaseOrderItem detailed error:', err.message);
      console.error('❌ Stack:', err.stack);
    }
    
    console.log('\n🔍 Final db object contents:');
    console.log('Available models:', Object.keys(db));
    console.log('PurchaseOrder in db:', !!db.PurchaseOrder);
    console.log('PurchaseOrderItem in db:', !!db.PurchaseOrderItem);
    
    // Now test the actual models/sequelize/index.js loading
    console.log('\n🔍 Testing actual models/sequelize/index.js loading...');
    
    // Clear require cache to force reload
    delete require.cache[require.resolve('./backend/models/sequelize/index.js')];
    
    try {
      const dbFromIndex = require('./backend/models/sequelize/index.js');
      console.log('✅ Models index loaded successfully');
      console.log('Models from index:', Object.keys(dbFromIndex).filter(key => !['sequelize', 'Sequelize'].includes(key)));
      console.log('PurchaseOrder from index:', !!dbFromIndex.PurchaseOrder);
      console.log('PurchaseOrderItem from index:', !!dbFromIndex.PurchaseOrderItem);
    } catch (err) {
      console.error('❌ Models index loading error:', err.message);
      console.error('❌ Stack:', err.stack);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error('❌ Stack:', error.stack);
  }
})();