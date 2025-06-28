const axios = require('axios');

async function debugRFQAPI() {
  console.log('🔍 Starting RFQ API Debug...');
  
  const BASE_URL = 'http://localhost:8888';
  
  try {
    // Test 1: Check if server is responding
    console.log('\n1. Testing server health...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/api/health`);
      console.log('✅ Server health:', healthResponse.status);
    } catch (error) {
      console.log('⚠️  Health endpoint not available, trying root...');
      try {
        const rootResponse = await axios.get(`${BASE_URL}/`);
        console.log('✅ Server root:', rootResponse.status);
      } catch (rootError) {
        console.log('❌ Server not responding:', rootError.code);
      }
    }
    
    // Test 2: Test RFQ endpoint without auth
    console.log('\n2. Testing RFQ endpoint (no auth)...');
    try {
      const rfqResponse = await axios.get(`${BASE_URL}/api/procurement/rfq`);
      console.log('✅ RFQ Response:', rfqResponse.status, rfqResponse.data);
    } catch (error) {
      console.log('❌ RFQ Error Details:');
      console.log('  Status Code:', error.response?.status);
      console.log('  Status Text:', error.response?.statusText);
      console.log('  Error Message:', error.response?.data?.message);
      console.log('  Error Details:', error.response?.data?.error);
      console.log('  Full Response:', JSON.stringify(error.response?.data, null, 2));
      
      if (error.response?.status === 401) {
        console.log('  → Authentication required (expected)');
      } else if (error.response?.status === 404) {
        console.log('  → Route not found - checking route configuration');
      } else if (error.response?.status === 500) {
        console.log('  → Server error - checking controller implementation');
      }
    }
    
    // Test 3: Test with mock authentication
    console.log('\n3. Testing with mock auth token...');
    try {
      const authResponse = await axios.get(`${BASE_URL}/api/procurement/rfq`, {
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Auth RFQ Response:', authResponse.status, authResponse.data);
    } catch (error) {
      console.log('❌ Auth RFQ Error:');
      console.log('  Status:', error.response?.status);
      console.log('  Message:', error.response?.data?.message);
      console.log('  Error:', error.response?.data?.error);
    }
    
    // Test 4: Check available routes
    console.log('\n4. Testing available API routes...');
    const testRoutes = [
      '/api',
      '/api/procurement',
      '/api/app/procurement/rfq'
    ];
    
    for (const route of testRoutes) {
      try {
        const routeResponse = await axios.get(`${BASE_URL}${route}`);
        console.log(`✅ ${route}:`, routeResponse.status);
      } catch (error) {
        console.log(`❌ ${route}:`, error.response?.status, error.response?.data?.message || error.code);
      }
    }
    
  } catch (error) {
    console.error('❌ Fatal error in RFQ debug:', error.message);
  }
}

debugRFQAPI();