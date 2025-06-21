const axios = require('axios');

async function verifyItemMasterUNSPSCFix() {
  console.log('Verifying Item Master UNSPSC Code Fix...');
  
  try {
    // Test simple item-master route
    console.log('\n1. Testing /item-master route:');
    const itemsResponse = await axios.get('http://localhost:8888/api/item-master');
    
    if (itemsResponse.data.success) {
      console.log(`✅ Found ${itemsResponse.data.count} item masters`);
      
      if (itemsResponse.data.data.length > 0) {
        const firstItem = itemsResponse.data.data[0];
        console.log('\nFirst Item Master Data Structure:');
        console.log(JSON.stringify(firstItem, null, 2));
        
        // Check for UNSPSC data
        console.log('\nChecking UNSPSC fields:');
        
        if (firstItem.unspsc) {
          console.log('✅ unspsc object exists');
          console.log(`- code: ${firstItem.unspsc.code !== undefined ? '✅ exists' : '❌ missing'}`);
          console.log(`- title: ${firstItem.unspsc.title !== undefined ? '✅ exists' : '❌ missing'}`);
          console.log(`- description: ${firstItem.unspsc.description !== undefined ? '✅ exists' : '❌ missing'}`);
        } else {
          console.log('❌ unspsc object is missing');
        }
      }
    } else {
      console.log('❌ Failed to fetch item masters');
    }
    
    console.log('\n✅ Verification complete. Please restart your backend server to apply these changes.');
    console.log('After restarting, check the Item Master page in the frontend to verify UNSPSC codes are displayed.');
    
  } catch (error) {
    console.error('Error during verification:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

verifyItemMasterUNSPSCFix();
