const axios = require('axios');

async function testItemCreationFix() {
  console.log('=== TESTING ITEM CREATION FIX ===');
  
  const baseURL = 'http://localhost:3001/api';
  
  // First, start with a clean test by checking UNSPSC
  const unspscCode = '40141800';
  
  try {
    // 1. Verify UNSPSC code exists and get correct ID
    console.log(`\n1. Checking UNSPSC code ${unspscCode} in database...`);
    const { UnspscCode } = require('./models/sequelize');
    const dbCode = await UnspscCode.findOne({ where: { code: unspscCode } });
    
    if (!dbCode) {
      console.error('❌ UNSPSC code not found in database!');
      return;
    }
    
    console.log('✅ UNSPSC code found:', {
      id: dbCode.id,
      code: dbCode.code,
      title: dbCode.title,
      level: dbCode.level
    });
    
    // 2. Test item creation API call
    console.log('\n2. Testing item creation API...');
    
    const testItemData = {
      itemNumber: `TEST-${Date.now()}`,
      shortDescription: 'Test Item for Fix Verification',
      longDescription: 'This is a test item to verify the UNSPSC foreign key fix',
      standardDescription: 'Test Item Standard Description',
      manufacturerName: 'Test Manufacturer',
      manufacturerPartNumber: 'TEST-123',
      equipmentCategory: 'INSTRUMENTS',
      equipmentSubCategory: 'LABORATORY',
      unspscCode: unspscCode, // Only send the code, let backend handle ID
      uom: 'EA',
      equipmentTag: 'TEST-TAG',
      serialNumber: 'N',
      criticality: 'NO',
      stockItem: 'Y',
      plannedStock: 'Y'
    };
    
    console.log('Payload:', JSON.stringify(testItemData, null, 2));
    
    try {
      const response = await axios.post(`${baseURL}/inventory/item-master`, testItemData, {
        headers: {
          'Content-Type': 'application/json',
          // Add a simple auth header if needed
          'Authorization': 'Bearer test-token'
        }
      });
      
      console.log('✅ Item creation successful!');
      console.log('Response:', response.data);
      
    } catch (apiError) {
      console.error('❌ API Error:', apiError.response?.data || apiError.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Only run if server is available
console.log('Starting test...');
testItemCreationFix().then(() => {
  console.log('Test completed.');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
