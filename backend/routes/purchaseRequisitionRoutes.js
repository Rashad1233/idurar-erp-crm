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

// All routes are protected
router.use(protect);

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
  .post(submitPurchaseRequisition);

router.route('/:id/approve')
  .post(approvePurchaseRequisition);

router.route('/:id')
  .get(getPurchaseRequisition)
  .put(updatePurchaseRequisition)
  .delete(deletePurchaseRequisition);

router.route('/:id/submit')
  .put(submitPurchaseRequisition);

router.route('/:id/approve')
  .put(approvePurchaseRequisition);

module.exports = router;
