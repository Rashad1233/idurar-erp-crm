// Temporary route to create an admin user for testing
const express = require('express');
const router = express.Router();
const { User } = require('../models/sequelize');
const bcrypt = require('bcryptjs');

router.post('/create-admin', async (req, res) => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (existingAdmin) {
      return res.status(200).json({
        success: true,
        message: 'Admin user already exists',
        data: {
          id: existingAdmin.id,
          email: existingAdmin.email,
          name: existingAdmin.name || 'Admin User',
          role: existingAdmin.role
        }
      });
    }
    
    // Create a new admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('adminpass', salt);
    
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      createItemMaster: true,
      editItemMaster: true,
      approveItemMaster: true,
      setInventoryLevels: true,
      createReorderRequests: true,
      approveReorderRequests: true,
      warehouseTransactions: true,
      isActive: true
    });
    
    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user',
      error: error.message
    });
  }
});

module.exports = router;
