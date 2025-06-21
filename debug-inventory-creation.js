// Debug script for inventory creation issue
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

async function debugInventoryCreation() {
  try {
    console.log('===== Starting Debug Session =====');
    console.log('API Base URL:', API_BASE_URL);
    console.log('Using token:', AUTH_TOKEN.substring(0, 10) + '...');
    
    // Set up axios with auth headers
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.headers.common['Authorization'] = `Bearer ${AUTH_TOKEN}`;
    axios.defaults.headers.common['x-auth-token'] = AUTH_TOKEN;
    
    // Step 1: Check authentication by getting current user
    console.log('\n--- Step 1: Verifying Authentication ---');
    try {
      const authResponse = await axios.get('auth/profile');
      console.log('Authentication successful!');
      console.log('Current user:', authResponse.data);
    } catch (error) {
      console.error('Authentication failed!');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('Error:', error.message);
      }
      process.exit(1);
    }
    
    // Step 2: Verify item master exists
    console.log('\n--- Step 2: Verifying Item Master ---');
    try {
      const itemMasterResponse = await axios.get(`inventory/item-master/${ITEM_MASTER_ID}`);
      console.log('Item master found!');
      console.log('Item details:', JSON.stringify(itemMasterResponse.data, null, 2));
    } catch (error) {
      console.error('Item master verification failed!');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('Error:', error.message);
      }
      process.exit(1);
    }
    
    // Step 3: Create inventory item
    console.log('\n--- Step 3: Creating Inventory Item ---');
    const inventoryData = {
      itemMasterId: ITEM_MASTER_ID,
      unitPrice: 10,
      physicalBalance: 10,
      condition: 'B',
      minimumLevel: 5,
      maximumLevel: 100,
      shortDescription: 'Default Description',
      longDescription: '',
      criticality: 'MEDIUM',
      unspscCode: '00000000',
      manufacturerName: 'Not specified',
      manufacturerPartNumber: 'Not specified',
      uom: 'EA'
    };
    
    try {
      console.log('Sending inventory data:', JSON.stringify(inventoryData, null, 2));
      const inventoryResponse = await axios.post('inventory', inventoryData);
      console.log('Inventory creation successful!');
      console.log('Response:', JSON.stringify(inventoryResponse.data, null, 2));
    } catch (error) {
      console.error('Inventory creation failed!');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('Error:', error.message);
      }
    }
    
    console.log('\n===== Debug Session Complete =====');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the debug script
debugInventoryCreation();
