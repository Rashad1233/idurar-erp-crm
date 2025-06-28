// Test the exact API call that the frontend is making
const axios = require('axios');

async function testFrontendAPI() {
  try {
    console.log('Testing frontend API call to /api/item?filter=approved...');
    
    // Simulate the exact call the frontend makes
    const response = await axios.get('http://localhost:8888/api/item?filter=approved&page=1&limit=100&includePricing=true', {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      }
    });
    
    console.log('✅ Status:', response.status);
    console.log('✅ Success:', response.data.success);
    console.log('✅ Data count:', response.data.data ? response.data.data.length : 0);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('✅ First item structure:');
      const item = response.data.data[0];
      console.log('  - id:', item.id);
      console.log('  - itemNumber:', item.itemNumber);
      console.log('  - shortDescription:', item.shortDescription);
      console.log('  - status:', item.status);
      console.log('  - uom:', item.uom);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('❌ Status:', error.response.status);
      console.error('❌ Data:', error.response.data);
    }
  }
}

testFrontendAPI();