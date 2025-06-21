const { Sequelize } = require('sequelize');

async function fixColumnNames() {
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
    
    // Check for snake_case vs camelCase issues
    
    // Check if we need to rename firstName to first_name
    if (columnNames.includes('firstName') && !columnNames.includes('first_name')) {
      console.log('Renaming firstName to first_name...');
      await sequelize.query(`
        ALTER TABLE "Users" 
        RENAME COLUMN "firstName" TO first_name;
      `);
    }
    
    // Check if we need to rename lastName to last_name
    if (columnNames.includes('lastName') && !columnNames.includes('last_name')) {
      console.log('Renaming lastName to last_name...');
      await sequelize.query(`
        ALTER TABLE "Users" 
        RENAME COLUMN "lastName" TO last_name;
      `);
    }
    
    // Check if we need to rename isActive to is_active
    if (columnNames.includes('isActive') && !columnNames.includes('is_active')) {
      console.log('Renaming isActive to is_active...');
      await sequelize.query(`
        ALTER TABLE "Users" 
        RENAME COLUMN "isActive" TO is_active;
      `);
    }
    
    // Check if we need to add any missing columns
    const requiredColumns = [
      { name: 'first_name', type: 'VARCHAR(255)' },
      { name: 'last_name', type: 'VARCHAR(255)' },
      { name: 'is_active', type: 'BOOLEAN DEFAULT true' }
    ];
    
    // Get updated column list
    const [updatedColumns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Users'
      AND table_schema = 'public';
    `);
    
    const updatedColumnNames = updatedColumns.map(col => col.column_name);
    console.log('Updated columns after renaming:', updatedColumnNames);
    
    // Add any missing columns
    for (const col of requiredColumns) {
      if (!updatedColumnNames.includes(col.name)) {
        console.log(`Adding missing column ${col.name}...`);
        await sequelize.query(`
          ALTER TABLE "Users" 
          ADD COLUMN ${col.name} ${col.type};
        `);
      }
    }
    
    // Copy data from camelCase to snake_case if needed
    if (columnNames.includes('firstName') && updatedColumnNames.includes('first_name')) {
      console.log('Copying data from firstName to first_name...');
      await sequelize.query(`
        UPDATE "Users"
        SET first_name = "firstName"
        WHERE first_name IS NULL AND "firstName" IS NOT NULL;
      `);
    }
    
    if (columnNames.includes('lastName') && updatedColumnNames.includes('last_name')) {
      console.log('Copying data from lastName to last_name...');
      await sequelize.query(`
        UPDATE "Users"
        SET last_name = "lastName"
        WHERE last_name IS NULL AND "lastName" IS NOT NULL;
      `);
    }
    
    if (columnNames.includes('isActive') && updatedColumnNames.includes('is_active')) {
      console.log('Copying data from isActive to is_active...');
      await sequelize.query(`
        UPDATE "Users"
        SET is_active = "isActive"
        WHERE is_active IS NULL AND "isActive" IS NOT NULL;
      `);
    }
    
    // Set default values where needed
    console.log('Setting default values for NULL columns...');
    await sequelize.query(`
      UPDATE "Users"
      SET first_name = SPLIT_PART(name, ' ', 1)
      WHERE first_name IS NULL;
    `);
    
    await sequelize.query(`
      UPDATE "Users"
      SET last_name = SUBSTRING(name FROM POSITION(' ' IN name))
      WHERE last_name IS NULL AND POSITION(' ' IN name) > 0;
    `);
    
    await sequelize.query(`
      UPDATE "Users"
      SET last_name = name
      WHERE last_name IS NULL;
    `);
    
    await sequelize.query(`
      UPDATE "Users"
      SET is_active = true
      WHERE is_active IS NULL;
    `);
    
    console.log('Column names fixed successfully!');
    
    // Check if user can login now
    const [adminUser] = await sequelize.query(`
      SELECT id, email, username, first_name, last_name, is_active FROM "Users" 
      WHERE email = 'admin@erp.com';
    `);
    
    console.log('Admin user details:', adminUser[0]);
    
  } catch (error) {
    console.error('Error fixing column names:', error);
  }
}

fixColumnNames();
