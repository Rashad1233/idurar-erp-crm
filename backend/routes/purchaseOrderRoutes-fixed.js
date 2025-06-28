const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { protect } = require('../middleware/authMiddleware');
const { sendPOForApproval } = require('../services/approvalService');

// Import models directly instead of lazy loading
const db = require('../models/sequelize');

// All routes are protected
router.use(protect);

/**
 * Get all Purchase Orders
 * GET /api/procurement/purchase-order
 */
router.get('/', async (req, res) => {
  console.log('🔍 PO Route Handler: GET / called');
  try {
    console.log('🔍 PO Route Handler: Getting models directly...');
    
    // Get models directly from db object
    const { PurchaseOrder, PurchaseOrderItem, Supplier, User } = db;
    
    console.log('🔍 PO Route Handler: Models received:', {
      PurchaseOrder: !!PurchaseOrder,
      PurchaseOrderItem: !!PurchaseOrderItem,
      Supplier: !!Supplier,
      User: !!User
    });
    
    // Validate models are available
    if (!PurchaseOrder) {
      console.log('❌ PO Route Handler: PurchaseOrder model not available');
      console.log('🔍 Available models in db:', Object.keys(db).filter(key => !['sequelize', 'Sequelize'].includes(key)));
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
      error: error.message
    });
    console.log('❌ PO Route Handler: Error response sent');
  }
});

/**
 * Get single Purchase Order
 * GET /api/procurement/purchase-order/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { PurchaseOrder, PurchaseOrderItem, Supplier, User, RequestForQuotation } = db;
    
    const purchaseOrder = await PurchaseOrder.findByPk(req.params.id, {
      include: [
        {
          model: Supplier,
          as: 'supplier'
        },
        {
          model: User,
          as: 'requestor',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: PurchaseOrderItem,
          as: 'items'
        },
        {
          model: RequestForQuotation,
          as: 'requestForQuotation',
          attributes: ['id', 'rfqNumber']
        }
      ]
    });

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found'
      });
    }

    res.json({
      success: true,
      result: purchaseOrder
    });

  } catch (error) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching purchase order',
      error: error.message
    });
  }
});

/**
 * Create new Purchase Order
 * POST /api/procurement/purchase-order
 */
router.post('/', async (req, res) => {
  try {
    const { PurchaseOrder, PurchaseOrderItem, Supplier, RequestForQuotation, PurchaseRequisitionItem } = db;
    
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
      urgency = 'medium'
    } = req.body;

    // Validate required fields
    if (!description || !supplierId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Description, supplier, and items are required'
      });
    }

    // Validate RFQ status is 'in_progress'
    if (requestForQuotationId) {
      const rfq = await RequestForQuotation.findByPk(requestForQuotationId);
      if (!rfq) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Request For Quotation ID'
        });
      }
      if (rfq.status !== 'in_progress') {
        return res.status(400).json({
          success: false,
          message: 'Only RFQs with status "in_progress" can be used for Purchase Orders'
        });
      }

      // Validate PO items are from PR items linked to RFQ
      const prItems = await PurchaseRequisitionItem.findAll({
        where: { purchaseRequisitionId: rfq.purchaseRequisitionId }
      });
      const prItemIds = prItems.map(prItem => prItem.id);

      for (const item of items) {
        if (!prItemIds.includes(item.purchaseRequisitionItemId)) {
          return res.status(400).json({
            success: false,
            message: `Item with purchaseRequisitionItemId ${item.purchaseRequisitionItemId} is not part of the Purchase Requisition linked to the RFQ`
          });
        }
      }
    }

    // Generate PO number
    const lastPO = await PurchaseOrder.findOne({
      order: [['createdAt', 'DESC']]
    });
    
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
      costCenter,
      urgency,
      createdById: req.user.id,
      updatedById: req.user.id
    });

    // Create PO items
    const poItems = items.map(item => ({
      purchaseOrderId: purchaseOrder.id,
      purchaseRequisitionItemId: item.purchaseRequisitionItemId,
      description: item.description,
      quantity: item.quantity,
      uom: item.uom,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
      deliveryDate: item.deliveryDate,
      notes: item.notes
    }));

    await PurchaseOrderItem.bulkCreate(poItems);

    // Fetch the created PO with items
    const createdPO = await PurchaseOrder.findByPk(purchaseOrder.id, {
      include: [
        {
          model: Supplier,
          as: 'supplier'
        },
        {
          model: PurchaseOrderItem,
          as: 'items'
        }
      ]
    });

    res.status(201).json({
      success: true,
      result: createdPO,
      message: 'Purchase Order created successfully'
    });

  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating purchase order',
      error: error.message
    });
  }
});

/**
 * Update Purchase Order
 * PUT /api/procurement/purchase-order/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { PurchaseOrder, PurchaseOrderItem, Supplier } = db;
    
    const purchaseOrder = await PurchaseOrder.findByPk(req.params.id);
    
    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found'
      });
    }

    // Update PO
    await purchaseOrder.update({
      ...req.body,
      updatedById: req.user.id
    });

    // If items are provided, update them
    if (req.body.items) {
      // Delete existing items
      await PurchaseOrderItem.destroy({
        where: { purchaseOrderId: purchaseOrder.id }
      });

      // Create new items
      const poItems = req.body.items.map(item => ({
        purchaseOrderId: purchaseOrder.id,
        description: item.description,
        quantity: item.quantity,
        uom: item.uom,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
        deliveryDate: item.deliveryDate,
        notes: item.notes
      }));

      await PurchaseOrderItem.bulkCreate(poItems);
    }

    // Fetch updated PO
    const updatedPO = await PurchaseOrder.findByPk(purchaseOrder.id, {
      include: [
        {
          model: Supplier,
          as: 'supplier'
        },
        {
          model: PurchaseOrderItem,
          as: 'items'
        }
      ]
    });

    res.json({
      success: true,
      result: updatedPO,
      message: 'Purchase Order updated successfully'
    });

  } catch (error) {
    console.error('Error updating purchase order:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating purchase order',
      error: error.message
    });
  }
});

/**
 * Send Purchase Order for approval
 * POST /api/procurement/purchase-order/:id/send-for-approval
 */
router.post('/:id/send-for-approval', async (req, res) => {
  try {
    const { approverEmails, urgency = 'medium', customMessage } = req.body;

    if (!approverEmails || !Array.isArray(approverEmails) || approverEmails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Approver emails are required'
      });
    }

    const result = await sendPOForApproval(
      req.params.id,
      approverEmails,
      urgency,
      customMessage
    );

    res.json({
      success: true,
      result: result,
      message: `Purchase Order sent for approval to ${result.approverCount} approvers`
    });

  } catch (error) {
    console.error('Error sending PO for approval:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending Purchase Order for approval',
      error: error.message
    });
  }
});

/**
 * Delete Purchase Order
 * DELETE /api/procurement/purchase-order/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { PurchaseOrder, PurchaseOrderItem } = db;
    
    const purchaseOrder = await PurchaseOrder.findByPk(req.params.id);
    
    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found'
      });
    }

    // Check if PO can be deleted (only draft status)
    if (purchaseOrder.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft Purchase Orders can be deleted'
      });
    }

    // Delete PO items first
    await PurchaseOrderItem.destroy({
      where: { purchaseOrderId: purchaseOrder.id }
    });

    // Delete PO
    await purchaseOrder.destroy();

    res.json({
      success: true,
      message: 'Purchase Order deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting purchase order:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting purchase order',
      error: error.message
    });
  }
});

module.exports = router;