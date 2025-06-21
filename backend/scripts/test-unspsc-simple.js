// Simple script to test the UNSPSC API endpoints
require('dotenv').config();
const axios = require('axios');

async function testUnspscAPI() {
  try {
    const baseURL = `http://localhost:${process.env.PORT || 8888}/api`;
    console.log(`Testing API at ${baseURL}`);

    // Test global UNSPSC endpoint (no auth required)
    console.log('\nTesting GET /unspsc/level/SEGMENT');
    const segmentsResponse = await axios.get(`${baseURL}/unspsc/level/SEGMENT`);
    console.log('Response status:', segmentsResponse.status);
    console.log('Segments count:', segmentsResponse.data.length);
    
    if (segmentsResponse.data.length > 0) {
      console.log('First segment:', segmentsResponse.data[0]);
    }

    console.log('\nAPI test completed successfully');
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testUnspscAPI();
