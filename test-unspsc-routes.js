const axios = require('axios');

async function testUnspscRoutes() {
  const API_BASE_URL = 'http://localhost:8888/api';

  console.log('Testing UNSPSC routes...');

  try {
    // Test search
    console.log('\n1. Testing UNSPSC search route...');
    const searchResponse = await axios.post(`${API_BASE_URL}/unspsc/search`, {
      query: 'laptop computer'
    });
    
    console.log('Search response status:', searchResponse.status);
    console.log('Search results:', JSON.stringify(searchResponse.data, null, 2));

    // Test favorites
    console.log('\n2. Testing UNSPSC favorites route...');
    const favoritesResponse = await axios.get(`${API_BASE_URL}/unspsc/favorites`);
    
    console.log('Favorites response status:', favoritesResponse.status);
    console.log('Favorites results:', JSON.stringify(favoritesResponse.data, null, 2));

    // Test details if we got a code from search
    if (searchResponse.data && searchResponse.data.results && searchResponse.data.results.length > 0) {
      const code = searchResponse.data.results[0].unspscCode;
      console.log(`\n3. Testing UNSPSC details route for code ${code}...`);
      
      const detailsResponse = await axios.get(`${API_BASE_URL}/unspsc/details/${code}`);
      
      console.log('Details response status:', detailsResponse.status);
      console.log('Details result:', JSON.stringify(detailsResponse.data, null, 2));
    }

    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Error during tests:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    }
  }
}

testUnspscRoutes();
