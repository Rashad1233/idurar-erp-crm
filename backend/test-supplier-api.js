// Test script to verify supplier API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:8888';

async function testSupplierAPI() {
  try {
    console.log('🔧 Testing Supplier API endpoints...');
    
    // Test GET /suppliers
    console.log('1. Testing GET /suppliers...');
    try {
      const response = await axios.get(`${BASE_URL}/suppliers`);
      console.log(`✅ GET /suppliers: ${response.status} - Found ${response.data.result?.length || 0} suppliers`);
    } catch (error) {
      console.log(`❌ GET /suppliers failed: ${error.response?.status} - ${error.message}`);
    }
    
    // Test server health
    console.log('2. Testing server health...');
    try {
      const response = await axios.get(`${BASE_URL}/health`);
      console.log(`✅ Server health: ${response.status}`);
    } catch (error) {
      console.log(`❌ Health check failed: ${error.message}`);
    }
    
    // Test 404 endpoint
    console.log('3. Testing 404 endpoint...');
    try {
      const response = await axios.get(`${BASE_URL}/nonexistent`);
      console.log(`⚠️ Unexpected success: ${response.status}`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`✅ 404 handling works: ${error.response.status}`);
      } else {
        console.log(`❌ Unexpected error: ${error.message}`);
      }
    }
    
    console.log('✅ API test completed');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSupplierAPI();