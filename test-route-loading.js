// Simple test to load and verify inventory routes
console.log('Testing inventory routes import...');

try {
  const inventoryRoutes = require('./backend/routes/inventoryRoutes');
  console.log('✅ Inventory routes loaded successfully');
  console.log('Route object type:', typeof inventoryRoutes);
  console.log('Route object keys:', Object.keys(inventoryRoutes));
} catch (error) {
  console.log('❌ Error loading inventory routes:');
  console.log('Error message:', error.message);
  console.log('Error stack:', error.stack);
}

// Test controller loading
try {
  const inventoryController = require('./backend/controllers/inventoryController');
  console.log('✅ Inventory controller loaded successfully');
  console.log('Controller functions:', Object.keys(inventoryController));
} catch (error) {
  console.log('❌ Error loading inventory controller:');
  console.log('Error message:', error.message);
  console.log('Error stack:', error.stack);
}

// Test models loading
try {
  const models = require('./backend/models/sequelize');
  console.log('✅ Models loaded successfully');
  console.log('Available models:', Object.keys(models));
} catch (error) {
  console.log('❌ Error loading models:');
  console.log('Error message:', error.message);
  console.log('Error stack:', error.stack);
}
