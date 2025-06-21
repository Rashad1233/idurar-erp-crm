const { Sequelize } = require('sequelize');

// Configure Sequelize
const sequelize = new Sequelize({
  host: 'localhost',
  database: 'erpdb',
  username: 'postgres',
  password: 'UHm8g167',
  dialect: 'postgres',
  logging: false
});

async function checkSupplierTable() {
  try {
    console.log('🔍 Checking supplier table and User associations...');
    
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Connection to database has been established successfully.');
    
    // Try to query the database directly to see the supplier table structure
    try {
      const [supplierColumns] = await sequelize.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'Suppliers'
        ORDER BY ordinal_position
      `);
      
      console.log('📊 Supplier table columns:');
      supplierColumns.forEach(column => {
        console.log(`  - ${column.column_name} (${column.data_type})`);
      });
    } catch (error) {
      console.error('❌ Error querying Suppliers table:', error.message);
    }
    
    // Check User table structure for associations
    try {
      const [userColumns] = await sequelize.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'Users'
        ORDER BY ordinal_position
      `);
      
      console.log('\n📊 User table columns:');
      userColumns.forEach(column => {
        console.log(`  - ${column.column_name} (${column.data_type})`);
      });
    } catch (error) {
      console.error('❌ Error querying Users table:', error.message);
    }
    
    // Check foreign key relationships
    try {
      const [foreignKeys] = await sequelize.query(`
        SELECT
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND (tc.table_name = 'Suppliers' OR ccu.table_name = 'Suppliers')
      `);
      
      console.log('\n🔗 Foreign key relationships involving Suppliers:');
      foreignKeys.forEach(fk => {
        console.log(`  - ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    } catch (error) {
      console.error('❌ Error querying foreign keys:', error.message);
    }
    
    // Test a simple query to fetch suppliers
    try {
      const [suppliers] = await sequelize.query(`
        SELECT id, "supplierNumber", "legalName", "tradeName", "createdById", "updatedById" 
        FROM "Suppliers" 
        LIMIT 5
      `);
      
      console.log('\n📋 Sample suppliers data:');
      suppliers.forEach(supplier => {
        console.log(`  - ${supplier.id}: ${supplier.supplierNumber} - ${supplier.legalName}`);
        console.log(`    Created by: ${supplier.createdById}, Updated by: ${supplier.updatedById}`);
      });
    } catch (error) {
      console.error('❌ Error fetching sample suppliers:', error.message);
    }
    
    // Check if createdBy and updatedBy columns exist and have valid references
    try {
      const [creatorInfo] = await sequelize.query(`
        SELECT s.id AS supplier_id, s."supplierNumber", u.id AS user_id, u.name, u.email
        FROM "Suppliers" s
        LEFT JOIN "Users" u ON s."createdById" = u.id
        LIMIT 5
      `);
      
      console.log('\n👤 Supplier-Creator relationships:');
      if (creatorInfo.length > 0) {
        creatorInfo.forEach(info => {
          console.log(`  - Supplier ${info.supplierNumber} created by ${info.name || 'Unknown'} (${info.email || 'No Email'})`);
        });
      } else {
        console.log('  No supplier-creator relationships found');
      }
    } catch (error) {
      console.error('❌ Error checking supplier-creator relationships:', error.message);
    }
    
    // Close the connection
    await sequelize.close();
    
  } catch (error) {
    console.error('❌ Error checking supplier table:', error);
    
    // Try to close the connection even if there was an error
    try {
      await sequelize.close();
    } catch (err) {
      // Ignore error on close
    }
  }
}

// Run the function
checkSupplierTable();
