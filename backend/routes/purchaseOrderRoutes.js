const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

/**
 * Get list of Purchase Orders
 * GET /api/purchase-order/list
 */
router.get('/list', async (req, res) => {
  try {
    console.log('🔍 PO Route Handler: Received list request');
    const { page = 1, items = 10, filter = {} } = req.query;
    
    const PurchaseOrder = sequelize.define('PurchaseOrder', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      poNumber: {
        type: DataTypes.STRING,
        allowNull: false
      },
      supplierId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      totalAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM,
        values: ['draft', 'sent', 'acknowledged', 'delivered', 'cancelled'],
        defaultValue: 'draft'
      },
      currency: {
        type: DataTypes.STRING,
        defaultValue: 'USD'
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      expectedDeliveryDate: {
        type: DataTypes.DATE
      },
      deliveryAddress: DataTypes.TEXT,
      notes: DataTypes.TEXT,
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'PurchaseOrders',
      timestamps: true
    });

    const User = sequelize.define('User', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      firstname: DataTypes.STRING,
      lastname: DataTypes.STRING,
      email: DataTypes.STRING
    }, {
      tableName: 'users',
      timestamps: false
    });

    const Supplier = sequelize.define('Supplier', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      contactPerson: DataTypes.STRING
    }, {
      tableName: 'suppliers',
      timestamps: false
    });

    // Set up associations
    PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
    PurchaseOrder.belongsTo(User, { foreignKey: 'requestorId', as: 'requestor' });
    PurchaseOrder.belongsTo(User, { foreignKey: 'approverId', as: 'approver' });

    const offset = (parseInt(page) - 1) * parseInt(items);
    const limit = parseInt(items);

    const whereClause = {};
    if (filter && typeof filter === 'object') {
      Object.keys(filter).forEach(key => {
        if (filter[key] !== undefined && filter[key] !== null && filter[key] !== '') {
          whereClause[key] = filter[key];
        }
      });
    }

    const { count, rows } = await PurchaseOrder.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name', 'email', 'contactPerson']
        },
        {
          model: User,
          as: 'requestor',
          attributes: ['id', 'firstname', 'lastname', 'email']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'firstname', 'lastname', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ PO Route Handler: Found ${count} purchase orders`);
    res.json({
      success: true,
      result: rows,
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(items),
        total: count
      }
    });
  } catch (error) {
    console.error('❌ PO Route Handler: Error fetching purchase orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching purchase orders',
      error: error.message
    });
  }
});

/**
 * Receive Goods for Purchase Order
 * POST /api/procurement/purchase-order/receive
 */
router.post('/receive', async (req, res) => {
  try {
    const { id } = req.body; // PO id
    const { PurchaseOrder } = createModels();

    // Find PO and check status
    const purchaseOrder = await PurchaseOrder.findOne({ where: { id } });
    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }
    if (purchaseOrder.status !== 'sent') {
      return res.status(400).json({ success: false, message: 'PO must be in sent status to receive goods' });
    }

    // Update PO status to 'acknowledged' and set acknowledgedAt
    await purchaseOrder.update({
      status: 'acknowledged',
      acknowledgedAt: new Date(),
      updatedById: req.user.id
    });

    res.json({ success: true, message: 'Goods received and PO status updated to acknowledged', result: purchaseOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error receiving goods', error: error.message });
  }
});

const sequelize = require('../config/postgresql');
const { DataTypes } = require('sequelize');

// Create models directly (matching actual database schema)
const createModels = () => {
  console.log('🔍 Creating simplified models directly...');
  
  // Create PurchaseOrder model directly (matching actual database schema)
  const PurchaseOrder = sequelize.define('PurchaseOrder', {
    date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customerReference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expectedDeliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rfqReference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
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
      type: DataTypes.STRING, // Using STRING instead of ENUM to match database
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
    // Removed fields that don't exist in database:
    // approvalToken, approvalStatus, approverName, approverTitle, approverComments, tokenExpiry, urgency
  });

  // Create PurchaseOrderItem model directly (matching actual database schema)
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
      type: DataTypes.STRING, // Using STRING instead of ENUM to match database
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

  // Define associations
  PurchaseOrder.hasMany(PurchaseOrderItem, { as: 'items', foreignKey: 'purchaseOrderId' });
  PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId' });
  PurchaseOrder.belongsTo(Supplier, { as: 'supplier', foreignKey: 'supplierId' });
  PurchaseOrder.belongsTo(User, { as: 'requestor', foreignKey: 'requestorId' });
  PurchaseOrder.belongsTo(User, { as: 'approver', foreignKey: 'approverId' });

  console.log('✅ Simplified models created directly');
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
 * Create new Purchase Order (base route)  
 * POST /api/procurement/purchase-order
 */
router.post('/', async (req, res) => {
  // Delegate to the /create handler
  try {
    console.log('🔍 PO Route Handler: POST / called - delegating to /create');
    
    // Get models
    const { PurchaseOrder, PurchaseOrderItem, Supplier, User } = createModels();
    const db = require('../models/sequelize');
    const { RequestForQuotation, PurchaseRequisitionItem } = db;
    
    const {
      description,
      supplierId,
      requestForQuotationId,
      contractId,
      items,
      totalAmount,
      currency,
      incoterms,
      paymentTerms,
      deliveryAddress,
      notes,
      costCenter
    } = req.body;

    // Validate required fields
    if (!description || !supplierId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Description, supplier, and items are required'
      });
    }

    // Generate PO number
    const poNumber = `PO-${String(Date.now()).slice(-8)}`;

    // Create Purchase Order
    const purchaseOrder = await PurchaseOrder.create({
      poNumber,
      description,
      supplierId,
      requestForQuotationId,
      contractId,
      status: 'draft',
      totalAmount: totalAmount || 0,
      currency: currency || 'USD',
      incoterms,
      paymentTerms,
      deliveryAddress,
      requestorId: req.user.id,
      approverId: req.user.id, // Default to same user
      notes,
      costCenter: costCenter || 'DEFAULT',
      createdById: req.user.id,
      updatedById: req.user.id
    });

    // Create PO items
    const poItems = items.map(item => ({
      purchaseOrderId: purchaseOrder.id,
      rfqItemId: item.rfqItemId,
      prItemId: item.prItemId,
      itemNumber: item.itemNumber,
      description: item.description,
      quantity: item.quantity,
      uom: item.uom,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
      deliveryDate: item.deliveryDate,
      notes: item.notes
    }));

    await PurchaseOrderItem.bulkCreate(poItems);

    res.status(201).json({
      success: true,
      result: purchaseOrder,
      message: 'Purchase Order created successfully'
    });

    console.log('✅ PO Route Handler: Purchase Order created successfully');

  } catch (error) {
    console.error('❌ PO Route Handler: Error creating purchase order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating purchase order',
      error: error.message
    });
  }
});

/**
 * Get all Purchase Orders
 * GET /api/procurement/purchase-order
 */
router.get('/', async (req, res) => {
  console.log('🔍 PO Route Handler: GET / called (SIMPLIFIED MODELS VERSION)');
  try {
    console.log('🔍 PO Route Handler: Creating simplified models directly...');
    
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
 * Test route to check simplified models availability
 * GET /api/procurement/purchase-order/test-simple
 */
router.get('/test-simple', async (req, res) => {
  try {
    console.log('🔍 Testing simplified models creation...');
    const models = createModels();
    
    res.json({
      success: true,
      modelsCreated: {
        PurchaseOrder: !!models.PurchaseOrder,
        PurchaseOrderItem: !!models.PurchaseOrderItem,
        User: !!models.User,
        Supplier: !!models.Supplier
      },
      message: 'Simplified models creation successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

/**
 * Get all Suppliers (for dropdowns)
 * GET /api/procurement/purchase-order/suppliers
 */
router.get('/suppliers', async (req, res) => {
  try {
    const db = require('../models/sequelize');
    const { Supplier } = db;
    const suppliers = await Supplier.findAll({
      order: [['legalName', 'ASC']]
    });
    res.json({ success: true, suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching suppliers', error: error.message });
  }
});

/**
 * Get all Purchase Requisitions (for dropdowns)
 * GET /api/procurement/purchase-order/prs
 */
router.get('/prs', async (req, res) => {
  try {
    const db = require('../models/sequelize');
    const { PurchaseRequisition } = db;
    const prs = await PurchaseRequisition.findAll({
      order: [['prNumber', 'DESC']]
    });
    res.json({ success: true, prs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching purchase requisitions', error: error.message });
  }
});

/**
 * Get all ItemMasters (for dropdowns)
 * GET /api/procurement/purchase-order/items
 */
router.get('/items', async (req, res) => {
  try {
    const db = require('../models/sequelize');
    const { ItemMaster } = db;
    const items = await ItemMaster.findAll({
      order: [['itemNumber', 'ASC']]
    });
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching items', error: error.message });
  }
});

/**
 * Get all Contracts (for dropdowns)
 * GET /api/procurement/purchase-order/contracts
 */
router.get('/contracts', async (req, res) => {
  try {
    const db = require('../models/sequelize');
    const { Contract } = db;
    const contracts = await Contract.findAll({
      order: [['contractNumber', 'DESC']]
    });
    res.json({ success: true, contracts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching contracts', error: error.message });
  }
});

/**
 * Create new Purchase Order
 * POST /api/procurement/purchase-order/create
 */
router.post('/create', async (req, res) => {
  try {
    console.log('🔍 PO Route Handler: POST /create called');
    console.log('🔍 Request body:', req.body);
    
    // Get models
    const { PurchaseOrder, PurchaseOrderItem, Supplier, User } = createModels();
    const db = require('../models/sequelize');
    const { RequestForQuotation, PurchaseRequisitionItem } = db;
    
    const {
      description,
      supplierId,
      requestForQuotationId,
      contractId,
      items,
      totalAmount,
      currency,
      incoterms,
      paymentTerms,
      deliveryAddress,
      notes,
      costCenter,
      date,
      department,
      customerReference,
      expectedDeliveryDate,
      rfqReference
    } = req.body;

    // Validate required fields
    if (!description || !supplierId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Description, supplier, and items are required'
      });
    }

    // Generate PO number
    const poNumber = `PO-${String(Date.now()).slice(-8)}`;

    // Create Purchase Order
    const purchaseOrder = await PurchaseOrder.create({
      poNumber,
      description,
      supplierId,
      requestForQuotationId,
      contractId,
      status: 'draft',
      totalAmount: totalAmount || 0,
      currency: currency || 'USD',
      incoterms,
      paymentTerms,
      deliveryAddress,
      requestorId: req.user.id,
      approverId: req.user.id, // Default to same user
      notes,
      costCenter: costCenter || 'DEFAULT',
      createdById: req.user.id,
      updatedById: req.user.id,
      date: date || null,
      department: department || null,
      customerReference: customerReference || null,
      expectedDeliveryDate: expectedDeliveryDate || null,
      rfqReference: rfqReference || null
    });

    // Create PO items with sanitized data
    const poItems = items.map(item => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const totalPrice = quantity * unitPrice;

      return {
        purchaseOrderId: purchaseOrder.id,
        rfqItemId: item.rfqItemId,
        prItemId: item.prItemId,
        itemNumber: item.itemNumber,
        description: item.description || '',
        quantity: quantity,
        uom: item.uom || 'EA',
        unitPrice: unitPrice,
        totalPrice: totalPrice,
        deliveryDate: item.deliveryDate,
        notes: item.notes || ''
      };
    });

    await PurchaseOrderItem.bulkCreate(poItems);

    res.status(201).json({
      success: true,
      result: purchaseOrder,
      message: 'Purchase Order created successfully'
    });

    console.log('✅ PO Route Handler: Purchase Order created successfully');

  } catch (error) {
    console.error('❌ PO Route Handler: Error creating purchase order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating purchase order',
      error: error.message
    });
  }
});

/**
 * Health check endpoint for debugging
 * GET /api/procurement/purchase-order/health
 */
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'PurchaseOrder API is up' });
});

/**
 * Update Purchase Order (PATCH endpoint for status updates)
 * PATCH /api/procurement/purchase-order/:id
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { PurchaseOrder } = createModels();

    // Find purchase order by ID
    const purchaseOrder = await PurchaseOrder.findOne({
      where: { id }
    });

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found',
      });
    }

    // Update the purchase order
    const updateData = {
      updatedById: req.user.id
    };

    // Handle status updates
    if (status) {
      updateData.status = status;
      
      // Set timestamp based on status
      if (status === 'pending_approval') {
        updateData.submittedAt = new Date();
      } else if (status === 'approved') {
        updateData.approvedAt = new Date();
      } else if (status === 'sent') {
        updateData.sentAt = new Date();
      } else if (status === 'acknowledged') {
        updateData.acknowledgedAt = new Date();
      } else if (status === 'partially_received') {
        updateData.acknowledgedAt = new Date();
      } else if (status === 'completed') {
        updateData.completedAt = new Date();
      } else if (status === 'cancelled') {
        updateData.cancelledAt = new Date();
      }
    }

    await purchaseOrder.update(updateData);

    res.json({
      success: true,
      result: purchaseOrder,
      message: 'Purchase Order updated successfully'
    });

    console.log('✅ PO Route Handler: Purchase Order updated successfully');

  } catch (error) {
    console.error('❌ PO Route Handler: Error updating purchase order:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating purchase order',
      error: error.message,
    });
  }
});

/**
 * Approve Purchase Order
 * POST /api/procurement/purchase-order/approve
 */
router.post('/approve', async (req, res) => {
  try {
    const { id, comments } = req.body;
    const { PurchaseOrder } = createModels();

    // Find purchase order by ID
    const purchaseOrder = await PurchaseOrder.findOne({
      where: { id }
    });

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found',
      });
    }

    // Allow approval if status is 'pending_approval' or 'submitted'
    if (purchaseOrder.status !== 'pending_approval' && purchaseOrder.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Purchase Order is not in a state that can be approved (must be submitted or pending approval)',
      });
    }

    // Update the purchase order to approved status
    await purchaseOrder.update({
      status: 'approved',
      approvedAt: new Date(),
      updatedById: req.user.id
    });

    // TODO: Create approval history record if needed

    res.json({
      success: true,
      result: purchaseOrder,
      message: 'Purchase Order approved successfully'
    });

    console.log('✅ PO Route Handler: Purchase Order approved successfully');

  } catch (error) {
    console.error('❌ PO Route Handler: Error approving purchase order:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving purchase order',
      error: error.message,
    });
  }
});

/**
 * Reject Purchase Order
 * POST /api/procurement/purchase-order/reject
 */
router.post('/reject', async (req, res) => {
  try {
    const { id, reason } = req.body;
    const { PurchaseOrder } = createModels();

    // Find purchase order by ID
    const purchaseOrder = await PurchaseOrder.findOne({
      where: { id }
    });

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found',
      });
    }

    // Check if PO is in pending_approval status
    if (purchaseOrder.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: 'Purchase Order is not in pending approval status',
      });
    }

    // Update the purchase order to cancelled status (rejected)
    await purchaseOrder.update({
      status: 'cancelled',
      cancelledAt: new Date(),
      updatedById: req.user.id,
      // Store rejection reason in notes field
      notes: purchaseOrder.notes ? 
        `${purchaseOrder.notes}\n\n[REJECTED] ${reason || 'No reason provided'}` : 
        `[REJECTED] ${reason || 'No reason provided'}`
    });

    // TODO: Create rejection history record
    // You might want to create a rejection history record here

    res.json({
      success: true,
      result: purchaseOrder,
      message: 'Purchase Order rejected successfully'
    });

    console.log('✅ PO Route Handler: Purchase Order rejected successfully');

  } catch (error) {
    console.error('❌ PO Route Handler: Error rejecting purchase order:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting purchase order',
      error: error.message,
    });
  }
});

/**
 * Issue Purchase Order to Supplier
 * POST /api/procurement/purchase-order/issue
 */
router.post('/issue', async (req, res) => {
  try {
    const { id } = req.body;
    const { PurchaseOrder, Supplier, PurchaseOrderItem } = createModels();
    const { sendMail } = require('../utils/mailer');

    // Find purchase order by ID, include supplier and items
    const purchaseOrder = await PurchaseOrder.findOne({
      where: { id },
      include: [
        { model: Supplier, as: 'supplier' },
        { model: PurchaseOrderItem, as: 'items' }
      ]
    });

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found',
      });
    }

    // Check if PO is in approved status
    if (purchaseOrder.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Purchase Order must be approved before issuing',
      });
    }

    // Update the purchase order to sent status (issued to supplier)
    await purchaseOrder.update({
      status: 'sent',
      sentAt: new Date(),
      updatedById: req.user.id
    });

    // Send email to supplier
    try {
      const supplierEmail = purchaseOrder.supplier?.contactEmail;
      if (supplierEmail) {
        const poNumber = purchaseOrder.poNumber;
        const supplierName = purchaseOrder.supplier.legalName || purchaseOrder.supplier.tradeName || '';
        const itemsTable = purchaseOrder.items.map(item => `
          <tr>
            <td style="padding:8px;border:1px solid #eee;">${item.itemNumber || ''}</td>
            <td style="padding:8px;border:1px solid #eee;">${item.description}</td>
            <td style="padding:8px;border:1px solid #eee;">${item.quantity}</td>
            <td style="padding:8px;border:1px solid #eee;">${item.uom}</td>
            <td style="padding:8px;border:1px solid #eee;">${item.unitPrice}</td>
            <td style="padding:8px;border:1px solid #eee;">${item.totalPrice}</td>
          </tr>
        `).join('');
        const html = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f9f9f9;padding:32px 24px;border-radius:12px;box-shadow:0 2px 8px #eee;">
            <h2 style="color:#2a7ae2;margin-bottom:8px;">Purchase Order Issued</h2>
            <p style="font-size:16px;color:#333;">Dear ${supplierName},</p>
            <p style="font-size:15px;color:#333;">We are pleased to inform you that the following Purchase Order has been issued to your company. Please find the details below:</p>
            <table style="width:100%;margin:24px 0 16px 0;border-collapse:collapse;font-size:15px;">
              <tr><td style="padding:8px;font-weight:bold;">PO Number:</td><td style="padding:8px;">${poNumber}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;">Date:</td><td style="padding:8px;">${purchaseOrder.date ? new Date(purchaseOrder.date).toLocaleDateString() : ''}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;">Expected Delivery:</td><td style="padding:8px;">${purchaseOrder.expectedDeliveryDate ? new Date(purchaseOrder.expectedDeliveryDate).toLocaleDateString() : ''}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;">Total Amount:</td><td style="padding:8px;">${purchaseOrder.totalAmount} ${purchaseOrder.currency}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;">Delivery Address:</td><td style="padding:8px;">${purchaseOrder.deliveryAddress || ''}</td></tr>
            </table>
            <h3 style="color:#2a7ae2;margin:16px 0 8px 0;">Order Items</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <thead>
                <tr style="background:#eaf1fb;">
                  <th style="padding:8px;border:1px solid #eee;">Item #</th>
                  <th style="padding:8px;border:1px solid #eee;">Description</th>
                  <th style="padding:8px;border:1px solid #eee;">Qty</th>
                  <th style="padding:8px;border:1px solid #eee;">UOM</th>
                  <th style="padding:8px;border:1px solid #eee;">Unit Price</th>
                  <th style="padding:8px;border:1px solid #eee;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsTable}
              </tbody>
            </table>
            <p style="margin-top:24px;font-size:15px;color:#333;">If you have any questions, please contact our procurement team.</p>
            <p style="margin-top:16px;font-size:14px;color:#888;">Thank you,<br/>ERP Procurement Team</p>
          </div>
        `;
        await sendMail({
          to: supplierEmail,
          subject: `Purchase Order ${poNumber} Issued`,
          html
        });
        console.log(`📧 PO email sent to supplier: ${supplierEmail}`);
      } else {
        console.warn('No supplier email found for PO:', purchaseOrder.id);
      }
    } catch (mailErr) {
      console.error('❌ Error sending PO email to supplier:', mailErr);
    }

    res.json({
      success: true,
      result: purchaseOrder,
      message: 'Purchase Order issued to supplier successfully'
    });

    console.log('✅ PO Route Handler: Purchase Order issued successfully');

  } catch (error) {
    console.error('❌ PO Route Handler: Error issuing purchase order:', error);
    res.status(500).json({
      success: false,
      message: 'Error issuing purchase order',
      error: error.message,
    });
  }
});

/**
 * Get a Purchase Order by ID
 * GET /api/procurement/purchase-order/read/:id
 */
router.get('/read/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { PurchaseOrder, PurchaseOrderItem, Supplier, User } = createModels();
    const db = require('../models/sequelize');

    // Find purchase order by ID
    const purchaseOrder = await PurchaseOrder.findOne({
      where: { id },
      include: [
        {
          model: PurchaseOrderItem,
          as: 'items',
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: [
            'id',
            'supplierNumber',
            'legalName',
            'tradeName',
            'contactEmail',
            'contactEmailSecondary',
            'contactPhone',
            'contactName',
            'address',
            'city',
            'state',
            'country',
            'postalCode',
            'taxId',
            'registrationNumber',
            'status',
            'supplierType',
            'paymentTerms',
            'complianceChecked'
          ]
        },
        {
          model: User,
          as: 'requestor',
        },
        {
          model: User,
          as: 'approver',
        },
      ],
    });

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found',
      });
    }

    res.json({
      success: true,
      result: purchaseOrder,
    });
  } catch (error) {
    console.error('❌ PO Route Handler: Error fetching purchase order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching purchase order',
      error: error.message,
    });
  }
});

module.exports = router;