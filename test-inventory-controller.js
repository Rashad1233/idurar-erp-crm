// Direct inventory controller test script
const axios = require('axios');
const { API_BASE_URL } = require('./frontend/src/config/serverApiConfig');

// Get auth token from command line args
const AUTH_TOKEN = process.argv[2];
if (!AUTH_TOKEN) {
  console.error('Please provide an auth token as a command line argument');
  process.exit(1);
}

// Item master ID to use
const ITEM_MASTER_ID = process.argv[3] || "f6b28980-7a07-4315-99f9-5b3e8c051ae3";

async function testInventoryController() {
  try {
    console.log('===== Inventory Controller Direct Test =====');
    
    // Set up axios with auth headers
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.headers.common['Authorization'] = `Bearer ${AUTH_TOKEN}`;
    
    // Create test inventory data with minimal required fields
    const inventoryData = {
      itemMasterId: ITEM_MASTER_ID,
      unitPrice: 10
    };
    
    console.log('Sending minimal inventory data:', JSON.stringify(inventoryData, null, 2));
    
    try {
      const response = await axios.post('inventory', inventoryData);
      console.log('Success! Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Failed with error:');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error(error.message);
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testInventoryController();
