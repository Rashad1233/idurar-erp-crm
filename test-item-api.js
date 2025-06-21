// Test script to verify item creation API endpoint
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8888';

async function testItemCreation() {
  try {
    console.log('🧪 Testing Item Creation API...');
    
    // Test data
    const itemData = {
      shortDescription: 'Test Item from API',
      longDescription: 'This is a test item created via API',
      standardDescription: 'Standard description for test item',
      manufacturerName: 'Test Manufacturer',
      manufacturerPartNumber: 'TM-API-001',
      equipmentCategory: 'ELECTRONICS',
      equipmentSubCategory: 'COMPONENTS',
      uom: 'EA',
      equipmentTag: 'TEST-TAG',
      serialNumber: 'N',
      criticality: 'LOW',
      stockItem: 'Y',
      plannedStock: 'N',
      unspscCode: '43211501'
    };
    
    console.log('📤 Sending POST request to /api/item');
    console.log('Data:', JSON.stringify(itemData, null, 2));
    
    const response = await axios.post(`${API_BASE_URL}/api/item`, itemData, {
      headers: {
        'Content-Type': 'application/json',
        // Note: No authentication - this will test if auth is required
      }
    });
    
    console.log('✅ Success! Response:', response.data);
    
  } catch (error) {
    console.log('❌ Error response:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message);
    console.log('Full error:', error.response?.data);
    
    if (error.response?.status === 400 && error.response?.data?.message === 'User authentication required') {
      console.log('🔐 Authentication is required - this is expected');
    } else if (error.response?.status === 400 && error.response?.data?.message === 'Unit of Measure (UOM) is required') {
      console.log('❌ UOM field mapping issue still exists');
    }
  }
}

testItemCreation();
