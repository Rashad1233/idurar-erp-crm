// Test authentication script
require('dotenv').config();
const { sequelize } = require('../config/db');
const { User } = require('../models/sequelize');
const bcrypt = require('bcryptjs');

async function testAuth() {
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
      console.log('❌ Admin user not found! Creating one...');
      
      // Create admin user if not exists
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const newAdmin = await User.create({
        name: 'System Administrator',
        email: 'admin@erp.com',
        password: hashedPassword,
        role: 'admin',
        createItemMaster: true,
        editItemMaster: true,
        approveItemMaster: true,
        setInventoryLevels: true,
        warehouseTransactions: true,
        createReorderRequests: true,
        approveReorderRequests: true,
        isActive: true
      });
      
      console.log('✅ Admin user created:', {
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role
      });
    } else {
      console.log('✅ Admin user found:', {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role
      });
      
      // Test password comparison
      console.log('🔄 Testing password comparison...');
      const isMatch = await adminUser.comparePassword('admin123');
      console.log(`Password comparison result: ${isMatch ? '✅ Matched' : '❌ Failed'}`);
      
      // Test direct bcrypt comparison as fallback
      console.log('🔄 Testing direct bcrypt comparison...');
      const directMatch = await bcrypt.compare('admin123', adminUser.password);
      console.log(`Direct bcrypt comparison result: ${directMatch ? '✅ Matched' : '❌ Failed'}`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
  }
}

testAuth();
