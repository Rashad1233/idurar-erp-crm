const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Temporary handlers until we implement the full functionality
router.get('/list', protect, (req, res) => {
  res.json({
    success: true,
    result: [],
    message: 'Successfully retrieved clients'
  });
});

router.get('/summary', protect, (req, res) => {
  // Return empty summary data
  res.json({
    success: true,
    result: {
      total: 0,
      active: 0,
      inactive: 0
    }
  });
});

module.exports = router;
