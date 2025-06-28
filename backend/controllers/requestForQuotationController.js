// Controller for Request for Quotation (RFQ) functionality
const { 
  RequestForQuotation, 
  RfqItem, 
  RfqSupplier, 
  RfqQuoteItem, 
  PurchaseRequisition,
  PurchaseRequisitionItem,
  User, 
  Supplier,
  ItemMaster,
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
  PurchaseRequisition,
  purchaserequisition: PurchaseRequisition,
  PurchaseRequisitionItem,
  purchaserequisitionitem: PurchaseRequisitionItem,
  User,
  user: User,
  Supplier,
  supplier: Supplier,
  ItemMaster,
  itemmaster: ItemMaster
};
const { Op } = require('sequelize');
const { generateTimeBasedId } = require('../utils/idGenerator');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email configuration - TEMPORARY: using fallback credentials for testing
const config = {
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || 'rashadyus10@gmail.com',
    password: process.env.EMAIL_PASSWORD || 'hldk uywx bxvl sxqu',
    from: process.env.EMAIL_FROM || 'ERP System <rashadyus10@gmail.com>'
  },
  baseUrl: process.env.BASE_URL || 'http://localhost:3000'
};

// Create email transporter
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.password
  }
});

// Send RFQ email notification to supplier
const sendRFQEmailNotification = async (rfq, rfqSupplier, requestData) => {
  try {
    // Check if email configuration is available
    if (!config.email.user || !config.email.password) {
      throw new Error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASSWORD in .env file');
    }

    // Generate response token if not exists
    if (!rfqSupplier.responseToken) {
      const responseToken = crypto.randomBytes(32).toString('hex');
      await rfqSupplier.update({ 
        responseToken: responseToken,
        tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });
      rfqSupplier.responseToken = responseToken;
    }

    const supplierPortalUrl = `${config.baseUrl}/rfq/supplier-approval/${rfq.id}/${rfqSupplier.supplierId}`;
    
    // Determine recipient email
    const recipientEmail = rfqSupplier.contactEmail;
    if (!recipientEmail) {
      throw new Error(`No email address found for supplier: ${rfqSupplier.supplierName}`);
    }

    const mailOptions = {
      from: config.email.from,
      to: recipientEmail,
      cc: rfqSupplier.contactEmailSecondary,
      subject: requestData.emailSubject || `Request for Quotation: ${rfq.rfqNumber}`,
      html: `
        <h2>Request for Quotation</h2>
        <p>Dear ${rfqSupplier.supplierName},</p>
        <p>You have received a new Request for Quotation (${rfq.rfqNumber}).</p>
        <p><strong>Description:</strong> ${rfq.description}</p>
        <p><strong>Submission Deadline:</strong> ${new Date(rfq.responseDeadline).toLocaleDateString()}</p>
        
        ${requestData.message ? `<div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0;">
          <p><strong>Message from Procurement Team:</strong></p>
          <p>${requestData.message.replace(/\n/g, '<br>')}</p>
        </div>` : ''}
        
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
    
    return result;
    
  } catch (error) {
    console.error(`❌ Error sending RFQ email:`, error);
    throw error;
  }
};

// Generate an RFQ number (format: RFQ-YYYYMMDD-XXXX)
const generateRFQNumber = async () => {
  const prefix = 'RFQ';
  const now = new Date();
  const date = now.getFullYear() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0');
  
  // Find the latest RFQ number for today
  const latestRFQ = await RequestForQuotation.findOne({
    where: {
      rfqNumber: {
        [Op.like]: `${prefix}-${date}-%`
      }
    },
    order: [['createdAt', 'DESC']]
  });
  
  let sequenceNumber = 1;
  
  if (latestRFQ) {
    // Extract the sequence number from the latest RFQ number
    const parts = latestRFQ.rfqNumber.split('-');
    if (parts.length === 3) {
      sequenceNumber = parseInt(parts[2], 10) + 1;
    }
  }
  
  return `${prefix}-${date}-${sequenceNumber.toString().padStart(4, '0')}`;
};

// @desc    Create a new request for quotation
// @route   POST /api/procurement/rfq
// @access  Private
exports.createRFQ = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      description, 
      responseDeadline, 
      notes,
      purchaseRequisitionId,
      items,
      suppliers
    } = req.body;
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: 'Authentication required. User ID not found.'
      });
    }
    
    // Validate required fields
    if (!description || !responseDeadline || !items || !items.length || !suppliers || !suppliers.length) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: description, responseDeadline, items, and suppliers'
      });
    }
    
    // If purchaseRequisitionId is provided, verify it exists
    if (purchaseRequisitionId) {
      const purchaseRequisition = await models.PurchaseRequisition.findByPk(purchaseRequisitionId);
      if (!purchaseRequisition) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: `Purchase Requisition with ID ${purchaseRequisitionId} not found`
        });
      }
      
      // Check PR status - should be approved
      if (purchaseRequisition.status !== 'approved') {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Purchase Requisition must be approved before creating an RFQ'
        });
      }
    }
    
    // Generate RFQ number
    const rfqNumber = await generateRFQNumber();
    
    // Create the RFQ
    const rfq = await RequestForQuotation.create({
      rfqNumber,
      description,
      status: 'draft',
      responseDeadline: new Date(responseDeadline),
      notes,
      purchaseRequisitionId: purchaseRequisitionId || null,
      createdById: req.user.id,
      updatedById: req.user.id
    }, { transaction });
    
    // Create RFQ items
    const rfqItems = [];
    for (const item of items) {
      // Check if PR item ID is provided and is valid
      if (item.purchaseRequisitionItemId) {
        const prItem = await PurchaseRequisitionItem.findByPk(item.purchaseRequisitionItemId);
        if (!prItem) {
          throw new Error(`PR Item with ID ${item.purchaseRequisitionItemId} not found`);
        }
      }
      
      // Check if item number is provided and is valid
      if (item.itemNumber) {
        const itemMaster = await ItemMaster.findOne({ 
          where: { itemNumber: item.itemNumber }
        });
        if (!itemMaster) {
          throw new Error(`Item with number ${item.itemNumber} not found`);
        }
      }
      
      const rfqItem = await RfqItem.create({
        requestForQuotationId: rfq.id,
        itemNumber: item.itemNumber || null,
        description: item.description,
        uom: item.uom,
        quantity: item.quantity,
        purchaseRequisitionItemId: item.purchaseRequisitionItemId || null
      }, { transaction });
      
      rfqItems.push(rfqItem);
    }
    
    // Create RFQ suppliers
    const rfqSuppliers = [];
    for (const supplier of suppliers) {
      // Check if supplier ID is provided and is valid
      if (supplier.supplierId) {
        const existingSupplier = await models.Supplier.findByPk(supplier.supplierId);
        if (!existingSupplier) {
          throw new Error(`Supplier with ID ${supplier.supplierId} not found`);
        }
        
        // Use existing supplier data if available
        if (!supplier.supplierName) {
          supplier.supplierName = existingSupplier.legalName || existingSupplier.tradeName;
        }
        if (!supplier.contactName && existingSupplier.contactPerson) {
          supplier.contactName = existingSupplier.contactPerson;
        }
        if (!supplier.contactEmail && existingSupplier.contactEmail) {
          supplier.contactEmail = existingSupplier.contactEmail;
        }
        if (!supplier.contactPhone && existingSupplier.contactPhone) {
          supplier.contactPhone = existingSupplier.contactPhone;
        }
      }
      
      // Validate supplier name
      if (!supplier.supplierName) {
        throw new Error('Supplier name is required');
      }
      
      const rfqSupplier = await RfqSupplier.create({
        requestForQuotationId: rfq.id,
        supplierId: supplier.supplierId || null,
        supplierName: supplier.supplierName,
        contactName: supplier.contactName || null,
        contactEmail: supplier.contactEmail || null,
        contactEmailSecondary: supplier.contactEmailSecondary || null,
        contactPhone: supplier.contactPhone || null,
        status: 'pending',
        notes: supplier.notes || null
      }, { transaction });
      
      rfqSuppliers.push(rfqSupplier);
    }
    
    await transaction.commit();
    
    res.status(201).json({
      success: true,
      message: 'Request for Quotation created successfully',
      data: {
        id: rfq.id,
        rfqNumber: rfq.rfqNumber,
        items: rfqItems.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          uom: item.uom
        })),
        suppliers: rfqSuppliers.map(supplier => ({
          id: supplier.id,
          supplierName: supplier.supplierName,
          contactEmail: supplier.contactEmail
        }))
      }
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to create Request for Quotation',
      error: error.message
    });
  }
};

// @desc    Get all requests for quotation
// @route   GET /api/procurement/rfq
// @access  Private
exports.getRFQs = async (req, res) => {
  try {
    // Build query based on query parameters
    const query = {};
    const { status, createdById, dateFrom, dateTo, search } = req.query;
    
    if (status) {
      query.status = status;
    }
    
    if (createdById) {
      query.createdById = createdById;
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt[Op.lte] = new Date(dateTo);
      }
    }
    
    // Search by RFQ number or description
    if (search) {
      query[Op.or] = [
        { rfqNumber: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Determine if we should filter by current user's role
    const isAdmin = req.user.role === 'admin';
    const isProcurementManager = req.user.role === 'procurement_manager';
    
    // Regular users can only see their own RFQs
    if (!isAdmin && !isProcurementManager) {
      query.createdById = req.user.id;
    }
    
    const rfqs = await RequestForQuotation.findAll({
      where: query,
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        },
        {
          model: PurchaseRequisition,
          as: 'purchaseRequisition',
          attributes: ['id', 'prNumber', 'description']
        },
        {
          model: RfqItem,
          as: 'items'
        },
        {
          model: RfqSupplier,
          as: 'suppliers',
          include: [
            {
              model: Supplier,
              as: 'supplier',
              attributes: ['id', 'supplierNumber', 'legalName', 'tradeName']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: rfqs.length,
      data: rfqs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Requests for Quotation',
      error: error.message
    });
  }
};

// @desc    Get a single request for quotation
// @route   GET /api/procurement/rfq/:id
// @access  Private
exports.getRFQ = async (req, res) => {
  try {
    const rfq = await RequestForQuotation.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        },
        {
          model: PurchaseRequisition,
          as: 'purchaseRequisition',
          attributes: ['id', 'prNumber', 'description', 'status', 'totalAmount']
        },
        {
          model: RfqItem,
          as: 'items',
          include: [
            {
              model: ItemMaster,
              as: 'itemMaster',
              attributes: ['id', 'itemNumber', 'shortDescription', 'uom']
            },
            {
              model: PurchaseRequisitionItem,
              as: 'prItem',
              attributes: ['id', 'description', 'quantity', 'unitPrice']
            },
            {
              model: RfqQuoteItem,
              as: 'quotes',
              include: [
                {
                  model: RfqSupplier,
                  as: 'rfqSupplier',
                  attributes: ['id', 'supplierName', 'status']
                }
              ]
            }
          ]
        },
        {
          model: RfqSupplier,
          as: 'suppliers',
          include: [
            {
              model: Supplier,
              as: 'supplier',
              attributes: ['id', 'supplierNumber', 'legalName', 'tradeName', 'contactEmail', 'contactPhone']
            },
            {
              model: RfqQuoteItem,
              as: 'quotedItems',
              include: [
                {
                  model: RfqItem,
                  as: 'rfqItem',
                  attributes: ['id', 'description', 'quantity', 'uom']
                }
              ]
            }
          ]
        }
      ]
    });
    
    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'Request for Quotation not found'
      });
    }
    
    // Check authorization - only creator, admin and procurement managers can view
    const isCreator = rfq.createdById === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isProcurementManager = req.user.role === 'procurement_manager';
    
    if (!isCreator && !isAdmin && !isProcurementManager) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this Request for Quotation'
      });
    }
    
    res.status(200).json({
      success: true,
      data: rfq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Request for Quotation',
      error: error.message
    });
  }
};

// @desc    Update a request for quotation
// @route   PUT /api/procurement/rfq/:id
// @access  Private
exports.updateRFQ = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      description, 
      responseDeadline, 
      notes,
      items,
      suppliers
    } = req.body;
    
    const rfq = await RequestForQuotation.findByPk(req.params.id);
    
    if (!rfq) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Request for Quotation not found'
      });
    }
    
    // Check authorization - only creator or admin can update
    const isCreator = rfq.createdById === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isProcurementManager = req.user.role === 'procurement_manager';
    
    if (!isCreator && !isAdmin && !isProcurementManager) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this Request for Quotation'
      });
    }
    
    // RFQ can only be updated if in draft status
    if (rfq.status !== 'draft') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Request for Quotation can only be updated when in draft status'
      });
    }
    
    // Update RFQ
    if (description) rfq.description = description;
    if (responseDeadline) rfq.responseDeadline = new Date(responseDeadline);
    if (notes !== undefined) rfq.notes = notes;
    
    rfq.updatedById = req.user.id;
    
    // Update items if provided
    if (items && items.length > 0) {
      // Delete existing items
      await RfqItem.destroy({
        where: { requestForQuotationId: rfq.id },
        transaction
      });
      
      // Create new items
      for (const item of items) {
        // Check if PR item ID is provided and is valid
        if (item.purchaseRequisitionItemId) {
          const prItem = await PurchaseRequisitionItem.findByPk(item.purchaseRequisitionItemId);
          if (!prItem) {
            throw new Error(`PR Item with ID ${item.purchaseRequisitionItemId} not found`);
          }
        }
        
        // Check if item number is provided and is valid
        if (item.itemNumber) {
          const itemMaster = await ItemMaster.findOne({ 
            where: { itemNumber: item.itemNumber }
          });
          if (!itemMaster) {
            throw new Error(`Item with number ${item.itemNumber} not found`);
          }
        }
        
        await RfqItem.create({
          requestForQuotationId: rfq.id,
          itemNumber: item.itemNumber || null,
          description: item.description,
          uom: item.uom,
          quantity: item.quantity,
          purchaseRequisitionItemId: item.purchaseRequisitionItemId || null
        }, { transaction });
      }
    }
    
    // Update suppliers if provided
    if (suppliers && suppliers.length > 0) {
      // Delete existing suppliers
      await RfqSupplier.destroy({
        where: { requestForQuotationId: rfq.id },
        transaction
      });
      
      // Create new suppliers
      for (const supplier of suppliers) {
        // Check if supplier ID is provided and is valid
        if (supplier.supplierId) {
          const existingSupplier = await models.Supplier.findByPk(supplier.supplierId);
          if (!existingSupplier) {
            throw new Error(`Supplier with ID ${supplier.supplierId} not found`);
          }
          
          // Use existing supplier data if available
          if (!supplier.supplierName) {
            supplier.supplierName = existingSupplier.legalName || existingSupplier.tradeName;
          }
          if (!supplier.contactName && existingSupplier.contactPerson) {
            supplier.contactName = existingSupplier.contactPerson;
          }
          if (!supplier.contactEmail && existingSupplier.contactEmail) {
            supplier.contactEmail = existingSupplier.contactEmail;
          }
          if (!supplier.contactPhone && existingSupplier.contactPhone) {
            supplier.contactPhone = existingSupplier.contactPhone;
          }
        }
        
        // Validate supplier name
        if (!supplier.supplierName) {
          throw new Error('Supplier name is required');
        }
        
        await RfqSupplier.create({
          requestForQuotationId: rfq.id,
          supplierId: supplier.supplierId || null,
          supplierName: supplier.supplierName,
          contactName: supplier.contactName || null,
          contactEmail: supplier.contactEmail || null,
          contactEmailSecondary: supplier.contactEmailSecondary || null,
          contactPhone: supplier.contactPhone || null,
          status: 'pending',
          notes: supplier.notes || null
        }, { transaction });
      }
    }
    
    await rfq.save({ transaction });
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Request for Quotation updated successfully',
      data: rfq
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to update Request for Quotation',
      error: error.message
    });
  }
};

// @desc    Send RFQ to suppliers
// @route   PUT /api/procurement/rfq/:id/send
// @access  Private
exports.sendRFQ = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const rfq = await RequestForQuotation.findByPk(req.params.id, {
      include: [
        {
          model: RfqItem,
          as: 'items'
        },
        {
          model: RfqSupplier,
          as: 'suppliers'
        }
      ]
    });
    
    if (!rfq) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Request for Quotation not found'
      });
    }
    
    // Check authorization - only creator, admin or procurement manager can send
    const isCreator = rfq.createdById === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isProcurementManager = req.user.role === 'procurement_manager';
    
    if (!isCreator && !isAdmin && !isProcurementManager) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send this Request for Quotation'
      });
    }
    
    // RFQ can only be sent if in draft status
    if (rfq.status !== 'draft') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Request for Quotation can only be sent when in draft status'
      });
    }
    
    // Validate that RFQ has items
    if (!rfq.items || rfq.items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Request for Quotation must have at least one item'
      });
    }
    
    // Validate that RFQ has suppliers
    if (!rfq.suppliers || rfq.suppliers.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Request for Quotation must have at least one supplier'
      });
    }
    
    // Update RFQ status
    rfq.status = 'sent';
    rfq.sentAt = new Date();
    rfq.updatedById = req.user.id;
    
    await rfq.save({ transaction });
    
    // Update all suppliers status to 'sent' and send emails
    const emailResults = [];
    for (const supplier of rfq.suppliers) {
      supplier.status = 'sent';
      supplier.sentAt = new Date();
      await supplier.save({ transaction });
      
      // Send email notification to suppliers
      try {
        await sendRFQEmailNotification(rfq, supplier, req.body);
        emailResults.push({ supplierId: supplier.id, status: 'sent', email: supplier.contactEmail });
        console.log(`✅ Email sent to supplier: ${supplier.supplierName}`);
      } catch (emailError) {
        console.error(`❌ Failed to send email to supplier ${supplier.supplierName}:`, emailError.message);
        emailResults.push({ supplierId: supplier.id, status: 'failed', email: supplier.contactEmail, error: emailError.message });
      }
    }
    
    await transaction.commit();
    
    const successfulEmails = emailResults.filter(r => r.status === 'sent').length;
    const failedEmails = emailResults.filter(r => r.status === 'failed').length;
    
    res.status(200).json({
      success: true,
      message: `Request for Quotation sent to suppliers successfully. Emails sent: ${successfulEmails}, Failed: ${failedEmails}`,
      data: rfq,
      emailResults: emailResults
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to send Request for Quotation',
      error: error.message
    });
  }
};

// @desc    Record supplier quote response
// @route   POST /api/procurement/rfq/:id/quote
// @access  Private
exports.recordSupplierQuote = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      rfqSupplierId, 
      quotedItems 
    } = req.body;
    
    if (!rfqSupplierId || !quotedItems || !quotedItems.length) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide supplier ID and quoted items'
      });
    }
    
    const rfq = await RequestForQuotation.findByPk(req.params.id);
    
    if (!rfq) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Request for Quotation not found'
      });
    }
    
    // Check if RFQ is in sent or in_progress status
    if (rfq.status !== 'sent' && rfq.status !== 'in_progress') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot record quotes for RFQ that is not in sent or in_progress status'
      });
    }
    
    // Verify supplier belongs to this RFQ
    const rfqSupplier = await RfqSupplier.findOne({
      where: {
        id: rfqSupplierId,
        requestForQuotationId: rfq.id
      }
    });
    
    if (!rfqSupplier) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Supplier not found for this RFQ'
      });
    }
    
    // Delete existing quotes for this supplier if any
    await RfqQuoteItem.destroy({
      where: { rfqSupplierId },
      transaction
    });
    
    // Record quoted items
    const recordedQuotes = [];
    for (const item of quotedItems) {
      // Verify item belongs to this RFQ
      const rfqItem = await RfqItem.findOne({
        where: {
          id: item.rfqItemId,
          requestForQuotationId: rfq.id
        }
      });
      
      if (!rfqItem) {
        throw new Error(`Item with ID ${item.rfqItemId} not found in this RFQ`);
      }
      
      // Validate required fields
      if (!item.unitPrice) {
        throw new Error('Unit price is required for each quoted item');
      }
      
      const quote = await RfqQuoteItem.create({
        rfqItemId: item.rfqItemId,
        rfqSupplierId: rfqSupplierId,
        unitPrice: item.unitPrice,
        deliveryTime: item.deliveryTime || null,
        deliveryDate: item.deliveryDate ? new Date(item.deliveryDate) : null,
        currencyCode: item.currencyCode || 'USD',
        notes: item.notes || null,
        isSelected: false
      }, { transaction });
      
      recordedQuotes.push(quote);
    }
    
    // Update supplier status
    rfqSupplier.status = 'responded';
    rfqSupplier.respondedAt = new Date();
    await rfqSupplier.save({ transaction });
    
    // Update RFQ status to in_progress if it was in sent status
    if (rfq.status === 'sent') {
      rfq.status = 'in_progress';
      await rfq.save({ transaction });
    }
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Supplier quote recorded successfully',
      data: {
        rfqSupplier,
        quotedItems: recordedQuotes
      }
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to record supplier quote',
      error: error.message
    });
  }
};

// @desc    Select winning quotes/suppliers
// @route   PUT /api/procurement/rfq/:id/select-quotes
// @access  Private
exports.selectQuotes = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { selectedQuotes } = req.body;
    
    if (!selectedQuotes || !selectedQuotes.length) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide selected quotes'
      });
    }
    
    const rfq = await RequestForQuotation.findByPk(req.params.id);
    
    if (!rfq) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Request for Quotation not found'
      });
    }
    
    // Check authorization - only creator, admin or procurement manager can select quotes
    const isCreator = rfq.createdById === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isProcurementManager = req.user.role === 'procurement_manager';
    
    if (!isCreator && !isAdmin && !isProcurementManager) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to select quotes for this Request for Quotation'
      });
    }
    
    // RFQ must be in in_progress status to select quotes
    if (rfq.status !== 'in_progress') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Quotes can only be selected when RFQ is in in_progress status'
      });
    }
    
    // Get all RFQ items to ensure all items have a selected quote
    const rfqItems = await RfqItem.findAll({
      where: { requestForQuotationId: rfq.id }
    });
    
    // Create a set of item IDs to track which items have selected quotes
    const itemIdsWithSelection = new Set();
    
    // Reset all quote selections first
    await RfqQuoteItem.update(
      { isSelected: false },
      { 
        where: { 
          rfqItemId: rfqItems.map(item => item.id) 
        },
        transaction 
      }
    );
    
    // Process selected quotes
    for (const selection of selectedQuotes) {
      const quote = await RfqQuoteItem.findOne({
        where: {
          id: selection.quoteId
        },
        include: [
          {
            model: RfqItem,
            as: 'rfqItem',
            where: { requestForQuotationId: rfq.id }
          },
          {
            model: RfqSupplier,
            as: 'rfqSupplier',
            where: { requestForQuotationId: rfq.id }
          }
        ]
      });
      
      if (!quote) {
        throw new Error(`Quote with ID ${selection.quoteId} not found or does not belong to this RFQ`);
      }
      
      // Mark this quote as selected
      quote.isSelected = true;
      await quote.save({ transaction });
      
      // Update supplier status
      const supplier = quote.rfqSupplier;
      supplier.status = 'selected';
      await supplier.save({ transaction });
      
      // Add item ID to the set of items with selections
      itemIdsWithSelection.add(quote.rfqItemId);
    }
    
    // Validate that all RFQ items have a selected quote
    if (itemIdsWithSelection.size !== rfqItems.length) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'All RFQ items must have a selected quote'
      });
    }
    
    // Update RFQ status
    rfq.status = 'completed';
    rfq.completedAt = new Date();
    rfq.updatedById = req.user.id;
    
    await rfq.save({ transaction });
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Quotes selected successfully',
      data: {
        rfq,
        selectedQuotes
      }
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to select quotes',
      error: error.message
    });
  }
};

// @desc    Cancel a request for quotation
// @route   PUT /api/procurement/rfq/:id/cancel
// @access  Private
exports.cancelRFQ = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { reason } = req.body;
    
    const rfq = await RequestForQuotation.findByPk(req.params.id);
    
    if (!rfq) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Request for Quotation not found'
      });
    }
    
    // Check authorization - only creator, admin or procurement manager can cancel
    const isCreator = rfq.createdById === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isProcurementManager = req.user.role === 'procurement_manager';
    
    if (!isCreator && !isAdmin && !isProcurementManager) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this Request for Quotation'
      });
    }
    
    // RFQ cannot be cancelled if completed
    if (rfq.status === 'completed') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed Request for Quotation'
      });
    }
    
    // Update RFQ status
    rfq.status = 'cancelled';
    rfq.notes = reason ? (rfq.notes ? `${rfq.notes}\n\nCancellation reason: ${reason}` : `Cancellation reason: ${reason}`) : rfq.notes;
    rfq.updatedById = req.user.id;
    
    await rfq.save({ transaction });
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Request for Quotation cancelled successfully',
      data: rfq
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to cancel Request for Quotation',
      error: error.message
    });
  }
};

// @desc    Get RFQs created from a specific Purchase Requisition
// @route   GET /api/procurement/rfq/by-pr/:prId
// @access  Private
exports.getRFQsByPR = async (req, res) => {
  try {
    const prId = req.params.prId;
    
    // Verify PR exists
    const purchaseRequisition = await models.PurchaseRequisition.findByPk(prId);
    if (!purchaseRequisition) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Requisition not found'
      });
    }
    
    // Get RFQs for this PR
    const rfqs = await RequestForQuotation.findAll({
      where: { purchaseRequisitionId: prId },
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        },
        {
          model: RfqItem,
          as: 'items'
        },
        {
          model: RfqSupplier,
          as: 'suppliers',
          include: [
            {
              model: Supplier,
              as: 'supplier',
              attributes: ['id', 'supplierNumber', 'legalName', 'tradeName']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: rfqs.length,
      data: rfqs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RFQs for Purchase Requisition',
      error: error.message
    });
  }
};

// @desc    Create an RFQ from a Purchase Requisition
// @route   POST /api/procurement/rfq/from-pr/:prId
// @access  Private
exports.createRFQFromPR = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const prId = req.params.prId;
    const { 
      description, 
      responseDeadline, 
      notes,
      items,
      suppliers
    } = req.body;
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: 'Authentication required. User ID not found.'
      });
    }
    
    // Validate required fields
    if (!responseDeadline || !suppliers || !suppliers.length) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: responseDeadline and suppliers'
      });
    }
    
    // Verify PR exists and is approved
    const purchaseRequisition = await models.PurchaseRequisition.findByPk(prId, {
      include: [
        {
          model: PurchaseRequisitionItem,
          as: 'items'
        }
      ]
    });
    
    if (!purchaseRequisition) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Purchase Requisition not found'
      });
    }
    
    // Check PR status - should be approved
    if (purchaseRequisition.status !== 'approved') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Purchase Requisition must be approved before creating an RFQ'
      });
    }
    
    // Generate RFQ number
    const rfqNumber = await generateRFQNumber();
    
    // Create the RFQ
    const rfq = await RequestForQuotation.create({
      rfqNumber,
      description: description || purchaseRequisition.description,
      status: 'draft',
      responseDeadline: new Date(responseDeadline),
      notes,
      purchaseRequisitionId: prId,
      createdById: req.user.id,
      updatedById: req.user.id
    }, { transaction });
    
    // Create RFQ items
    const rfqItems = [];
    
    // If specific items are provided, use them
    if (items && items.length > 0) {
      for (const itemId of items) {
        // Find the PR item
        const prItem = await PurchaseRequisitionItem.findOne({
          where: {
            id: itemId,
            PurchaseRequisitionId: prId
          }
        });
        
        if (!prItem) {
          throw new Error(`PR Item with ID ${itemId} not found in this PR`);
        }
        
        const rfqItem = await RfqItem.create({
          requestForQuotationId: rfq.id,
          itemNumber: prItem.itemNumber,
          description: prItem.description,
          uom: prItem.uom,
          quantity: prItem.quantity,
          purchaseRequisitionItemId: prItem.id
        }, { transaction });
        
        rfqItems.push(rfqItem);
      }
    } 
    // Otherwise, use all PR items
    else {
      for (const prItem of purchaseRequisition.items) {
        const rfqItem = await RfqItem.create({
          requestForQuotationId: rfq.id,
          itemNumber: prItem.itemNumber,
          description: prItem.description,
          uom: prItem.uom,
          quantity: prItem.quantity,
          purchaseRequisitionItemId: prItem.id
        }, { transaction });
        
        rfqItems.push(rfqItem);
      }
    }
    
    // Create RFQ suppliers
    const rfqSuppliers = [];
    for (const supplier of suppliers) {
      // Check if supplier ID is provided and is valid
      if (supplier.supplierId) {
        const existingSupplier = await models.Supplier.findByPk(supplier.supplierId);
        if (!existingSupplier) {
          throw new Error(`Supplier with ID ${supplier.supplierId} not found`);
        }
        
        // Use existing supplier data if available
        if (!supplier.supplierName) {
          supplier.supplierName = existingSupplier.legalName || existingSupplier.tradeName;
        }
        if (!supplier.contactName && existingSupplier.contactPerson) {
          supplier.contactName = existingSupplier.contactPerson;
        }
        if (!supplier.contactEmail && existingSupplier.contactEmail) {
          supplier.contactEmail = existingSupplier.contactEmail;
        }
        if (!supplier.contactPhone && existingSupplier.contactPhone) {
          supplier.contactPhone = existingSupplier.contactPhone;
        }
      }
      
      // Validate supplier name
      if (!supplier.supplierName) {
        throw new Error('Supplier name is required');
      }
      
      const rfqSupplier = await RfqSupplier.create({
        requestForQuotationId: rfq.id,
        supplierId: supplier.supplierId || null,
        supplierName: supplier.supplierName,
        contactName: supplier.contactName || null,
        contactEmail: supplier.contactEmail || null,
        contactEmailSecondary: supplier.contactEmailSecondary || null,
        contactPhone: supplier.contactPhone || null,
        status: 'pending',
        notes: supplier.notes || null
      }, { transaction });
      
      rfqSuppliers.push(rfqSupplier);
    }
    
    await transaction.commit();
    
    res.status(201).json({
      success: true,
      message: 'RFQ created from Purchase Requisition successfully',
      data: {
        id: rfq.id,
        rfqNumber: rfq.rfqNumber,
        items: rfqItems.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          uom: item.uom
        })),
        suppliers: rfqSuppliers.map(supplier => ({
          id: supplier.id,
          supplierName: supplier.supplierName,
          contactEmail: supplier.contactEmail
        }))
      }
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to create RFQ from Purchase Requisition',
      error: error.message
    });
  }
};
