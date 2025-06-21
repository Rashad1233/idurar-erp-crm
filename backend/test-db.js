const { Sequelize } = require('sequelize');

// Try to connect directly to PostgreSQL
async function testConnection() {
  try {
    const sequelize = new Sequelize('erpdb', 'postgres', 'UHm8g167', {
      host: 'localhost',
      port: 5432,
      dialect: 'postgres'
    });

    await sequelize.authenticate();
    console.log('✅ Connection successful!');
    
    // Create the User model
    const User = sequelize.define('User', {
      username: Sequelize.STRING,
      email: Sequelize.STRING,
      password: Sequelize.STRING,
      firstName: Sequelize.STRING,
      lastName: Sequelize.STRING,
      role: Sequelize.STRING,
      isActive: Sequelize.BOOLEAN
    });
    
    // Force create the table
    await User.sync({ force: true });
    console.log('✅ User table created successfully!');
    
    // Create admin user
    await User.create({
      username: 'admin',
      email: 'admin@erp.com',
      password: 'admin123', // Will be hashed in the frontend
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true
    });
    console.log('✅ Admin user created successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
}

testConnection();
