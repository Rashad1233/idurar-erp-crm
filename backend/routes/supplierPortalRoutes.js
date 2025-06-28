const express = require('express');
const router = express.Router();
const {
  getSupplierRFQ,
  submitSupplierResponse,
  getContractForAcceptance,
  acceptContract,
  rejectContract
} = require('../controllers/supplierPortalController');

// Supplier portal routes (no auth required - uses response token)
router.route('/rfq/:token')
  .get(getSupplierRFQ)
  .post(submitSupplierResponse);

// Contract acceptance routes
router.get('/contract-acceptance/:contractId', getContractForAcceptance);
router.post('/contract-acceptance/:contractId', acceptContract);
router.post('/contract-rejection/:contractId', rejectContract);

module.exports = router;
