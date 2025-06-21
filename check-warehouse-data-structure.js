const axios = require('axios');

async function testWarehouseData() {
  console.log('Testing Warehouse Data Structure...');
  
  try {
    // Test simple storage locations route
    console.log('\n1. Testing /simple-storage-locations route:');
    const storageLocations = await axios.get('http://localhost:8888/api/simple-storage-locations');
    
    if (storageLocations.data.success) {
      console.log(`✅ Found ${storageLocations.data.count} storage locations`);
      
      if (storageLocations.data.data.length > 0) {
        const firstLocation = storageLocations.data.data[0];
        console.log('\nFirst Storage Location Data Structure:');
        console.log(JSON.stringify(firstLocation, null, 2));
        
        // Check for important fields
        console.log('\nChecking key fields:');
        console.log(`- code: ${firstLocation.code !== undefined ? '✅ exists' : '❌ missing'}`);
        console.log(`- description: ${firstLocation.description !== undefined ? '✅ exists' : '❌ missing'}`);
        console.log(`- street: ${firstLocation.street !== undefined ? '✅ exists' : '❌ missing'}`);
        console.log(`- city: ${firstLocation.city !== undefined ? '✅ exists' : '❌ missing'}`);
        console.log(`- country: ${firstLocation.country !== undefined ? '✅ exists' : '❌ missing'}`);
      }
    } else {
      console.log('❌ Failed to fetch storage locations');
    }
    
    // Test simple bin locations route
    console.log('\n2. Testing /simple-bin-locations route:');
    const binLocations = await axios.get('http://localhost:8888/api/simple-bin-locations');
    
    if (binLocations.data.success) {
      console.log(`✅ Found ${binLocations.data.count} bin locations`);
      
      if (binLocations.data.data.length > 0) {
        const firstBin = binLocations.data.data[0];
        console.log('\nFirst Bin Location Data Structure:');
        console.log(JSON.stringify(firstBin, null, 2));
        
        // Check for important fields
        console.log('\nChecking key fields:');
        console.log(`- binCode: ${firstBin.binCode !== undefined ? '✅ exists' : '❌ missing'}`);
        console.log(`- description: ${firstBin.description !== undefined ? '✅ exists' : '❌ missing'}`);
        console.log(`- storageLocationId: ${firstBin.storageLocationId !== undefined ? '✅ exists' : '❌ missing'}`);
        console.log(`- storageLocationCode: ${firstBin.storageLocationCode !== undefined ? '✅ exists' : '❌ missing'}`);
        console.log(`- storageLocationDescription: ${firstBin.storageLocationDescription !== undefined ? '✅ exists' : '❌ missing'}`);
      }
    } else {
      console.log('❌ Failed to fetch bin locations');
    }
    
  } catch (error) {
    console.error('Error during testing:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testWarehouseData();
