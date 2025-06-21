const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
// TEMPORARILY DISABLED - itemMasterController has syntax errors
/*
const {
  createItemMaster,
  getItemMasters,
  getItemMaster,
  updateItemMaster,
  submitItemMaster,
  reviewItemMaster,
  deleteItemMaster
} = require('../controllers/itemMasterController');
*/

const {
  createInventory,
  getInventoryItems,
  getInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  searchInventoryItems,
  advancedSearchInventoryItems,
  createReorderRequest,
  submitReorderRequest,
  approveReorderRequest,
  scanReorderItems,
  getReorderRequests,  getReorderRequest,
  cancelReorderRequest,
  getInventoryReportData,
  getInventorySummaryMetrics,
  getInventoryTrendData,
  exportInventoryReport,
  getUnspscCategoryData
} = require('../controllers/inventoryController');

const {
  createStorageLocation,
  getStorageLocations,
  getStorageLocation,
  createBinLocation,
  getBinLocations,
  createTransaction,  completeTransaction,
  getTransactions
} = require('../controllers/warehouseController');

// Item Master routes - TEMPORARILY DISABLED due to controller issues
/*
router.route('/item-master')
  .post(protect, createItemMaster)
  .get(protect, getItemMasters);

router.route('/item-master/:id')
  .get(protect, getItemMaster)
  .put(protect, updateItemMaster)
  .delete(protect, deleteItemMaster);

router.route('/item-master/:id/submit')
  .put(protect, submitItemMaster);

router.route('/item-master/:id/review')
  .put(protect, reviewItemMaster);
*/

// Inventory routes
router.route('/inventory')
  .post(protect, createInventory)
  .get(protect, getInventoryItems);

// Inventory search routes (must come before /inventory/:id)
router.route('/inventory/search')
  .get(protect, searchInventoryItems);

router.route('/inventory/advanced-search')
  .get(protect, advancedSearchInventoryItems);

router.route('/inventory/:id')
  .get(protect, getInventoryItem)
  .put(protect, updateInventoryItem)
  .delete(protect, deleteInventoryItem);

// Reorder request routes
router.route('/reorder-request')
  .post(protect, createReorderRequest)
  .get(protect, getReorderRequests);

router.route('/reorder-request/scan')
  .post(protect, scanReorderItems);

router.route('/reorder-request/:id')
  .get(protect, getReorderRequest);

router.route('/reorder-request/:id/submit')
  .put(protect, submitReorderRequest);

router.route('/reorder-request/:id/approve')
  .put(protect, approveReorderRequest);

router.route('/reorder-request/:id/cancel')
  .put(protect, cancelReorderRequest);

// Warehouse routes
router.route('/storage-location')
  .post(protect, createStorageLocation)
  .get(protect, getStorageLocations);

router.route('/storage-location/:id')
  .get(protect, getStorageLocation);

router.route('/bin-location')
  .post(protect, createBinLocation)
  .get(protect, getBinLocations);

router.route('/transaction')
  .post(protect, createTransaction)
  .get(protect, getTransactions);

router.route('/transaction/:id/complete')
  .put(protect, completeTransaction);

// Inventory reporting routes
router.route('/inventory/reports')
  .get(protect, getInventoryReportData);

router.route('/inventory/reports/summary')
  .get(protect, getInventorySummaryMetrics);

router.route('/inventory/reports/trends')
  .get(protect, getInventoryTrendData);

router.route('/inventory/reports/unspsc-categories')
  .get(protect, getUnspscCategoryData);

router.route('/inventory/reports/export')
  .get(protect, exportInventoryReport);

module.exports = router;
