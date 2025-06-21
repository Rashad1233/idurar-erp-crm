const axios = require('axios');

async function testInventoryDirectly() {
  console.log('🔍 Testing inventory endpoints directly...');
  
  const baseUrl = 'http://localhost:8888/api';
  const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBiNGFmYTNlLTg1ODItNDUyYi04MzNjLWY4YmY2OTVjNGQ2MCIsImlhdCI6MTc0ODI4NDYzNCwiZXhwIjoxNzUwODc2NjM0fQ.U_QNusihE35Gi2fegq3_-6YY149Cty_meUHBO-HRChU';
  
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'x-auth-token': authToken,
    'Content-Type': 'application/json'
  };
  
  try {
    // Test basic API
    console.log('\n1. Testing basic API...');
    const basicResponse = await axios.get(`${baseUrl}/`, { headers });
    console.log('✅ Basic API works:', basicResponse.data);
    
    // Test auth route
    console.log('\n2. Testing auth route...');
    try {
      const authResponse = await axios.get(`${baseUrl}/auth/profile`, { headers });
      console.log('✅ Auth route works:', authResponse.data);
    } catch (authError) {
      console.log('❌ Auth route failed:', authError.response?.status, authError.response?.data);
    }
    
    // Test inventory GET route
    console.log('\n3. Testing inventory GET route...');
    try {
      const inventoryResponse = await axios.get(`${baseUrl}/inventory`, { headers });
      console.log('✅ Inventory GET works:', {
        success: inventoryResponse.data.success,
        itemCount: inventoryResponse.data.data ? inventoryResponse.data.data.length : 0
      });
      
      // If inventory items exist, test DELETE
      if (inventoryResponse.data.data && inventoryResponse.data.data.length > 0) {
        const testItem = inventoryResponse.data.data[0];
        console.log(`\n4. Testing DELETE on item: ${testItem.id}`);
        
        try {
          const deleteResponse = await axios.delete(`${baseUrl}/inventory/${testItem.id}`, { headers });
          console.log('✅ DELETE works:', deleteResponse.data);
        } catch (deleteError) {
          console.log('❌ DELETE failed:', {
            status: deleteError.response?.status,
            statusText: deleteError.response?.statusText,
            data: deleteError.response?.data,
            url: deleteError.config?.url
          });
        }
      } else {
        console.log('❌ No inventory items found to test DELETE');
      }
      
    } catch (inventoryError) {
      console.log('❌ Inventory GET failed:', {
        status: inventoryError.response?.status,
        statusText: inventoryError.response?.statusText,
        data: inventoryError.response?.data,
        url: inventoryError.config?.url
      });
    }
      } catch (error) {
    console.error('❌ Test failed:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }
}

testInventoryDirectly().catch(console.error);
