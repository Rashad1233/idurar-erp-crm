// Add this file to /backend/src/index.js to debug API requests and responses

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sequelize } = require('../models/sequelize');
const simpleItemMasterRoutes = require('../routes/simpleItemMasterRoutes');

// Create a simple express app for debugging
const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Register routes
app.use('/api', simpleItemMasterRoutes);

// Start server
const PORT = 8899;
app.listen(PORT, () => {
  console.log(`Debug server running on port ${PORT}`);
  console.log(`Test with http://localhost:${PORT}/api/item-master`);
});

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
