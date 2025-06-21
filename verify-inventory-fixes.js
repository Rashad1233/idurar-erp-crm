const axios = require('axios');

async function verifyInventoryFixes() {
  console.log('Verifying Inventory Data Display Fixes...');
  
  try {
    // Test simple inventory route with fixes
    console.log('\n1. Testing /simple-inventory route with fixes:');
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
        console.log(`- storageLocation: ${firstItem.storageLocation !== undefined ? '✅ exists' : '❌ missing'}`);
        console.log(`- binLocation: ${firstItem.binLocation !== undefined ? '✅ exists' : '❌ missing'}`);
        console.log(`- linePrice: ${firstItem.linePrice !== undefined ? '✅ exists' : '❌ missing'}`);
        
        // Check storage location structure
        if (firstItem.storageLocation && typeof firstItem.storageLocation === 'object') {
          console.log('\nStorage Location Structure:');
          console.log(`- code: ${firstItem.storageLocation.code !== undefined ? '✅ exists' : '❌ missing'}`);
          console.log(`- description: ${firstItem.storageLocation.description !== undefined ? '✅ exists' : '❌ missing'}`);
        }
        
        // Check bin location structure
        if (firstItem.binLocation && typeof firstItem.binLocation === 'object') {
          console.log('\nBin Location Structure:');
          console.log(`- binCode: ${firstItem.binLocation.binCode !== undefined ? '✅ exists' : '❌ missing'}`);
          console.log(`- description: ${firstItem.binLocation.description !== undefined ? '✅ exists' : '❌ missing'}`);
        }
      }
    } else {
      console.log('❌ Failed to fetch inventory items');
    }
    
    console.log('\n✅ Verification complete. Please restart your backend server to apply these changes.');
    console.log('After restarting, check the inventory page in the frontend to verify the data is displayed correctly.');
    
  } catch (error) {
    console.error('Error during verification:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

verifyInventoryFixes();
