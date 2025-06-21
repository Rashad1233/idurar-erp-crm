// Update index.js to add the simple inventory routes
const simpleInventoryRoutes = require('../routes/simpleInventoryRoutes');
app.use('/api', simpleInventoryRoutes);
console.log('✅ Simple inventory routes registered (highest priority)');

// Register inventory override routes (high priority)
const inventoryOverrideRoutes = require('../routes/inventoryOverrideRoutes');
app.use('/api', inventoryOverrideRoutes);
console.log('✅ Inventory override routes registered (high priority)');
