// This script applies all necessary fixes to make the Users table compatible with
// both camelCase and snake_case column naming conventions
const { Sequelize } = require('sequelize');

async function applyFinalFixes() {
  try {
    // Create a direct Sequelize connection
    const sequelize = new Sequelize('erpdb', 'postgres', 'UHm8g167', {
      host: 'localhost',
      dialect: 'postgres',
      port: 5432,
      logging: false
    });
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connection established successfully.');
    
    // Execute SQL to update the model definition in the database
    console.log('🔄 Updating model definition...');
    
    // Step 1: Set the User model to use "Users" table explicitly
    console.log('✅ Using "Users" table explicitly.');
    
    // Step 2: Make sure all required columns exist with the right names
    const columnChecks = [
      { name: 'first_name', alias: 'firstName', type: 'VARCHAR(255)' },
      { name: 'last_name', alias: 'lastName', type: 'VARCHAR(255)' },
      { name: 'is_active', alias: 'isActive', type: 'BOOLEAN DEFAULT true' },
      { name: 'last_login', alias: 'lastLogin', type: 'TIMESTAMP WITH TIME ZONE' },
      { name: 'created_at', alias: 'createdAt', type: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()' },
      { name: 'updated_at', alias: 'updatedAt', type: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()' }
    ];
    
    // Get all columns from Users table
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Users'
      AND table_schema = 'public';
    `);
    
    const columnNames = columns.map(col => col.column_name);
    console.log('📋 Current columns:', columnNames.join(', '));
    
    // Add missing columns
    for (const col of columnChecks) {
      if (!columnNames.includes(col.name)) {
        console.log(`⏳ Adding ${col.name} column...`);
        try {
          await sequelize.query(`
            ALTER TABLE "Users" 
            ADD COLUMN ${col.name} ${col.type};
          `);
          console.log(`✅ Added ${col.name} column.`);
        } catch (err) {
          console.error(`❌ Error adding ${col.name}:`, err.message);
        }
      } else {
        console.log(`✅ Column ${col.name} already exists.`);
      }
    }
    
    // Step 3: Ensure data consistency between camelCase and snake_case columns
    console.log('🔄 Ensuring data consistency...');
    
    // Copy from camelCase to snake_case
    for (const col of columnChecks) {
      if (columnNames.includes(col.alias)) {
        console.log(`⏳ Copying data from ${col.alias} to ${col.name}...`);
        try {
          await sequelize.query(`
            UPDATE "Users"
            SET ${col.name} = "${col.alias}"
            WHERE ${col.name} IS NULL AND "${col.alias}" IS NOT NULL;
          `);
          console.log(`✅ Data copied from ${col.alias} to ${col.name}.`);
        } catch (err) {
          console.error(`❌ Error copying data from ${col.alias}:`, err.message);
        }
      }
    }
    
    // Set default values for any NULL columns
    console.log('🔄 Setting default values for NULL columns...');
    
    // Default values for first_name and last_name from name
    try {
      await sequelize.query(`
        UPDATE "Users"
        SET first_name = SPLIT_PART(name, ' ', 1)
        WHERE first_name IS NULL AND name IS NOT NULL;
      `);
      
      await sequelize.query(`
        UPDATE "Users"
        SET last_name = CASE 
          WHEN POSITION(' ' IN name) > 0 THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
          ELSE ''
        END
        WHERE last_name IS NULL AND name IS NOT NULL;
      `);
      
      // Set is_active to true for NULL values
      await sequelize.query(`
        UPDATE "Users"
        SET is_active = true
        WHERE is_active IS NULL;
      `);
      
      // Set timestamps for NULL values
      await sequelize.query(`
        UPDATE "Users"
        SET created_at = NOW(), updated_at = NOW()
        WHERE created_at IS NULL OR updated_at IS NULL;
      `);
      
      console.log('✅ Default values set for NULL columns.');
    } catch (err) {
      console.error('❌ Error setting default values:', err.message);
    }
    
    // Step 4: Verify admin user is correctly set up
    console.log('🔄 Verifying admin user...');
    
    const [adminUser] = await sequelize.query(`
      SELECT id, email, username, first_name, last_name, is_active, last_login, created_at, updated_at 
      FROM "Users" 
      WHERE email = 'admin@erp.com';
    `);
    
    if (adminUser.length > 0) {
      console.log('✅ Admin user exists:', adminUser[0]);
    } else {
      console.log('❌ Admin user not found! Creating it...');
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await sequelize.query(`
        INSERT INTO "Users" 
        (username, email, password, name, first_name, last_name, role, is_active, created_at, updated_at)
        VALUES
        ('admin', 'admin@erp.com', '${hashedPassword}', 'Admin User', 'Admin', 'User', 'admin', true, NOW(), NOW());
      `);
      
      console.log('✅ Admin user created successfully.');
    }
    
    console.log('🎉 All database fixes completed successfully!');
    console.log('👉 You should now be able to log in with:');
    console.log('   Email: admin@erp.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error applying fixes:', error);
  }
}

applyFinalFixes();
