// Test Purchase Order Route
const axios = require('axios');

(async () => {
  console.log('🔍 Testing Purchase Order Route...');
  
  try {
    // Test the Purchase Order route
    const response = await axios.get('http://localhost:8888/api/procurement/purchase-order', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer null' // Using null as shown in logs
      }
    });
    
    console.log('✅ Purchase Order route response:', response.status);
    console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Purchase Order route error:', error.response?.status);
    console.error('❌ Error message:', error.response?.data?.message || error.message);
    console.error('❌ Full error data:', JSON.stringify(error.response?.data, null, 2));
  }
  
  // Also test if models are available by checking a simple endpoint
  try {
    console.log('\n🔍 Testing models availability...');
    const testResponse = await axios.get('http://localhost:8888/api/test-inventory');
    console.log('✅ Test route works:', testResponse.data);
  } catch (error) {
    console.error('❌ Test route error:', error.message);
  }
})();