const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const { sequelize } = require('../models/sequelize');
const { extendModels } = require('./model-compatibility-layer');
const comprehensiveCompatibility = require('./middleware/comprehensiveCompatibility');

// Extend models with compatibility layer
extendModels(sequelize.models);

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
// app.use(comprehensiveCompatibility); // Add comprehensive compatibility middleware - TEMPORARILY DISABLED

// Import routes
const authRoutes = require('../routes/authRoutes');
// Note: procurement routes (including purchase-requisition) are registered in index.js
// using the /api/procurement prefix

// API routes
app.use('/api/auth', authRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend/dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

module.exports = app;
