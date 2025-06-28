const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { protect } = require('../middleware/authMiddleware');

// Force reload models by clearing cache
const getModels = () => {
  // Clear the models cache to force reload
  const modelsPath = require.resolve('../models/sequelize');
  delete require.cache[modelsPath];
  
  // Also clear related model files
  const modelFiles = [
    '../models/sequelize/PurchaseOrder',
    '../models/sequelize/PurchaseOrderItem',
    '../models/sequelize/associations'
  ];
  
  modelFiles.forEach(file => {
    try {
      const filePath = require.resolve(file);
      delete require.cache[filePath];
    } catch (e) {
      // File might not exist, ignore
    }
  });
  
  // Now require fresh models
  const db = require('../models/sequelize');
  return db;
};

// All routes are protected
router.use(protect);

/**
 * Get all Purchase Orders
 * GET /api/procurement/purchase-order
 */
router.get('/', async (req, res) => {
  console.log('🔍 PO Route Handler: GET / called (HOTFIX VERSION)');
  try {
    console.log('🔍 PO Route Handler: Getting models with cache clear...');
    
    // Get fresh models
    const db = getModels();
    const { PurchaseOrder, PurchaseOrderItem, Supplier, User } = db;
    
    console.log('🔍 PO Route Handler: Models received:', {
      PurchaseOrder: !!PurchaseOrder,
      PurchaseOrderItem: !!PurchaseOrderItem,
      Supplier: !!Supplier,
      User: !!User
    });
    
    console.log('🔍 Available models in db:', Object.keys(db).filter(key => !['sequelize', 'Sequelize'].includes(key)));
    
    // Validate models are available
    if (!PurchaseOrder) {
      console.log('❌ PO Route Handler: PurchaseOrder model not available');
      return res.status(500).json({ 
        error: 'PurchaseOrder model not available',
        availableModels: Object.keys(db).filter(key => !['sequelize', 'Sequelize'].includes(key))
      });
    }
    
    console.log('🔍 PO Route Handler: Starting query...');
    
    const { status, page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    let whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    if (search) {
      whereClause[Op.or] = [
        { poNumber: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const purchaseOrders = await PurchaseOrder.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'legalName', 'contactEmail']
        },
        {
          model: User,
          as: 'requestor',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: PurchaseOrderItem,
          as: 'items'
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    console.log('🔍 PO Route Handler: Query completed successfully, found', purchaseOrders.count, 'records');
    
    res.json({
      success: true,
      result: purchaseOrders.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: purchaseOrders.count,
        pages: Math.ceil(purchaseOrders.count / limit)
      }
    });
    
    console.log('✅ PO Route Handler: Response sent successfully');

  } catch (error) {
    console.error('❌ PO Route Handler: Error fetching purchase orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching purchase orders',
      error: error.message,
      stack: error.stack
    });
    console.log('❌ PO Route Handler: Error response sent');
  }
});

/**
 * Test route to check models availability
 * GET /api/procurement/purchase-order/test-models
 */
router.get('/test-models', async (req, res) => {
  try {
    console.log('🔍 Testing models availability...');
    const db = getModels();
    
    res.json({
      success: true,
      availableModels: Object.keys(db).filter(key => !['sequelize', 'Sequelize'].includes(key)),
      purchaseOrderAvailable: !!db.PurchaseOrder,
      purchaseOrderItemAvailable: !!db.PurchaseOrderItem,
      supplierAvailable: !!db.Supplier,
      userAvailable: !!db.User
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;