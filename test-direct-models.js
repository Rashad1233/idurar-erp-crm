// Test Direct Models Endpoint
const axios = require('axios');

(async () => {
  console.log('🔍 Testing Direct Models Endpoint...');
  
  try {
    // Test the test-direct endpoint
    const response = await axios.get('http://localhost:8888/api/procurement/purchase-order/test-direct', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer null' // Using null as shown in logs
      }
    });
    
    console.log('✅ Test direct models endpoint response:', response.status);
    console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test direct models endpoint error:', error.response?.status);
    console.error('❌ Error message:', error.response?.data?.message || error.message);
    console.error('❌ Full error data:', JSON.stringify(error.response?.data, null, 2));
  }
  
  // Now test the main Purchase Order route
  console.log('\n🔍 Testing Purchase Order Route with Direct Models...');
  
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