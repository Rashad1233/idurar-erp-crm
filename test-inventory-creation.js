// Test script for inventory creation
const axios = require('axios');
const { API_BASE_URL } = require('./frontend/src/config/serverApiConfig');

// You need to provide these when running the script
const AUTH_TOKEN = process.argv[2];
const ITEM_MASTER_ID = process.argv[3];

if (!AUTH_TOKEN || !ITEM_MASTER_ID) {
  console.error('Usage: node test-inventory-creation.js YOUR_AUTH_TOKEN ITEM_MASTER_ID');
  process.exit(1);
}

async function testInventoryCreation() {
  try {
    console.log('Testing inventory creation...');
    
    // Configure axios with auth headers
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.headers.common['Authorization'] = `Bearer ${AUTH_TOKEN}`;
    
    // Create test inventory data - don't include inventoryNumber
    const inventoryData = {
      itemMasterId: ITEM_MASTER_ID,
      unitPrice: 15.99,
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
    
    console.log('Sending inventory data:', JSON.stringify(inventoryData, null, 2));
    
    // Attempt to create inventory
    const response = await axios.post('inventory', inventoryData);
    
    console.log('API Response:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('✅ SUCCESS: Inventory created successfully with ID:', response.data.data.id);
      console.log('Generated Inventory Number:', response.data.data.inventoryNumber);
      return true;
    } else {
      console.log('❌ FAILURE: Inventory creation failed');
      return false;
    }
  } catch (error) {
    console.error('Error during test:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Run the test
testInventoryCreation()
  .then(success => {
    if (success) {
      console.log('Test completed successfully!');
      process.exit(0);
    } else {
      console.error('Test failed.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Test script error:', error);
    process.exit(1);
  });
