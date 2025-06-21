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

async function checkTables() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Connection to database has been established successfully.');

    // Get all tables in the database
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log(`\n📋 Found ${tables.length} tables in database:`);
    
    const tableNames = tables.map(t => t.table_name).sort();
    tableNames.forEach(table => console.log(`- ${table}`));
    
    // Check specific tables related to failing endpoints
    const criticalTables = [
      'purchase_requisitions', 
      'purchase_requisition_items', 
      'suppliers', 
      'inventory',
      'users'
    ];
    
    console.log('\n🔍 Checking critical tables:');
    
    for (const tableName of criticalTables) {
      const exists = tableNames.includes(tableName);
      
      if (exists) {
        // Get all columns in the table
        const [columns] = await sequelize.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = '${tableName}'
          ORDER BY ordinal_position
        `);
        
        console.log(`✅ Table '${tableName}' exists with ${columns.length} columns:`);
        columns.forEach(col => {
          console.log(`  - ${col.column_name} (${col.data_type})`);
        });
      } else {
        console.log(`❌ Table '${tableName}' does not exist!`);
      }
    }
    
    // Close the connection
    await sequelize.close();
    
  } catch (error) {
    console.error('❌ Error checking tables:', error);
    
    // Try to close connection even if there was an error
    try {
      await sequelize.close();
    } catch (err) {
      // Ignore error on close
    }
  }
}

// Run the function
checkTables();
