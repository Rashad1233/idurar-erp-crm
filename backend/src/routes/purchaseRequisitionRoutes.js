const express = require('express');
const router = express.Router();
const purchaseRequisitionController = require('../../controllers/appControllers/procurementControllers/purchaseRequisitionController');

// GET purchase requisition by id with items
router.get('/:id', purchaseRequisitionController.readPurchaseRequisitions);

module.exports = router;
