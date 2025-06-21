const express = require('express');
const app = express();

// Middleware
app.use(express.json());

app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route works' });
});

// Create a simple router similar to inventoryRoutes
const router = express.Router();

router.route('/inventory')
  .get((req, res) => {
    res.json({ message: 'Inventory GET works', items: [] });
  })
  .post((req, res) => {
    res.json({ message: 'Inventory POST works' });
  });

router.route('/inventory/:id')
  .get((req, res) => {
    res.json({ message: 'Inventory GET by ID works', id: req.params.id });
  })
  .put((req, res) => {
    res.json({ message: 'Inventory PUT works', id: req.params.id });
  })
  .delete((req, res) => {
    res.json({ message: 'Inventory DELETE works', id: req.params.id });
  });

// Mount the router
console.log('Mounting router...');
app.use('/api', router);
console.log('Router mounted');

const PORT = 8889;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  
  // Debug: List all routes after server starts
  console.log('Debugging routes after server start...');
  if (app._router && app._router.stack) {
    app._router.stack.forEach((middleware, i) => {
      if (middleware.route) {
        console.log(`Direct route: ${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
      } else if (middleware.name === 'router') {
        console.log(`Router middleware ${i}:`);
        if (middleware.handle && middleware.handle.stack) {
          middleware.handle.stack.forEach((route, j) => {
            if (route.route) {
              console.log(`  ${Object.keys(route.route.methods).join(',').toUpperCase()} ${route.route.path}`);
            }
          });
        }
      }
    });
  } else {
    console.log('No router found');
  }
});
