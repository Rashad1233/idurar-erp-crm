const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { protect } = require('../middleware/authMiddleware');
const sequelize = require('../config/postgresql');
const { DataTypes } = require('sequelize');

// Create models directly
const createModels = () => {
  console.log('🔍 Creating models directly...');
  
  // Create PurchaseOrder model directly
  const PurchaseOrder = sequelize.define('PurchaseOrder', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    poNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    requestForQuotationId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    supplierId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    contractId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending_approval', 'approved', 'sent', 'acknowledged', 'partially_received', 'completed', 'cancelled'),
      defaultValue: 'draft',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
    },
    incoterms: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentTerms: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deliveryAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    requestorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    approverId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    currentApproverId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    attachments: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    submittedAt: {
      type: DataTypes.DATE,
    },
    approvedAt: {
      type: DataTypes.DATE,
    },
    sentAt: {
      type: DataTypes.DATE,
    },
    acknowledgedAt: {
      type: DataTypes.DATE,
    },
    completedAt: {
      type: DataTypes.DATE,
    },
    cancelledAt: {
      type: DataTypes.DATE,
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    updatedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    costCenter: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    approvalToken: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    approvalStatus: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    approverName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approverTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approverComments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    urgency: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
    },
  });

  // Create PurchaseOrderItem model directly
  const PurchaseOrderItem = sequelize.define('PurchaseOrderItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    purchaseOrderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    rfqItemId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    prItemId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    itemNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    uom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 1.00,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'partial', 'received', 'cancelled'),
      defaultValue: 'pending',
    },
    receivedQuantity: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },
    receivedAt: {
      type: DataTypes.DATE,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  });

  // Get existing models from the db
  const db = require('../models/sequelize');
  const { User, Supplier } = db;

  console.log('✅ Models created directly');
  console.log('  - PurchaseOrder:', !!PurchaseOrder);
  console.log('  - PurchaseOrderItem:', !!PurchaseOrderItem);
  console.log('  - User:', !!User);
  console.log('  - Supplier:', !!Supplier);

  return {
    PurchaseOrder,
    PurchaseOrderItem,
    User,
    Supplier
  };
};

// All routes are protected
router.use(protect);

/**
 * Get all Purchase Orders
 * GET /api/procurement/purchase-order
 */
router.get('/', async (req, res) => {
  console.log('🔍 PO Route Handler: GET / called (DIRECT MODELS VERSION)');
  try {
    console.log('🔍 PO Route Handler: Creating models directly...');
    
    // Get models directly
    const { PurchaseOrder, PurchaseOrderItem, Supplier, User } = createModels();
    
    console.log('🔍 PO Route Handler: Models received:', {
      PurchaseOrder: !!PurchaseOrder,
      PurchaseOrderItem: !!PurchaseOrderItem,
      Supplier: !!Supplier,
      User: !!User
    });
    
    // Validate models are available
    if (!PurchaseOrder) {
      console.log('❌ PO Route Handler: PurchaseOrder model not available');
      return res.status(500).json({ 
        error: 'PurchaseOrder model not available'
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

    // Simple query without associations first
    const purchaseOrders = await PurchaseOrder.findAndCountAll({
      where: whereClause,
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
 * GET /api/procurement/purchase-order/test-direct
 */
router.get('/test-direct', async (req, res) => {
  try {
    console.log('🔍 Testing direct models creation...');
    const models = createModels();
    
    res.json({
      success: true,
      modelsCreated: {
        PurchaseOrder: !!models.PurchaseOrder,
        PurchaseOrderItem: !!models.PurchaseOrderItem,
        User: !!models.User,
        Supplier: !!models.Supplier
      },
      message: 'Direct models creation successful'
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