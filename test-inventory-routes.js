// Test script to check if inventory routes can be loaded
console.log('Testing inventory routes loading...');

try {
  // Test loading the routes file
  const inventoryRoutes = require('./backend/routes/inventoryRoutes');
  console.log('✅ Inventory routes loaded successfully');
  console.log('Route object type:', typeof inventoryRoutes);
  console.log('Is router function?', typeof inventoryRoutes === 'function');
  
  // Test loading the controller
  const inventoryController = require('./backend/controllers/inventoryController');
  console.log('✅ Inventory controller loaded successfully');
  console.log('Available functions:', Object.keys(inventoryController));
  
  // Check if deleteInventory function exists
  if (inventoryController.deleteInventory) {
    console.log('✅ deleteInventory function is available');
    console.log('deleteInventory type:', typeof inventoryController.deleteInventory);
  } else {
    console.log('❌ deleteInventory function is missing');
  }
  
} catch (error) {
  console.error('❌ Error loading inventory routes:', error.message);
  console.error('Stack:', error.stack);
}
