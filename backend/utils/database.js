const { sequelize, User } = require('../models/sequelize');
const bcrypt = require('bcrypt');

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    // Check if admin user exists
    const adminExists = await User.findOne({ where: { email: 'admin@erp.com' } });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      // Create admin user
      await User.create({
        username: 'admin',
        email: 'admin@erp.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true
      });
      console.log('✅ Default admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
    console.error(error.stack);
  }
};

// Test database connection
const testDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    console.log('🔄 Syncing database models...');
    // Force sync all models (CAUTION: This drops all tables!)
    await sequelize.sync({ force: true });
    console.log('✅ Database models created');
    
    console.log('🔄 Creating admin user...');
    await createDefaultAdmin();
    
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    console.error(error.stack);
    return false;
  }
};

module.exports = {
  testDatabaseConnection
};
