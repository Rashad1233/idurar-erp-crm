const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');

async function fixUserTable() {
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
    console.log('Connection established successfully.');
    
    // Check columns and add missing ones
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Users'
      AND table_schema = 'public';
    `);
    
    const columnNames = columns.map(col => col.column_name);
    console.log('Current columns:', columnNames);
    
    // Add columns if they don't exist
    const requiredColumns = [
      { name: 'username', type: 'VARCHAR(255) UNIQUE' },
      { name: 'firstName', type: 'VARCHAR(255)' },
      { name: 'lastName', type: 'VARCHAR(255)' }
    ];
    
    for (const col of requiredColumns) {
      if (!columnNames.includes(col.name)) {
        console.log(`Adding ${col.name} column...`);
        try {
          await sequelize.query(`
            ALTER TABLE "Users" 
            ADD COLUMN "${col.name}" ${col.type};
          `);
          console.log(`Added ${col.name} column successfully.`);
        } catch (err) {
          console.error(`Error adding ${col.name} column:`, err.message);
        }
      } else {
        console.log(`Column ${col.name} already exists.`);
      }
    }
    
    // Set username from email if it's NULL
    console.log('Updating NULL usernames from email addresses...');
    await sequelize.query(`
      UPDATE "Users"
      SET username = SPLIT_PART(email, '@', 1)
      WHERE username IS NULL;
    `);
    
    // Set firstName and lastName from name if they're NULL
    console.log('Updating NULL firstName/lastName from name...');
    try {
      await sequelize.query(`
        UPDATE "Users"
        SET "firstName" = SPLIT_PART(name, ' ', 1),
            "lastName" = COALESCE(NULLIF(SUBSTRING(name FROM POSITION(' ' IN name)), ''), name)
        WHERE "firstName" IS NULL OR "lastName" IS NULL;
      `);
    } catch (err) {
      console.error('Error updating firstName/lastName:', err.message);
    }
    
    // Create admin user if not exists
    const [adminUser] = await sequelize.query(`
      SELECT * FROM "Users" WHERE username = 'admin' OR email = 'admin@erp.com';
    `);
    
    if (adminUser.length === 0) {
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await sequelize.query(`
        INSERT INTO "Users" 
        (username, email, password, name, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
        VALUES
        ('admin', 'admin@erp.com', '${hashedPassword}', 'Admin User', 'Admin', 'User', 'admin', true, NOW(), NOW());
      `);
      console.log('Admin user created successfully.');
    } else {
      console.log('Admin user already exists.');
    }
    
    console.log('User table fix complete!');
  } catch (error) {
    console.error('Error fixing user table:', error);
  }
}

fixUserTable();
