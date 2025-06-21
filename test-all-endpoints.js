const axios = require('axios');
const colors = require('colors/safe');

const API_URL = 'http://localhost:8888';
let token = null;

// Helper function to login
async function login() {
  try {
    console.log(colors.cyan('🔑 Logging in...'));
    const loginResponse = await axios.post(`${API_URL}/api/login`, {
      email: 'admin@erp.com',
      password: 'admin123'
    });

    token = loginResponse.data.token;
    
    if (!token) {
      console.error(colors.red('❌ Login failed, no token returned:'), loginResponse.data);
      return false;
    }
    
    console.log(colors.green('✅ Login successful'));
    return true;
  } catch (error) {
    console.error(colors.red('❌ Login failed:'), error.response?.status, error.response?.data || error.message);
    return false;
  }
}

// Helper function to test an endpoint
async function testEndpoint(endpoint, name) {
  try {
    console.log(colors.cyan(`\n🔍 Testing ${endpoint} endpoint...`));
    const response = await axios.get(`${API_URL}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(colors.green(`✅ ${name} endpoint successful`));
    console.log(colors.yellow(`📋 ${name} data preview:`));
    
    if (response.data.data) {
      console.log(`   Items: ${response.data.data.length || 'N/A'}`);
      if (response.data.data.length > 0) {
        console.log(colors.gray('   First item sample:'), JSON.stringify(response.data.data[0], null, 2).substring(0, 200) + '...');
      }
    } else if (Array.isArray(response.data)) {
      console.log(`   Items: ${response.data.length || 'N/A'}`);
      if (response.data.length > 0) {
        console.log(colors.gray('   First item sample:'), JSON.stringify(response.data[0], null, 2).substring(0, 200) + '...');
      }
    } else {
      console.log(colors.gray('   Response:'), JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
    }
    
    return true;
  } catch (error) {
    console.error(colors.red(`❌ ${name} endpoint failed:`), error.response?.status, error.response?.data || error.message);
    return false;
  }
}

// Main function to test all endpoints
async function testAllEndpoints() {
  // First login to get token
  const loggedIn = await login();
  if (!loggedIn) return;
  
  // Test inventory endpoints
  await testEndpoint('/api/inventory', 'Inventory');
  await testEndpoint('/api/inventory-items', 'Inventory Items');
  await testEndpoint('/api/inventory-all-data', 'Inventory All Data');
  
  // Test procurement endpoints
  await testEndpoint('/api/procurement/supplier', 'Supplier');
  await testEndpoint('/api/procurement/purchase-requisition', 'Purchase Requisition');
  
  // Test item endpoints
  await testEndpoint('/api/item', 'Item');
  await testEndpoint('/api/item-direct', 'Item Direct');
}

// Run the tests
testAllEndpoints();
