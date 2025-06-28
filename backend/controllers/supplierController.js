// Controller for Supplier functionality
const { 
  Supplier, 
  User, 
  Contract,
  PurchaseOrder,
  sequelize
} = require('../models/sequelize');
const { Op } = require('sequelize');
const { generateNextNumber } = require('../utils/numberGenerator');
const crypto = require('crypto');
const emailService = require('../services/emailService');

// Create models object with both capitalized and lowercase aliases
const models = {
  Supplier,
  supplier: Supplier,
  User,
  user: User,
  Contract,
  contract: Contract
};

// Generate a supplier number (format: SUP-YYYYMMDD-XXXX)
const generateSupplierNumber = async () => {
  const prefix = 'SUP';
  return generateNextNumber(prefix, Supplier);
};

// @desc    Create a new supplier
// @route   POST /api/procurement/supplier
// @access  Private
exports.createSupplier = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      legalName, 
      tradeName, 
      contactEmail, 
      contactEmailSecondary,
      contactPhone,
      contactName,
      supplierType,
      paymentTerms,
      address,
      city,
      state,
      country,
      postalCode,
      taxId,
      registrationNumber,
      complianceChecked,
      notes
    } = req.body;
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. User ID not found.'
      });
    }
    
    // Validate required fields
    if (!legalName) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide a legal name for the supplier'
      });
    }
    
    // Generate supplier number
    const supplierNumber = await generateSupplierNumber();
      // Create the supplier with pending_approval status
    const supplier = await models.Supplier.create({
      supplierNumber,
      legalName,
      tradeName: tradeName || legalName,
      contactEmail,
      contactEmailSecondary,
      contactPhone,
      contactName,
      supplierType: supplierType || 'transactional',
      paymentTerms,
      address,
      city,
      state,
      country,
      postalCode,
      taxId,
      registrationNumber,
      complianceChecked: complianceChecked || false,
      status: 'pending_approval', // Set to pending_approval by default
      notes,
      createdById: req.user.id,
      updatedById: req.user.id
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to create supplier',
      error: error.message
    });
  }
};

// @desc    Get all suppliers
// @route   GET /api/procurement/supplier
// @access  Private
exports.getSuppliers = async (req, res) => {
  try {
    // Build query based on query parameters
    const query = {};
    const { status, supplierType, search, createdById } = req.query;
    
    if (status) {
      query.status = status;
    }
    
    if (supplierType) {
      query.supplierType = supplierType;
    }
    
    if (createdById) {
      query.createdById = createdById;
    }
    
    if (search) {
      query[Op.or] = [
        { legalName: { [Op.iLike]: `%${search}%` } },
        { tradeName: { [Op.iLike]: `%${search}%` } },
        { supplierNumber: { [Op.iLike]: `%${search}%` } },
        { contactEmail: { [Op.iLike]: `%${search}%` } },
        { contactPhone: { [Op.iLike]: `%${search}%` } }
      ];
    }
      // Try a simple direct query first if there are issues with associations
    try {
      const suppliers = await models.Supplier.findAll({
        where: query,
        include: [
          {
            model: User,
            as: 'createdBy',
            attributes: ['id', 'name', 'email'],
            required: false  // Use LEFT JOIN instead of INNER JOIN
          },
          {
            model: User,
            as: 'updatedBy',
            attributes: ['id', 'name', 'email'],
            required: false  // Use LEFT JOIN instead of INNER JOIN
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      return res.status(200).json({
        success: true,
        count: suppliers.length,
        data: suppliers
      });
    } catch (associationError) {
      console.error('❌ Error with associations:', associationError.message);
      
      // Fall back to direct SQL if the association query fails
      const [rawSuppliers] = await sequelize.query(`
        SELECT s.*, 
               c.name as "createdByName", c.email as "createdByEmail",
               u.name as "updatedByName", u.email as "updatedByEmail"
        FROM "Suppliers" s
        LEFT JOIN "Users" c ON s."createdById" = c.id
        LEFT JOIN "Users" u ON s."updatedById" = u.id
        ORDER BY s."createdAt" DESC
      `);
        console.log(`✅ Retrieved ${rawSuppliers.length} suppliers via direct SQL`);
      return res.status(200).json({
        success: true,
        count: rawSuppliers.length,
        data: rawSuppliers,
        note: 'Data retrieved via fallback direct SQL query'
      });
    }
  } catch (error) {
    console.error('❌ Error fetching suppliers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch suppliers',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get a single supplier
// @route   GET /api/procurement/supplier/:id
// @access  Private
exports.getSupplier = async (req, res) => {
  try {
    try {
      const supplier = await models.Supplier.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'createdBy',
            attributes: ['id', 'name', 'email'],
            required: false
          },
          {
            model: User,
            as: 'updatedBy',
            attributes: ['id', 'name', 'email'],
            required: false
          },
          {
            model: Contract,
            as: 'contracts',
            required: false
          },
          {
            model: PurchaseOrder,
            as: 'purchaseOrders',
            required: false
          }
        ]
      });
        
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: supplier
      });
    } catch (associationError) {
      console.error('❌ Error with associations:', associationError.message);
      
      // Fall back to direct SQL if the association query fails
      const [rawSupplier] = await sequelize.query(`
        SELECT s.*, 
               c.name as "createdByName", c.email as "createdByEmail",
               u.name as "updatedByName", u.email as "updatedByEmail"
        FROM "Suppliers" s
        LEFT JOIN "Users" c ON s."createdById" = c.id
        LEFT JOIN "Users" u ON s."updatedById" = u.id
        WHERE s.id = :supplierId
      `, {
        replacements: { supplierId: req.params.id }
      });
      
      if (rawSupplier.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: rawSupplier[0],
        note: 'Data retrieved via fallback direct SQL query'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supplier',
      error: error.message
    });
  }
};

// @desc    Update a supplier
// @route   PUT /api/procurement/supplier/:id
// @access  Private
exports.updateSupplier = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      legalName, 
      tradeName, 
      contactEmail, 
      contactEmailSecondary,
      contactPhone,
      contactName,
      supplierType,
      paymentTerms,
      address,
      city,
      state,
      country,
      postalCode,
      taxId,
      registrationNumber,
      complianceChecked,
      status,
      notes
    } = req.body;
    
    const supplier = await models.Supplier.findByPk(req.params.id);
    
    if (!supplier) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    // Check authorization - only creator, admin or procurement manager can update
    const isCreator = supplier.createdById === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isProcurementManager = req.user.role === 'procurement_manager';
    
    if (!isCreator && !isAdmin && !isProcurementManager) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this supplier'
      });
    }
    
    // Update supplier
    if (legalName) supplier.legalName = legalName;
    if (tradeName) supplier.tradeName = tradeName;
    if (contactEmail !== undefined) supplier.contactEmail = contactEmail;
    if (contactEmailSecondary !== undefined) supplier.contactEmailSecondary = contactEmailSecondary;
    if (contactPhone !== undefined) supplier.contactPhone = contactPhone;
    if (contactName !== undefined) supplier.contactName = contactName;
    if (supplierType) supplier.supplierType = supplierType;
    if (paymentTerms !== undefined) supplier.paymentTerms = paymentTerms;
    if (address !== undefined) supplier.address = address;
    if (city !== undefined) supplier.city = city;
    if (state !== undefined) supplier.state = state;
    if (country !== undefined) supplier.country = country;
    if (postalCode !== undefined) supplier.postalCode = postalCode;
    if (taxId !== undefined) supplier.taxId = taxId;
    if (registrationNumber !== undefined) supplier.registrationNumber = registrationNumber;
    if (complianceChecked !== undefined) supplier.complianceChecked = complianceChecked;
    if (status) supplier.status = status;
    if (notes !== undefined) supplier.notes = notes;
    
    supplier.updatedById = req.user.id;
    
    await supplier.save({ transaction });
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to update supplier',
      error: error.message
    });
  }
};

// @desc    Delete a supplier
// @route   DELETE /api/procurement/supplier/:id
// @access  Private
exports.deleteSupplier = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Try to find supplier with associations, but handle gracefully if models don't exist
    let supplier;
    try {
      // First try to get supplier without associations to be safe
      supplier = await models.Supplier.findByPk(req.params.id);
      
      if (!supplier) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
      }
      
      // Then try to check for associated records using separate queries
      let hasContracts = false;
      if (models.Contract) {
        try {
          const contractCount = await models.Contract.count({
            where: { supplierId: req.params.id }
          });
          hasContracts = contractCount > 0;
        } catch (err) {
          console.warn('Could not check contract associations:', err.message);
        }
      }
      
      // Check if supplier has associated contracts
      if (hasContracts) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Cannot delete supplier with associated contracts'
        });
      }
      
    } catch (error) {
      console.error('Error finding supplier:', error);
      await transaction.rollback();
      return res.status(500).json({
        success: false,
        message: 'Error finding supplier',
        error: error.message
      });
    }
    
    // Check authorization - only creator, admin or procurement manager can delete
    const isCreator = supplier.createdById === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isProcurementManager = req.user.role === 'procurement_manager';
    
    if (!isCreator && !isAdmin && !isProcurementManager) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this supplier'
      });
    }
    
    // Delete supplier
    console.log(`🔍 Deleting supplier: ${supplier.legalName} (ID: ${supplier.id})`);
    await supplier.destroy({ transaction });
    
    await transaction.commit();
    console.log(`✅ Successfully deleted supplier: ${supplier.legalName}`);
    
    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error deleting supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete supplier',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Approve Supplier - Changes status to pending_supplier_acceptance and sends email
const approveSupplier = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { approvalNotes } = req.body;
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Find supplier
    const supplier = await models.Supplier.findByPk(id, { transaction });
    if (!supplier) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    // Check if supplier is in pending_approval status
    if (supplier.status !== 'pending_approval') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Supplier cannot be approved. Current status: ${supplier.status}`
      });
    }
    
    // Generate acceptance token
    const crypto = require('crypto');
    const acceptanceToken = crypto.randomBytes(32).toString('hex');
    
    // Update supplier
    await supplier.update({
      status: 'pending_supplier_acceptance',
      approvedById: req.user.id,
      approvedAt: new Date(),
      acceptanceToken,
      notes: approvalNotes ? `${supplier.notes || ''}\n\nApproval Notes: ${approvalNotes}` : supplier.notes
    }, { transaction });
    
    await transaction.commit();
    
    // Send acceptance email to supplier
    try {
      const emailResult = await emailService.sendSupplierApprovalEmail(supplier, {
        acceptanceToken,
        approvalNotes
      });
      
      if (emailResult.success) {
        console.log('✅ Supplier approval email sent successfully');
        if (emailResult.previewUrl) {
          console.log('📧 Email preview URL:', emailResult.previewUrl);
        }
      } else {
        console.error('❌ Failed to send supplier approval email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Error sending supplier acceptance email:', emailError);
      // Don't fail the entire operation if email fails
    }
    
    console.log(`✅ Supplier approved: ${supplier.legalName} by user ${req.user.id}`);
    
    res.status(200).json({
      success: true,
      message: 'Supplier approved successfully. Acceptance email sent.',
      data: {
        id: supplier.id,
        status: 'pending_supplier_acceptance',
        approvedAt: supplier.approvedAt
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error approving supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve supplier',
      error: error.message
    });
  }
};

// Reject Supplier
const rejectSupplier = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Find supplier
    const supplier = await models.Supplier.findByPk(id, { transaction });
    if (!supplier) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    // Check if supplier is in pending_approval status
    if (supplier.status !== 'pending_approval') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Supplier cannot be rejected. Current status: ${supplier.status}`
      });
    }
    
    // Update supplier
    await supplier.update({
      status: 'rejected',
      approvedById: req.user.id,
      approvedAt: new Date(),
      notes: rejectionReason ? `${supplier.notes || ''}\n\nRejection Reason: ${rejectionReason}` : supplier.notes
    }, { transaction });
    
    await transaction.commit();
    
    console.log(`✅ Supplier rejected: ${supplier.legalName} by user ${req.user.id}`);
    
    res.status(200).json({
      success: true,
      message: 'Supplier rejected successfully',
      data: {
        id: supplier.id,
        status: 'rejected'
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error rejecting supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject supplier',
      error: error.message
    });
  }
};

// Supplier accepts our offer
const supplierAcceptance = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { token } = req.params;
    const { action } = req.body; // 'accept' or 'decline'
    
    // Find supplier by acceptance token
    const supplier = await models.Supplier.findOne({
      where: { acceptanceToken: token },
      transaction
    });
    
    if (!supplier) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired acceptance link'
      });
    }
    
    // Check if supplier is in pending_supplier_acceptance status
    if (supplier.status !== 'pending_supplier_acceptance') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'This supplier has already been processed'
      });
    }
    
    if (action === 'accept') {
      // Supplier accepts - make them active
      await supplier.update({
        status: 'active',
        supplierAcceptedAt: new Date(),
        acceptanceToken: null // Clear token after use
      }, { transaction });
      
      await transaction.commit();
      
      console.log(`✅ Supplier accepted offer: ${supplier.legalName}`);
      
      res.status(200).json({
        success: true,
        message: 'Welcome! You have successfully joined our supplier network.',
        data: {
          supplierName: supplier.legalName,
          status: 'active'
        }
      });
    } else if (action === 'decline') {
      // Supplier declines - mark as rejected
      await supplier.update({
        status: 'rejected',
        acceptanceToken: null // Clear token after use
      }, { transaction });
      
      await transaction.commit();
      
      console.log(`ℹ️ Supplier declined offer: ${supplier.legalName}`);
      
      res.status(200).json({
        success: true,
        message: 'We understand. Thank you for your time.',
        data: {
          supplierName: supplier.legalName,
          status: 'declined'
        }
      });
    } else {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "accept" or "decline"'
      });
    }
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error processing supplier acceptance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process supplier response',
      error: error.message
    });
  }
};

// Get pending approval suppliers (for DoFA review page)
const getPendingApprovalSuppliers = async (req, res) => {
  try {
    const suppliers = await models.Supplier.findAll({
      where: { status: 'pending_approval' },
      include: [
        {
          model: models.User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      result: suppliers,
      pagination: {
        total: suppliers.length,
        page: 1,
        pages: 1
      }
    });
  } catch (error) {
    console.error('❌ Error fetching pending approval suppliers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending approval suppliers',
      error: error.message
    });
  }
};



module.exports = {
  createSupplier: exports.createSupplier,
  getSuppliers: exports.getSuppliers,
  getSupplierById: exports.getSupplier, // Note: the function is named getSupplier, not getSupplierById
  updateSupplier: exports.updateSupplier,
  deleteSupplier: exports.deleteSupplier,
  approveSupplier,
  rejectSupplier,
  supplierAcceptance,
  getPendingApprovalSuppliers
};
