// Routes for item history and pricing
const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { getItemPriceHistory } = require('../../controllers/itemHistoryController');

// Get price history for an item
router.get('/:itemId', protect, getItemPriceHistory);

module.exports = router;
