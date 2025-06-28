const express = require('express');
const router = express.Router();
const { 
  createPurchaseRequisition,
  getPurchaseRequisitions,
  getPurchaseRequisition,
  updatePurchaseRequisition,
  submitPurchaseRequisition,
  approvePurchaseRequisition,
  deletePurchaseRequisition,
  getPendingApprovals
} = require('../controllers/purchaseRequisitionController');
const { protect } = require('../middleware/authMiddleware');
const enhancePRWithUserInfo = require('../middleware/enhancePRWithUserInfo');

// All routes are protected
router.use(protect);

// Apply the enhancePRWithUserInfo middleware to all responses
router.use(enhancePRWithUserInfo);

// Purchase Requisition routes
router.route('/')
  .post(createPurchaseRequisition)
  .get(getPurchaseRequisitions);

router.route('/pending-approvals')
  .get(getPendingApprovals);

router.route('/:id')
  .get(getPurchaseRequisition)
  .put(updatePurchaseRequisition)
  .delete(deletePurchaseRequisition);

router.route('/:id/submit')
  .post(submitPurchaseRequisition)
  .put(submitPurchaseRequisition);  // Support both POST and PUT

router.route('/:id/approve')
  .post(approvePurchaseRequisition)
  .put(approvePurchaseRequisition);  // Support both POST and PUT

module.exports = router;
