const { Client } = require('pg');

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'erpdb',
  user: 'postgres',
  password: 'UHm8g167'
};

async function checkPRTableColumns() {
  const client = new Client(dbConfig);
  
  try {
    console.log('🔌 Connecting to PostgreSQL database...');
    await client.connect();
    console.log('✅ Connected to database:', dbConfig.database);
    
    // Get all columns from PurchaseRequisitions table
    console.log('\n📋 Checking PurchaseRequisitions table columns...');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'PurchaseRequisitions'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nColumns in PurchaseRequisitions table:');
    columnsResult.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n👋 Disconnected from database');
  }
}

// Run the check
checkPRTableColumns();
