// Simple test script to verify delete functionality works
console.log('🧪 Testing inventory delete functionality...');

// Function to test delete API call directly
async function testDeleteInventory(itemId) {
  try {
    console.log(`Testing delete for item ID: ${itemId}`);
    
    const response = await fetch(`http://localhost:8888/api/inventory/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // You'll need to replace this with actual token
      }
    });

    console.log('Response status:', response.status);
    console.log('Response statusText:', response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Delete successful:', data);
      return { success: true, data };
    } else {
      const errorData = await response.text();
      console.log('❌ Delete failed:', errorData);
      return { success: false, error: errorData, status: response.status };
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return { success: false, error: error.message };
  }
}

// Test function for browser console
window.testDeleteInventory = testDeleteInventory;

console.log('✅ Delete test function loaded. Use: testDeleteInventory("ITEM_ID")');
console.log('📋 Available inventory items and their IDs:');

// Function to list all inventory items for testing
async function listInventoryItems() {
  try {
    const response = await fetch('http://localhost:8888/api/inventory', {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.table(data.data?.map(item => ({
        id: item.id,
        inventoryNumber: item.inventoryNumber,
        description: item.itemMaster?.shortDescription,
        physicalBalance: item.physicalBalance
      })));
    }
  } catch (error) {
    console.error('Error fetching inventory:', error);
  }
}

window.listInventoryItems = listInventoryItems;

console.log('Use listInventoryItems() to see all items first, then use testDeleteInventory(id) to test delete');
