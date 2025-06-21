const { sequelize } = require('./models/sequelize');

async function checkPRData() {
  try {
    console.log('🔍 Checking Purchase Requisition data...');
      // Check what database we're using
    console.log('🔧 Database dialect:', sequelize.getDialect());
    
    // Check what tables exist (PostgreSQL version)
    try {
      const tables = await sequelize.query(
        `SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%Purchase%';`,
        { type: sequelize.QueryTypes.SELECT }
      );
      console.log('📊 Purchase-related tables:', tables);
    } catch (err) {
      console.log('ℹ️ Could not check tables (may not be PostgreSQL):', err.message);
    }
      // Check PurchaseRequisitions table (with proper case)
    try {
      const prCount = await sequelize.query(
        'SELECT COUNT(*) as count FROM "PurchaseRequisitions";',
        { type: sequelize.QueryTypes.SELECT }
      );
      console.log('📈 PurchaseRequisitions count:', prCount[0].count);
      
      // Get recent PRs
      const recentPRs = await sequelize.query(
        'SELECT * FROM "PurchaseRequisitions" ORDER BY "createdAt" DESC LIMIT 5;',
        { type: sequelize.QueryTypes.SELECT }
      );
      console.log('📋 Recent Purchase Requisitions:');
      recentPRs.forEach(pr => {
        console.log(`  - ID: ${pr.id}`);
        console.log(`    Number: ${pr.prNumber}`);
        console.log(`    Description: ${pr.description}`);
        console.log(`    Total: ${pr.totalAmount}`);
        console.log(`    Status: ${pr.status}`);
        console.log(`    Created: ${pr.createdAt}`);
        console.log('---');
      });
    } catch (err) {
      console.error('❌ Error checking PurchaseRequisitions table:', err.message);
    }
    
    // Check PurchaseRequisitionItems table (with proper case)
    try {
      const itemCount = await sequelize.query(
        'SELECT COUNT(*) as count FROM "PurchaseRequisitionItems";',
        { type: sequelize.QueryTypes.SELECT }
      );
      console.log('📦 PurchaseRequisitionItems count:', itemCount[0].count);
      
      // Get recent items
      const recentItems = await sequelize.query(
        'SELECT * FROM "PurchaseRequisitionItems" ORDER BY "createdAt" DESC LIMIT 10;',
        { type: sequelize.QueryTypes.SELECT }
      );
      console.log('📦 Recent Purchase Requisition Items:');
      recentItems.forEach(item => {
        console.log(`  - Item: ${item.description}`);
        console.log(`    Quantity: ${item.quantity} ${item.uom}`);
        console.log(`    Unit Price: ${item.unitPrice}`);
        console.log(`    PR ID: ${item.purchaseRequisitionId}`);
        console.log('---');
      });
    } catch (err) {
      console.error('❌ Error checking PurchaseRequisitionItems table:', err.message);
    }
    
  } catch (err) {
    console.error('❌ Database error:', err.message);
  } finally {
    process.exit(0);
  }
}

checkPRData();
