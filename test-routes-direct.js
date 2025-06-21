const express = require('express');
const app = express();

// Import all routes like the main server
try {
  const inventoryRoutes = require('./backend/routes/inventoryRoutes');
  console.log('✓ Inventory routes imported successfully');
  
  // Register the route
  app.use('/api/inventory', inventoryRoutes);
  console.log('✓ Inventory routes registered');
  
  // Start test server
  const server = app.listen(9999, () => {
    console.log('Test server running on port 9999');
    
    // Test if routes are accessible
    setTimeout(async () => {
      try {
        const response = await fetch('http://localhost:9999/api/inventory');
        console.log('Test route response status:', response.status);
        const text = await response.text();
        console.log('Test route response:', text);
      } catch (error) {
        console.error('Test route error:', error.message);
      }
      server.close();
    }, 1000);
  });
  
} catch (error) {
  console.error('✗ Error:', error.message);
  console.error('Stack:', error.stack);
}
