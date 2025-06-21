const axios = require('axios');

console.log('🔍 Testing DELETE functionality with authentication...');

async function testDeleteFunctionality() {
  const baseUrl = 'http://localhost:8888/api';
  
  try {
    // Test basic API endpoint first
    console.log('\n1. Testing basic API endpoint...');
    const basicResponse = await axios.get(`${baseUrl}/`);
    console.log('✅ Basic API response:', basicResponse.data);
    
    // Test inventory GET endpoint
    console.log('\n2. Testing inventory GET endpoint...');
    const getResponse = await axios.get(`${baseUrl}/inventory`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBiNGFmYTNlLTg1ODItNDUyYi04MzNjLWY4YmY2OTVjNGQ2MCIsImlhdCI6MTc0ODI4NDYzNCwiZXhwIjoxNzUwODc2NjM0fQ.U_QNusihE35Gi2fegq3_-6YY149Cty_meUHBO-HRChU',
        'x-auth-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBiNGFmYTNlLTg1ODItNDUyYi04MzNjLWY4YmY2OTVjNGQ2MCIsImlhdCI6MTc0ODI4NDYzNCwiZXhwIjoxNzUwODc2NjM0fQ.U_QNusihE35Gi2fegq3_-6YY149Cty_meUHBO-HRChU'
      }
    });
    console.log('✅ Inventory GET response:', {
      success: getResponse.data.success,
      itemCount: getResponse.data.data ? getResponse.data.data.length : 0
    });
    
    // Test if we have any inventory items to work with
    if (getResponse.data.data && getResponse.data.data.length > 0) {
      const testItem = getResponse.data.data[0];
      console.log('\n3. Found test item:', {
        id: testItem.id,
        name: testItem.name,
        sku: testItem.sku
      });
      
      // Test DELETE endpoint
      console.log('\n4. Testing DELETE endpoint...');
      try {
        const deleteResponse = await axios.delete(`${baseUrl}/inventory/${testItem.id}`, {
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBiNGFmYTNlLTg1ODItNDUyYi04MzNjLWY4YmY2OTVjNGQ2MCIsImlhdCI6MTc0ODI4NDYzNCwiZXhwIjoxNzUwODc2NjM0fQ.U_QNusihE35Gi2fegq3_-6YY149Cty_meUHBO-HRChU',
            'x-auth-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBiNGFmYTNlLTg1ODItNDUyYi04MzNjLWY4YmY2OTVjNGQ2MCIsImlhdCI6MTc0ODI4NDYzNCwiZXhwIjoxNzUwODc2NjM0fQ.U_QNusihE35Gi2fegq3_-6YY149Cty_meUHBO-HRChU'
          }
        });
        console.log('✅ DELETE successful:', {
          status: deleteResponse.status,
          data: deleteResponse.data
        });
        
        // Verify deletion by trying to get the item again
        console.log('\n5. Verifying deletion...');
        try {
          const verifyResponse = await axios.get(`${baseUrl}/inventory/${testItem.id}`, {
            headers: {
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBiNGFmYTNlLTg1ODItNDUyYi04MzNjLWY4YmY2OTVjNGQ2MCIsImlhdCI6MTc0ODI4NDYzNCwiZXhwIjoxNzUwODc2NjM0fQ.U_QNusihE35Gi2fegq3_-6YY149Cty_meUHBO-HRChU',
              'x-auth-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBiNGFmYTNlLTg1ODItNDUyYi04MzNjLWY4YmY2OTVjNGQ2MCIsImlhdCI6MTc0ODI4NDYzNCwiZXhwIjoxNzUwODc2NjM0fQ.U_QNusihE35Gi2fegq3_-6YY149Cty_meUHBO-HRChU'
            }
          });
          console.log('❌ Item still exists after deletion:', verifyResponse.data);
        } catch (verifyError) {
          if (verifyError.response?.status === 404) {
            console.log('✅ Deletion verified - item no longer exists');
          } else {
            console.log('❓ Unexpected error during verification:', verifyError.response?.data || verifyError.message);
          }
        }
        
      } catch (deleteError) {
        console.log('❌ DELETE failed:', {
          status: deleteError.response?.status,
          data: deleteError.response?.data,
          message: deleteError.message
        });
      }
    } else {
      console.log('❌ No inventory items found to test DELETE');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }
}

testDeleteFunctionality().then(() => {
  console.log('\n🏁 Test completed');
}).catch(error => {
  console.error('❌ Test runner error:', error);
});
