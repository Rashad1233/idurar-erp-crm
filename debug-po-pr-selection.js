// Debug script to test PR selection in Purchase Order Create form
const axios = require('axios');

const API_URL = 'http://localhost:8888/api';
const TOKEN = 'your-auth-token-here'; // Replace with actual token

async function debugPRSelection() {
  try {
    console.log('=== Testing PR Data Fetching ===\n');
    
    // 1. Test fetching all PRs
    console.log('1. Fetching all PRs from /api/purchase-requisition...');
    const allPRsResponse = await axios.get(`${API_URL}/purchase-requisition`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'x-auth-token': TOKEN
      }
    });
    
    console.log('Response status:', allPRsResponse.status);
    console.log('Response structure:', {
      success: allPRsResponse.data.success,
      hasResult: !!allPRsResponse.data.result,
      hasData: !!allPRsResponse.data.data,
      resultLength: allPRsResponse.data.result?.length || 0,
      dataLength: allPRsResponse.data.data?.length || 0
    });
    
    const prsData = allPRsResponse.data.result || allPRsResponse.data.data || [];
    console.log('\nTotal PRs fetched:', prsData.length);
    
    if (prsData.length > 0) {
      console.log('\nFirst PR structure:');
      const firstPR = prsData[0];
      console.log({
        id: firstPR.id || firstPR._id,
        prNumber: firstPR.prNumber,
        status: firstPR.status,
        hasItems: !!firstPR.items,
        itemsCount: firstPR.items?.length || 0
      });
      
      if (firstPR.items && firstPR.items.length > 0) {
        console.log('\nFirst item structure:');
        console.log({
          id: firstPR.items[0].id || firstPR.items[0]._id,
          name: firstPR.items[0].name || firstPR.items[0].itemName,
          description: firstPR.items[0].description || firstPR.items[0].itemDescription,
          quantity: firstPR.items[0].quantity,
          estimatedPrice: firstPR.items[0].estimatedPrice,
          unit: firstPR.items[0].unit
        });
      }
    }
    
    // 2. Test if individual PR endpoints exist
    if (prsData.length > 0) {
      const testPRId = prsData[0].id || prsData[0]._id;
      console.log('\n2. Testing individual PR endpoints...');
      
      // Test /read/:id endpoint
      try {
        console.log(`\nTesting /api/purchase-requisition/read/${testPRId}...`);
        const readResponse = await axios.get(`${API_URL}/purchase-requisition/read/${testPRId}`, {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'x-auth-token': TOKEN
          }
        });
        console.log('✓ /read/:id endpoint exists');
      } catch (error) {
        console.log('✗ /read/:id endpoint error:', error.response?.status || error.message);
      }
      
      // Test /:id endpoint
      try {
        console.log(`\nTesting /api/purchase-requisition/${testPRId}...`);
        const directResponse = await axios.get(`${API_URL}/purchase-requisition/${testPRId}`, {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'x-auth-token': TOKEN
          }
        });
        console.log('✓ /:id endpoint exists');
      } catch (error) {
        console.log('✗ /:id endpoint error:', error.response?.status || error.message);
      }
    }
    
    // 3. Check RFQ endpoints
    console.log('\n3. Testing RFQ endpoints...');
    try {
      const rfqResponse = await axios.get(`${API_URL}/rfq/list`, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'x-auth-token': TOKEN
        }
      });
      console.log('✓ RFQ list endpoint works');
      console.log('RFQ count:', rfqResponse.data.result?.length || 0);
    } catch (error) {
      console.log('✗ RFQ list error:', error.response?.status || error.message);
    }
    
  } catch (error) {
    console.error('Error during debug:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Get token from command line or use a default
const token = process.argv[2];
if (token) {
  API_URL = API_URL;
  TOKEN = token;
  console.log('Using provided token\n');
} else {
  console.log('Usage: node debug-po-pr-selection.js <auth-token>\n');
  console.log('No token provided, using default (may fail)\n');
}

debugPRSelection();
