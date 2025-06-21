const axios = require('axios');

// Simple HTTP client for testing
const apiClient = axios.create({
  baseURL: 'http://localhost:8888/api/',
  timeout: 10000,
});

async function testUnspscService() {
  console.log('==== Testing UNSPSC Services ====');
  
  try {
    // Test 1: Get UNSPSC by code
    console.log('\n1. Testing getUnspscByCode:');
    const codeResponse = await apiClient.get('unspsc/code/43211500');
    console.log('Response:', JSON.stringify(codeResponse.data, null, 2));
    
    // Test 2: Get favorites
    console.log('\n2. Testing getFavorites:');
    const favoritesResponse = await apiClient.get('unspsc/favorites');
    console.log('Response:', JSON.stringify(favoritesResponse.data, null, 2));
    
    // Test 3: Search with AI
    console.log('\n3. Testing AI Search:');
    const aiSearchResponse = await apiClient.post('deepseek/search', { description: 'laptop computer' });
    console.log('Response:', JSON.stringify(aiSearchResponse.data, null, 2));
    
    console.log('\n==== All tests completed ====');
  } catch (error) {
    console.error('Error during testing:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received from server');
    }
  }
}

testUnspscService();
