const axios = require('axios');

async function testUnspscSave() {
  const API_BASE_URL = 'http://localhost:5000/api';
  
  console.log('🧪 Testing UNSPSC code saving...');
  
  // Test data with UNSPSC code
  const testItemData = {
    itemNumber: `TEST-UNSPSC-${Date.now()}`,
    shortDescription: 'Test Item with UNSPSC',
    longDescription: 'This is a test item to verify UNSPSC code saving',
    standardDescription: 'Standard test description',
    manufacturerName: 'Test Manufacturer',
    equipmentCategory: 'TOOLS',
    equipmentSubCategory: 'MISC',
    uom: 'EA',
    criticality: 'LOW',
    stockItem: 'Y',
    plannedStock: 'N',
    // Test both AI-generated UNSPSC (no ID) and manual UNSPSC (with ID)
    unspscCode: '43211508', // Computer printers
    unspscCodeId: null, // AI-generated case
    createdById: '5a772bde-25ca-4ccb-ad50-e11b01899a87'
  };
  
  try {
    console.log('📤 Sending test item data:', testItemData);
    
    const response = await axios.post(`${API_BASE_URL}/ultra-simple-item-create`, testItemData);
    
    if (response.data && response.data.success) {
      console.log('✅ Item created successfully!');
      console.log('📋 Created item data:', response.data.result);
      
      // Verify the UNSPSC code was saved
      if (response.data.result.unspscCode === testItemData.unspscCode) {
        console.log('✅ UNSPSC code saved correctly:', response.data.result.unspscCode);
      } else {
        console.log('❌ UNSPSC code not saved correctly');
        console.log('Expected:', testItemData.unspscCode);
        console.log('Got:', response.data.result.unspscCode);
      }
    } else {
      console.log('❌ Failed to create item:', response.data);
    }
  } catch (error) {
    console.error('❌ Error testing UNSPSC save:', error.response?.data || error.message);
  }
}

// Test with UNSPSC ID (manual selection case)
async function testUnspscSaveWithId() {
  const API_BASE_URL = 'http://localhost:5000/api';
  
  console.log('\n🧪 Testing UNSPSC code saving with ID...');
  
  // First, get a real UNSPSC code with ID from the database
  try {
    const searchResponse = await axios.post(`${API_BASE_URL}/enhanced-unspsc/search`, {
      query: 'computer printer'
    });
    
    if (searchResponse.data && searchResponse.data.success && searchResponse.data.data.length > 0) {
      const unspscResult = searchResponse.data.data[0];
      console.log('📝 Found UNSPSC:', unspscResult);
      
      const testItemData = {
        itemNumber: `TEST-UNSPSC-ID-${Date.now()}`,
        shortDescription: 'Test Item with UNSPSC ID',
        longDescription: 'This is a test item to verify UNSPSC code saving with ID',
        standardDescription: 'Standard test description with ID',
        manufacturerName: 'Test Manufacturer',
        equipmentCategory: 'TOOLS',
        equipmentSubCategory: 'MISC',
        uom: 'EA',
        criticality: 'LOW',
        stockItem: 'Y',
        plannedStock: 'N',
        unspscCode: unspscResult.code,
        unspscCodeId: unspscResult.id,
        createdById: '5a772bde-25ca-4ccb-ad50-e11b01899a87'
      };
      
      console.log('📤 Sending test item data with ID:', testItemData);
      
      const response = await axios.post(`${API_BASE_URL}/ultra-simple-item-create`, testItemData);
      
      if (response.data && response.data.success) {
        console.log('✅ Item with UNSPSC ID created successfully!');
        console.log('📋 Created item data:', response.data.result);
        
        // Verify both UNSPSC code and ID were saved
        if (response.data.result.unspscCode === testItemData.unspscCode) {
          console.log('✅ UNSPSC code saved correctly:', response.data.result.unspscCode);
        }
        if (response.data.result.unspscCodeId === testItemData.unspscCodeId) {
          console.log('✅ UNSPSC ID saved correctly:', response.data.result.unspscCodeId);
        }
      } else {
        console.log('❌ Failed to create item with ID:', response.data);
      }
    }
  } catch (error) {
    console.error('❌ Error testing UNSPSC save with ID:', error.response?.data || error.message);
  }
}

// Run tests
testUnspscSave().then(() => {
  return testUnspscSaveWithId();
}).then(() => {
  console.log('\n🎯 UNSPSC save tests completed!');
});
