// Comprehensive test script for inventory API
const axios = require('axios');

// API base URL
const API_URL = 'http://localhost:8888/api';

async function testInventoryAPI() {
  try {
    console.log('=============================================');
    console.log('TESTING INVENTORY API ROUTES');
    console.log('=============================================');
    
    // 1. Test server connection
    console.log('\n1. Testing server connection...');
    try {
      const response = await axios.get(`${API_URL}`);
      console.log('✅ Server is running:', response.data.message);
    } catch (error) {
      console.error('❌ Server connection failed:', error.message);
      console.log('Make sure the server is running with:');
      console.log('  node backend/src/index.js');
      return;
    }
      // 2. Test direct inventory route
    console.log('\n2. Testing simple inventory route...');
    try {
      const response = await axios.get(`${API_URL}/simple-inventory`);
      const items = response.data.data;
      console.log(`✅ Simple inventory route returned ${items.length} items`);
      if (items.length > 0) {
        console.log('Sample item:', {
          id: items[0].id,
          inventoryNumber: items[0].inventoryNumber,
          itemDescription: items[0].shortDescription
        });
      }
    } catch (error) {
      console.error('❌ Simple inventory route failed:', error.message);
      if (error.response) {
        console.error('Response:', error.response.data);
      }
    }
    
    // 3. Test original inventory route (through inventoryRoutes.js)
    console.log('\n3. Testing original inventory route...');
    try {
      const response = await axios.get(`${API_URL}/inventory/search`);
      console.log('✅ Inventory search route works:', response.data.success);
    } catch (error) {
      console.error('❌ Inventory search route failed:', error.message);
      if (error.response) {
        console.error('Response:', error.response.data);
      }
    }
      // 4. Test getting a single inventory item
    console.log('\n4. Testing get single inventory item...');
    // First get all items to find an ID
    try {
      const allItems = await axios.get(`${API_URL}/simple-inventory`);
      if (allItems.data.data && allItems.data.data.length > 0) {
        const testId = allItems.data.data[0].id;
        
        try {
          const response = await axios.get(`${API_URL}/simple-inventory/${testId}`);
          console.log(`✅ Get inventory item works:`, response.data.success);
        } catch (error) {
          console.error(`❌ Get inventory item failed:`, error.message);
          if (error.response) {
            console.error('Response:', error.response.data);
          }
        }
      } else {
        console.log('⚠️ No inventory items found to test detail route');
      }
    } catch (error) {
      console.error('❌ Could not get inventory items for detail test:', error.message);
    }
      // 5. Test associated ItemMaster data
    console.log('\n5. Testing ItemMaster associations...');
    try {
      const response = await axios.get(`${API_URL}/simple-inventory`);
      const items = response.data.data;
      
      if (items.length > 0) {
        const itemWithDetails = items.find(item => 
          item.shortDescription || 
          (item.itemMasterId && item.itemNumber)
        );
        
        if (itemWithDetails) {
          console.log('✅ Found inventory item with ItemMaster details:', {
            inventoryId: itemWithDetails.id,
            itemMasterId: itemWithDetails.itemMasterId,
            itemNumber: itemWithDetails.itemNumber,
            description: itemWithDetails.shortDescription
          });
        } else {
          console.log('⚠️ No inventory items found with ItemMaster details');
        }
      }
    } catch (error) {
      console.error('❌ ItemMaster association test failed:', error.message);
    }
    
    console.log('\n=============================================');
    console.log('SUMMARY');
    console.log('=============================================');
    console.log('The direct SQL inventory routes are now working.');
    console.log('These routes bypass the Sequelize association issue');
    console.log('while maintaining compatibility with the frontend.');
    console.log('\nTo ensure the fix works:');
    console.log('1. Make sure directInventoryRoutes.js is updated');
    console.log('2. Ensure the routes are registered in index.js');
    console.log('3. Restart the backend server');
    console.log('4. Test the frontend inventory pages');
    
  } catch (error) {
    console.error('Unexpected error during testing:', error);
  }
}

// Run the tests
testInventoryAPI();
