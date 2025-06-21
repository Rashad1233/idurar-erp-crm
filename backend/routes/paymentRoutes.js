const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Temporary handlers until we implement the full functionality
router.get('/list', protect, (req, res) => {
  res.json({
    success: true,
    result: [],
    message: 'Successfully retrieved payments'
  });
});

router.get('/summary', protect, (req, res) => {
  // Return empty summary data
  res.json({
    success: true,
    result: {
      total: 0,
      received: 0,
      pending: 0,
      currency: req.query.currency || 'USD'
    }
  });
});

module.exports = router;
