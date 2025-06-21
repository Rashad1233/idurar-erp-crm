const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const warehouseController = require('../controllers/warehouseController');

// Storage location routes
router.route('/storage-location')
  .post(protect, warehouseController.createStorageLocation)
  .get(protect, warehouseController.getStorageLocations);

router.route('/storage-location/:id')
  .get(protect, warehouseController.getStorageLocation)
  .put(protect, warehouseController.updateStorageLocation)
  .delete(protect, warehouseController.deleteStorageLocation);

// Bin location routes
router.route('/bin-location')
  .post(protect, warehouseController.createBinLocation)
  .get(protect, warehouseController.getBinLocations);

router.route('/bin-location/:id')
  .get(protect, warehouseController.getBinLocation)
  .put(protect, warehouseController.updateBinLocation)
  .delete(protect, warehouseController.deleteBinLocation);

// Get bins by storage location
router.route('/storage-location/:id/bins')
  .get(protect, warehouseController.getBinsByStorageLocation);

// Transaction routes
router.route('/transaction')
  .post(protect, warehouseController.createTransaction)
  .get(protect, warehouseController.getTransactions);

// Transaction by type routes - More specific route comes first
router.route('/transaction/type/:type')
  .get(protect, warehouseController.getTransactionsByType);

// Transaction completion route
router.route('/transaction/:id/complete')
  .put(protect, warehouseController.completeTransaction);

// General transaction by ID route - Less specific route comes last
router.route('/transaction/:id')
  .get(protect, warehouseController.getTransaction);

// Test route to verify warehouse endpoints are working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Warehouse routes are working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
