// Debug Purchase Order Models Loading
(async () => {
  console.log('🔍 Starting PO Models Debug...');

  try {
    // Test database connection first
    const sequelize = require('./backend/config/postgresql');
    console.log('✅ Database config loaded');
    
    // Test individual model loading
    console.log('🔍 Testing individual model loading...');
    
    const { DataTypes } = require('sequelize');
    
    // Test PurchaseOrder model
    try {
      const PurchaseOrderModel = require('./backend/models/sequelize/PurchaseOrder');
      console.log('✅ PurchaseOrder model file loaded');
      
      const PurchaseOrder = PurchaseOrderModel(sequelize, DataTypes);
      console.log('✅ PurchaseOrder model instantiated:', !!PurchaseOrder);
      console.log('  - Model name:', PurchaseOrder.name);
      console.log('  - Table name:', PurchaseOrder.tableName);
    } catch (error) {
      console.error('❌ Error loading PurchaseOrder model:', error.message);
      console.error('❌ Stack:', error.stack);
    }
    
    // Test PurchaseOrderItem model
    try {
      const PurchaseOrderItemModel = require('./backend/models/sequelize/PurchaseOrderItem');
      console.log('✅ PurchaseOrderItem model file loaded');
      
      const PurchaseOrderItem = PurchaseOrderItemModel(sequelize, DataTypes);
      console.log('✅ PurchaseOrderItem model instantiated:', !!PurchaseOrderItem);
      console.log('  - Model name:', PurchaseOrderItem.name);
      console.log('  - Table name:', PurchaseOrderItem.tableName);
    } catch (error) {
      console.error('❌ Error loading PurchaseOrderItem model:', error.message);
      console.error('❌ Stack:', error.stack);
    }
    
    // Test full models loading
    console.log('🔍 Testing full models loading...');
    try {
      const db = require('./backend/models/sequelize');
      console.log('✅ Models index loaded');
      console.log('🔍 Available models:', Object.keys(db).filter(key => !['sequelize', 'Sequelize'].includes(key)));
      console.log('🔍 PurchaseOrder in db:', !!db.PurchaseOrder);
      console.log('🔍 PurchaseOrderItem in db:', !!db.PurchaseOrderItem);
      
      if (db.PurchaseOrder) {
        console.log('✅ PurchaseOrder model available');
        console.log('  - Name:', db.PurchaseOrder.name);
        console.log('  - Table:', db.PurchaseOrder.tableName);
      } else {
        console.error('❌ PurchaseOrder model NOT available in db object');
      }
      
      if (db.PurchaseOrderItem) {
        console.log('✅ PurchaseOrderItem model available');
        console.log('  - Name:', db.PurchaseOrderItem.name);
        console.log('  - Table:', db.PurchaseOrderItem.tableName);
      } else {
        console.error('❌ PurchaseOrderItem model NOT available in db object');
      }
      
    } catch (error) {
      console.error('❌ Error loading models index:', error.message);
      console.error('❌ Stack:', error.stack);
    }
    
    // Test database tables existence
    console.log('🔍 Testing database tables...');
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection successful');
      
      // Check if tables exist in erpdb database
      const [results] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name ILIKE '%purchaseorder%'
        ORDER BY table_name;
      `);
      
      console.log('🔍 Purchase Order related tables in erpdb database:', results.map(r => r.table_name));
      
      if (results.length === 0) {
        console.warn('⚠️ No Purchase Order tables found in database!');
        
        // Check all tables
        const [allTables] = await sequelize.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          ORDER BY table_name;
        `);
        
        console.log('🔍 All tables in erpdb database:', allTables.map(t => t.table_name));
      }
      
    } catch (error) {
      console.error('❌ Database connection error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Fatal error in debug script:', error.message);
    console.error('❌ Stack:', error.stack);
  }
})();