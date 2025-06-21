const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  validateApprovedItem, 
  validatePlannedStockItem, 
  getApprovedItemsForInventory 
} = require('../middleware/inventoryValidation');

// Get approved items eligible for inventory operations
router.get('/approved-items', protect, getApprovedItemsForInventory);

// Test validation endpoints
router.get('/validate-inventory/:itemId', protect, validateApprovedItem, (req, res) => {
  res.json({
    success: true,
    message: 'Item is valid for inventory operations',
    data: {
      itemId: req.validatedItem.id,
      itemNumber: req.validatedItem.itemNumber,
      status: req.validatedItem.status,
      stockType: req.validatedItem.plannedStock === 'Y' ? 'ST2' : 
                 req.validatedItem.stockItem === 'Y' ? 'ST1' : 'NS3'
    }
  });
});

router.get('/validate-minmax/:itemId', protect, validatePlannedStockItem, (req, res) => {
  res.json({
    success: true,
    message: 'Item is valid for min/max level configuration',
    data: {
      itemId: req.validatedItem.id,
      itemNumber: req.validatedItem.itemNumber,
      status: req.validatedItem.status,
      stockType: 'ST2',
      plannedStock: req.validatedItem.plannedStock
    }
  });
});

module.exports = router;
