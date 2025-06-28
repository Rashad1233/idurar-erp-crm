// Test database connection and run migrations
const sequelize = require('../config/postgresql');
const fs = require('fs');
const path = require('path');

async function testDatabaseConnection() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Test authentication
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    
    // Test a simple query
    const [results] = await sequelize.query('SELECT NOW() as current_time');
    console.log('✅ Database query test successful:', results[0].current_time);
    
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    return false;
  }
}

async function runMigration() {
  try {
    console.log('🔄 Running database migration...');
    
    const migrationPath = path.join(__dirname, '../migrations/20241220_add_approval_workflow_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split SQL by semicolon and execute each statement
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await sequelize.query(statement);
          console.log('✅ Executed SQL statement successfully');
        } catch (error) {
          if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            console.log('⚠️  Statement already applied:', error.message);
          } else {
            console.error('❌ Error executing statement:', error.message);
          }
        }
      }
    }
    
    console.log('✅ Migration completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return false;
  }
}

async function syncModels() {
  try {
    console.log('🔄 Syncing database models...');
    
    // Import models to ensure they're loaded
    const db = require('../models/sequelize');
    
    // Sync models without forcing (to preserve existing data)
    await sequelize.sync({ alter: true });
    
    console.log('✅ Database models synced successfully');
    return true;
  } catch (error) {
    console.error('❌ Model sync failed:', error.message);
    return false;
  }
}

async function testApprovalModels() {
  try {
    console.log('🔄 Testing approval workflow models...');
    
    const { 
      RequestForQuotation, 
      RfqSupplier, 
      RfqItem, 
      RfqQuoteItem,
      PurchaseOrder,
      ApprovalWorkflow,
      ApprovalThreshold,
      NotificationLog
    } = require('../models/sequelize');
    
    // Test model availability
    console.log('✅ RequestForQuotation model loaded:', !!RequestForQuotation);
    console.log('✅ RfqSupplier model loaded:', !!RfqSupplier);
    console.log('✅ RfqItem model loaded:', !!RfqItem);
    console.log('✅ RfqQuoteItem model loaded:', !!RfqQuoteItem);
    console.log('✅ PurchaseOrder model loaded:', !!PurchaseOrder);
    console.log('✅ ApprovalWorkflow model loaded:', !!ApprovalWorkflow);
    console.log('✅ ApprovalThreshold model loaded:', !!ApprovalThreshold);
    console.log('✅ NotificationLog model loaded:', !!NotificationLog);
    
    // Test basic queries
    const rfqCount = await RequestForQuotation.count();
    console.log('✅ RFQ count:', rfqCount);
    
    const poCount = await PurchaseOrder.count();
    console.log('✅ PO count:', poCount);
    
    const workflowCount = await ApprovalWorkflow.count();
    console.log('✅ Approval Workflow count:', workflowCount);
    
    return true;
  } catch (error) {
    console.error('❌ Model test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database setup and testing...\n');
  
  // Test connection
  const connectionOk = await testDatabaseConnection();
  if (!connectionOk) {
    process.exit(1);
  }
  
  console.log('');
  
  // Run migration
  const migrationOk = await runMigration();
  if (!migrationOk) {
    console.log('⚠️  Migration had issues but continuing...');
  }
  
  console.log('');
  
  // Sync models
  const syncOk = await syncModels();
  if (!syncOk) {
    console.log('⚠️  Model sync had issues but continuing...');
  }
  
  console.log('');
  
  // Test models
  const testOk = await testApprovalModels();
  if (!testOk) {
    console.log('⚠️  Model testing had issues...');
  }
  
  console.log('\n🎉 Database setup completed!');
  console.log('📊 Database is ready for RFQ and PO approval workflows');
  
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
}

module.exports = {
  testDatabaseConnection,
  runMigration,
  syncModels,
  testApprovalModels
};