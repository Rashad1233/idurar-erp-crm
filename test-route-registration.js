const express = require('express');

// Create a test Express app to see what routes get registered
const app = express();

// Import the exact same routes as the server
const inventoryRoutes = require('./backend/routes/inventoryRoutes');

console.log('🔍 Testing Express route registration');
console.log('Inventory routes type:', typeof inventoryRoutes);

// Register the routes exactly like the server does
app.use('/api/inventory', inventoryRoutes);

// Function to extract all registered routes
function getRegisteredRoutes(app) {
  const routes = [];
  
  function extractRoutes(stack, basePath = '') {
    stack.forEach(layer => {
      if (layer.route) {
        // Direct route
        const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
        routes.push({
          path: basePath + layer.route.path,
          methods: methods,
          type: 'route'
        });
      } else if (layer.name === 'router' && layer.handle.stack) {
        // Router middleware
        const routerPath = basePath + (layer.regexp.source.match(/\^\\?\/(.*?)\\\//)?.[1] || '');
        extractRoutes(layer.handle.stack, routerPath);
      }
    });
  }
  
  if (app._router && app._router.stack) {
    extractRoutes(app._router.stack);
  }
  
  return routes;
}

// Get all registered routes
const registeredRoutes = getRegisteredRoutes(app);

console.log('📋 Registered routes:');
registeredRoutes.forEach(route => {
  console.log(`  ${route.methods} ${route.path}`);
});

// Check specifically for DELETE routes
const deleteRoutes = registeredRoutes.filter(route => route.methods.includes('DELETE'));
console.log('\n🗑️ DELETE routes found:');
deleteRoutes.forEach(route => {
  console.log(`  ${route.methods} ${route.path}`);
});

// Check if the specific route we need exists
const inventoryDeleteRoute = registeredRoutes.find(route => 
  route.path.includes('inventory') && 
  route.path.includes(':id') && 
  route.methods.includes('DELETE')
);

if (inventoryDeleteRoute) {
  console.log('\n✅ Found inventory DELETE route:', inventoryDeleteRoute);
} else {
  console.log('\n❌ Inventory DELETE route not found!');
  console.log('Available inventory routes:');
  const inventoryRoutes = registeredRoutes.filter(route => route.path.includes('inventory'));
  inventoryRoutes.forEach(route => {
    console.log(`  ${route.methods} ${route.path}`);
  });
}
