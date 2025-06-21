// Script to validate the inventory authentication fix
const axios = require('axios');
const { API_BASE_URL } = require('./frontend/src/config/serverApiConfig');

// Get a valid auth token from your localStorage (you'll need to be logged in)
// Replace this with a valid token from your browser localStorage
const AUTH_TOKEN = process.argv[2] || 'YOUR_VALID_AUTH_TOKEN_HERE';

if (AUTH_TOKEN === 'YOUR_VALID_AUTH_TOKEN_HERE') {
  console.error('Please provide a valid auth token as a command line argument:');
  console.error('node validate-inventory-auth-fix.js YOUR_AUTH_TOKEN');
  process.exit(1);
}

// A valid item master ID from your database
// Replace this with a valid item master ID from your database
const ITEM_MASTER_ID = process.argv[3] || 'YOUR_VALID_ITEM_MASTER_ID_HERE';

if (ITEM_MASTER_ID === 'YOUR_VALID_ITEM_MASTER_ID_HERE') {
  console.error('Please provide a valid item master ID as a command line argument:');
  console.error('node validate-inventory-auth-fix.js YOUR_AUTH_TOKEN YOUR_ITEM_MASTER_ID');
  process.exit(1);
}

async function validateInventoryAuthFix() {
  try {
    console.log('Testing inventory creation with authentication...');
    
    // Configure axios with auth headers
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.headers.common['Authorization'] = `Bearer ${AUTH_TOKEN}`;
    axios.defaults.headers.common['x-auth-token'] = AUTH_TOKEN;
    
    // Create test inventory data
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
    
    console.log('Sending inventory data:', inventoryData);
    
    // Attempt to create inventory
    const response = await axios.post('inventory', inventoryData);
    
    console.log('Inventory creation response:', response.data);
    
    if (response.data.success) {
      console.log('✅ SUCCESS: Inventory created successfully with ID:', response.data.data.id);
      return true;
    } else {
      console.log('❌ FAILURE: Inventory creation failed');
      return false;
    }
  } catch (error) {
    console.error('Error during test:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

// Run the validation
validateInventoryAuthFix()
  .then(success => {
    if (success) {
      console.log('Authentication fix validation completed successfully!');
      process.exit(0);
    } else {
      console.error('Authentication fix validation failed.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Validation script error:', error);
    process.exit(1);
  });
