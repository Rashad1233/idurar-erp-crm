/**
 * Script to verify the API response for UNSPSC code
 */
const fetch = require('node-fetch');

async function verifyApi() {
  try {
    console.log('Testing direct API access at http://localhost:8888/api/item-master');
    
    // Make a direct API call without authentication
    const response = await fetch('http://localhost:8888/api/item-master');
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
      console.log('❌ API returned empty or invalid data format');
      console.log('API Response:', data);
      return;
    }
    
    console.log(`✅ API returned ${data.data.length} items`);
    
    // Check the first item for UNSPSC structure
    const firstItem = data.data[0];
    console.log('\nFirst item:');
    console.log('- Item Number:', firstItem.itemNumber);
    console.log('- Description:', firstItem.shortDescription);
    console.log('- Raw unspscCode property:', firstItem.unspscCode);
    console.log('- Raw unspsc object:', JSON.stringify(firstItem.unspsc, null, 2));
    
    if (firstItem.unspsc && firstItem.unspsc.code) {
      console.log('✅ UNSPSC object is correctly structured');
    } else {
      console.log('❌ UNSPSC object is missing or not correctly structured');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyApi();
