// Check Purchase Order Database Schema
const sequelize = require('./backend/config/postgresql');

(async () => {
  console.log('🔍 Checking Purchase Order Database Schema...');
  
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Check PurchaseOrders table columns
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'PurchaseOrders'
      ORDER BY ordinal_position;
    `);
    
    console.log('🔍 PurchaseOrders table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check PurchaseOrderItems table columns
    const [itemColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'PurchaseOrderItems'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n🔍 PurchaseOrderItems table columns:');
    itemColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check if there are any existing records
    const [poCount] = await sequelize.query(`SELECT COUNT(*) as count FROM "PurchaseOrders"`);
    const [poiCount] = await sequelize.query(`SELECT COUNT(*) as count FROM "PurchaseOrderItems"`);
    
    console.log(`\n🔍 Existing records:`);
    console.log(`  - PurchaseOrders: ${poCount[0].count}`);
    console.log(`  - PurchaseOrderItems: ${poiCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  }
})();