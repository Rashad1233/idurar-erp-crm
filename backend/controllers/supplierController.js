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
      // Create the supplier
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
      status: 'active',
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
    const supplier = await models.Supplier.findByPk(req.params.id, {
      include: [
        {
          model: Contract,
          as: 'contracts'
        },
        {
          model: PurchaseOrder,
          as: 'purchaseOrders'
        }
      ]
    });
    
    if (!supplier) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
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
    
    // Check if supplier has associated contracts or purchase orders
    if (supplier.contracts.length > 0 || supplier.purchaseOrders.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot delete supplier with associated contracts or purchase orders'
      });
    }
    
    // Delete supplier
    await supplier.destroy({ transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to delete supplier',
      error: error.message
    });
  }
};
