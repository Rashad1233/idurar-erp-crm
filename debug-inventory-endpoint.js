const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:8888';

async function loginAndTestInventoryEndpoint() {
  try {
    // Login to get a token first
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

    // Test the inventory endpoint
    try {
      console.log('\n🔍 Testing /api/inventory endpoint...');
      const inventoryResponse = await axios.get(`${API_URL}/api/inventory`, config);
      console.log('✅ Inventory endpoint successful');
      console.log('📋 Inventory data preview:');
      console.log(`   Items returned: ${inventoryResponse.data ? inventoryResponse.data.length : 'N/A'}`);
      if (inventoryResponse.data && inventoryResponse.data.length > 0) {
        console.log('   First item sample:', JSON.stringify(inventoryResponse.data[0], null, 2));
      } else {
        console.log('   No inventory items found.');
      }
    } catch (error) {
      console.error('❌ Inventory endpoint failed:', error.response?.status, error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Overall test failed:', error.response?.status, error.response?.data || error.message);
  }
}

loginAndTestInventoryEndpoint();
