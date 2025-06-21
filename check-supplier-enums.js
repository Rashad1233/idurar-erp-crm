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

async function checkEnumValues() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('✅ Connected to database successfully.');

    // Check enum values for supplierType
    const [enumResults] = await sequelize.query(`
      SELECT pg_type.typname, pg_enum.enumlabel 
      FROM pg_type 
      JOIN pg_enum ON pg_enum.enumtypid = pg_type.oid 
      WHERE typname LIKE '%supplier%' OR typname LIKE '%Supplier%'
    `);
    
    console.log('Found enum types related to suppliers:', enumResults);
    
    // Check the Suppliers table structure
    const [tableInfo] = await sequelize.query(`
      SELECT 
        column_name, 
        data_type, 
        udt_name
      FROM 
        information_schema.columns 
      WHERE 
        table_name = 'Suppliers' 
      ORDER BY 
        ordinal_position;
    `);
    
    console.log('\nSuppliers table columns:');
    tableInfo.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}${col.udt_name !== col.data_type ? ' (' + col.udt_name + ')' : ''}`);
    });

    // Create a simple supplier to see if we can determine valid values
    try {
      // Try with different values for supplierType
      for (const type of ['transactional', 'strategic', 'service', 'product']) {
        try {
          const [result] = await sequelize.query(`
            INSERT INTO "Suppliers" (
              "id", "supplierNumber", "legalName", "supplierType", "status", "createdAt", "updatedAt"
            ) VALUES (
              '${require('uuid').v4()}', 'TEST-${Date.now()}', 'Test Supplier', '${type}', 'active', NOW(), NOW()
            ) RETURNING "id", "supplierType"
          `);
          console.log(`✅ Successfully added supplier with type: ${type}`);
          // Delete the test record
          await sequelize.query(`DELETE FROM "Suppliers" WHERE "id" = '${result[0].id}'`);
        } catch (err) {
          console.log(`❌ Failed to add supplier with type: ${type}. Error: ${err.message}`);
        }
      }
    } catch (error) {
      console.error('Error testing supplier types:', error);
    }
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    // Close the connection
    await sequelize.close();
  }
}

checkEnumValues();
