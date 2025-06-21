// Database initialization script
require('dotenv').config();
const { sequelize } = require('../config/db');

// Import all models to ensure they are registered
const User = require('../models/sequelize/User');
const ItemMaster = require('../models/sequelize/ItemMaster');
const Inventory = require('../models/sequelize/Inventory');
const StorageLocation = require('../models/sequelize/Warehouse').StorageLocation;
const BinLocation = require('../models/sequelize/Warehouse').BinLocation;
const Transaction = require('../models/sequelize/Transaction');
const ReorderRequest = require('../models/sequelize/ReorderRequest');
const UnspscCode = require('../models/sequelize/UnspscCode');

// Import associations
require('../models/sequelize/associations');

async function initializeDatabase() {
  try {
    console.log('🔄 Connecting to PostgreSQL database...');
    
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');
    
    console.log('🔄 Synchronizing database schema...');
      // This will create tables if they don't exist
    // Set force: true to recreate tables and existing data
    await sequelize.sync({ force: true });
    
    console.log('✅ Database schema synchronized successfully!');
    
    // Check if we need to create a default admin user
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('🔄 Creating default admin user...');
      
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
        await User.create({
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
      
      console.log('✅ Default admin user created!');
      console.log('📧 Email: admin@erp.com');
      console.log('🔑 Password: admin123');
    }
    
    // Create some sample storage locations if none exist
    const locationCount = await StorageLocation.count();
    if (locationCount === 0) {
      console.log('🔄 Creating sample storage locations...');
      
      const adminUser = await User.findOne({ where: { role: 'admin' } });
      
      await StorageLocation.bulkCreate([
        {
          code: 'WH01',
          description: 'Main Warehouse',
          address: '123 Industrial Ave, Manufacturing District',
          createdById: adminUser.id
        },
        {
          code: 'WH02', 
          description: 'Secondary Warehouse',
          address: '456 Storage Blvd, Distribution Center',
          createdById: adminUser.id
        },
        {
          code: 'OF01',
          description: 'Office Storage',
          address: '789 Corporate Way, Admin Building',
          createdById: adminUser.id
        }
      ]);
        console.log('✅ Sample storage locations created!');
    }

    // Create sample UNSPSC codes if none exist
    const unspscCount = await UnspscCode.count();
    if (unspscCount === 0) {
      console.log('🔄 Creating sample UNSPSC codes...');
      
      await UnspscCode.bulkCreate([
        {
          code: '31150000',
          segment: '31',
          family: '15',
          class: '00',
          commodity: '00',
          title: 'Bearings and bushings and wheels and gears',
          definition: 'Industrial bearings, bushings, wheels, and gears used in machinery and equipment',
          level: 'CLASS'
        },
        {
          code: '31151500',
          segment: '31',
          family: '15',
          class: '15',
          commodity: '00',
          title: 'Bearings',
          definition: 'Mechanical components that constrain relative motion and reduce friction between moving parts',
          level: 'CLASS'
        },
        {
          code: '31151700',
          segment: '31',
          family: '15',
          class: '17',
          commodity: '00',
          title: 'Gears',
          definition: 'Mechanical components used to transmit motion and power between machine parts',
          level: 'CLASS'
        }
      ]);
      
      console.log('✅ Sample UNSPSC codes created!');
    }

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`👥 Users: ${await User.count()}`);
    console.log(`📦 Item Masters: ${await ItemMaster.count()}`);
    console.log(`📊 Inventory Items: ${await Inventory.count()}`);
    console.log(`🏢 Storage Locations: ${await StorageLocation.count()}`);
    console.log(`📍 Bin Locations: ${await BinLocation.count()}`);
    console.log(`🔢 UNSPSC Codes: ${await UnspscCode.count()}`);
    
    // Check if Transaction model is available before counting
    try {
      console.log(`📋 Transactions: ${await Transaction.count()}`);
    } catch (error) {
      console.log(`📋 Transactions: Model not available (${error.message})`);
    }
    
    try {
      console.log(`🔄 Reorder Requests: ${await ReorderRequest.count()}`);
    } catch (error) {
      console.log(`🔄 Reorder Requests: Model not available (${error.message})`);
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the initialization
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('\n✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = initializeDatabase;
