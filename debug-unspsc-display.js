// debug-unspsc-display.js
// This script checks the actual retrieved item data and processes it like the frontend would

const axios = require('axios');

// Set up axios with proper configuration
const baseUrl = 'http://localhost:8888/api';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBiNGFmYTNlLTg1ODItNDUyYi04MzNjLWY4YmY2OTVjNGQ2MCIsImlhdCI6MTc0ODI4NDYzNCwiZXhwIjoxNzUwODc2NjM0fQ.U_QNusihE35Gi2fegq3_-6YY149Cty_meUHBO-HRChU';

// Setup headers for auth
const headers = {
  'Authorization': `Bearer ${token}`,
  'x-auth-token': token
};

// Testing the unspsc display
async function testUnspscDisplay() {
  try {
    console.log('🔍 Testing UNSPSC code display for Item Masters');
    
    // Fetch data from API
    const response = await axios.get(`${baseUrl}/item-master`, { headers });
    
    if (!response.data?.success) {
      console.error('❌ API response indicates failure:', response.data);
      return;
    }
    
    const items = response.data.data || [];
    console.log(`✅ Retrieved ${items.length} items from API`);
    
    if (items.length === 0) {
      console.log('No items found to analyze');
      return;
    }
    
    // Display detailed information about the first item's UNSPSC code
    const firstItem = items[0];
    console.log('\nFirst item details:');
    console.log('Item ID:', firstItem.id);
    console.log('Item Number:', firstItem.itemNumber);
    
    // Check all UNSPSC-related fields
    console.log('\nUNSPSC field analysis:');
    
    // Direct fields
    console.log('1. Direct unspscCode field:', firstItem.unspscCode);
    console.log('2. Direct unspscCodeId field:', firstItem.unspscCodeId);
    
    // Check for the nested object structure expected by the frontend
    console.log('\n3. Nested unspsc object:');
    if (firstItem.unspsc) {
      console.log('   ✅ unspsc object exists');
      console.log('   - code:', firstItem.unspsc.code);
      console.log('   - title:', firstItem.unspsc.title);
      console.log('   - description:', firstItem.unspsc.description);
    } else {
      console.log('   ❌ unspsc object is null or undefined');
    }
    
    // Simulate the frontend render logic for UNSPSC code column
    console.log('\n4. Frontend render simulation:');
    const renderUnspsc = (unspsc) => {
      if (unspsc && unspsc.code) {
        return `${unspsc.code} (${unspsc.title || 'No title'})`;
      }
      return '-';
    };
    
    console.log('   Frontend would display:', renderUnspsc(firstItem.unspsc));
    
    // Check all properties on the item to see if there's any other UNSPSC-related data
    console.log('\nAll properties with "unspsc" in the name:');
    Object.keys(firstItem)
      .filter(key => key.toLowerCase().includes('unspsc'))
      .forEach(key => {
        console.log(`   ${key}:`, JSON.stringify(firstItem[key], null, 2));
      });
    
  } catch (error) {
    console.error('❌ Error testing UNSPSC display:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testUnspscDisplay();
