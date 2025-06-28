const express = require('express');
const router = express.Router();
const { 
  supplierAcceptance
} = require('../controllers/supplierController');
const { 
  getContractForAcceptance,
  acceptContract
} = require('../controllers/supplierPortalController');
const { 
  Supplier,
  RequestForQuotation,
  RfqSupplier,
  RfqItem,
  RfqQuoteItem,
  PurchaseOrder,
  PurchaseOrderItem
} = require('../models/sequelize');

// Public route for supplier acceptance (no auth required)
router.post('/acceptance/:token', supplierAcceptance);

// Public route to get supplier info by token (for the acceptance page)
router.get('/acceptance/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const supplier = await Supplier.findOne({
      where: { acceptanceToken: token },
      attributes: ['id', 'legalName', 'contactEmail', 'status']
    });
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired acceptance link'
      });
    }
    
    if (supplier.status !== 'pending_supplier_acceptance') {
      return res.status(400).json({
        success: false,
        message: 'This supplier has already been processed'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        supplierName: supplier.legalName,
        contactEmail: supplier.contactEmail
      }
    });
  } catch (error) {
    console.error('❌ Error fetching supplier acceptance info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supplier information'
    });
  }
});

// Public routes for contract acceptance (no auth required)
router.get('/contract/acceptance/:contractId', getContractForAcceptance);
router.post('/contract/acceptance/:contractId', async (req, res) => {
  try {
    // Handle the contract acceptance with decision parameter
    const { decision } = req.body;
    
    if (decision === 'accept') {
      // Call the existing acceptContract function
      await acceptContract(req, res);
    } else if (decision === 'decline') {
      // Handle contract rejection
      const { Contract, Supplier } = require('../models/sequelize');
      const { contractId } = req.params;
      
      const contract = await Contract.findOne({
        where: { id: contractId },
        include: [
          {
            model: Supplier,
            as: 'supplier',
            attributes: ['id', 'legalName', 'contactEmail']
          }
        ]
      });

      if (!contract) {
        return res.status(404).json({
          success: false,
          message: 'Contract not found'
        });
      }

      // Update contract status to rejected
      await contract.update({
        status: 'rejected_by_supplier',
        supplierRejectedAt: new Date(),
        rejectionReason: req.body.rejectionReason || 'Declined by supplier'
      });

      res.status(200).json({
        success: true,
        message: 'Contract has been declined. Thank you for your response.',
        data: {
          contractId: contract.id,
          contractNumber: contract.contractNumber,
          status: 'rejected_by_supplier'
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid decision. Must be "accept" or "decline".'
      });
    }
  } catch (error) {
    console.error('❌ Error processing contract response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process contract response'
    });
  }
});

// RFQ Response Routes (Public - No Auth Required)
router.get('/rfq/response/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find RFQ supplier by token
    const rfqSupplier = await RfqSupplier.findOne({
      where: { responseToken: token },
      include: [
        {
          model: RequestForQuotation,
          as: 'rfq',
          include: [
            {
              model: RfqItem,
              as: 'items',
              attributes: ['id', 'description', 'quantity', 'uom', 'estimatedPrice', 'notes']
            }
          ],
          attributes: ['id', 'rfqNumber', 'description', 'responseDeadline', 'status', 'notes']
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'legalName', 'contactEmail']
        }
      ],
      attributes: ['id', 'status', 'notes', 'sentAt', 'respondedAt']
    });
    
    if (!rfqSupplier) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired RFQ response link'
      });
    }
    
    // Check if already submitted
    if (rfqSupplier.status === 'responded' || rfqSupplier.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: `This RFQ has already been ${rfqSupplier.status}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        rfqNumber: rfqSupplier.rfq.rfqNumber,
        description: rfqSupplier.rfq.description,
        responseDeadline: rfqSupplier.rfq.responseDeadline,
        supplierName: rfqSupplier.supplierName,
        status: rfqSupplier.status,
        lineItems: rfqSupplier.rfq.items,
        notes: rfqSupplier.rfq.notes
      }
    });
  } catch (error) {
    console.error('❌ Error fetching RFQ response info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RFQ information'
    });
  }
});

router.post('/rfq/response/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { action, lineItems, currency, validUntil, deliveryTerms, paymentTerms, comments, totalAmount } = req.body;
    
    // Find RFQ supplier by token
    const rfqSupplier = await RfqSupplier.findOne({
      where: { responseToken: token },
      include: [
        {
          model: RequestForQuotation,
          as: 'rfq',
          attributes: ['id', 'rfqNumber']
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'legalName']
        }
      ]
    });
    
    if (!rfqSupplier) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired RFQ response link'
      });
    }
    
    // Handle decline action
    if (action === 'decline') {
      await rfqSupplier.update({
        status: 'rejected',
        notes: req.body.reason || 'Declined by supplier',
        respondedAt: new Date()
      });
      
      return res.status(200).json({
        success: true,
        message: 'Thank you for your response. We have recorded that you are unable to provide a quotation at this time.',
        data: {
          rfqNumber: rfqSupplier.rfq.rfqNumber
        }
      });
    }
    
    // Handle quotation submission
    if (!lineItems || !Array.isArray(lineItems)) {
      return res.status(400).json({
        success: false,
        message: 'Line items are required for quotation submission'
      });
    }
    
    // Update RFQ supplier status
    await rfqSupplier.update({
      status: 'responded',
      notes: comments || '',
      respondedAt: new Date()
    });
    
    // Create RFQ quote items
    for (const item of lineItems) {
      await RfqQuoteItem.create({
        rfqSupplierId: rfqSupplier.id,
        itemDescription: item.description,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice || 0),
        totalPrice: parseFloat(item.unitPrice || 0) * parseFloat(item.quantity || 0),
        currency: currency || 'USD',
        leadTime: item.leadTime || null,
        notes: item.comments || ''
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Your quotation has been submitted successfully. Our procurement team will review it and contact you with the results.',
      data: {
        rfqNumber: rfqSupplier.rfq.rfqNumber,
        totalAmount: totalAmount
      }
    });
  } catch (error) {
    console.error('❌ Error submitting RFQ response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit RFQ response'
    });
  }
});

// Purchase Order Approval Routes (Public - No Auth Required)
router.get('/po/approval/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find PO by approval token
    const purchaseOrder = await PurchaseOrder.findOne({
      where: { approvalToken: token },
      include: [
        {
          model: PurchaseOrderItem,
          as: 'items',
          attributes: ['id', 'description', 'quantity', 'uom', 'unitPrice', 'deliveryDate']
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'legalName', 'contactEmail']
        }
      ],
      attributes: [
        'id', 'poNumber', 'description', 'totalAmount', 'currency',
        'requestDate', 'requiredBy', 'requestedBy', 'approvalStatus',
        'currentApprovalLevel', 'totalApprovalLevels', 'businessJustification'
      ]
    });
    
    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired purchase order approval link'
      });
    }
    
    // Check if already processed
    if (purchaseOrder.approvalStatus === 'approved' || purchaseOrder.approvalStatus === 'rejected') {
      return res.status(400).json({
        success: false,
        message: `This purchase order has already been ${purchaseOrder.approvalStatus}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        poNumber: purchaseOrder.poNumber,
        description: purchaseOrder.description,
        totalAmount: purchaseOrder.totalAmount,
        currency: purchaseOrder.currency,
        requestDate: purchaseOrder.requestDate,
        requiredBy: purchaseOrder.requiredBy,
        requestedBy: purchaseOrder.requestedBy,
        supplierName: purchaseOrder.supplier?.legalName,
        currentApprovalLevel: purchaseOrder.currentApprovalLevel,
        totalApprovalLevels: purchaseOrder.totalApprovalLevels,
        businessJustification: purchaseOrder.businessJustification,
        lineItems: purchaseOrder.items
      }
    });
  } catch (error) {
    console.error('❌ Error fetching PO approval info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase order information'
    });
  }
});

router.post('/po/approval/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { action, comments, approverInfo } = req.body;
    
    // Find PO by approval token
    const purchaseOrder = await PurchaseOrder.findOne({
      where: { approvalToken: token },
      attributes: ['id', 'poNumber', 'totalAmount', 'currency', 'approvalStatus']
    });
    
    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired purchase order approval link'
      });
    }
    
    // Check if already processed
    if (purchaseOrder.approvalStatus === 'approved' || purchaseOrder.approvalStatus === 'rejected') {
      return res.status(400).json({
        success: false,
        message: `This purchase order has already been ${purchaseOrder.approvalStatus}`
      });
    }
    
    // Update purchase order status
    const updateData = {
      approvalStatus: action === 'approve' ? 'approved' : 'rejected',
      approvedAt: new Date(),
      approverComments: comments || '',
      approverName: approverInfo?.name || '',
      approverTitle: approverInfo?.title || ''
    };
    
    await purchaseOrder.update(updateData);
    
    const message = action === 'approve' 
      ? `Purchase Order ${purchaseOrder.poNumber} has been approved successfully.`
      : `Purchase Order ${purchaseOrder.poNumber} has been rejected and sent back for revision.`;
    
    res.status(200).json({
      success: true,
      message: message,
      data: {
        poNumber: purchaseOrder.poNumber,
        totalAmount: purchaseOrder.totalAmount,
        currency: purchaseOrder.currency,
        status: updateData.approvalStatus
      }
    });
  } catch (error) {
    console.error('❌ Error processing PO approval:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process purchase order approval'
    });
  }
});

module.exports = router;