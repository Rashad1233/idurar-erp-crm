const express = require('express');
const router = express.Router();
const { 
  createSupplier,
  getSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Supplier routes
router.route('/')
  .post(createSupplier)
  .get(getSuppliers);

router.route('/:id')
  .get(getSupplier)
  .put(updateSupplier)
  .delete(deleteSupplier);

module.exports = router;
