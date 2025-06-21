const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createItemMaster,
  getItemMasters,
  getItemsPendingReview,
  reviewItemMaster,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  recreateFromNotification,
  searchItemMasters
} = require('../controllers/minimalItemController');

// Enhanced search route
router.route('/search')
  .get(protect, searchItemMasters);

// Main items route (for the all items view)
router.route('/')
  .post(protect, createItemMaster)
  .get(protect, getItemMasters);

// Working pending review route
router.route('/pending-review')
  .get(protect, getItemsPendingReview);

// Test route for minimal controller
router.route('/minimal-pending')
  .get(protect, getItemsPendingReview);

// Review/approve item route
router.route('/:id/review')
  .put(protect, reviewItemMaster);

// Notifications routes
router.route('/notifications')
  .get(protect, getNotifications);

router.route('/notifications/mark-all-read')
  .put(protect, markAllNotificationsAsRead);

router.route('/notifications/:id/read')
  .put(protect, markNotificationAsRead);

router.route('/notifications/:id')
  .delete(protect, deleteNotification);

// Recreate item from notification
router.route('/notifications/:notificationId/recreate')
  .post(protect, recreateFromNotification);

module.exports = router;
