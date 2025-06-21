const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Import working function from minimal controller
const { getItemsPendingReview } = require('../controllers/minimalItemController');

// Import other functions from main controller (commented out for now to avoid issues)
/*
const {
  createItemMaster,
  getItemMasters,
  getItemMaster,
  updateItemMaster,
  deleteItemMaster,
  searchItemMasters
} = require('../controllers/itemMasterController');
*/

// Review workflow routes - WORKING!
router.route('/pending-review')
  .get(protect, getItemsPendingReview);

module.exports = router;
