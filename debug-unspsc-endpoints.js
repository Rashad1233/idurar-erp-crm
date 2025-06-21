const axios = require('axios');

async function testUnspscEndpoints() {
  const BASE_URL = 'http://localhost:8888';
  
  console.log('Testing UNSPSC endpoints...');
  console.log('===============================');
  
  try {
    // 1. Test the search endpoint
    console.log('\n1. Testing search endpoint...');
    try {
      const searchResponse = await axios.post(`${BASE_URL}/api/unspsc/search`, {
        query: 'laptop computer'
      });
      
      console.log('✅ Search successful!');
      console.log('Status:', searchResponse.status);
      console.log('Message:', searchResponse.data.message);
      console.log('Results count:', searchResponse.data.results?.length || 0);
      if (searchResponse.data.results?.length > 0) {
        console.log('First result:', searchResponse.data.results[0].unspscCode, '-', searchResponse.data.results[0].fullTitle);
      }
    } catch (error) {
      console.error('❌ Search failed!');
      console.error('Status:', error.response?.status);
      console.error('Error:', error.response?.data?.message || error.message);
      
      if (error.response?.data?.results) {
        console.log('Demo results returned:', error.response.data.results.length);
      }
    }
    
    // 2. Test the favorites endpoint
    console.log('\n2. Testing favorites endpoint...');
    try {
      const favoritesResponse = await axios.get(`${BASE_URL}/api/unspsc/favorites`);
      
      console.log('✅ Favorites fetch successful!');
      console.log('Status:', favoritesResponse.status);
      console.log('Message:', favoritesResponse.data.message);
      console.log('Favorites count:', favoritesResponse.data.favorites?.length || 0);
    } catch (error) {
      console.error('❌ Favorites fetch failed!');
      console.error('Status:', error.response?.status);
      console.error('Error:', error.response?.data?.message || error.message);
    }
    
    // 3. Test the details endpoint with a known code
    console.log('\n3. Testing details endpoint...');
    try {
      const detailsResponse = await axios.get(`${BASE_URL}/api/unspsc/details/43211503`);
      
      console.log('✅ Details fetch successful!');
      console.log('Status:', detailsResponse.status);
      console.log('Message:', detailsResponse.data.message);
      console.log('Code:', detailsResponse.data.result?.unspscCode);
      console.log('Title:', detailsResponse.data.result?.fullTitle);
    } catch (error) {
      console.error('❌ Details fetch failed!');
      console.error('Status:', error.response?.status);
      console.error('Error:', error.response?.data?.message || error.message);
      
      if (error.response?.data?.result) {
        console.log('Demo result returned:', error.response.data.result.unspscCode, '-', error.response.data.result.fullTitle);
      }
    }
    
    console.log('\n===============================');
    console.log('Testing complete!');
    
  } catch (error) {
    console.error('Unexpected error during testing:', error.message);
  }
}

// Run the tests
testUnspscEndpoints();
