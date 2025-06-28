const axios = require('axios');

async function testItemAPI() {
  try {
    console.log('Testing /api/item?filter=approved endpoint...');
    
    const response = await axios.get('http://localhost:8888/api/item?filter=approved');
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ API Response Success:', response.data.success);
    console.log('✅ Number of items returned:', response.data.data ? response.data.data.length : 0);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('✅ Sample item:', JSON.stringify(response.data.data[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ API Test Error:', error.message);
    if (error.response) {
      console.error('❌ Response Status:', error.response.status);
      console.error('❌ Response Data:', error.response.data);
    }
  }
}

testItemAPI();
