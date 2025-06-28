const axios = require('axios');

async function testPRApiDirect() {
  console.log('🔍 Testing Purchase Requisition API endpoint directly...\n');
  
  try {
    // Test the API endpoint
    console.log('📡 Calling GET http://localhost:8888/api/purchase-requisition/list');
    
    const response = await axios.get('http://localhost:8888/api/purchase-requisition/list', {
      headers: {
        'Content-Type': 'application/json',
        // Add auth token if needed
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
      console.error('\n🔍 Error Details:');
      if (error.response.data.error) {
        console.error('Error Message:', error.response.data.error);
      }
      if (error.response.data.stack) {
        console.error('Stack Trace:', error.response.data.stack);
      }
    } else if (error.request) {
      console.error('No response received. Is the backend server running on port 8888?');
    }
  }
}

// Run the test
testPRApiDirect();
