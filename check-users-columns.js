const { Sequelize } = require('sequelize');

async function checkUsersTable() {
  try {
    // Create a connection to the database
    const sequelize = new Sequelize(
      'erpdb',
      'postgres',
      'UHm8g167',
      {
        host: 'localhost',
        port: 5432,
        dialect: 'postgres',
        logging: false
      }
    );

    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Get detailed column information
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Users'
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);

    console.log('Users table columns:');
    columns.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
    });

    // Check if we need to add or rename columns
    const hasFirstNameCamelCase = columns.some(col => col.column_name === 'firstName');
    const hasFirstNameSnakeCase = columns.some(col => col.column_name === 'first_name');
    const hasLastNameCamelCase = columns.some(col => col.column_name === 'lastName');
    const hasLastNameSnakeCase = columns.some(col => col.column_name === 'last_name');

    console.log('\nColumn presence check:');
    console.log(`- firstName (camelCase): ${hasFirstNameCamelCase}`);
    console.log(`- first_name (snake_case): ${hasFirstNameSnakeCase}`);
    console.log(`- lastName (camelCase): ${hasLastNameCamelCase}`);
    console.log(`- last_name (snake_case): ${hasLastNameSnakeCase}`);

  } catch (error) {
    console.error('Error checking Users table:', error);
  }
}

checkUsersTable();
