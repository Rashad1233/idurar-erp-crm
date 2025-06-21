const express = require('express');
const router = express.Router();

// Import individual procurement route files
const purchaseRequisitionRoutes = require('./purchaseRequisitionRoutes');
const requestForQuotationRoutes = require('./requestForQuotationRoutes');
const supplierRoutes = require('./supplierRoutes');

// Mount procurement routes
router.use('/purchase-requisition', purchaseRequisitionRoutes);
router.use('/rfq', requestForQuotationRoutes);
router.use('/supplier', supplierRoutes);

module.exports = router;
