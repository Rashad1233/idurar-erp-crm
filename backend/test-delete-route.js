const express = require('express');
const app = express();

// Add JSON middleware
app.use(express.json());

// Mock auth middleware that just passes through
const mockAuth = (req, res, next) => {
  req.user = { id: 'test-user' };
  next();
};

// Override protect middleware in routes
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  if (id.includes('authMiddleware')) {
    return { protect: mockAuth };
  }
  return originalRequire.apply(this, arguments);
};

try {
  const inventoryRoutes = require('./routes/inventoryRoutes');
  console.log('Inventory routes loaded successfully');
  
  app.use('/api/inventory', inventoryRoutes);
  
  const server = app.listen(8889, () => {
    console.log('Test server running on port 8889');
    
    // Test the DELETE route
    const http = require('http');
    const testId = 'test-inventory-id';
    
    const options = {
      hostname: 'localhost',
      port: 8889,
      path: '/api/inventory/' + testId,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    console.log('Testing DELETE route:', options.path);
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Response status:', res.statusCode);
        console.log('Response:', data);
        server.close();
        process.exit(0);
      });
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error);
      server.close();
      process.exit(1);
    });
    
    req.end();
  });
  
} catch (error) {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
