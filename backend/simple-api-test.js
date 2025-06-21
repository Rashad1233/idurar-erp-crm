// Simple API test script
const axios = require('axios');

async function testWarehouseAPI() {
  try {
    // First check if server is running
    console.log('Checking if server is running...');
    try {
      const serverResponse = await axios.get('http://localhost:8888/api');
      console.log('Server is running:', serverResponse.data);
    } catch (error) {
      console.error('Server check failed:', error.message);
      console.log('Make sure the backend server is running on port 8888');
      return;
    }
      console.log('\nTesting login...');
    const loginResponse = await axios.post('http://localhost:8888/api/login', {
      email: 'admin@erp.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.token) {
      console.error('Login failed:', loginResponse.data);
      return;
    }
    
    console.log('Login successful, token obtained');
    const token = loginResponse.data.token;
    
    console.log('\nTesting /api/warehouse/storage-location endpoint...');
    try {
      const warehouseResponse = await axios.get('http://localhost:8888/api/warehouse/storage-location', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', warehouseResponse.status);
      console.log('Response data:', JSON.stringify(warehouseResponse.data, null, 2));
    } catch (error) {
      console.error('Warehouse API error:', error.response ? {
        status: error.response.status,
        data: error.response.data
      } : error.message);
    }
  } catch (error) {
    console.error('API test error:', error.response ? {
      status: error.response.status,
      data: error.response.data
    } : error.message);
  }
}

testWarehouseAPI();
