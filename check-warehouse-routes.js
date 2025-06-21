const axios = require('axios');

// Function to check if a route is accessible
async function checkRoute(route) {
  try {
    console.log(`Testing route: ${route}`);
    const response = await axios.get(`http://localhost:8888/api/${route}`);
    console.log(`✅ Route ${route} - Status: ${response.status}`);
    console.log(`   Data count: ${response.data.count || 'N/A'}`);
    console.log(`   Success: ${response.data.success}`);
    return {
      route,
      status: response.status,
      success: response.data.success,
      count: response.data.count || 'N/A',
      data: response.data.data || []
    };
  } catch (error) {
    console.error(`❌ Route ${route} - Error: ${error.message}`);
    return {
      route,
      status: error.response?.status || 'No response',
      error: error.message,
      data: error.response?.data || null
    };
  }
}

// Main function to test all warehouse-related routes
async function testWarehouseRoutes() {
  console.log('==== TESTING WAREHOUSE ROUTES ====');
  
  // Routes to test
  const routes = [
    'simple-storage-locations',
    'simple-bin-locations',
    'warehouse/storage-location',
    'warehouse/bin-location'
  ];
  
  // Test each route
  const results = [];
  for (const route of routes) {
    const result = await checkRoute(route);
    results.push(result);
    console.log('-----------------------------');
  }
  
  // Summary
  console.log('\n==== SUMMARY ====');
  for (const result of results) {
    const statusEmoji = result.status === 200 ? '✅' : '❌';
    console.log(`${statusEmoji} ${result.route}: ${result.status} - ${result.error || `${result.count} items`}`);
  }
  
  // Check if backend server is correctly registering the routes
  console.log('\n==== CHECKING SERVER REGISTRATION ====');
  try {
    const response = await axios.get('http://localhost:8888/api');
    console.log('✅ Backend API is running');
  } catch (error) {
    console.error('❌ Backend API is not running correctly');
    console.error(error.message);
  }
}

// Run the tests
testWarehouseRoutes();
