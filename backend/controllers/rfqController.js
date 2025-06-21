const nodemailer = require('nodemailer');
const { 
  RequestForQuotation,
  RFQLineItem,
  RFQResponse,
  Supplier,
  PurchaseRequisition,
  User,
  sequelize
} = require('../models/sequelize');
// Create models object with both capitalized and lowercase aliases
const models = {
  RequestForQuotation,
  requestforquotation: RequestForQuotation,
  RFQLineItem,
  rfqlineitem: RFQLineItem,
  RFQResponse,
  rfqresponse: RFQResponse,
  Supplier,
  supplier: Supplier,
  PurchaseRequisition,
  purchaserequisition: PurchaseRequisition,
  User,
  user: User
};
const { generateNextNumber } = require('../utils/numberGenerator');
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
  const prefix = 'RFQ';
  return generateNextNumber(prefix, RequestForQuotation);
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
      submissionDeadline,
      status: 'draft',
      createdById: req.user.id,
      updatedById: req.user.id
    }, { transaction });

    // Create RFQ line items
    await Promise.all(lineItems.map(item =>
      RFQLineItem.create({
        ...item,
        rfqId: rfq.id
      }, { transaction })
    ));

    // Create RFQ responses for each supplier
    const suppliers = await models.Supplier.findAll({
      where: {
        id: supplierIds
      },
      transaction
    });

    await Promise.all(suppliers.map(supplier =>
      RFQResponse.create({
        rfqId: rfq.id,
        supplierId: supplier.id,
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
  const response = await RFQResponse.findOne({
    where: {
      rfqId: rfq.id,
      supplierId: supplier.id
    }
  });

  const supplierPortalUrl = `${config.baseUrl}/supplier-portal/rfq/${response.responseToken}`;

  const mailOptions = {
    from: config.email.from,
    to: supplier.contactEmail,
    cc: supplier.contactEmailSecondary,
    subject: `Request for Quotation: ${rfq.rfqNumber}`,
    html: `
      <h2>Request for Quotation</h2>
      <p>Dear ${supplier.tradeName},</p>
      <p>You have received a new Request for Quotation (${rfq.rfqNumber}).</p>
      <p><strong>Submission Deadline:</strong> ${new Date(rfq.submissionDeadline).toLocaleDateString()}</p>
      <p>Please click the link below to view the RFQ details and submit your quotation:</p>
      <p><a href="${supplierPortalUrl}">Access RFQ Portal</a></p>
      <p>If you have any questions, please contact us.</p>
      <br>
      <p>Best regards,<br>Procurement Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`RFQ email sent to ${supplier.contactEmail}`);
  } catch (error) {
    console.error(`Error sending RFQ email to ${supplier.contactEmail}:`, error);
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
          model: Supplier,
          as: 'suppliers',
          through: { attributes: [] }
        },
        {
          model: RFQLineItem,
          as: 'lineItems'
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
          model: Supplier,
          as: 'suppliers',
          through: { attributes: [] }
        },
        {
          model: RFQLineItem,
          as: 'lineItems'
        },
        {
          model: RFQResponse,
          as: 'responses',
          include: [
            {
              model: Supplier,
              as: 'supplier'
            }
          ]
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
