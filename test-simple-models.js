// Test Simplified Models
const axios = require('axios');

(async () => {
  console.log('🔍 Testing Simplified Models...');
  
  try {
    // Test the test-simple endpoint
    const response = await axios.get('http://localhost:8888/api/procurement/purchase-order/test-simple', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer null'
      }
    });
    
    console.log('✅ Test simple models endpoint response:', response.status);
    console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test simple models endpoint error:', error.response?.status);
    console.error('❌ Error message:', error.response?.data?.message || error.message);
    console.error('❌ Full error data:', JSON.stringify(error.response?.data, null, 2));
  }
  
  // Now test the main Purchase Order route
  console.log('\n🔍 Testing Purchase Order Route with Simplified Models...');
  
  try {
    const response = await axios.get('http://localhost:8888/api/procurement/purchase-order', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer null'
      }
    });
    
    console.log('✅ Purchase Order route response:', response.status);
    console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Purchase Order route error:', error.response?.status);
    console.error('❌ Error message:', error.response?.data?.message || error.message);
    console.error('❌ Full error data:', JSON.stringify(error.response?.data, null, 2));
  }
})();