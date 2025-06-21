// Debug script to identify inventory creation validation issues
const axios = require('axios');
const { API_BASE_URL } = require('./frontend/src/config/serverApiConfig');

// Get auth token from command line args
const AUTH_TOKEN = process.argv[2];
if (!AUTH_TOKEN) {
  console.error('Please provide an auth token as a command line argument');
  process.exit(1);
}

// Item master ID to use (optional 3rd argument)
const ITEM_MASTER_ID = process.argv[3] || "f6b28980-7a07-4315-99f9-5b3e8c051ae3";

async function validateInventoryCreation() {
  try {
    console.log('\n===== INVENTORY CREATION VALIDATOR =====');
    console.log('API Base URL:', API_BASE_URL);
    
    // Set up axios with auth headers
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.headers.common['Authorization'] = `Bearer ${AUTH_TOKEN}`;
    
    // Step 1: Verify authentication and get user info
    console.log('\n--- Step 1: Verifying Authentication & User Info ---');
    let userId = null;
    try {
      const authResponse = await axios.get('auth/profile');
      userId = authResponse.data.id;
      console.log('✅ Authentication successful!');
      console.log('User ID:', userId);
      console.log('User details:', JSON.stringify(authResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Authentication failed!');
      if (error.response) {
        console.error(`Status: ${error.response.status} - ${error.response.statusText}`);
        console.error('Response:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('Error:', error.message);
      }
      process.exit(1);
    }
    
    // Step 2: Verify Item Master exists and retrieve its details
    console.log('\n--- Step 2: Verifying Item Master ---');
    let itemMaster = null;
    try {
      const itemResponse = await axios.get(`inventory/item-master/${ITEM_MASTER_ID}`);
      itemMaster = itemResponse.data.data;
      console.log('✅ Item master found!');
      console.log('Item details:', JSON.stringify(itemResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Item master verification failed!');
      if (error.response) {
        console.error(`Status: ${error.response.status} - ${error.response.statusText}`);
        console.error('Response:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('Error:', error.message);
      }
      process.exit(1);
    }
    
    // Step 3: Test progressive data sets with different field combinations
    console.log('\n--- Step 3: Testing Inventory Creation With Different Field Sets ---');
    
    const testCases = [
      {
        name: "Minimal Required Fields",
        data: {
          itemMasterId: ITEM_MASTER_ID,
          unitPrice: 15.99,
        }
      },
      {
        name: "Basic Fields",
        data: {
          itemMasterId: ITEM_MASTER_ID,
          unitPrice: 15.99,
          physicalBalance: 10,
          condition: 'A',
        }
      },
      {
        name: "All Standard Fields",
        data: {
          itemMasterId: ITEM_MASTER_ID,
          unitPrice: 15.99,
          physicalBalance: 10,
          condition: 'A',
          minimumLevel: 5,
          maximumLevel: 20,
          storageLocationId: null, // This might need a valid ID
          binLocation: 'A1-B2',
          warehouse: 'Main Warehouse',
          serialNumber: 'SN12345',
        }
      },
      {
        name: "With Form Fields (Including Non-DB Fields)",
        data: {
          itemMasterId: ITEM_MASTER_ID,
          unitPrice: 15.99,
          physicalBalance: 10,
          condition: 'A',
          minimumLevel: 5,
          maximumLevel: 20,
          shortDescription: itemMaster?.shortDescription || 'Test Item',
          criticality: itemMaster?.criticality || 'MEDIUM',
          unspscCode: itemMaster?.unspscCode || '00000000',
          uom: itemMaster?.uom || 'EA',
          manufacturerName: itemMaster?.manufacturerName || 'Test Manufacturer',
          manufacturerPartNumber: itemMaster?.manufacturerPartNumber || 'TP-123',
        }
      },
      {
        name: "With Explicit lastUpdatedById",
        data: {
          itemMasterId: ITEM_MASTER_ID,
          unitPrice: 15.99,
          lastUpdatedById: userId
        }
      }
    ];
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\nTest Case ${i+1}: ${testCase.name}`);
      console.log('Sending data:', JSON.stringify(testCase.data, null, 2));
      
      try {
        const response = await axios.post('inventory', testCase.data);
        console.log(`✅ SUCCESS! Status: ${response.status}`);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        // If we succeed, no need to try the other test cases
        console.log('\n===== SUCCESS FOUND! =====');
        console.log(`The issue was resolved with test case "${testCase.name}"`);
        console.log('Required fields appear to be:', Object.keys(testCase.data).join(', '));
        return;
      } catch (error) {
        console.error(`❌ FAILED! Status: ${error.response?.status || 'Unknown'}`);
        if (error.response) {
          console.error('Response:', JSON.stringify(error.response.data, null, 2));
        } else {
          console.error('Error:', error.message);
        }
      }
    }
    
    console.log('\n===== All Test Cases Failed =====');
    console.log('The issue may be more complex than just missing fields.');
    console.log('Check server logs for more details or try examining the database schema.');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the validation script
validateInventoryCreation();
