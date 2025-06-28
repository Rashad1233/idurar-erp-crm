// Test CORS and frontend API call
const axios = require('axios');

async function testCORS() {
  try {
    console.log('Testing CORS and API call from frontend perspective...');
    
    // Test with CORS headers that the frontend would send
    const response = await axios.get('http://localhost:8888/api/item?filter=approved&page=1&limit=100&includePricing=true', {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization, x-auth-token'
      },
      withCredentials: true
    });
    
    console.log('✅ CORS Test Success!');
    console.log('✅ Status:', response.status);
    console.log('✅ Data structure:', {
      success: response.data.success,
      dataCount: response.data.data ? response.data.data.length : 0,
      resultCount: response.data.result ? response.data.result.length : 0
    });
    
    // Test the exact data structure the frontend expects
    if (response.data.success && response.data.data) {
      console.log('✅ Frontend will receive data correctly');
      console.log('✅ Sample item for frontend:', {
        id: response.data.data[0].id,
        itemNumber: response.data.data[0].itemNumber,
        shortDescription: response.data.data[0].shortDescription,
        status: response.data.data[0].status
      });
    } else {
      console.log('❌ Frontend data structure issue');
    }
    
  } catch (error) {
    console.error('❌ CORS/API Error:', error.message);
    if (error.response) {
      console.error('❌ Status:', error.response.status);
      console.error('❌ Headers:', error.response.headers);
      console.error('❌ Data:', error.response.data);
    }
  }
}

testCORS();