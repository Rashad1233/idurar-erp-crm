const express = require('express');
const router = express.Router();
const { getSuppliers } = require('../controllers/simpleSupplierController');

// Simple route to get suppliers without associations
router.get('/list', getSuppliers);

module.exports = router;