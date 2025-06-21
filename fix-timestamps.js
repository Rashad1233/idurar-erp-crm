const { Sequelize } = require('sequelize');

async function fixTimestampColumns() {
  try {
    // Create a direct Sequelize connection
    const sequelize = new Sequelize('erpdb', 'postgres', 'UHm8g167', {
      host: 'localhost',
      dialect: 'postgres',
      port: 5432,
      logging: true
    });
    
    // Test connection
    await sequelize.authenticate();
    console.log('Connection established successfully.');

    // We'll just add the timestamp columns with default values
    console.log('Adding created_at and updated_at columns with default values...');
    
    try {
      await sequelize.query(`
        ALTER TABLE "Users" 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      `);
      console.log('Added created_at column');
    } catch (err) {
      console.error('Error adding created_at:', err.message);
    }
    
    try {
      await sequelize.query(`
        ALTER TABLE "Users" 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      `);
      console.log('Added updated_at column');
    } catch (err) {
      console.error('Error adding updated_at:', err.message);
    }
    
    // Now make sure both are populated
    console.log('Setting values for created_at and updated_at if null...');
    await sequelize.query(`
      UPDATE "Users"
      SET created_at = "createdAt"
      WHERE created_at IS NULL AND "createdAt" IS NOT NULL;
    `);
    
    await sequelize.query(`
      UPDATE "Users"
      SET updated_at = "updatedAt"
      WHERE updated_at IS NULL AND "updatedAt" IS NOT NULL;
    `);
    
    // Check if we still have nulls, and set them to now
    await sequelize.query(`
      UPDATE "Users"
      SET created_at = NOW(), updated_at = NOW()
      WHERE created_at IS NULL OR updated_at IS NULL;
    `);
    
    console.log('Timestamp columns fixed successfully!');
    
    // Check admin user to make sure it looks correct
    const [adminUser] = await sequelize.query(`
      SELECT id, email, username, first_name, last_name, is_active, last_login, created_at, updated_at 
      FROM "Users" 
      WHERE email = 'admin@erp.com';
    `);
    
    if (adminUser.length > 0) {
      console.log('Admin user details:', adminUser[0]);
    } else {
      console.log('Admin user not found!');
    }
    
  } catch (error) {
    console.error('Error fixing timestamp columns:', error);
  }
}

fixTimestampColumns();
