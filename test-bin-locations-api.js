const axios = require('axios');

const baseURL = 'http://localhost:5001/api';

async function testBinLocationsAPI() {
  try {
    console.log('🔍 Testing bin locations API...');
    
    // First, try to login and get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      username: 'admin@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    
    // Set up headers for authenticated requests
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Check storage locations first
    console.log('2. Getting storage locations...');
    const storageResponse = await axios.get(`${baseURL}/warehouse/storage-location`, { headers });
    console.log(`✅ Found ${storageResponse.data.data?.length || 0} storage locations`);
    
    if (storageResponse.data.data && storageResponse.data.data.length > 0) {
      const firstLocation = storageResponse.data.data[0];
      console.log(`3. Testing bins for storage location: ${firstLocation.id} (${firstLocation.code})`);
      
      // Try to get bins for the first storage location
      const binResponse = await axios.get(`${baseURL}/warehouse/storage-location/${firstLocation.id}/bins`, { headers });
      console.log(`✅ Bins request successful! Found ${binResponse.data.data?.length || 0} bins`);
      console.log('Response:', binResponse.data);
    } else {
      console.log('❌ No storage locations found to test with');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data    });
  }
}

testBinLocationsAPI();
