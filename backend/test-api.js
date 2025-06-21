// Simple script to test warehouse API functionality
const axios = require('axios');

async function testWarehouseAPI() {
  try {
    // Login to get token
    console.log('🔑 Logging in to get auth token...');
    const loginResponse = await axios.post('http://localhost:8888/api/login', {
      email: 'admin@demo.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.token) {
      console.error('❌ Login failed:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful! Token obtained.');
    
    // Test warehouse endpoint
    console.log('\n🔍 Testing /api/warehouse/storage-location endpoint...');
    try {
      const warehouseResponse = await axios.get('http://localhost:8888/api/warehouse/storage-location', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Response status:', warehouseResponse.status);
      console.log('Data:', JSON.stringify(warehouseResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Warehouse API error:', error.response ? {
        status: error.response.status,
        data: error.response.data
      } : error.message);
    }
  } catch (error) {
    console.error('❌ API test error:', error.response ? {
      status: error.response.status,
      data: error.response.data
    } : error.message);
  }
}

// Run the test
testWarehouseAPI();
