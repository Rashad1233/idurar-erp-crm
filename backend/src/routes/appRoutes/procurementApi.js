const express = require('express');
const router = express.Router();

// Import procurement controllers
const rfqController = require('../../controllers/appControllers/procurementControllers/rfqController');
const purchaseRequisitionController = require('../../controllers/appControllers/procurementControllers/purchaseRequisitionController');

// RFQ routes
router.use('/rfq', rfqController);

// Purchase Requisition routes  
router.use('/purchase-requisition', purchaseRequisitionController);

// Add route to get single purchase requisition by id
router.get('/purchase-requisition/:id', purchaseRequisitionController.readPurchaseRequisitions);

module.exports = router;
