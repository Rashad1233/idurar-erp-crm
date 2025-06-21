const axios = require('axios');

async function checkWarehouseData() {
  console.log('===== CHECKING WAREHOUSE DATA =====');
  
  try {
    // Check storage locations data
    console.log('\n1. STORAGE LOCATIONS DATA:');
    const storageRes = await axios.get('http://localhost:8888/api/simple-storage-locations');
    
    if (storageRes.data.data && storageRes.data.data.length > 0) {
      const firstLocation = storageRes.data.data[0];
      console.log('First storage location object structure:');
      console.log(JSON.stringify(firstLocation, null, 2));
      
      // List all available fields
      console.log('\nAvailable fields:');
      Object.keys(firstLocation).forEach(key => {
        console.log(`- ${key}: ${firstLocation[key]}`);
      });
    } else {
      console.log('No storage locations found!');
    }
    
    // Check bin locations data
    console.log('\n2. BIN LOCATIONS DATA:');
    const binRes = await axios.get('http://localhost:8888/api/simple-bin-locations');
    
    if (binRes.data.data && binRes.data.data.length > 0) {
      const firstBin = binRes.data.data[0];
      console.log('First bin location object structure:');
      console.log(JSON.stringify(firstBin, null, 2));
      
      // List all available fields
      console.log('\nAvailable fields:');
      Object.keys(firstBin).forEach(key => {
        console.log(`- ${key}: ${firstBin[key]}`);
      });
    } else {
      console.log('No bin locations found!');
    }
    
  } catch (error) {
    console.error('Error checking warehouse data:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the function
checkWarehouseData();
