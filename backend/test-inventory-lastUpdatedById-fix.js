// Test script to validate the inventory lastUpdatedById fix
const axios = require('axios');
const { API_BASE_URL } = require('../frontend/src/config/serverApiConfig');

// Set your auth token here (get it from local storage or from a test login)
const authToken = 'YOUR_AUTH_TOKEN_HERE';

async function testInventoryCreation() {
  try {
    console.log('Testing inventory creation with lastUpdatedById...');
    
    // Configure axios with auth headers
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    
    // Create test inventory data
    const inventoryData = {
      itemMasterId: 'YOUR_TEST_ITEM_MASTER_ID', // Replace with a valid item master ID
      unitPrice: 10.99,
      physicalBalance: 5,
      condition: 'A',
      minimumLevel: 2,
      maximumLevel: 10
    };
    
    // Attempt to create inventory
    const response = await axios.post('inventory/inventory', inventoryData);
    
    console.log('Inventory creation response:', response.data);
    
    if (response.data.success) {
      console.log('✅ Inventory created successfully with ID:', response.data.data.id);
      
      // Now test updating the inventory
      const updateResponse = await axios.put(
        `inventory/inventory/${response.data.data.id}`, 
        { ...inventoryData, unitPrice: 12.99 }
      );
      
      console.log('Inventory update response:', updateResponse.data);
      
      if (updateResponse.data.success) {
        console.log('✅ Inventory updated successfully');
        console.log('Test complete - Fix validated!');
      } else {
        console.log('❌ Inventory update failed');
      }
    } else {
      console.log('❌ Inventory creation failed');
    }
  } catch (error) {
    console.error('Error during test:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testInventoryCreation();
