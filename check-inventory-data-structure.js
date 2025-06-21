const axios = require('axios');

async function testInventoryDataStructure() {
  console.log('Testing Inventory Data Structure...');
  
  try {
    // Test simple inventory route
    console.log('\n1. Testing /simple-inventory route:');
    const inventoryResponse = await axios.get('http://localhost:8888/api/simple-inventory');
    
    if (inventoryResponse.data.success) {
      console.log(`✅ Found ${inventoryResponse.data.count} inventory items`);
      
      if (inventoryResponse.data.data.length > 0) {
        const firstItem = inventoryResponse.data.data[0];
        console.log('\nFirst Inventory Item Data Structure:');
        console.log(JSON.stringify(firstItem, null, 2));
        
        // Check for important fields
        console.log('\nChecking key fields:');
        console.log(`- id: ${firstItem.id !== undefined ? '✅ exists' : '❌ missing'}`);
        console.log(`- inventoryNumber: ${firstItem.inventoryNumber !== undefined ? '✅ exists' : '❌ missing'}`);
        console.log(`- physicalBalance: ${firstItem.physicalBalance !== undefined ? '✅ exists' : '❌ missing'}`);
        console.log(`- unitPrice: ${firstItem.unitPrice !== undefined ? '✅ exists' : '❌ missing'}`);
        console.log(`- itemMasterId: ${firstItem.itemMasterId !== undefined ? '✅ exists' : '❌ missing'}`);
        console.log(`- itemNumber: ${firstItem.itemNumber !== undefined ? '✅ exists' : '❌ missing'}`);
        console.log(`- shortDescription: ${firstItem.shortDescription !== undefined ? '✅ exists' : '❌ missing'}`);
        console.log(`- warehouse: ${firstItem.warehouse !== undefined ? '✅ exists' : '❌ missing'}`);
        console.log(`- storageLocation: ${firstItem.storageLocation !== undefined ? '✅ exists' : '❌ missing'}`);
        console.log(`- binLocation: ${firstItem.binLocation !== undefined ? '✅ exists' : '❌ missing'}`);
      }
    } else {
      console.log('❌ Failed to fetch inventory items');
    }
    
  } catch (error) {
    console.error('Error during testing:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testInventoryDataStructure();
