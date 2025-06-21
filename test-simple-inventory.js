// Simple test to see if inventory routes work without auth middleware
const express = require('express');
const app = express();

// Add basic middleware
app.use(express.json());

// Import inventory controller
const {
  createInventory,
  getInventoryItems,
  getInventoryItem,
  updateInventoryItem,
  deleteInventory
} = require('./backend/controllers/inventoryController');

// Test route without auth middleware
app.get('/api/inventory', async (req, res) => {
  try {
    console.log('Testing inventory route without auth...');
    res.json({ message: 'Inventory route accessible', status: 'success' });
  } catch (error) {
    console.error('Error in test route:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test with actual controller function
app.get('/api/inventory-test', async (req, res) => {
  try {
    console.log('Testing with actual getInventoryItems function...');
    // Mock req.user for the test
    req.user = { id: 1 };
    await getInventoryItems(req, res);
  } catch (error) {
    console.error('Error in controller test:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(7777, () => {
  console.log('Simple test server running on port 7777');
});
