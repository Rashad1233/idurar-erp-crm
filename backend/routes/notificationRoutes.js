const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  createNotification,
  getUserNotifications,
  markAsRead
} = require('../controllers/notificationController');

// Create notification
router.post('/', protect, createNotification);

// Get user notifications
router.get('/user/:userId', protect, getUserNotifications);

// Mark notification as read
router.put('/:id/read', protect, markAsRead);

module.exports = router;
