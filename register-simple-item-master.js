// Register simple item master routes in the application
const express = require('express');
const app = require('../backend/src/app');

// Log the registration process
console.log('🔍 Registering simple item master routes...');

// Import the simple item master routes
const simpleItemMasterRoutes = require('./backend/routes/simpleItemMasterRoutes');

// Register the routes with the application
app.use('/api', simpleItemMasterRoutes);

console.log('✅ Simple item master routes registered successfully');

// Export the updated app
module.exports = app;
