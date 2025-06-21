// Login test script
require('dotenv').config();
const { sequelize } = require('../config/db');
const User = require('../models/sequelize/User');
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Find admin user
    console.log('🔄 Looking for admin user...');
    const adminUser = await User.findOne({ 
      where: { 
        email: 'admin@erp.com' 
      } 
    });

    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('✅ Admin user found:', {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      passwordHash: adminUser.password.substring(0, 20) + '...'
    });

    // Test password comparison
    const testPassword = 'admin123';
    console.log(`🔄 Testing password: "${testPassword}"`);
    
    // Test using model's comparePassword method
    const modelMatch = await adminUser.comparePassword(testPassword);
    console.log(`Model comparePassword result: ${modelMatch ? '✅ Success' : '❌ Failed'}`);
    
    // Test using direct bcrypt
    const directMatch = await bcrypt.compare(testPassword, adminUser.password);
    console.log(`Direct bcrypt compare result: ${directMatch ? '✅ Success' : '❌ Failed'}`);

    if (!modelMatch && !directMatch) {
      // Create new password hash for comparison
      console.log('\n🔄 Creating new password hash for debugging...');
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(testPassword, salt);
      console.log('Current stored hash:', adminUser.password);
      console.log('New test hash:', newHash);
      
      // Update password if needed
      console.log('\n🔄 Updating password...');
      adminUser.password = testPassword; // This will trigger the beforeUpdate hook
      await adminUser.save();
      console.log('✅ Password updated successfully');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
  }
}

testLogin();
