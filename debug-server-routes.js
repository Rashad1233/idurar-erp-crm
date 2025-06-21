const express = require('express');
const app = express();

// Add middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} - Headers:`, JSON.stringify(req.headers, null, 2));
  next();
});

// Import and use inventory routes
const inventoryRoutes = require('./backend/routes/inventoryRoutes');
app.use('/api/inventory', inventoryRoutes);

// Catch-all route to see what routes are not being matched
app.use('*', (req, res) => {
  console.log(`❌ Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    url: req.originalUrl,
    availableRoutes: 'Check console output'
  });
});

const PORT = 8889; // Use different port to avoid conflict

app.listen(PORT, () => {
  console.log(`🚀 Debug server running on port ${PORT}`);
  console.log('📋 Testing inventory routes...');
  
  // Log all registered routes
  if (app._router && app._router.stack) {
    console.log('Registered routes:');
    app._router.stack.forEach((layer, i) => {
      if (layer.route) {
        console.log(`  ${Object.keys(layer.route.methods).join(',').toUpperCase()} ${layer.route.path}`);
      } else if (layer.name === 'router') {
        console.log(`  Router middleware - regexp: ${layer.regexp}`);
        if (layer.handle && layer.handle.stack) {
          layer.handle.stack.forEach((sublayer, j) => {
            if (sublayer.route) {
              console.log(`    ${Object.keys(sublayer.route.methods).join(',').toUpperCase()} ${sublayer.route.path}`);
            }
          });
        }
      }
    });
  }
});
