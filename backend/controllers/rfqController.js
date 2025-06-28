const nodemailer = require('nodemailer');
const { 
  RequestForQuotation,
  RfqItem,
  RfqSupplier,
  RfqQuoteItem,
  Supplier,
  PurchaseRequisition,
  User,
  sequelize
} = require('../models/sequelize');
// Create models object with both capitalized and lowercase aliases
const models = {
  RequestForQuotation,
  requestforquotation: RequestForQuotation,
  RfqItem,
  rfqitem: RfqItem,
  RfqSupplier,
  rfqsupplier: RfqSupplier,
  RfqQuoteItem,
  rfqquoteitem: RfqQuoteItem,
  Supplier,
  supplier: Supplier,
  PurchaseRequisition,
  purchaserequisition: PurchaseRequisition,
  User,
  user: User
};
const { generateRFQNumber: generateRFQNumberUtil } = require('../utils/numberGenerator');
const config = require('../config/config');

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.password
  }
});

// Generate RFQ number (format: RFQ-YYYYMMDD-XXXX)
const generateRFQNumber = async () => {
  return generateRFQNumberUtil();
};

// @desc    Create a new RFQ
// @route   POST /api/procurement/rfq
// @access  Private
exports.createRFQ = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      purchaseRequisitionId,
      description,
      submissionDeadline,
      lineItems,
      supplierIds
    } = req.body;

    // Validate required fields
    if (!purchaseRequisitionId || !submissionDeadline || !lineItems || !lineItems.length) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Generate RFQ number
    const rfqNumber = await generateRFQNumber();

    // Create RFQ
    const rfq = await RequestForQuotation.create({
      rfqNumber,
      purchaseRequisitionId,
      description,
      responseDeadline: submissionDeadline,
      status: 'draft',
      createdById: req.user.id,
      updatedById: req.user.id
    }, { transaction });

    // Create RFQ line items
    await Promise.all(lineItems.map(item =>
      RfqItem.create({
        ...item,
        requestForQuotationId: rfq.id
      }, { transaction })
    ));

    // Create RFQ supplier records for each supplier
    const suppliers = await models.Supplier.findAll({
      where: {
        id: supplierIds
      },
      transaction
    });

    await Promise.all(suppliers.map(supplier =>
      RfqSupplier.create({
        requestForQuotationId: rfq.id,
        supplierId: supplier.id,
        supplierName: supplier.legalName || supplier.tradeName,
        contactEmail: supplier.contactEmail,
        contactPhone: supplier.contactPhone,
        status: 'pending'
      }, { transaction })
    ));

    await transaction.commit();

    // Send emails to suppliers
    await Promise.all(suppliers.map(supplier =>
      sendRFQEmail(rfq, supplier)
    ));

    res.status(201).json({
      success: true,
      message: 'RFQ created successfully',
      data: {
        id: rfq.id,
        rfqNumber: rfq.rfqNumber
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating RFQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating RFQ',
      error: error.message
    });
  }
};

// Send RFQ email to supplier
const sendRFQEmail = async (rfq, supplier) => {
  try {
    // Check if email configuration is available
    if (!config.email.user || !config.email.password) {
      console.error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASSWORD in .env file');
      return;
    }

    // Find the RFQ supplier record
    const rfqSupplier = await RfqSupplier.findOne({
      where: {
        requestForQuotationId: rfq.id,
        supplierId: supplier.id
      }
    });

    if (!rfqSupplier) {
      console.error(`RFQ supplier record not found for supplier ${supplier.id} and RFQ ${rfq.id}`);
      return;
    }

    // Generate response token if not exists
    if (!rfqSupplier.responseToken) {
      const crypto = require('crypto');
      const responseToken = crypto.randomBytes(32).toString('hex');
      await rfqSupplier.update({ 
        responseToken: responseToken,
        tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });
      rfqSupplier.responseToken = responseToken;
    }

    const supplierPortalUrl = `${config.baseUrl}/rfq/supplier-approval/${rfq.id}/${rfqSupplier.supplierId}`;
    
    // Determine recipient email
    const recipientEmail = supplier.contactEmail || supplier.email || rfqSupplier.contactEmail;
    if (!recipientEmail) {
      console.error(`No email address found for supplier: ${supplier.legalName || supplier.tradeName || 'Unknown'}`);
      return;
    }

    const mailOptions = {
      from: config.email.from,
      to: recipientEmail,
      cc: supplier.contactEmailSecondary || rfqSupplier.contactEmailSecondary,
      subject: `Request for Quotation: ${rfq.rfqNumber}`,
      html: `
        <h2>Request for Quotation</h2>
        <p>Dear ${supplier.tradeName || supplier.legalName || 'Supplier'},</p>
        <p>You have received a new Request for Quotation (${rfq.rfqNumber}).</p>
        <p><strong>Description:</strong> ${rfq.description}</p>
        <p><strong>Submission Deadline:</strong> ${new Date(rfq.responseDeadline).toLocaleDateString()}</p>
        <p>Please click the link below to view the RFQ details and submit your response:</p>
        <p><a href="${supplierPortalUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Access RFQ Portal</a></p>
        <p>If you have any questions, please contact our procurement team.</p>
        <br>
        <p>Best regards,<br>Procurement Team</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          RFQ Number: ${rfq.rfqNumber}<br>
          Response Required By: ${new Date(rfq.responseDeadline).toLocaleDateString()}<br>
          Link: <a href="${supplierPortalUrl}">${supplierPortalUrl}</a>
        </p>
      `
    };

    console.log(`Attempting to send RFQ email to: ${recipientEmail}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ RFQ email sent successfully to ${recipientEmail}. Message ID: ${result.messageId}`);
    
    // Update the RFQ supplier record to mark as sent
    await rfqSupplier.update({
      status: 'sent',
      sentAt: new Date()
    });
    
  } catch (error) {
    console.error(`❌ Error sending RFQ email:`, error);
    console.error(`Supplier: ${supplier.legalName || supplier.tradeName || 'Unknown'}`);
    console.error(`Email: ${supplier.contactEmail || supplier.email || 'No email'}`);
  }
};

// @desc    Get RFQ list
// @route   GET /api/procurement/rfq
// @access  Private
exports.getRFQs = async (req, res) => {
  try {
    const rfqs = await RequestForQuotation.findAll({
      include: [
        {
          model: PurchaseRequisition,
          as: 'purchaseRequisition'
        },
        {
          model: RfqSupplier,
          as: 'suppliers',
          include: [
            {
              model: Supplier,
              as: 'supplier'
            }
          ]
        },
        {
          model: RfqItem,
          as: 'items'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: rfqs
    });
  } catch (error) {
    console.error('Error fetching RFQs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching RFQs',
      error: error.message
    });
  }
};

// @desc    Approve RFQ by supplier
// @route   POST /api/procurement/rfq/:id/supplier-approve
// @access  Private (supplier portal)
exports.supplierApproveRFQ = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { supplierId, comments } = req.body;

    // Find the RFQ
    const rfq = await RequestForQuotation.findByPk(id, { transaction });
    if (!rfq) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    // Find the supplier's RFQ record
    const rfqSupplier = await RfqSupplier.findOne({
      where: {
        requestForQuotationId: id,
        supplierId: supplierId
      },
      transaction
    });

    if (!rfqSupplier) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Supplier not found for this RFQ'
      });
    }

    // Update supplier status to approved
    await rfqSupplier.update({
      status: 'approved',
      respondedAt: new Date(),
      notes: comments || null
    }, { transaction });

    // Check supplier responses and update RFQ status accordingly
    const allSuppliers = await RfqSupplier.findAll({
      where: {
        requestForQuotationId: id
      },
      transaction
    });

    // Count suppliers by status
    const approvedSuppliers = allSuppliers.filter(s => s.status === 'approved');
    const rejectedSuppliers = allSuppliers.filter(s => s.status === 'rejected');
    
    // Update RFQ status based on supplier responses
    let newRfqStatus = rfq.status;
    
    // If all suppliers rejected, mark as rejected
    if (rejectedSuppliers.length === allSuppliers.length && allSuppliers.length > 0) {
      newRfqStatus = 'rejected';
    }
    // If at least one supplier approved and RFQ is not already in_progress, mark as in_progress
    else if (approvedSuppliers.length > 0 && rfq.status !== 'in_progress') {
      newRfqStatus = 'in_progress';
    }
    
    // Update RFQ status if it changed
    if (newRfqStatus !== rfq.status) {
      await rfq.update({
        status: newRfqStatus
      }, { transaction });
    }

    await transaction.commit();

    res.json({
      success: true,
      message: 'RFQ approved by supplier successfully',
      data: {
        rfqId: id,
        supplierId: supplierId,
        allSuppliersApproved: approvedSuppliers.length === allSuppliers.length
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error approving RFQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving RFQ',
      error: error.message
    });
  }
};

// @desc    Reject RFQ by supplier
// @route   POST /api/procurement/rfq/:id/supplier-reject
// @access  Private (supplier portal)
exports.supplierRejectRFQ = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { supplierId, comments } = req.body;

    // Find the RFQ
    const rfq = await RequestForQuotation.findByPk(id, { transaction });
    if (!rfq) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    // Find the supplier's RFQ record
    const rfqSupplier = await RfqSupplier.findOne({
      where: {
        requestForQuotationId: id,
        supplierId: supplierId
      },
      transaction
    });

    if (!rfqSupplier) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Supplier not found for this RFQ'
      });
    }

    // Update supplier status to rejected
    await rfqSupplier.update({
      status: 'rejected',
      respondedAt: new Date(),
      notes: comments || null
    }, { transaction });

    // Check supplier responses and update RFQ status accordingly
    const allSuppliers = await RfqSupplier.findAll({
      where: {
        requestForQuotationId: id
      },
      transaction
    });

    // Count suppliers by status
    const approvedSuppliers = allSuppliers.filter(s => s.status === 'approved');
    const rejectedSuppliers = allSuppliers.filter(s => s.status === 'rejected');
    
    // Update RFQ status based on supplier responses
    let newRfqStatus = rfq.status;
    
    // If all suppliers rejected, mark as rejected
    if (rejectedSuppliers.length === allSuppliers.length && allSuppliers.length > 0) {
      newRfqStatus = 'rejected';
    }
    // If at least one supplier approved and RFQ is not already in_progress, mark as in_progress
    else if (approvedSuppliers.length > 0 && rfq.status !== 'in_progress') {
      newRfqStatus = 'in_progress';
    }
    
    // Update RFQ status if it changed
    if (newRfqStatus !== rfq.status) {
      await rfq.update({
        status: newRfqStatus
      }, { transaction });
    }

    await transaction.commit();

    res.json({
      success: true,
      message: 'RFQ rejected by supplier successfully',
      data: {
        rfqId: id,
        supplierId: supplierId
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error rejecting RFQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting RFQ',
      error: error.message
    });
  }
};

// @desc    Get RFQ by ID
// @route   GET /api/procurement/rfq/:id
// @access  Private
exports.getRFQ = async (req, res) => {
  try {
    const rfq = await RequestForQuotation.findByPk(req.params.id, {
      include: [
        {
          model: PurchaseRequisition,
          as: 'purchaseRequisition'
        },
        {
          model: RfqSupplier,
          as: 'suppliers',
          include: [
            {
              model: Supplier,
              as: 'supplier'
            },
            {
              model: RfqQuoteItem,
              as: 'quotedItems'
            }
          ]
        },
        {
          model: RfqItem,
          as: 'items'
        }
      ]
    });

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    res.json({
      success: true,
      data: rfq
    });
  } catch (error) {
    console.error('Error fetching RFQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching RFQ',
      error: error.message
    });
  }
};
