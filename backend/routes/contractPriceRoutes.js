// API endpoint for getting contract prices for items
const express = require('express');
const router = express.Router();
const { 
  getItemContractPrices,
  getSupplierContractPrices,
  getActiveContractsForSupplier,
  getContractDetails
} = require('../controllers/contractPriceController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Get contract prices for an item across all suppliers
router.get('/item/:itemId/prices', getItemContractPrices);

// Get contract prices for all items from a specific supplier
router.get('/supplier/:supplierId/prices', getSupplierContractPrices);

// Get all active contracts for a supplier
router.get('/supplier/:supplierId/contracts', getActiveContractsForSupplier);

// Get contract details including items
router.get('/contract/:contractId', getContractDetails);

module.exports = router;
