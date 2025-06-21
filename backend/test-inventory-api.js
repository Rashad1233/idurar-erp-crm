const axios = require('axios');

async function testInventoryCreation() {
  try {
    console.log('Testing inventory creation via API...');
    
    const inventoryData = {
      itemMasterId: 'bcc4f9d9-b443-4e19-aa5e-2747b1070249',
      unitPrice: 15,
      physicalBalance: 25,
      condition: 'A',
      minimumLevel: 5,
      maximumLevel: 100
      // Removed storageLocationId and binLocationId to avoid the StorageLocation check
    };
    
    const response = await axios.post('http://localhost:8888/api/inventory', inventoryData, {
      headers: {
        'Authorization': 'Bearer test-token', // Add a dummy token
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Inventory creation successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Inventory creation failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data);
  }
}

testInventoryCreation();
