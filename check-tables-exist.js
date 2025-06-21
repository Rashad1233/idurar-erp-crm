const { Sequelize } = require('sequelize');

async function checkTablesExist() {
  const sequelize = new Sequelize(
    'erpdb',
    'postgres',
    'UHm8g167',  // Use the actual password
    {
      host: 'localhost',
      port: 5432,
      dialect: 'postgres',
      logging: false
    }
  );

  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Check if tables exist
    try {
      const [results] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      
      console.log('Tables in the database:');
      results.forEach(result => {
        console.log(`- ${result.table_name}`);
      });
      
      // Check specifically for users table
      const [usersCheck] = await sequelize.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'Users'
        );
      `);
      
      console.log('Users table exists:', usersCheck[0].exists);
      
      // Check specifically for lower case users table
      const [usersLowerCheck] = await sequelize.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `);
      
      console.log('users (lowercase) table exists:', usersLowerCheck[0].exists);
      
    } catch (error) {
      console.error('Error checking tables:', error);
    }

    await sequelize.close();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

checkTablesExist();
