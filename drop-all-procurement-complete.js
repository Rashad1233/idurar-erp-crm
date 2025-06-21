const { Sequelize } = require('sequelize');

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || 'idurar_erp_crm',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'admin',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
  }
);

async function dropAllProcurementTables() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Drop all procurement tables in the correct order (child tables first)
    const tablesToDrop = [
      'PurchaseOrderItems',
      'PurchaseRequisitionItems', 
      'RfqQuoteItems',
      'RfqItems',
      'RfqSuppliers',
      'ContractItems',
      'ApprovalHistories',
      'PurchaseOrders',
      'PurchaseRequisitions',
      'RequestForQuotations',
      'Contracts',
      'Suppliers'
    ];

    console.log('🗑️ Dropping procurement tables...');
    
    for (const tableName of tablesToDrop) {
      try {
        await sequelize.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
        console.log(`✅ Dropped table: ${tableName}`);
      } catch (error) {
        console.log(`⚠️ Could not drop ${tableName}: ${error.message}`);
      }
    }

    // Also drop any related ENUM types
    const enumsToDelete = [
      'enum_PurchaseRequisitions_status',
      'enum_PurchaseOrders_status',
      'enum_RequestForQuotations_status',
      'enum_Contracts_status',
      'enum_Suppliers_status',
      'enum_ApprovalHistories_action',
      'enum_RfqSuppliers_status'
    ];

    console.log('🗑️ Dropping ENUM types...');
    for (const enumName of enumsToDelete) {
      try {
        await sequelize.query(`DROP TYPE IF EXISTS "${enumName}" CASCADE;`);
        console.log(`✅ Dropped ENUM: ${enumName}`);
      } catch (error) {
        console.log(`⚠️ Could not drop ENUM ${enumName}: ${error.message}`);
      }
    }

    console.log('✅ All procurement tables and ENUMs dropped successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔒 Database connection closed.');
  }
}

dropAllProcurementTables();
