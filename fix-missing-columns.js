const { Sequelize } = require('sequelize');

async function fixMissingColumns() {
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
    
    // Check if columns exist and add them if they don't
    if (!columnNames.includes('first_name')) {
      console.log('Adding first_name column...');
      await sequelize.query(`
        ALTER TABLE "Users" 
        ADD COLUMN first_name VARCHAR(255);
      `);
      
      // Set first_name from name if available
      console.log('Setting first_name from name...');
      await sequelize.query(`
        UPDATE "Users"
        SET first_name = SPLIT_PART(name, ' ', 1)
        WHERE name IS NOT NULL;
      `);
    }
    
    if (!columnNames.includes('last_name')) {
      console.log('Adding last_name column...');
      await sequelize.query(`
        ALTER TABLE "Users" 
        ADD COLUMN last_name VARCHAR(255);
      `);
      
      // Set last_name from name if available
      console.log('Setting last_name from name...');
      await sequelize.query(`
        UPDATE "Users"
        SET last_name = CASE 
          WHEN POSITION(' ' IN name) > 0 THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
          ELSE ''
        END
        WHERE name IS NOT NULL;
      `);
    }
    
    if (!columnNames.includes('is_active')) {
      console.log('Adding is_active column...');
      await sequelize.query(`
        ALTER TABLE "Users" 
        ADD COLUMN is_active BOOLEAN DEFAULT true;
      `);
      
      // Set all existing users to active
      console.log('Setting all users to active...');
      await sequelize.query(`
        UPDATE "Users"
        SET is_active = true;
      `);
    }
    
    console.log('Fixing complete! Checking admin user...');
    
    // Check admin user to make sure it looks correct
    const [adminUser] = await sequelize.query(`
      SELECT id, email, username, first_name, last_name, is_active 
      FROM "Users" 
      WHERE email = 'admin@erp.com';
    `);
    
    if (adminUser.length > 0) {
      console.log('Admin user details:', adminUser[0]);
    } else {
      console.log('Admin user not found!');
    }
    
  } catch (error) {
    console.error('Error fixing missing columns:', error);
  }
}

fixMissingColumns();
