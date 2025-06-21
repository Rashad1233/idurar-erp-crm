const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const settingsController = require('../controllers/settingsController');

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes with authentication and error handling
router.get('/listAll', protect, asyncHandler(settingsController.listAll));
router.get('/:key', protect, asyncHandler(settingsController.get));

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Settings route error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An error occurred while processing the request',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

module.exports = router;
