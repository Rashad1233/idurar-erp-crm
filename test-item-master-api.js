// test-item-master-api.js
// Script to test the item-master API endpoint and diagnose issues

const axios = require('axios');

console.log('🔍 Testing Item Master API endpoint');

// Test configuration
const baseUrl = 'http://localhost:8888/api';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBiNGFmYTNlLTg1ODItNDUyYi04MzNjLWY4YmY2OTVjNGQ2MCIsImlhdCI6MTc0ODI4NDYzNCwiZXhwIjoxNzUwODc2NjM0fQ.U_QNusihE35Gi2fegq3_-6YY149Cty_meUHBO-HRChU'; // Use your valid token here

async function testItemMasterEndpoint() {
  console.log('\n1. Testing Item Master endpoint with different URL formats');
  
  // Test different URL formats to see which one works
  const urlVariations = [
    '/inventory/item-master',
    'inventory/item-master',
    '/api/inventory/item-master',
    'api/inventory/item-master',
    '/item-master',
    'item-master'
  ];
  
  for (const urlPath of urlVariations) {
    try {
      console.log(`Testing URL: ${baseUrl}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`);
      
      const response = await axios.get(`${baseUrl}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        }
      });
      
      console.log(`✅ Success with URL: ${urlPath}`);      console.log('Response:', {
        status: response.status,
        success: response.data.success,
        count: response.data.data ? response.data.data.length : 0
      });
      
      // Add detailed information about the first item
      if (response.data.data && response.data.data.length > 0) {
        const firstItem = response.data.data[0];
        console.log('\nFirst item from response:');
        console.log('Item Number:', firstItem.itemNumber);
        console.log('Item Description:', firstItem.shortDescription);
        console.log('UNSPSC data:', JSON.stringify(firstItem.unspsc, null, 2));
        console.log('Raw UNSPSC code:', firstItem.unspscCode);
        console.log('Raw UNSPSC fullCode:', firstItem.unspscFullCode);
        console.log('Raw UNSPSC title:', firstItem.unspscTitle);
        
        // Debug all available fields
        console.log('\nAll fields in the item:');
        Object.keys(firstItem).forEach(key => {
          if (key.toLowerCase().includes('unspsc')) {
            console.log(`${key}: ${JSON.stringify(firstItem[key])}`);
          }
        });
      }
      
      return response.data; // Return on first success
    } catch (error) {
      console.log(`❌ Failed with URL: ${urlPath}`);
      console.log('Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        data: error.response?.data
      });
    }
  }
  
  console.log('\nAll URL variations failed. Checking server routes configuration...');
  return null;
}

async function main() {
  try {
    // Test the item master endpoint
    console.log('\nTesting Item Master API endpoint...');
    const itemMasterResponse = await testItemMasterEndpoint();
    
    // If all tests fail, provide recommendations
    if (!itemMasterResponse) {
      console.log('\n🔧 Recommendations:');
      console.log('1. Check if the server is running correctly');
      console.log('2. Verify the route is properly registered in backend/routes/inventoryRoutes.js');
      console.log('3. Check the controller implementation in backend/controllers/itemMasterController.js');
      console.log('4. Ensure database connection is working properly');
      console.log('5. Look for any validation errors in the request');
    }
    
  } catch (error) {
    console.error('❌ Test failed with an unexpected error:', error.message);
  }
}

main();
