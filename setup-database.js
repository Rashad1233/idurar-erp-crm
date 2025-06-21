const { Sequelize } = require('sequelize');
const { exec } = require('child_process');
const path = require('path');
const bcrypt = require('bcrypt');

// Create a connection to the database
const sequelize = new Sequelize(
  'erpdb',
  'postgres',
  'UHm8g167',  // Use the actual password
  {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: console.log
  }
);

async function setupDatabase() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Check if Users table exists
    try {
      const [userTableCheck] = await sequelize.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'Users'
        );
      `);
      
      const usersTableExists = userTableCheck[0].exists;
      
      if (usersTableExists) {
        console.log('Users table already exists. Checking columns...');
        
        // Check if username column exists
        const [columnCheck] = await sequelize.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'Users'
          AND table_schema = 'public';
        `);
        
        const columns = columnCheck.map(col => col.column_name);
        console.log('Available columns:', columns);
        
        if (!columns.includes('username')) {
          console.log('Adding username column to Users table...');
          await sequelize.query(`
            ALTER TABLE "Users" 
            ADD COLUMN username VARCHAR(255) UNIQUE;
          `);
          console.log('Username column added successfully.');
        }
      } else {
        console.log('Users table does not exist. Creating it...');
        
        // Create Users table
        await sequelize.query(`
          CREATE TABLE "Users" (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            "firstName" VARCHAR(255) NOT NULL,
            "lastName" VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'user',
            "isActive" BOOLEAN DEFAULT true,
            "lastLogin" TIMESTAMP,
            "createdAt" TIMESTAMP NOT NULL,
            "updatedAt" TIMESTAMP NOT NULL
          );
        `);
        console.log('Users table created successfully.');
      }
      
      // Check if we need to create admin user
      const [adminUserCheck] = await sequelize.query(`
        SELECT * FROM "Users" WHERE username = 'admin' OR email = 'admin@erp.com';
      `);
      
      if (adminUserCheck.length === 0) {
        console.log('Admin user does not exist. Creating admin user...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await sequelize.query(`
          INSERT INTO "Users" 
          (username, email, password, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
          VALUES
          ('admin', 'admin@erp.com', '${hashedPassword}', 'Admin', 'User', 'admin', true, NOW(), NOW());
        `);
        console.log('Admin user created successfully.');
      } else {
        console.log('Admin user already exists.');
      }
      
      console.log('Database setup complete! You can now start the application.');
    } catch (error) {
      console.error('Error setting up database:', error);
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

setupDatabase();

setupDatabase();
