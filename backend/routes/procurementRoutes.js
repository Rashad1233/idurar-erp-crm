const express = require('express');
const router = express.Router();
const { ItemMaster } = require('../models/sequelize');
const { protect } = require('../middleware/authMiddleware');

// Import individual procurement route files
const contractRoutes = require('./contractRoutes');
const contractPriceRoutes = require('./contractPriceRoutes');
const requestForQuotationRoutes = require('./requestForQuotationRoutes');
const purchaseOrderRoutes = require('./purchaseOrderRoutes');
const supplierRoutes = require('./supplierRoutes');
const purchaseRequisitionRoutes = require('./purchaseRequisitionRoutes'); // RESTORED: for /purchase-requisition/create and related endpoints

// Add item-master route for contract management
router.get('/item-master', protect, async (req, res) => {
  try {
    const items = await ItemMaster.findAll({
      where: { status: 'APPROVED' },
      attributes: ['id', 'itemNumber', 'shortDescription', 'uom', 'status', 'equipmentCategory'],
      order: [['itemNumber', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: items,
      message: `${items.length} approved items found`
    });
  } catch (error) {
    console.error('Error fetching approved items:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching approved items',
      error: error.message
    });
  }
});

// Mount procurement routes
router.use('/contract', contractRoutes);
router.use('/contract-prices', contractPriceRoutes);
router.use('/rfq', requestForQuotationRoutes);
router.use('/purchase-order', purchaseOrderRoutes);
router.use('/supplier', supplierRoutes);
router.use('/purchase-requisition', purchaseRequisitionRoutes); // RESTORED: for /purchase-requisition/create and related endpoints

module.exports = router;
