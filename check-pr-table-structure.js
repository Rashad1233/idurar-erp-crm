const { Client } = require('pg');

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'erpdb',
  user: 'postgres',
  password: 'UHm8g167'
};

async function checkPRTableStructure() {
  const client = new Client(dbConfig);
  
  try {
    console.log('🔌 Connecting to PostgreSQL database...');
    await client.connect();
    console.log('✅ Connected to database:', dbConfig.database);
    
    // Get all columns in PurchaseRequisitions table
    console.log('\n📋 Checking PurchaseRequisitions table structure...');
    const columnsResult = await client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'PurchaseRequisitions'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nColumns in PurchaseRequisitions table:');
    console.log('=====================================');
    columnsResult.rows.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Get sample data
    console.log('\n📊 Sample Purchase Requisitions:');
    const sampleResult = await client.query(`
      SELECT * FROM "PurchaseRequisitions"
      LIMIT 5;
    `);
    
    if (sampleResult.rows.length === 0) {
      console.log('No Purchase Requisitions found in the database.');
    } else {
      console.log(`Found ${sampleResult.rows.length} records:`);
      sampleResult.rows.forEach((pr, index) => {
        console.log(`\n--- Record ${index + 1} ---`);
        Object.entries(pr).forEach(([key, value]) => {
          console.log(`${key}: ${value}`);
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('\n👋 Disconnected from database');
  }
}

// Run the check
console.log('🚀 Checking Purchase Requisitions Table Structure');
console.log('================================================\n');
checkPRTableStructure();
