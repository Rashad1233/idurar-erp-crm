// Test the frontend request utility
const axios = require('axios');

async function testFrontendRequest() {
  console.log('🔍 Testing frontend request patterns...');
  
  const BASE_URL = 'http://localhost:8888/api';
  
  // Test the different URL patterns the frontend might be using
  const testUrls = [
    '/procurement/rfq',           // Direct endpoint
    '/procurement/rfq/list',      // With /list suffix
    '/procurement/rfq/listAll',   // With /listAll suffix
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`\n🔍 Testing: ${BASE_URL}${url}`);
      const response = await axios.get(`${BASE_URL}${url}`, {
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ ${url}: Status ${response.status}`);
      console.log(`   Data: ${response.data.success ? 'Success' : 'Failed'}`);
      console.log(`   Count: ${response.data.count || response.data.data?.length || 0}`);
      
    } catch (error) {
      console.log(`❌ ${url}: Status ${error.response?.status || 'No response'}`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }
  }
}

testFrontendRequest();