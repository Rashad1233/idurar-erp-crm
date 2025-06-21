// Script to reset procurement tables to fix UUID foreign key issues
const { Client } = require('pg');

// Database connection (matching backend config)
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'mimipos_erp',
  user: 'postgres',
  password: 'admin',
});

async function resetProcurementTables() {
  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Database connection established');

    // Drop tables that have foreign key constraints to Users table
    const tablesToDrop = [
      'ApprovalHistories',
      'PurchaseRequisitionItems', 
      'PurchaseRequisitions',
      'PurchaseOrderItems',
      'PurchaseOrders',
      'DelegationOfAuthorities'
    ];

    console.log('🗑️ Dropping procurement tables to fix data type conflicts...');
    
    for (const table of tablesToDrop) {
      try {
        await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
        console.log(`✅ Dropped table: ${table}`);
      } catch (error) {
        console.log(`⚠️ Could not drop table ${table}:`, error.message);
      }
    }

    console.log('✅ All procurement tables dropped successfully');
    console.log('🚀 You can now restart the backend server to recreate tables with correct UUID foreign keys');

  } catch (error) {
    console.error('❌ Error resetting procurement tables:', error);
  } finally {
    await client.end();
  }
}

resetProcurementTables();
