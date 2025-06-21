// Debug script to test server route registration
const express = require('express');
const app = express();

// Add basic middleware
app.use(express.json());

// Try to load and register inventory routes
try {
  console.log('Loading inventory routes...');
  const inventoryRoutes = require('./routes/inventoryRoutes');
  console.log('✅ Inventory routes loaded successfully');
  
  // Register the routes
  app.use('/api/inventory', inventoryRoutes);
  console.log('✅ Inventory routes registered successfully');
  
  // List all registered routes
  console.log('\nRegistered routes:');
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      console.log(`${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      console.log(`Router middleware: ${middleware.regexp}`);
    }
  });
  
  // Start a temporary server to test
  const server = app.listen(9999, () => {
    console.log('\n✅ Test server started on port 9999');
    console.log('Testing route accessibility...');
    
    // Test the routes
    const http = require('http');
    
    // Test basic route
    const req = http.request({
      hostname: 'localhost',
      port: 9999,
      path: '/api/inventory',
      method: 'GET'
    }, (res) => {
      console.log(`GET /api/inventory - Status: ${res.statusCode}`);
      server.close();
    });
    
    req.on('error', (err) => {
      console.error('Request error:', err.message);
      server.close();
    });
    
    req.end();
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
