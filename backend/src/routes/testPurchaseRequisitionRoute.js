const express = require('express');
const router = express.Router();
const { readPurchaseRequisitions } = require('../../controllers/appControllers/procurementControllers/purchaseRequisitionController/read');

// Test route to get purchase requisition by id and return JSON response
router.get('/test-pr/:id', async (req, res) => {
  // Call the existing controller method
  await readPurchaseRequisitions(req, res);
});

module.exports = router;
