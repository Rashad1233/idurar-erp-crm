const { Sequelize } = require('sequelize');

// Configure database connection
const sequelize = new Sequelize({
  host: 'localhost',
  database: 'erpdb',
  username: 'postgres',
  password: 'UHm8g167',
  dialect: 'postgres',
  logging: false
});

// Known tables with capitalized names
const CAPITALIZED_TABLES = [
  'PurchaseRequisitions',
  'PurchaseRequisitionItems',
  'PurchaseRequisitionApprovals',
  'Suppliers',
  'Inventories',
  'Users',
  'ItemMasters',
  'Warehouses',
  'StorageLocations',
  'BinLocations',
  'Transactions',
  'TransactionItems',
  'Contracts',
  'ContractItems',
  'ReorderRequests',
  'ReorderRequestItems',
  'RequestForQuotations',
  'RfqItems',
  'RfqSuppliers',
  'RfqQuoteItems',
  'UnspscCodes',
  'ApprovalHistories',
  'PurchaseOrders',
  'PurchaseOrderItems',
  'DelegationOfAuthorities'
];

// Function to check table columns
async function checkTableColumns(tableName) {
  try {
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = '${tableName}'
      ORDER BY ordinal_position
    `);
    
    console.log(`\n📋 Table: ${tableName}`);
    console.log(`Found ${columns.length} columns:`);
    
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}${col.is_nullable === 'YES' ? ', nullable' : ''})`);
    });
    
    return columns;
  } catch (error) {
    console.error(`❌ Error checking columns for ${tableName}:`, error.message);
    return [];
  }
}

// Function to check table relationships
async function checkTableRelationships(tableName) {
  try {
    const [foreignKeys] = await sequelize.query(`
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE
        tc.constraint_type = 'FOREIGN KEY' AND
        tc.table_name = '${tableName}'
    `);
    
    console.log(`\n🔗 Foreign keys for ${tableName}:`);
    
    if (foreignKeys.length === 0) {
      console.log('  No foreign keys found');
    } else {
      foreignKeys.forEach(fk => {
        console.log(`  - ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    }
    
    return foreignKeys;
  } catch (error) {
    console.error(`❌ Error checking relationships for ${tableName}:`, error.message);
    return [];
  }
}

// Function to check all tables
async function checkAllTables() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Connected to database successfully.');
    
    // Get all tables in the database
    const [tables] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`\n📊 Found ${tables.length} tables in the database:`);
    const tableNames = tables.map(t => t.table_name);
    console.log(tableNames.join(', '));
    
    // Check for the supplier table specifically
    if (tableNames.includes('Suppliers')) {
      console.log('\n🔍 Checking Suppliers table specifically:');
      
      // Check columns
      const supplierColumns = await checkTableColumns('Suppliers');
      
      // Check relationships
      const supplierRelationships = await checkTableRelationships('Suppliers');
      
      // Check if Users table exists
      if (tableNames.includes('Users')) {
        // Check user columns for reference
        console.log('\n🔍 Checking Users table for comparison:');
        await checkTableColumns('Users');
      }
      
      // Check data in the Suppliers table
      const [supplierCount] = await sequelize.query(`
        SELECT COUNT(*) FROM "Suppliers"
      `);
      
      console.log(`\n📊 Supplier count: ${supplierCount[0].count}`);
      
      if (parseInt(supplierCount[0].count) > 0) {
        const [sampleSupplier] = await sequelize.query(`
          SELECT * FROM "Suppliers" LIMIT 1
        `);
        
        console.log('\n📝 Sample supplier data:');
        console.log(JSON.stringify(sampleSupplier[0], null, 2));
      } else {
        console.log('\n⚠️ No suppliers found in the database');
      }
    } else {
      console.error('❌ Suppliers table not found in the database!');
    }
    
    // Check for any tables that might be related to suppliers
    const supplierRelatedTables = tableNames.filter(t => 
      t.toLowerCase().includes('supplier') || 
      t.toLowerCase().includes('vendor')
    );
    
    if (supplierRelatedTables.length > 0) {
      console.log('\n🔍 Found supplier-related tables:');
      console.log(supplierRelatedTables.join(', '));
    }
    
    await sequelize.close();
    console.log('\n✅ Database check complete.');
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
    
    try {
      await sequelize.close();
    } catch (err) {
      // Ignore error on close
    }
  }
}

// Run the check
checkAllTables();
