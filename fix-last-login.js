const { Sequelize } = require('sequelize');

async function fixLastLoginColumn() {
  try {
    // Create a direct Sequelize connection
    const sequelize = new Sequelize('erpdb', 'postgres', 'UHm8g167', {
      host: 'localhost',
      dialect: 'postgres',
      port: 5432,
      logging: console.log
    });
    
    // Test connection
    await sequelize.authenticate();
    console.log('Connection established successfully.');
    
    // Get all columns from Users table
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Users'
      AND table_schema = 'public';
    `);
    
    const columnNames = columns.map(col => col.column_name);
    console.log('Current columns:', columnNames);
    
    // Check if last_login column exists
    if (!columnNames.includes('last_login')) {
      console.log('Adding last_login column...');
      await sequelize.query(`
        ALTER TABLE "Users" 
        ADD COLUMN last_login TIMESTAMP;
      `);
      
      // Set last_login to current time for existing users
      console.log('Setting initial last_login values...');
      await sequelize.query(`
        UPDATE "Users"
        SET last_login = NOW();
      `);
    }
    
    // Update the lastLogin column to make it snake_case too
    if (columnNames.includes('lastLogin') && !columnNames.includes('last_login')) {
      console.log('Renaming lastLogin to last_login...');
      await sequelize.query(`
        ALTER TABLE "Users" 
        RENAME COLUMN "lastLogin" TO last_login;
      `);
    }
    
    // Check if lastLogin column exists but last_login doesn't (another possible scenario)
    if (columnNames.includes('lastLogin') && columnNames.includes('last_login')) {
      console.log('Copying data from lastLogin to last_login...');
      await sequelize.query(`
        UPDATE "Users"
        SET last_login = "lastLogin"
        WHERE last_login IS NULL AND "lastLogin" IS NOT NULL;
      `);
    }
    
    console.log('Fixing complete! Checking admin user...');
    
    // Check admin user to make sure it looks correct
    const [adminUser] = await sequelize.query(`
      SELECT id, email, username, first_name, last_name, is_active, last_login 
      FROM "Users" 
      WHERE email = 'admin@erp.com';
    `);
    
    if (adminUser.length > 0) {
      console.log('Admin user details:', adminUser[0]);
    } else {
      console.log('Admin user not found!');
    }
    
    // Also update the auth controller to handle both variations
    console.log('All database fixes completed successfully!');
    
  } catch (error) {
    console.error('Error fixing last_login column:', error);
  }
}

fixLastLoginColumn();
