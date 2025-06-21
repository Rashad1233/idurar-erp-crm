const express = require('express');
const router = express.Router();
const {
  getSupplierRFQ,
  submitSupplierResponse
} = require('../controllers/supplierPortalController');

// Supplier portal routes (no auth required - uses response token)
router.route('/rfq/:token')
  .get(getSupplierRFQ)
  .post(submitSupplierResponse);

module.exports = router;
