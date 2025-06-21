// Test procurement API endpoints after fixing the double /api/ issue
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8888/api';

// Test token - you'll need to replace this with a valid JWT token from login
const TEST_TOKEN = 'YOUR_JWT_TOKEN_HERE';

async function testProcurementEndpoints() {
  console.log('🧪 Testing Procurement API Endpoints...\n');
  
  // Set up axios defaults
  axios.defaults.baseURL = API_BASE_URL;
  axios.defaults.headers.common['Authorization'] = `Bearer ${TEST_TOKEN}`;
  
  const tests = [
    {
      name: 'Get Purchase Requisitions',
      method: 'GET',
      url: '/procurement/purchase-requisition',
      description: 'Should fetch all purchase requisitions for the user'
    },
    {
      name: 'Get Suppliers',
      method: 'GET', 
      url: '/procurement/supplier',
      description: 'Should fetch all suppliers'
    },
    {
      name: 'Get RFQs',
      method: 'GET',
      url: '/procurement/rfq', 
      description: 'Should fetch all RFQs for the user'
    },
    {
      name: 'Get Pending Approvals',
      method: 'GET',
      url: '/procurement/purchase-requisition/pending-approvals',
      description: 'Should fetch pending approvals for current user'
    }
  ];
  
  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}`);
      console.log(`   URL: ${API_BASE_URL}${test.url}`);
      console.log(`   Description: ${test.description}`);
      
      const response = await axios({
        method: test.method,
        url: test.url
      });
      
      console.log(`   ✅ SUCCESS: Status ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2).substring(0, 200)}...`);
      
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.response?.status || 'Network Error'}`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
}

console.log('📝 Instructions:');
console.log('1. Make sure both backend and frontend servers are running');
console.log('2. Login to get a JWT token from the frontend');
console.log('3. Replace TEST_TOKEN above with your actual JWT token');
console.log('4. Run this script: node test-procurement-endpoints.js\n');
console.log('🚀 Starting in 3 seconds...\n');

setTimeout(testProcurementEndpoints, 3000);
