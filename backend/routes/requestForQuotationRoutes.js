const express = require('express');
const router = express.Router();
const { 
  createRFQ,
  getRFQs,
  getRFQ,
  updateRFQ,
  sendRFQ,
  recordSupplierQuote,
  selectQuotes,
  cancelRFQ,
  getRFQsByPR,
  createRFQFromPR
} = require('../controllers/requestForQuotationController');

// Import supplier approval functions from rfqController
const {
  supplierApproveRFQ,
  supplierRejectRFQ
} = require('../controllers/rfqController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// RFQ routes
router.route('/')
  .post(createRFQ)
  .get(getRFQs);

router.route('/:id')
  .get(getRFQ)
  .put(updateRFQ);

router.route('/:id/send')
  .put(sendRFQ);

router.route('/:id/quote')
  .post(recordSupplierQuote);

router.route('/:id/select-quotes')
  .put(selectQuotes);

router.route('/:id/cancel')
  .put(cancelRFQ);

// PR-related RFQ routes
router.route('/by-pr/:prId')
  .get(getRFQsByPR);

router.route('/from-pr/:prId')
  .post(createRFQFromPR);

// Supplier approval routes
router.route('/:id/supplier-approve')
  .post(supplierApproveRFQ);

router.route('/:id/supplier-reject')
  .post(supplierRejectRFQ);

module.exports = router;
