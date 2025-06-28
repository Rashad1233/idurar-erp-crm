const express = require('express');
const router = express.Router();
const {
  createRFQ,
  getRFQs,
  getRFQ,
  supplierApproveRFQ,
  supplierRejectRFQ
} = require('../controllers/rfqController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// RFQ routes
router.route('/')
  .post(createRFQ)
  .get(getRFQs);

router.route('/list')
  .get(getRFQs);

router.route('/:id')
  .get(getRFQ);

router.route('/read/:id')
  .get(getRFQ);

router.route('/:id/supplier-approve')
  .post(supplierApproveRFQ);

router.route('/:id/supplier-reject')
  .post(supplierRejectRFQ);

module.exports = router;
