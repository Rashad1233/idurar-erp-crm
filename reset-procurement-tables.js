// Script to reset procurement tables to fix UUID foreign key issues
const { Sequelize, DataTypes } = require('sequelize');

// Database connection
const sequelize = new Sequelize(
  process.env.DB_NAME || 'erp_system',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log
  }
);

async function resetProcurementTables() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
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
        await sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
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
    await sequelize.close();
  }
}

resetProcurementTables();
