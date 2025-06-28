const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

/**
 * Get all Sales Orders
 * GET /api/sales-order
 */
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Sales Order Route: GET / called');
    
    const db = require('../models/sequelize');
    const { SalesOrder, SalesOrderItem, Customer, User, ItemMaster } = db;
    
    const { status, page = 1, limit = 10, search, dateFrom, dateTo } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    let whereClause = {};
    if (status) {
      whereClause.orderStatus = status;
    }
    if (search) {
      whereClause[Op.or] = [
        { soNumber: { [Op.iLike]: `%${search}%` } },
        { receiptNumber: { [Op.iLike]: `%${search}%` } },
        { customerName: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (dateFrom && dateTo) {
      whereClause.orderDate = {
        [Op.between]: [new Date(dateFrom), new Date(dateTo)]
      };
    }

    const salesOrders = await SalesOrder.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          as: 'customer',
          required: false
        },
        {
          model: User,
          as: 'salesperson',
          attributes: ['id', 'name', 'email']
        },
        {
          model: SalesOrderItem,
          as: 'items',
          include: [
            {
              model: ItemMaster,
              as: 'itemMaster',
              attributes: ['id', 'itemNumber', 'shortDescription']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      result: salesOrders.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: salesOrders.count,
        pages: Math.ceil(salesOrders.count / limit)
      }
    });

  } catch (error) {
    console.error('❌ Sales Order Route: Error fetching sales orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales orders',
      error: error.message
    });
  }
});

/**
 * Get Sales Order by ID
 * GET /api/sales-order/:id
 */
router.get('/:id', async (req, res) => {
  try {
    console.log('🔍 Sales Order Route: GET /:id called');
    
    const db = require('../models/sequelize');
    const { SalesOrder, SalesOrderItem, Customer, User, ItemMaster } = db;
    
    const salesOrder = await SalesOrder.findByPk(req.params.id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          required: false
        },
        {
          model: User,
          as: 'salesperson',
          attributes: ['id', 'name', 'email']
        },
        {
          model: SalesOrderItem,
          as: 'items',
          include: [
            {
              model: ItemMaster,
              as: 'itemMaster',
              attributes: ['id', 'itemNumber', 'shortDescription', 'manufacturerName']
            }
          ]
        }
      ]
    });

    if (!salesOrder) {
      return res.status(404).json({
        success: false,
        message: 'Sales order not found'
      });
    }

    res.json({
      success: true,
      result: salesOrder
    });

  } catch (error) {
    console.error('❌ Sales Order Route: Error fetching sales order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales order',
      error: error.message
    });
  }
});

/**
 * Create new Sales Order (POS Style)
 * POST /api/sales-order
 */
router.post('/', async (req, res) => {
  try {
    console.log('🔍 Sales Order Route: POST / called');
    
    const db = require('../models/sequelize');
    const { SalesOrder, SalesOrderItem, Customer, ItemMaster, sequelize } = db;
    
    const {
      customerId,
      customerName,
      items,
      paymentMethod,
      vatRate,
      discountType,
      discountValue,
      seasonalDiscount,
      specialDiscount,
      notes,
      storeLocation,
      barcodeScanned
    } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }

    // Start transaction
    const t = await sequelize.transaction();

    try {
      // Calculate subtotal from items
      let subtotal = 0;
      const processedItems = [];

      for (const item of items) {
        // Validate item exists
        const itemMaster = await ItemMaster.findByPk(item.itemMasterId);
        if (!itemMaster) {
          throw new Error(`Item with ID ${item.itemMasterId} not found`);
        }

        const lineTotal = item.quantity * item.unitPrice;
        subtotal += lineTotal;

        processedItems.push({
          itemMasterId: item.itemMasterId,
          itemNumber: itemMaster.itemNumber,
          itemDescription: item.itemDescription || itemMaster.shortDescription,
          barcode: item.barcode,
          quantity: item.quantity,
          uom: item.uom || itemMaster.uom,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          discountPercent: item.discountPercent || 0,
          category: item.category,
          size: item.size,
          color: item.color,
          brand: item.brand,
          notes: item.notes
        });
      }

      // Create Sales Order
      const salesOrder = await SalesOrder.create({
        customerId: customerId || null,
        customerName: customerName || 'Walk-in Customer',
        subtotal: subtotal,
        vatRate: vatRate || 18.00,
        discountType: discountType || 'none',
        discountValue: discountValue || 0,
        seasonalDiscount: seasonalDiscount || 0,
        specialDiscount: specialDiscount || 0,
        paymentMethod: paymentMethod || 'cash',
        paymentStatus: 'pending',
        orderStatus: 'draft',
        currency: 'USD',
        notes: notes,
        salesPersonId: req.user.id,
        storeLocation: storeLocation || 'Main Store',
        barcodeScanned: barcodeScanned || [],
        createdById: req.user.id,
        updatedById: req.user.id
      }, { transaction: t });

      // Create Sales Order Items
      const salesOrderItems = processedItems.map(item => ({
        ...item,
        salesOrderId: salesOrder.id
      }));

      await SalesOrderItem.bulkCreate(salesOrderItems, { transaction: t });

      // Commit transaction
      await t.commit();

      // Fetch created order with associations
      const createdOrder = await SalesOrder.findByPk(salesOrder.id, {
        include: [
          {
            model: Customer,
            as: 'customer',
            required: false
          },
          {
            model: SalesOrderItem,
            as: 'items',
            include: [
              {
                model: ItemMaster,
                as: 'itemMaster',
                attributes: ['id', 'itemNumber', 'shortDescription']
              }
            ]
          }
        ]
      });

      res.status(201).json({
        success: true,
        result: createdOrder,
        message: 'Sales Order created successfully'
      });

    } catch (error) {
      await t.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Sales Order Route: Error creating sales order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating sales order',
      error: error.message
    });
  }
});

/**
 * Update Sales Order
 * PUT /api/sales-order/:id
 */
router.put('/:id', async (req, res) => {
  try {
    console.log('🔍 Sales Order Route: PUT /:id called');
    
    const db = require('../models/sequelize');
    const { SalesOrder } = db;
    
    const salesOrder = await SalesOrder.findByPk(req.params.id);
    if (!salesOrder) {
      return res.status(404).json({
        success: false,
        message: 'Sales order not found'
      });
    }

    // Update only allowed fields
    const allowedUpdates = [
      'paymentStatus', 'orderStatus', 'paymentMethod', 'notes', 
      'vatRate', 'discountType', 'discountValue', 'seasonalDiscount', 'specialDiscount'
    ];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    updates.updatedById = req.user.id;

    await salesOrder.update(updates);

    res.json({
      success: true,
      result: salesOrder,
      message: 'Sales Order updated successfully'
    });

  } catch (error) {
    console.error('❌ Sales Order Route: Error updating sales order:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating sales order',
      error: error.message
    });
  }
});

/**
 * Process Payment
 * POST /api/sales-order/:id/payment
 */
router.post('/:id/payment', async (req, res) => {
  try {
    console.log('🔍 Sales Order Route: POST /:id/payment called');
    
    const db = require('../models/sequelize');
    const { SalesOrder } = db;
    
    const { paymentMethod, amountPaid } = req.body;
    
    const salesOrder = await SalesOrder.findByPk(req.params.id);
    if (!salesOrder) {
      return res.status(404).json({
        success: false,
        message: 'Sales order not found'
      });
    }

    // Determine payment status
    let paymentStatus = 'pending';
    if (amountPaid >= salesOrder.totalAmount) {
      paymentStatus = 'paid';
    } else if (amountPaid > 0) {
      paymentStatus = 'partial';
    }

    // Update sales order
    await salesOrder.update({
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      orderStatus: paymentStatus === 'paid' ? 'confirmed' : 'processing',
      updatedById: req.user.id
    });

    res.json({
      success: true,
      result: salesOrder,
      message: 'Payment processed successfully'
    });

  } catch (error) {
    console.error('❌ Sales Order Route: Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
      error: error.message
    });
  }
});

/**
 * Get all Customers (for dropdown)
 * GET /api/sales-order/customers
 */
router.get('/customers', async (req, res) => {
  try {
    const db = require('../models/sequelize');
    const { Customer } = db;
    
    const customers = await Customer.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
      attributes: ['id', 'customerNumber', 'name', 'email', 'phone', 'customerType']
    });
    
    res.json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching customers', 
      error: error.message 
    });
  }
});

/**
 * Get all Items (for POS scanning/selection)
 * GET /api/sales-order/items
 */
router.get('/items', async (req, res) => {
  try {
    const db = require('../models/sequelize');
    const { ItemMaster } = db;
    
    const { search, category, barcode } = req.query;
    
    let whereClause = { status: 'APPROVED' };
    
    if (search) {
      whereClause[Op.or] = [
        { itemNumber: { [Op.iLike]: `%${search}%` } },
        { shortDescription: { [Op.iLike]: `%${search}%` } },
        { longDescription: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (category) {
      whereClause.equipmentCategory = category;
    }
    
    if (barcode) {
      whereClause.itemNumber = barcode; // For demonstration, using itemNumber as barcode
    }
    
    const items = await ItemMaster.findAll({
      where: whereClause,
      order: [['itemNumber', 'ASC']],
      attributes: [
        'id', 'itemNumber', 'shortDescription', 'longDescription', 
        'equipmentCategory', 'equipmentSubCategory', 'uom', 
        'manufacturerName', 'manufacturerPartNumber'
      ],
      limit: 50
    });
    
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching items', 
      error: error.message 
    });
  }
});

/**
 * Barcode Scanner Simulation
 * POST /api/sales-order/scan
 */
router.post('/scan', async (req, res) => {
  try {
    const db = require('../models/sequelize');
    const { ItemMaster } = db;
    
    const { barcode } = req.body;
    
    if (!barcode) {
      return res.status(400).json({
        success: false,
        message: 'Barcode is required'
      });
    }
    
    // For demonstration, search by itemNumber (acting as barcode)
    const item = await ItemMaster.findOne({
      where: { 
        itemNumber: barcode,
        status: 'APPROVED'
      },
      attributes: [
        'id', 'itemNumber', 'shortDescription', 'longDescription', 
        'equipmentCategory', 'uom', 'manufacturerName'
      ]
    });
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found for this barcode'
      });
    }
    
    res.json({
      success: true,
      item: {
        ...item.toJSON(),
        barcode: barcode,
        unitPrice: 0, // Default price - would come from pricing table in real system
        quantity: 1
      },
      message: 'Item scanned successfully'
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error scanning barcode', 
      error: error.message 
    });
  }
});

/**
 * Get Sales Analytics
 * GET /api/sales-order/analytics
 */
router.get('/analytics', async (req, res) => {
  try {
    const db = require('../models/sequelize');
    const { SalesOrder, SalesOrderItem } = db;
    
    const { dateFrom, dateTo } = req.query;
    
    let whereClause = {};
    if (dateFrom && dateTo) {
      whereClause.orderDate = {
        [Op.between]: [new Date(dateFrom), new Date(dateTo)]
      };
    }
    
    // Total sales
    const totalSales = await SalesOrder.sum('totalAmount', {
      where: { ...whereClause, paymentStatus: 'paid' }
    });
    
    // Order count
    const orderCount = await SalesOrder.count({
      where: whereClause
    });
    
    // Average order value
    const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;
    
    // Top selling items
    const topItems = await SalesOrderItem.findAll({
      attributes: [
        'itemNumber',
        'itemDescription',
        [db.sequelize.fn('SUM', db.sequelize.col('quantity')), 'totalQuantity'],
        [db.sequelize.fn('SUM', db.sequelize.col('lineTotal')), 'totalValue']
      ],
      include: [{
        model: SalesOrder,
        as: 'salesOrder',
        where: whereClause,
        attributes: []
      }],
      group: ['SalesOrderItem.itemNumber', 'SalesOrderItem.itemDescription'],
      order: [[db.sequelize.fn('SUM', db.sequelize.col('quantity')), 'DESC']],
      limit: 10
    });
    
    res.json({
      success: true,
      analytics: {
        totalSales: totalSales || 0,
        orderCount,
        avgOrderValue: avgOrderValue || 0,
        topItems
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching analytics', 
      error: error.message 
    });
  }
});

module.exports = router;

/**
 * Get all Sales Orders
 * GET /api/sales-order
 */
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Sales Order Route: GET / called');
    
    const db = require('../models/sequelize');
    const { SalesOrder, SalesOrderItem, Customer, User, ItemMaster } = db;
    
    const { status, page = 1, limit = 10, search, dateFrom, dateTo } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    let whereClause = {};
    if (status) {
      whereClause.orderStatus = status;
    }
    if (search) {
      whereClause[Op.or] = [
        { soNumber: { [Op.iLike]: `%${search}%` } },
        { receiptNumber: { [Op.iLike]: `%${search}%` } },
        { customerName: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (dateFrom && dateTo) {
      whereClause.orderDate = {
        [Op.between]: [new Date(dateFrom), new Date(dateTo)]
      };
    }

    const salesOrders = await SalesOrder.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          as: 'customer',
          required: false
        },
        {
          model: User,
          as: 'salesperson',
          attributes: ['id', 'name', 'email']
        },
        {
          model: SalesOrderItem,
          as: 'items',
          include: [
            {
              model: ItemMaster,
              as: 'itemMaster',
              attributes: ['id', 'itemNumber', 'shortDescription']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      result: salesOrders.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: salesOrders.count,
        pages: Math.ceil(salesOrders.count / limit)
      }
    });

  } catch (error) {
    console.error('❌ Sales Order Route: Error fetching sales orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales orders',
      error: error.message
    });
  }
});

/**
 * Get Sales Order by ID
 * GET /api/sales-order/:id
 */
router.get('/:id', async (req, res) => {
  try {
    console.log('🔍 Sales Order Route: GET /:id called');
    
    const db = require('../models/sequelize');
    const { SalesOrder, SalesOrderItem, Customer, User, ItemMaster } = db;
    
    const salesOrder = await SalesOrder.findByPk(req.params.id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          required: false
        },
        {
          model: User,
          as: 'salesperson',
          attributes: ['id', 'name', 'email']
        },
        {
          model: SalesOrderItem,
          as: 'items',
          include: [
            {
              model: ItemMaster,
              as: 'itemMaster',
              attributes: ['id', 'itemNumber', 'shortDescription', 'manufacturerName']
            }
          ]
        }
      ]
    });

    if (!salesOrder) {
      return res.status(404).json({
        success: false,
        message: 'Sales order not found'
      });
    }

    res.json({
      success: true,
      result: salesOrder
    });

  } catch (error) {
    console.error('❌ Sales Order Route: Error fetching sales order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales order',
      error: error.message
    });
  }
});

/**
 * Create new Sales Order (POS Style)
 * POST /api/sales-order
 */
router.post('/', async (req, res) => {
  try {
    console.log('🔍 Sales Order Route: POST / called');
    
    const db = require('../models/sequelize');
    const { SalesOrder, SalesOrderItem, Customer, ItemMaster, sequelize } = db;
    
    const {
      customerId,
      customerName,
      items,
      paymentMethod,
      vatRate,
      discountType,
      discountValue,
      seasonalDiscount,
      specialDiscount,
      notes,
      storeLocation,
      barcodeScanned
    } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }

    // Start transaction
    const t = await sequelize.transaction();

    try {
      // Calculate subtotal from items
      let subtotal = 0;
      const processedItems = [];

      for (const item of items) {
        // Validate item exists
        const itemMaster = await ItemMaster.findByPk(item.itemMasterId);
        if (!itemMaster) {
          throw new Error(`Item with ID ${item.itemMasterId} not found`);
        }

        const lineTotal = item.quantity * item.unitPrice;
        subtotal += lineTotal;

        processedItems.push({
          itemMasterId: item.itemMasterId,
          itemNumber: itemMaster.itemNumber,
          itemDescription: item.itemDescription || itemMaster.shortDescription,
          barcode: item.barcode,
          quantity: item.quantity,
          uom: item.uom || itemMaster.uom,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          discountPercent: item.discountPercent || 0,
          category: item.category,
          size: item.size,
          color: item.color,
          brand: item.brand,
          notes: item.notes
        });
      }

      // Create Sales Order
      const salesOrder = await SalesOrder.create({
        customerId: customerId || null,
        customerName: customerName || 'Walk-in Customer',
        subtotal: subtotal,
        vatRate: vatRate || 18.00,
        discountType: discountType || 'none',
        discountValue: discountValue || 0,
        seasonalDiscount: seasonalDiscount || 0,
        specialDiscount: specialDiscount || 0,
        paymentMethod: paymentMethod || 'cash',
        paymentStatus: 'pending',
        orderStatus: 'draft',
        currency: 'USD',
        notes: notes,
        salesPersonId: req.user.id,
        storeLocation: storeLocation || 'Main Store',
        barcodeScanned: barcodeScanned || [],
        createdById: req.user.id,
        updatedById: req.user.id
      }, { transaction: t });

      // Create Sales Order Items
      const salesOrderItems = processedItems.map(item => ({
        ...item,
        salesOrderId: salesOrder.id
      }));

      await SalesOrderItem.bulkCreate(salesOrderItems, { transaction: t });

      // Commit transaction
      await t.commit();

      // Fetch created order with associations
      const createdOrder = await SalesOrder.findByPk(salesOrder.id, {
        include: [
          {
            model: Customer,
            as: 'customer',
            required: false
          },
          {
            model: SalesOrderItem,
            as: 'items',
            include: [
              {
                model: ItemMaster,
                as: 'itemMaster',
                attributes: ['id', 'itemNumber', 'shortDescription']
              }
            ]
          }
        ]
      });

      res.status(201).json({
        success: true,
        result: createdOrder,
        message: 'Sales Order created successfully'
      });

    } catch (error) {
      await t.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Sales Order Route: Error creating sales order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating sales order',
      error: error.message
    });
  }
});

/**
 * Update Sales Order
 * PUT /api/sales-order/:id
 */
router.put('/:id', async (req, res) => {
  try {
    console.log('🔍 Sales Order Route: PUT /:id called');
    
    const db = require('../models/sequelize');
    const { SalesOrder } = db;
    
    const salesOrder = await SalesOrder.findByPk(req.params.id);
    if (!salesOrder) {
      return res.status(404).json({
        success: false,
        message: 'Sales order not found'
      });
    }

    // Update only allowed fields
    const allowedUpdates = [
      'paymentStatus', 'orderStatus', 'paymentMethod', 'notes', 
      'vatRate', 'discountType', 'discountValue', 'seasonalDiscount', 'specialDiscount'
    ];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    updates.updatedById = req.user.id;

    await salesOrder.update(updates);

    res.json({
      success: true,
      result: salesOrder,
      message: 'Sales Order updated successfully'
    });

  } catch (error) {
    console.error('❌ Sales Order Route: Error updating sales order:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating sales order',
      error: error.message
    });
  }
});

/**
 * Process Payment
 * POST /api/sales-order/:id/payment
 */
router.post('/:id/payment', async (req, res) => {
  try {
    console.log('🔍 Sales Order Route: POST /:id/payment called');
    
    const db = require('../models/sequelize');
    const { SalesOrder } = db;
    
    const { paymentMethod, amountPaid } = req.body;
    
    const salesOrder = await SalesOrder.findByPk(req.params.id);
    if (!salesOrder) {
      return res.status(404).json({
        success: false,
        message: 'Sales order not found'
      });
    }

    // Determine payment status
    let paymentStatus = 'pending';
    if (amountPaid >= salesOrder.totalAmount) {
      paymentStatus = 'paid';
    } else if (amountPaid > 0) {
      paymentStatus = 'partial';
    }

    // Update sales order
    await salesOrder.update({
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      orderStatus: paymentStatus === 'paid' ? 'confirmed' : 'processing',
      updatedById: req.user.id
    });

    res.json({
      success: true,
      result: salesOrder,
      message: 'Payment processed successfully'
    });

  } catch (error) {
    console.error('❌ Sales Order Route: Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
      error: error.message
    });
  }
});

/**
 * Get all Customers (for dropdown)
 * GET /api/sales-order/customers
 */
router.get('/customers', async (req, res) => {
  try {
    const db = require('../models/sequelize');
    const { Customer } = db;
    
    const customers = await Customer.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
      attributes: ['id', 'customerNumber', 'name', 'email', 'phone', 'customerType']
    });
    
    res.json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching customers', 
      error: error.message 
    });
  }
});

/**
 * Get all Items (for POS scanning/selection)
 * GET /api/sales-order/items
 */
router.get('/items', async (req, res) => {
  try {
    const db = require('../models/sequelize');
    const { ItemMaster } = db;
    
    const { search, category, barcode } = req.query;
    
    let whereClause = { status: 'APPROVED' };
    
    if (search) {
      whereClause[Op.or] = [
        { itemNumber: { [Op.iLike]: `%${search}%` } },
        { shortDescription: { [Op.iLike]: `%${search}%` } },
        { longDescription: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (category) {
      whereClause.equipmentCategory = category;
    }
    
    if (barcode) {
      whereClause.itemNumber = barcode; // For demonstration, using itemNumber as barcode
    }
    
    const items = await ItemMaster.findAll({
      where: whereClause,
      order: [['itemNumber', 'ASC']],
      attributes: [
        'id', 'itemNumber', 'shortDescription', 'longDescription', 
        'equipmentCategory', 'equipmentSubCategory', 'uom', 
        'manufacturerName', 'manufacturerPartNumber'
      ],
      limit: 50
    });
    
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching items', 
      error: error.message 
    });
  }
});

/**
 * Barcode Scanner Simulation
 * POST /api/sales-order/scan
 */
router.post('/scan', async (req, res) => {
  try {
    const db = require('../models/sequelize');
    const { ItemMaster } = db;
    
    const { barcode } = req.body;
    
    if (!barcode) {
      return res.status(400).json({
        success: false,
        message: 'Barcode is required'
      });
    }
    
    // For demonstration, search by itemNumber (acting as barcode)
    const item = await ItemMaster.findOne({
      where: { 
        itemNumber: barcode,
        status: 'APPROVED'
      },
      attributes: [
        'id', 'itemNumber', 'shortDescription', 'longDescription', 
        'equipmentCategory', 'uom', 'manufacturerName'
      ]
    });
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found for this barcode'
      });
    }
    
    res.json({
      success: true,
      item: {
        ...item.toJSON(),
        barcode: barcode,
        unitPrice: 0, // Default price - would come from pricing table in real system
        quantity: 1
      },
      message: 'Item scanned successfully'
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error scanning barcode', 
      error: error.message 
    });
  }
});

/**
 * Get Sales Analytics
 * GET /api/sales-order/analytics
 */
router.get('/analytics', async (req, res) => {
  try {
    const db = require('../models/sequelize');
    const { SalesOrder, SalesOrderItem } = db;
    
    const { dateFrom, dateTo } = req.query;
    
    let whereClause = {};
    if (dateFrom && dateTo) {
      whereClause.orderDate = {
        [Op.between]: [new Date(dateFrom), new Date(dateTo)]
      };
    }
    
    // Total sales
    const totalSales = await SalesOrder.sum('totalAmount', {
      where: { ...whereClause, paymentStatus: 'paid' }
    });
    
    // Order count
    const orderCount = await SalesOrder.count({
      where: whereClause
    });
    
    // Average order value
    const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;
    
    // Top selling items
    const topItems = await SalesOrderItem.findAll({
      attributes: [
        'itemNumber',
        'itemDescription',
        [db.sequelize.fn('SUM', db.sequelize.col('quantity')), 'totalQuantity'],
        [db.sequelize.fn('SUM', db.sequelize.col('lineTotal')), 'totalValue']
      ],
      include: [{
        model: SalesOrder,
        as: 'salesOrder',
        where: whereClause,
        attributes: []
      }],
      group: ['SalesOrderItem.itemNumber', 'SalesOrderItem.itemDescription'],
      order: [[db.sequelize.fn('SUM', db.sequelize.col('quantity')), 'DESC']],
      limit: 10
    });
    
    res.json({
      success: true,
      analytics: {
        totalSales: totalSales || 0,
        orderCount,
        avgOrderValue: avgOrderValue || 0,
        topItems
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching analytics', 
      error: error.message 
    });
  }
});

module.exports = router;