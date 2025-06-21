// This script tests the UNSPSC routes directly

const fetch = require('node-fetch');

async function testUnspscRoutes() {
  const API_BASE_URL = 'http://localhost:8888/api';
  
  console.log('Testing UNSPSC routes...');
  
  try {
    // Test search endpoint
    console.log('\n1. Testing UNSPSC search...');
    const searchResponse = await fetch(`${API_BASE_URL}/unspsc/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'laptop computer'
      })
    });
    
    const searchData = await searchResponse.json();
    console.log(`Search status: ${searchResponse.status}`);
    console.log('Search results:', JSON.stringify(searchData, null, 2).substring(0, 500) + '...');
    
    // Test favorites endpoint
    console.log('\n2. Testing UNSPSC favorites...');
    const favoritesResponse = await fetch(`${API_BASE_URL}/unspsc/favorites`);
    const favoritesData = await favoritesResponse.json();
    console.log(`Favorites status: ${favoritesResponse.status}`);
    console.log('Favorites results:', JSON.stringify(favoritesData, null, 2));
    
    // Test code details
    console.log('\n3. Testing UNSPSC code details...');
    const detailsResponse = await fetch(`${API_BASE_URL}/unspsc/details/43211503`);
    const detailsData = await detailsResponse.json();
    console.log(`Details status: ${detailsResponse.status}`);
    console.log('Details results:', JSON.stringify(detailsData, null, 2).substring(0, 500) + '...');
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error testing routes:', error);
  }
}

// Run the tests
testUnspscRoutes();
