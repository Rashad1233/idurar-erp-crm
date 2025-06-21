const axios = require('axios');

async function verifyInventoryItemMasterFixes() {
  console.log('Verifying Inventory ItemMaster Data Display Fixes...');
  
  try {
    // Test simple inventory route with fixes
    console.log('\n1. Testing /simple-inventory route with ItemMaster fixes:');
    const inventoryResponse = await axios.get('http://localhost:8888/api/simple-inventory');
    
    if (inventoryResponse.data.success) {
      console.log(`✅ Found ${inventoryResponse.data.count} inventory items`);
      
      if (inventoryResponse.data.data.length > 0) {
        const firstItem = inventoryResponse.data.data[0];
        console.log('\nFirst Inventory Item Data Structure:');
        console.log(JSON.stringify(firstItem, null, 2));
        
        // Check for important fields
        console.log('\nChecking ItemMaster fields:');
        
        // Check itemMaster object
        if (firstItem.itemMaster) {
          console.log('✅ itemMaster object exists');
          console.log(`- itemNumber: ${firstItem.itemMaster.itemNumber !== undefined ? '✅ exists' : '❌ missing'}`);
          console.log(`- shortDescription: ${firstItem.itemMaster.shortDescription !== undefined ? '✅ exists' : '❌ missing'}`);
          
          // Check UNSPSC
          if (firstItem.itemMaster.unspsc) {
            console.log('✅ unspsc object exists');
            console.log(`- code: ${firstItem.itemMaster.unspsc.code !== undefined ? '✅ exists' : '❌ missing'}`);
            console.log(`- title: ${firstItem.itemMaster.unspsc.title !== undefined ? '✅ exists' : '❌ missing'}`);
          } else {
            console.log('❌ unspsc object is missing');
          }
        } else {
          console.log('❌ itemMaster object is missing');
        }
      }
    } else {
      console.log('❌ Failed to fetch inventory items');
    }
    
    console.log('\n✅ Verification complete. Please restart your backend server to apply these changes.');
    console.log('After restarting, check the inventory page in the frontend to verify:');
    console.log('1. Item Numbers are displayed');
    console.log('2. UNSPSC Codes are displayed');
    
  } catch (error) {
    console.error('Error during verification:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

verifyInventoryItemMasterFixes();
