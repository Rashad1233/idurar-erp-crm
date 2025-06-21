const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:8888';

async function loginAndTestItemEndpoint() {
  try {    // Login to get a token first
    console.log('Logging in...');
    const loginResponse = await axios.post(`${API_URL}/api/login`, {
      email: 'admin@erp.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    
    if (!token) {
      console.error('❌ Login failed, no token returned:', loginResponse.data);
      return;
    }
    
    console.log('✅ Login successful');
    console.log('👤 User data:', loginResponse.data.user);

    // Set the authorization header with the token
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    // Now test each relevant endpoint
    try {
      console.log('\n🔍 Testing /api/item endpoint...');
      const itemResponse = await axios.get(`${API_URL}/api/item`, config);
      console.log('✅ Item endpoint successful');
      console.log('📋 Item data preview:');
      console.log('   Count:', itemResponse.data.count || 'N/A');
      console.log('   First few items:', JSON.stringify(itemResponse.data.data && itemResponse.data.data.slice(0, 2), null, 2));
    } catch (error) {
      console.error('❌ Item endpoint failed:', error.response?.status, error.response?.data || error.message);
      
      // Check if there are any errors in the controller
      console.log('\n🔍 Testing controller directly through debug route...');
      try {
        const debugResponse = await axios.get(`${API_URL}/api/debug/controller/itemMasterController/getItemMasters`, config);
        console.log('✅ Debug controller call successful:', debugResponse.data);
      } catch (debugError) {
        console.error('❌ Debug controller call failed:', debugError.response?.status, debugError.response?.data || debugError.message);
      }
    }

    // Test the inventory routes as well
    try {
      console.log('\n🔍 Testing /api/inventory/item endpoint...');
      const inventoryItemResponse = await axios.get(`${API_URL}/api/inventory/item`, config);
      console.log('✅ Inventory item endpoint successful');
      console.log('📋 Inventory item data preview:');
      console.log(JSON.stringify(inventoryItemResponse.data.slice(0, 2), null, 2));
    } catch (error) {
      console.error('❌ Inventory item endpoint failed:', error.response?.status, error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Overall test failed:', error.response?.status, error.response?.data || error.message);
  }
}

loginAndTestItemEndpoint();
