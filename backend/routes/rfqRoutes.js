const express = require('express');
const router = express.Router();
const {
  createRFQ,
  getRFQs,
  getRFQ
} = require('../controllers/rfqController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// RFQ routes
router.route('/')
  .post(createRFQ)
  .get(getRFQs);

router.route('/:id')
  .get(getRFQ);

module.exports = router;
