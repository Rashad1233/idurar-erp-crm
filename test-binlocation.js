// Test BinLocation model directly
const sequelize = require('./backend/config/postgresql');
const { DataTypes } = require('sequelize');

async function testBinLocation() {
  try {
    console.log('🔍 Testing direct model loading...');
    
    // Load warehouse models directly
    const warehouseModels = require('./backend/models/sequelize/Warehouse')(sequelize, DataTypes);
    console.log('✅ Warehouse models loaded:', Object.keys(warehouseModels));
    
    const { StorageLocation, BinLocation } = warehouseModels;
    
    // Test finding storage locations
    console.log('🔍 Testing StorageLocation...');
    const storageLocations = await StorageLocation.findAll({ limit: 1 });
    console.log(`Found ${storageLocations.length} storage locations`);
    
    if (storageLocations.length > 0) {
      const storageLocationId = storageLocations[0].id;
      console.log(`🔍 Testing BinLocation for storage location: ${storageLocationId}`);
      
      // Test the exact query from the controller
      const bins = await BinLocation.findAll({
        where: { storageLocationId },
        order: [['binCode', 'ASC']]
      });
      
      console.log(`✅ Found ${bins.length} bins`);
      if (bins.length > 0) {
        console.log('First bin:', bins[0].binCode);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testBinLocation();
