// Load models with updated logger for diagnostics
const {
  PurchaseRequisition,
  PurchaseRequisitionItem,
  User,
  Contract,
  Supplier,
  ItemMaster,
  Inventory,
  sequelize
} = require('../models/sequelize');

// Load additional models directly to avoid export issues
const ApprovalHistoryModel = require('../models/sequelize/ApprovalHistory');
const DelegationOfAuthorityModel = require('../models/sequelize/DelegationOfAuthority');

// Initialize the models with sequelize instance
const ApprovalHistory = ApprovalHistoryModel(sequelize, require('sequelize').DataTypes);
const DelegationOfAuthority = DelegationOfAuthorityModel(sequelize, require('sequelize').DataTypes);
const { Op } = require('sequelize');
const { generateNextNumber } = require('../utils/numberGenerator');

// Create models object with both capitalized and lowercase aliases
const models = {
  PurchaseRequisition,
  purchaserequisition: PurchaseRequisition,
  PurchaseRequisitionItem,
  purchaserequisitionitem: PurchaseRequisitionItem,
  Supplier,
  supplier: Supplier,
  Inventory,
  inventory: Inventory,
  ItemMaster,
  itemmaster: ItemMaster,
  User,
  user: User,
  Contract,
  contract: Contract,
  ApprovalHistory,
  approvalhistory: ApprovalHistory,
  DelegationOfAuthority,
  delegationofauthority: DelegationOfAuthority
};

// Debug logging for model verification
console.log(`🔍 PurchaseRequisition model check:`, {
  tableName: PurchaseRequisition?.tableName || 'Not defined',
  attributes: Object.keys(PurchaseRequisition?.rawAttributes || {}).slice(0, 5).join(', ') + '...',
  primaryKeyField: PurchaseRequisition?.primaryKeyField || 'Not defined'
});

// Generate a PR number (format: PR-YYYYMMDD-XXXX)
const generatePRNumber = async () => {
  const prefix = 'PR';
  return generateNextNumber(prefix, PurchaseRequisition);
};

// Get approval chain for a PR based on amount and cost center
const getApprovalChain = async (amount, costCenter, transaction) => {
  try {
    console.log(`🔍 Getting approval chain for amount: ${amount}, costCenter: ${costCenter}`);
    
    const approvers = await DelegationOfAuthority.findAll({
      where: { 
        costCenter: costCenter || null, // If null, applies to all cost centers
        documentType: ['PR', 'All'],
        isActive: true,
        amountFrom: { [Op.lte]: amount },
        amountTo: { [Op.gte]: amount },
        [Op.or]: [
          { endDate: null }, // No end date
          { endDate: { [Op.gte]: new Date() } } // End date is in the future
        ],
        startDate: { [Op.lte]: new Date() } // Start date is in the past
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }],
      order: [['approvalLevel', 'ASC']],
      transaction
    });

    console.log(`✅ Found ${approvers.length} approvers in chain`);
    return approvers;
  } catch (error) {
    console.error('❌ Error getting approval chain:', error);
    return [];
  }
};

// Send email notification to approver
const notifyApprover = async (pr, approver) => {
  try {
    // Send email notification (implement your email sending logic here)
    console.log(`✉️ Would send approval notification to ${approver.email} for PR ${pr.prNumber}`);
    
    // Email content would include:
    // - PR number and details
    // - Link to approve/reject
    // - Total amount and other relevant information
  } catch (error) {
    console.error('Error sending approval notification:', error);
  }
};

// @desc    Create a new purchase requisition
// @route   POST /api/procurement/purchase-requisition
// @access  Private
exports.createPurchaseRequisition = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('📝 Received purchase requisition data:', JSON.stringify(req.body, null, 2));
    
    const { 
      description, 
      costCenter, 
      currency, 
      approverId,
      notes,
      items,
      totalValue,
      requiredDate,
      number,
      fallbackNumber 
    } = req.body;
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. User ID not found.'
      });
    }
      // Validate required fields
    if (!description || !costCenter || !items || !items.length) {
      console.log('❌ Validation failed:', { description: !!description, costCenter: !!costCenter, items: items?.length });
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: description, costCenter, and items'
      });
    }
    
    console.log('✅ Validation passed, creating PR...');
      // Generate PR number if not provided
    const prNumber = number || fallbackNumber || await generatePRNumber();
    
    // Use totalValue from frontend if provided, otherwise calculate
    let totalAmount = totalValue || 0;
    if (!totalValue) {
      for (const item of items) {
        if (item.unitPrice && item.quantity) {
          totalAmount += parseFloat(item.unitPrice) * parseFloat(item.quantity);
        }
      }
    }      // Create the purchase requisition
    console.log('📝 Creating PR with data:', {
      prNumber,
      description,
      status: 'draft',
      totalAmount,
      currency: currency || 'USD',
      costCenter,
      requestorId: req.user.id,
      approverId: approverId || req.user.id,
      notes,
      createdById: req.user.id,
      updatedById: req.user.id
    });
    
    const purchaseRequisition = await models.PurchaseRequisition.create({
      prNumber,
      description,
      status: 'draft',
      totalAmount,
      currency: currency || 'USD',
      costCenter,
      requestorId: req.user.id,
      approverId: approverId || req.user.id, // Use requestor as temporary approver until submission
      notes,
      createdById: req.user.id,
      updatedById: req.user.id
    }, { transaction });
    
    console.log('✅ PR created with ID:', purchaseRequisition.id);      // Create purchase requisition items
    console.log('📦 Creating PR items...');
    const prItems = [];
    for (const item of items) {
      console.log('🔍 Processing item:', item);
      
      // Check if contract ID is provided and is valid
      if (item.contractId) {
        console.log('🔍 Checking contract...');
        const contract = await Contract.findByPk(item.contractId);
        if (!contract) {
          throw new Error(`Contract with ID ${item.contractId} not found`);
        }
      }
        // Check if supplier ID is provided and is valid
      if (item.supplierId) {
        console.log('🔍 Checking supplier...');
        const supplier = await models.Supplier.findByPk(item.supplierId);
        if (!supplier) {
          throw new Error(`Supplier with ID ${item.supplierId} not found`);
        }
      }
      
      // Check if item number is provided and is valid
      if (item.itemNumber) {
        console.log('🔍 Checking item master...');
        const itemMaster = await ItemMaster.findOne({ 
          where: { itemNumber: item.itemNumber }
        });
        if (!itemMaster) {
          throw new Error(`Item with number ${item.itemNumber} not found`);
        }
      }
        // Check if inventory ID is provided
      let itemMasterId = null;      
      if (item.inventoryId) {
        console.log('🔍 Checking inventory...');
        const inventory = await Inventory.findByPk(item.inventoryId);
        if (!inventory) {
          throw new Error(`Inventory with ID ${item.inventoryId} not found`);
        }
        itemMasterId = inventory.itemMasterId;
      }        const totalPrice = item.unitPrice && item.quantity 
        ? parseFloat(item.unitPrice) * parseFloat(item.quantity) 
        : 0;
      
      // Map frontend field names to backend
      const itemDescription = item.description || item.itemName || 'Unnamed Item';
      
      console.log('📝 Creating PR item with data:', {
        purchaseRequisitionId: purchaseRequisition.id,
        itemNumber: item.itemNumber || null,
        description: itemDescription,
        uom: item.uom,
        quantity: item.quantity,
        unitPrice: item.unitPrice || 0,
        totalPrice,
        contractId: item.contractId || null,
        supplierId: item.supplierId || null,
        supplierName: item.supplierName || null,
        comments: item.comments || null,
        deliveryDate: item.deliveryDate || null,
        inventoryId: item.inventoryId || null,
        itemMasterId: itemMasterId || item.itemMasterId || null,
        inventoryNumber: item.inventoryNumber || null,
        status: 'pending'
      });
      
      const prItem = await PurchaseRequisitionItem.create({
        purchaseRequisitionId: purchaseRequisition.id,
        itemNumber: item.itemNumber || null,
        description: itemDescription,
        uom: item.uom,
        quantity: item.quantity,
        unitPrice: item.unitPrice || 0,
        totalPrice,
        contractId: item.contractId || null,
        supplierId: item.supplierId || null,
        supplierName: item.supplierName || null,
        comments: item.comments || null,
        deliveryDate: item.deliveryDate || null,
        inventoryId: item.inventoryId || null,
        itemMasterId: itemMasterId || item.itemMasterId || null,
        inventoryNumber: item.inventoryNumber || null,        status: 'pending'
      }, { transaction });
      
      console.log('✅ PR item created with ID:', prItem.id);
      prItems.push(prItem);
    }
    
    console.log('✅ All PR items created successfully');
    await transaction.commit();
    console.log('✅ Transaction committed successfully');
      res.status(201).json({
      success: true,
      message: 'Purchase Requisition created successfully',
      result: {
        id: purchaseRequisition.id,
        prNumber: purchaseRequisition.prNumber,
        number: purchaseRequisition.prNumber, // For frontend compatibility
        items: prItems.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        }))
      },
      data: {
        id: purchaseRequisition.id,
        prNumber: purchaseRequisition.prNumber,
        items: prItems.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        }))
      }
    });  } catch (error) {
    console.error('❌ Error creating Purchase Requisition:', error);
    console.error('❌ Error stack:', error.stack);
    await transaction.rollback();
    console.log('🔄 Transaction rolled back');
    res.status(500).json({
      success: false,
      message: 'Failed to create Purchase Requisition',
      error: error.message
    });
  }
};

// @desc    Get all purchase requisitions
// @route   GET /api/procurement/purchase-requisition
// @access  Private
exports.getPurchaseRequisitions = async (req, res) => {
  try {
    console.log('📋 Getting purchase requisitions...');
    
    // Debug log for available tables
    console.log(`🔍 PurchaseRequisition table name: ${PurchaseRequisition.tableName || 'Not defined'}`);
    
    try {
      // Try a raw query to see what's available
      const [tables] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      console.log('📊 Available tables:', tables.map(t => t.table_name));
    } catch (dbErr) {
      console.error('❌ Failed to query tables:', dbErr.message);
    }
    
    // Build query based on query parameters
    const query = {};
    const { status, requestorId, approverId, dateFrom, dateTo, search } = req.query;
    
    if (status) {
      query.status = status;
    }
    
    if (requestorId) {
      query.requestorId = requestorId;
    }
    
    if (approverId) {
      query.approverId = approverId;
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
    
    // Search by PR number or description
    if (search) {
      query[Op.or] = [
        { prNumber: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Determine if we should filter by current user's role
    const isAdmin = req.user.role === 'admin';
    const isProcurementManager = req.user.role === 'procurement_manager';
    
    // Regular users can only see their own PRs or ones they need to approve
    if (!isAdmin && !isProcurementManager) {
      query[Op.or] = [
        { requestorId: req.user.id },
        { currentApproverId: req.user.id }
      ];
    }
      console.log('🔍 Query:', JSON.stringify(query));
    
    try {
      const purchaseRequisitions = await models.PurchaseRequisition.findAll({
        where: query,
        include: [
          {
            model: User,
            as: 'requestor',
            attributes: ['id', 'name', 'email'],
            required: false
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'name', 'email'],
            required: false
          },
          {
            model: User,
            as: 'currentApprover',
            attributes: ['id', 'name', 'email'],
            required: false
          },
          {
            model: User,
            as: 'createdBy',
            attributes: ['id', 'name', 'email'],
            required: false
          },
          {
            model: PurchaseRequisitionItem,
            as: 'items',
            required: false
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      console.log(`✅ Found ${purchaseRequisitions.length} purchase requisitions`);
      
      // Debug: Check if associations are working
      if (purchaseRequisitions.length > 0) {
        const firstPR = purchaseRequisitions[0];
        console.log('🔍 First PR data sample:', {
          id: firstPR.id,
          prNumber: firstPR.prNumber,
          requestor: firstPR.requestor ? firstPR.requestor.name : 'NO REQUESTOR',
          createdBy: firstPR.createdBy ? firstPR.createdBy.name : 'NO CREATED BY',
          approver: firstPR.approver ? firstPR.approver.name : 'NO APPROVER'
        });
      }
      
      res.status(200).json({
        success: true,
        count: purchaseRequisitions.length,
        data: purchaseRequisitions
      });
    } catch (queryErr) {
      console.error('❌ Error in findAll query:', queryErr);
      // Try a more basic query
      console.log('Attempting simpler query...');
      
      try {
        // Try direct SQL query as fallback
        const [rows] = await sequelize.query(`
          SELECT * FROM "PurchaseRequisitions" LIMIT 10
        `);
        
        console.log(`✅ Found ${rows.length} rows via direct SQL`);
        
        res.status(200).json({
          success: true,
          count: rows.length,
          data: rows,
          note: 'Data retrieved via fallback direct SQL query'
        });
      } catch (sqlErr) {
        console.error('❌ Direct SQL query also failed:', sqlErr.message);
        throw queryErr; // rethrow the original error
      }
    }
  } catch (error) {
    console.error('❌ Failed to fetch Purchase Requisitions:', error);
    console.error('Call stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Purchase Requisitions',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get a single purchase requisition
// @route   GET /api/procurement/purchase-requisition/:id
// @access  Private
exports.getPurchaseRequisition = async (req, res) => {
  try {
    const purchaseRequisition = await models.PurchaseRequisition.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'requestor',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'currentApprover',
          attributes: ['id', 'name', 'email']
        },
        {
          model: PurchaseRequisitionItem,
          as: 'items',
          include: [
            {
              model: ItemMaster,
              as: 'itemMaster',
              attributes: ['id', 'itemNumber', 'shortDescription', 'longDescription', 'uom', 'manufacturerName', 'manufacturerPartNumber']
            },
            {
              model: Inventory,
              as: 'inventory',
              attributes: ['id', 'inventoryNumber', 'physicalBalance', 'unitPrice', 'minimumLevel', 'warehouse', 'binLocationText']
            },
            {
              model: ItemMaster,
              as: 'itemMasterDirect',
              attributes: ['id', 'itemNumber', 'shortDescription', 'longDescription', 'uom', 'manufacturerName', 'manufacturerPartNumber']
            },
            {
              model: Contract,
              as: 'contract',
              attributes: ['id', 'contractNumber', 'contractName']
            },
            {
              model: Supplier,
              as: 'supplier',
              attributes: ['id', 'supplierNumber', 'legalName', 'tradeName']
            }
          ]
        },
        {
          model: ApprovalHistory,
          as: 'approvalHistory',
          include: [
            {
              model: User,
              as: 'approver',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });
    
    if (!purchaseRequisition) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Requisition not found'
      });
    }
    
    // Check authorization - only requestor, approvers, admin and procurement managers can view
    const isRequestor = purchaseRequisition.requestorId === req.user.id;
    const isApprover = purchaseRequisition.approverId === req.user.id || 
                      purchaseRequisition.currentApproverId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isProcurementManager = req.user.role === 'procurement_manager';
    
    if (!isRequestor && !isApprover && !isAdmin && !isProcurementManager) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this Purchase Requisition'
      });
    }
    
    res.status(200).json({
      success: true,
      data: purchaseRequisition
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Purchase Requisition',
      error: error.message
    });
  }
};

// @desc    Update a purchase requisition
// @route   PUT /api/procurement/purchase-requisition/:id
// @access  Private
exports.updatePurchaseRequisition = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      description, 
      costCenter, 
      currency, 
      approverId,
      notes,
      items 
    } = req.body;
    
    const purchaseRequisition = await models.PurchaseRequisition.findByPk(req.params.id);
    
    if (!purchaseRequisition) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Purchase Requisition not found'
      });
    }
    
    // Check authorization - only requestor or admin can update
    const isRequestor = purchaseRequisition.requestorId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isRequestor && !isAdmin) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this Purchase Requisition'
      });
    }
    
    // PR can only be updated if in draft status
    if (purchaseRequisition.status !== 'draft') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Purchase Requisition can only be updated when in draft status'
      });
    }
    
    // Update PR
    if (description) purchaseRequisition.description = description;
    if (costCenter) purchaseRequisition.costCenter = costCenter;
    if (currency) purchaseRequisition.currency = currency;
    if (approverId) purchaseRequisition.approverId = approverId;
    if (notes !== undefined) purchaseRequisition.notes = notes;
    
    purchaseRequisition.updatedById = req.user.id;
    
    // Calculate total amount if items are provided
    if (items && items.length > 0) {
      let totalAmount = 0;
        // Delete existing items
      await PurchaseRequisitionItem.destroy({
        where: { purchaseRequisitionId: purchaseRequisition.id },
        transaction
      });
      
      // Create new items
      for (const item of items) {
        // Check if contract ID is provided and is valid
        if (item.contractId) {
          const contract = await Contract.findByPk(item.contractId);
          if (!contract) {
            throw new Error(`Contract with ID ${item.contractId} not found`);
          }
        }
        
        // Check if supplier ID is provided and is valid
        if (item.supplierId) {
          const supplier = await models.Supplier.findByPk(item.supplierId);
          if (!supplier) {
            throw new Error(`Supplier with ID ${item.supplierId} not found`);
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
        
        const totalPrice = item.unitPrice && item.quantity 
          ? parseFloat(item.unitPrice) * parseFloat(item.quantity) 
          : 0;
            await PurchaseRequisitionItem.create({
          purchaseRequisitionId: purchaseRequisition.id,
          itemNumber: item.itemNumber || null,
          description: item.description,
          uom: item.uom,
          quantity: item.quantity,
          unitPrice: item.unitPrice || 0,
          totalPrice,
          contractId: item.contractId || null,
          supplierId: item.supplierId || null,
          supplierName: item.supplierName || null,
          comments: item.comments || null,
          deliveryDate: item.deliveryDate || null,
          status: 'pending'
        }, { transaction });
        
        totalAmount += totalPrice;
      }
      
      purchaseRequisition.totalAmount = totalAmount;
    }
    
    await purchaseRequisition.save({ transaction });
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Purchase Requisition updated successfully',
      data: purchaseRequisition
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to update Purchase Requisition',
      error: error.message
    });
  }
};

// @desc    Submit a purchase requisition for approval
// @route   PUT /api/procurement/purchase-requisition/:id/submit
// @access  Private
exports.submitPurchaseRequisition = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const currentUser = req.user;
    console.log(` User submitting PR: ${currentUser?.name} (${currentUser?.role})`);

    const pr = await models.PurchaseRequisition.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'requestor',
          attributes: ['id', 'name', 'email']
        }
      ],
      transaction
    });

    if (!pr) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Purchase Requisition not found'
      });
    }

    if (pr.status !== 'draft') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Only draft PRs can be submitted for approval'
      });
    }    // Update PR status to submitted (for approval)
    await pr.update({
      status: 'submitted',
      submittedAt: new Date()
    }, { transaction });

    // Try to create approval history record (non-blocking)
    try {
      await ApprovalHistory.create({
        referenceType: 'PurchaseRequisition',
        referenceId: pr.id,
        approverId: currentUser?.id,
        level: 1,
        status: 'pending',
        comments: `Submitted for approval by ${currentUser?.name}`
      }, { transaction });
    } catch (historyError) {
      console.warn(' Could not create approval history:', historyError.message);
      // Continue without failing the submission
    }

    await transaction.commit();

    return res.json({
      success: true,
      message: 'Purchase Requisition submitted for approval successfully',
      data: pr
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error submitting PR:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting PR',
      error: error.message
    });
  }
};


// @desc    Approve or reject a purchase requisition
// @route   PUT /api/procurement/purchase-requisition/:id/approve
// @access  Private
exports.approvePurchaseRequisition = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { action, comments } = req.body;
    
    if (!['approve', 'reject'].includes(action)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }    const pr = await models.PurchaseRequisition.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'requestor',
          attributes: ['id', 'name', 'email']
        }
      ],
      transaction
    });    if (!pr) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Purchase Requisition not found'
      });
    }

    // For now, allow any admin to approve/reject (can be enhanced later with proper approval chain)
    if (req.user.role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Only admins can approve/reject PRs'
      });
    }

    // Check if PR is in a status that can be approved/rejected
    if (!['submitted', 'partially_approved'].includes(pr.status)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'PR is not in a status that can be approved/rejected'
      });
    }

    // Create approval history record
    try {
      await directApprovalHistory.create({
        referenceType: 'PurchaseRequisition',
        referenceId: pr.id,
        approverId: req.user.id,
        level: 1,
        status: action === 'approve' ? 'approved' : 'rejected',
        comments: comments || (action === 'approve' ? 'Approved by admin' : 'Rejected by admin'),
        actionDate: new Date()
      }, { transaction });
    } catch (historyError) {
      console.log('⚠️ Could not create approval history:', historyError.message);
      // Continue without approval history for now
    }

    if (action === 'reject') {
      // Reject PR
      await pr.update({
        status: 'rejected',
        currentApproverId: null,
        rejectedAt: new Date(),
        rejectedById: req.user.id
      }, { transaction });

      // Notify requestor of rejection
      console.log(`✉️ Would notify ${pr.requestor.email} that PR ${pr.prNumber} was rejected`);
    } else {
      // Approve PR
      await pr.update({
        status: 'approved',
        currentApproverId: null,
        approvedAt: new Date(),
        approverId: req.user.id
      }, { transaction });

      // Notify requestor of approval
      console.log(`✉️ Would notify ${pr.requestor.email} that PR ${pr.prNumber} was approved`);
    }

    await transaction.commit();

    res.json({
      success: true,
      message: `PR ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error processing PR approval:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing PR approval',
      error: error.message
    });
  }
};

// @desc    Delete a purchase requisition
// @route   DELETE /api/procurement/purchase-requisition/:id
// @access  Private
exports.deletePurchaseRequisition = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const purchaseRequisition = await models.PurchaseRequisition.findByPk(req.params.id);
    
    if (!purchaseRequisition) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Purchase Requisition not found'
      });
    }
    
    // Check authorization - only requestor or admin can delete
    const isRequestor = purchaseRequisition.requestorId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isRequestor && !isAdmin) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this Purchase Requisition'
      });
    }
    
    // PR can only be deleted if in draft status
    if (purchaseRequisition.status !== 'draft') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Purchase Requisition can only be deleted when in draft status'
      });
    }
      // Delete PR items
    await PurchaseRequisitionItem.destroy({
      where: { purchaseRequisitionId: purchaseRequisition.id },
      transaction
    });
    
    // Delete PR
    await purchaseRequisition.destroy({ transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Purchase Requisition deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to delete Purchase Requisition',
      error: error.message
    });
  }
};

// @desc    Get pending approvals for current user
// @route   GET /api/procurement/purchase-requisition/pending-approvals
// @access  Private
exports.getPendingApprovals = async (req, res) => {
  try {
    const pendingPRs = await models.PurchaseRequisition.findAll({
      where: {
        status: 'pending_approval',
        currentApproverId: req.user.id
      },
      include: [
        {
          model: User,
          as: 'requestor',
          attributes: ['id', 'name', 'email']
        },        {
          model: ApprovalHistory,
          as: 'approvalHistory',
          where: {
            approverId: req.user.id,
            status: 'pending'
          },
          required: true
        },
        {
          model: PurchaseRequisitionItem,
          as: 'items'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: pendingPRs
    });
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending approvals',
      error: error.message
    });
  }
};
