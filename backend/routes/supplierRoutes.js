const express = require('express');
const router = express.Router();
const { 
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  approveSupplier,
  rejectSupplier,
  supplierAcceptance,
  getPendingApprovalSuppliers
} = require('../controllers/supplierController');
const { protect } = require('../middleware/authMiddleware');

// Simple supplier list route (bypasses association issues) - NO AUTH REQUIRED
const { getSuppliers: getSimpleSuppliers } = require('../controllers/simpleSupplierController');
router.get('/list', getSimpleSuppliers);

// Simple approved PRs route for RFQ form - NO AUTH REQUIRED
const { getApprovedPRs, getPRDetails } = require('../controllers/simplePRController');
router.get('/approved-prs', getApprovedPRs);
router.get('/pr-details/:id', getPRDetails);

// All other routes are protected
router.use(protect);

// Specific routes must come before parameterized routes
// Approval routes
router.get('/pending/approval', getPendingApprovalSuppliers);
router.post('/:id/approve', approveSupplier);
router.post('/:id/reject', rejectSupplier);

// Supplier routes
router.route('/')
  .post(createSupplier)
  .get(getSuppliers);

router.route('/:id')
  .get(getSupplierById)
  .put(updateSupplier)
  .delete(deleteSupplier);

// Public route for supplier acceptance (no auth required)
// This should be in a separate router or handled differently
// For now, we'll create a separate endpoint

module.exports = router;