/**
 * Debug Authentication Issue
 * This script helps diagnose the authentication problems causing 404 errors
 */

const axios = require('axios');
const API_BASE_URL = 'http://localhost:8888/api';

async function debugAuthIssue() {
  console.log('=== Debug Authentication Issue ===\n');

  // Step 1: Test basic API connectivity
  console.log('Step 1: Testing basic API connectivity...');
  try {
    const response = await axios.get(`${API_BASE_URL}`);
    console.log('✅ Basic API connection successful');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Basic API connection failed');
    console.log('Error:', error.message);
    return;
  }

  // Step 2: Test procurement endpoint without auth (should return 401, not 404)
  console.log('\nStep 2: Testing procurement endpoint without authentication...');
  try {
    const response = await axios.get(`${API_BASE_URL}/procurement/purchase-requisition`);
    console.log('✅ Unexpected success - this should have failed with 401');
    console.log('Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log(`Status: ${error.response.status} ${error.response.statusText}`);
      if (error.response.status === 404) {
        console.log('❌ Getting 404 - this indicates the route is not found!');
        console.log('This suggests the procurement routes are not properly mounted.');
      } else if (error.response.status === 401) {
        console.log('✅ Getting 401 - this is expected, route exists but needs auth');
      }
      console.log('Response data:', error.response.data);
    } else {
      console.log('❌ Network error:', error.message);
    }
  }

  // Step 3: Test with mock authentication
  console.log('\nStep 3: Testing with mock authentication...');
  try {
    const response = await axios.get(`${API_BASE_URL}/procurement/purchase-requisition`, {
      headers: {
        'Authorization': 'Bearer fake-token',
        'x-auth-token': 'fake-token'
      }
    });
    console.log('✅ Unexpected success with fake token');
    console.log('Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log(`Status: ${error.response.status} ${error.response.statusText}`);
      if (error.response.status === 404) {
        console.log('❌ Still getting 404 - route definitely not found');
      } else if (error.response.status === 401) {
        console.log('✅ Getting 401 - route exists, fake token rejected as expected');
      }
      console.log('Response data:', error.response.data);
    }
  }

  // Step 4: List all available routes (if possible)
  console.log('\nStep 4: Testing other API endpoints to verify route structure...');
  
  const testRoutes = [
    '/inventory',
    '/auth',
    '/procurement',
    '/setting'
  ];

  for (const route of testRoutes) {
    try {
      const response = await axios.get(`${API_BASE_URL}${route}`);
      console.log(`✅ ${route}: Success`);
    } catch (error) {
      if (error.response) {
        console.log(`${route}: ${error.response.status} ${error.response.statusText}`);
      } else {
        console.log(`${route}: Network error`);
      }
    }
  }

  console.log('\n=== Debug Complete ===');
  console.log('Summary:');
  console.log('- If getting 404 for procurement routes, the backend routes are not mounted correctly');
  console.log('- If getting 401 for procurement routes, the routes exist but authentication is failing');
  console.log('- Check backend server logs for route registration messages');
}

// Run the debug
debugAuthIssue().catch(console.error);
