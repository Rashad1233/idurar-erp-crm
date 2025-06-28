// Test Models Endpoint
const axios = require('axios');

(async () => {
  console.log('🔍 Testing Models Endpoint...');
  
  try {
    // Test the test-models endpoint
    const response = await axios.get('http://localhost:8888/api/procurement/purchase-order/test-models', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer null' // Using null as shown in logs
      }
    });
    
    console.log('✅ Test models endpoint response:', response.status);
    console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test models endpoint error:', error.response?.status);
    console.error('❌ Error message:', error.response?.data?.message || error.message);
    console.error('❌ Full error data:', JSON.stringify(error.response?.data, null, 2));
  }
})();