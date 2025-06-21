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

async function checkSupplierTable() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Connection to database has been established successfully.');

    // Get the enum values for supplierType
    const [result] = await sequelize.query(`
      SELECT
        pg_type.typname,
        pg_enum.enumlabel
      FROM
        pg_type
        JOIN pg_enum ON pg_enum.enumtypid = pg_type.oid
      WHERE
        pg_type.typname = 'enum_suppliers_suppliertype'
      ORDER BY
        pg_enum.enumsortorder;
    `);

    console.log('Available supplier types:', result.map(r => r.enumlabel));

    // Check the Suppliers table structure
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, udt_name, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Suppliers'
      ORDER BY ordinal_position;
    `);

    console.log('Suppliers table columns:');
    columns.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}${col.udt_name === 'enum_suppliers_suppliertype' ? ' (enum)' : ''}`);
    });

  } catch (error) {
    console.error('❌ Error checking supplier table:', error);
  } finally {
    // Close the connection
    await sequelize.close();
    console.log('✅ Database connection closed.');
  }
}

// Run the function
checkSupplierTable();
