const express = require('express');
const router = express.Router();
const { testFunction } = require('../controllers/testController');

// Simple test route without any controller imports
router.get('/simple-test', (req, res) => {
  console.log('🧪 SIMPLE TEST ROUTE CALLED');
  res.status(200).json({
    success: true,
    message: 'Simple test route works',
    timestamp: new Date().toISOString()
  });
});

// Test route with controller import
router.get('/controller-test', testFunction);

module.exports = router;
