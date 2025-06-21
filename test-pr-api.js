const axios = require('axios');

async function testPRAPI() {
  console.log('🔍 Testing Purchase Requisition API after server restart...\n');
  
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkFkbWluIFVzZXIiLCJlbWFpbCI6ImFkbWluQGVycC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzM2NTE1NzUsImV4cCI6MTczNDI1NjM3NX0.Q5PIq0aRXSG2r1wHZzd6YOHmUzYKE4PJFxpQGqVlI5g';
  
  try {
    console.log('Testing Purchase Requisition API...');
    const response = await axios.get('http://localhost:8888/api/procurement/purchase-requisition', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ API CALL SUCCESSFUL!');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data) {
      console.log(`\n📊 Found ${response.data.data.length} purchase requisitions`);
    }
    
  } catch (error) {
    console.log('❌ API CALL FAILED!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
}

testPRAPI().catch(console.error);
