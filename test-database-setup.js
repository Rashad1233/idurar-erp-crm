const { Client } = require('pg');

// Database connection configuration
const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'erpdb',  // Changed from erp_test_db to erpdb
  password: 'postgres',  // You may need to update this
  port: 5432,
};

async function testDatabaseSetup() {
  const client = new Client(dbConfig);
  
  try {
    console.log('Connecting to PostgreSQL database...');
    await client.connect();
    console.log('Successfully connected to database:', dbConfig.database);
    
    // Test query to verify connection
    const result = await client.query('SELECT current_database(), current_user, version()');
    console.log('\nDatabase Information:');
    console.log('- Current Database:', result.rows[0].current_database);
    console.log('- Current User:', result.rows[0].current_user);
    console.log('- PostgreSQL Version:', result.rows[0].version);
    
    // Check for required tables
    console.log('\nChecking for existing tables...');
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    console.log('\nExisting tables in database:');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    // Check specific tables for ERP system
    const requiredTables = [
      'item_masters',
      'suppliers',
      'users',
      'warehouses',
      'inventory',
      'purchase_requisitions',
      'purchase_orders',
      'contracts',
      'unspsc_codes'
    ];
    
    console.log('\nChecking for required ERP tables:');
    for (const table of requiredTables) {
      const exists = tablesResult.rows.some(row => row.table_name === table);
      console.log(`- ${table}: ${exists ? '✓ EXISTS' : '✗ MISSING'}`);
    }
    
    // Check data in key tables
    console.log('\nChecking data in key tables:');
    
    // Check item_masters
    try {
      const itemMastersCount = await client.query('SELECT COUNT(*) FROM item_masters');
      console.log(`- item_masters: ${itemMastersCount.rows[0].count} records`);
      
      if (itemMastersCount.rows[0].count > 0) {
        const sampleItems = await client.query('SELECT id, item_number, short_description FROM item_masters LIMIT 5');
        console.log('  Sample items:');
        sampleItems.rows.forEach(item => {
          console.log(`    • ${item.item_number}: ${item.short_description}`);
        });
      }
    } catch (err) {
      console.log('- item_masters: Table not found or error accessing');
    }
    
    // Check suppliers
    try {
      const suppliersCount = await client.query('SELECT COUNT(*) FROM suppliers');
      console.log(`- suppliers: ${suppliersCount.rows[0].count} records`);
      
      if (suppliersCount.rows[0].count > 0) {
        const sampleSuppliers = await client.query('SELECT id, supplier_id, name FROM suppliers LIMIT 5');
        console.log('  Sample suppliers:');
        sampleSuppliers.rows.forEach(supplier => {
          console.log(`    • ${supplier.supplier_id}: ${supplier.name}`);
        });
      }
    } catch (err) {
      console.log('- suppliers: Table not found or error accessing');
    }
    
    // Check users
    try {
      const usersCount = await client.query('SELECT COUNT(*) FROM users');
      console.log(`- users: ${usersCount.rows[0].count} records`);
    } catch (err) {
      console.log('- users: Table not found or error accessing');
    }
    
    // Check warehouses
    try {
      const warehousesCount = await client.query('SELECT COUNT(*) FROM warehouses');
      console.log(`- warehouses: ${warehousesCount.rows[0].count} records`);
    } catch (err) {
      console.log('- warehouses: Table not found or error accessing');
    }
    
    // Check inventory
    try {
      const inventoryCount = await client.query('SELECT COUNT(*) FROM inventory');
      console.log(`- inventory: ${inventoryCount.rows[0].count} records`);
    } catch (err) {
      console.log('- inventory: Table not found or error accessing');
    }
    
    console.log('\nDatabase setup test completed successfully!');
    
  } catch (error) {
    console.error('Error during database setup test:', error);
    throw error;
  } finally {
    await client.end();
    console.log('Closed database connection');
  }
}

// Run the test
testDatabaseSetup().catch(err => {
  console.error(err);
  process.exit(1);
});
