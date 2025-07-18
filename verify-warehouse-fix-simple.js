const axios = require('axios');

async function testWarehouseModule() {
  console.log('===== WAREHOUSE MODULE TEST =====');
  console.log('Testing warehouse module functionality after fixes...');
  
  // Test the API endpoints
  console.log('\nTesting API endpoints:');
  
  try {
    // Test storage locations endpoint
    console.log('Testing /api/simple-storage-locations...');
    const storageRes = await axios.get('http://localhost:8888/api/simple-storage-locations');
    console.log('✅ Storage locations API works!');
    console.log(`  Found ${storageRes.data.count} storage locations`);
    
    // Test bin locations endpoint
    console.log('\nTesting /api/simple-bin-locations...');
    const binRes = await axios.get('http://localhost:8888/api/simple-bin-locations');
    console.log('✅ Bin locations API works!');
    console.log(`  Found ${binRes.data.count} bin locations`);
    
    // Print summary
    console.log('\n✅ All warehouse API endpoints are working correctly!');
    console.log('\nFrontend should now be able to load warehouse data properly.');
    console.log('Please check the warehouse page at: http://localhost:3001/warehouse');
    
  } catch (error) {
    console.log('❌ API test failed:');
    console.log(error.message);
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Response:', error.response.data);
    }
  }
}

// Run the test
testWarehouseModule();
