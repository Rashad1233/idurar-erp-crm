const { ItemMaster, Contract, ContractItem, Supplier, User, sequelize } = require('../models/sequelize');

// Get all contracts
exports.getAllContracts = async (req, res) => {
  console.log('📋 getAllContracts CALLED');
  try {
    const contracts = await Contract.findAll({
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'legalName', 'contactEmail']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`✅ Found ${contracts.length} contracts`);
    
    res.status(200).json({
      success: true,
      data: contracts,
      message: `${contracts.length} contracts found`
    });
    
  } catch (error) {
    console.error('❌ Error getting contracts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contracts',
      error: error.message
    });
  }
};

// Get contract by ID
exports.getContractById = async (req, res) => {
  console.log('🔍 getContractById CALLED');
  try {
    const { id } = req.params;
    
    const contract = await Contract.findByPk(id, {
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
    
    console.log(`✅ Contract ${id} found`);
    
    res.status(200).json({
      success: true,
      data: contract,
      message: 'Contract found'
    });
    
  } catch (error) {
    console.error('❌ Error getting contract:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contract',
      error: error.message
    });
  }
};

// Create new contract
exports.createContract = async (req, res) => {
  console.log('📝 createContract CALLED');
  try {
    const contractData = {
      ...req.body,
      createdById: req.user.id,
      updatedById: req.user.id
    };
    
    const contract = await Contract.create(contractData);
    
    // Load contract with supplier details
    const contractWithSupplier = await Contract.findByPk(contract.id, {
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'legalName', 'contactEmail']
        }
      ]
    });
    
    console.log(`✅ Contract ${contract.id} created successfully`);
    
    res.status(201).json({
      success: true,
      data: contractWithSupplier,
      message: 'Contract created successfully'
    });
    
  } catch (error) {
    console.error('❌ Error creating contract:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating contract',
      error: error.message
    });
  }
};

// Update contract
exports.updateContract = async (req, res) => {
  console.log('✏️ updateContract CALLED');
  try {
    const { id } = req.params;
    
    const contract = await Contract.findByPk(id);
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }
    
    const updatedData = {
      ...req.body,
      updatedById: req.user.id
    };
    
    await contract.update(updatedData);
    
    // Load updated contract with supplier details
    const contractWithSupplier = await Contract.findByPk(contract.id, {
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'legalName', 'contactEmail']
        }
      ]
    });
    
    console.log(`✅ Contract ${id} updated successfully`);
    
    res.status(200).json({
      success: true,
      data: contractWithSupplier,
      message: 'Contract updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error updating contract:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contract',
      error: error.message
    });
  }
};

// Delete contract
exports.deleteContract = async (req, res) => {
  console.log('🗑️ deleteContract CALLED');
  try {
    const { id } = req.params;
    
    const contract = await Contract.findByPk(id);
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }
    
    // Delete associated contract items first
    await ContractItem.destroy({
      where: { contractId: id }
    });
    
    // Delete contract
    await contract.destroy();
    
    console.log(`✅ Contract ${id} deleted successfully`);
    
    res.status(200).json({
      success: true,
      message: 'Contract deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting contract:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting contract',
      error: error.message
    });
  }
};

// Get contract items
exports.getContractItems = async (req, res) => {
  console.log('📦 getContractItems CALLED');
  try {
    const { id } = req.params;
    
    const items = await ContractItem.findAll({
      where: { contractId: id },
      include: [
        {
          model: ItemMaster,
          as: 'itemMaster',
          attributes: ['id', 'itemNumber', 'shortDescription', 'uom', 'status']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    
    console.log(`✅ Found ${items.length} items for contract ${id}`);
    
    res.status(200).json({
      success: true,
      data: items,
      message: `${items.length} contract items found`
    });
    
  } catch (error) {
    console.error('❌ Error getting contract items:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contract items',
      error: error.message
    });
  }
};

// Add item to contract
exports.addItemToContract = async (req, res) => {
  console.log('➕ addItemToContract CALLED');
  try {
    const { id } = req.params;
    const { itemNumber, description, uom, unitPrice, leadTime, minimumOrderQuantity, notes } = req.body;
    
    // Check if item already exists in contract
    const existingItem = await ContractItem.findOne({
      where: { 
        contractId: id,
        itemNumber 
      }
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Item already exists in this contract'
      });
    }

    const contractItem = await ContractItem.create({
      contractId: id,
      itemNumber,
      description,
      uom,
      unitPrice,
      leadTime,
      minimumOrderQuantity,
      notes
    });

    const itemWithDetails = await ContractItem.findByPk(contractItem.id, {
      include: [
        {
          model: ItemMaster,
          as: 'itemMaster',
          attributes: ['id', 'itemNumber', 'shortDescription', 'uom', 'status']
        }
      ]
    });

    console.log(`✅ Item ${itemNumber} added to contract ${id}`);

    res.status(201).json({
      success: true,
      data: itemWithDetails,
      message: 'Item added to contract successfully'
    });
    
  } catch (error) {
    console.error('❌ Error adding item to contract:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding item to contract',
      error: error.message
    });
  }
};

// Remove item from contract
exports.removeItemFromContract = async (req, res) => {
  console.log('➖ removeItemFromContract CALLED');
  try {
    const { itemId } = req.params;
    
    const contractItem = await ContractItem.findByPk(itemId);
    
    if (!contractItem) {
      return res.status(404).json({
        success: false,
        message: 'Contract item not found'
      });
    }

    await contractItem.destroy();

    console.log(`✅ Contract item ${itemId} removed successfully`);

    res.status(200).json({
      success: true,
      message: 'Item removed from contract successfully'
    });
    
  } catch (error) {
    console.error('❌ Error removing item from contract:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing item from contract',
      error: error.message
    });
  }
};

// Submit contract for approval
exports.submitContract = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findByPk(id);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }
    if (contract.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft contracts can be submitted' });
    }
    contract.status = 'pending_approval';
    await contract.save();
    return res.status(200).json({ success: true, message: 'Contract submitted for approval', data: contract });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error submitting contract', error: error.message });
  }
};

// List contracts pending DOFA approval
exports.getContractsForDofaApproval = async (req, res) => {
  try {
    const contracts = await Contract.findAll({
      where: { status: 'pending_approval' },
      include: [
        { model: Supplier, as: 'supplier', attributes: ['id', 'legalName', 'tradeName', 'contactEmail'] },
        { model: User, as: 'createdBy', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.status(200).json({ success: true, data: contracts });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching contracts for approval', error: error.message });
  }
};

// Approve contract (DOFA)
exports.approveContract = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findByPk(id);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }
    if (contract.status !== 'pending_approval') {
      return res.status(400).json({ success: false, message: 'Only contracts pending approval can be approved' });
    }
    contract.status = 'pending_supplier_acceptance';
    contract.approvalStatus = 'approved';
    contract.approvalDate = new Date();
    contract.approvedById = req.user.id;
    await contract.save();
    return res.status(200).json({ success: true, message: 'Contract approved and is now pending supplier acceptance. Email sent to supplier.', data: contract });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error approving contract', error: error.message });
  }
};

// Reject contract (DOFA)
exports.rejectContract = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findByPk(id);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }
    if (contract.status !== 'pending_approval') {
      return res.status(400).json({ success: false, message: 'Only contracts pending approval can be rejected' });
    }
    contract.status = 'rejected';
    contract.approvalStatus = 'rejected';
    contract.approvalDate = new Date();
    contract.approvedById = req.user.id;
    await contract.save();
    return res.status(200).json({ success: true, message: 'Contract rejected', data: contract });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error rejecting contract', error: error.message });
  }
};

// Get pending contract approvals
exports.getPendingContractApprovals = async (req, res) => {
  try {
    console.log('📋 Getting pending contract approvals for user:', req.user?.id || 'NO USER');
    console.log('📋 Request user context:', req.user ? 'EXISTS' : 'MISSING');
    
    const pendingContracts = await Contract.findAll({
      where: {
        status: 'pending_approval',
        approvalStatus: 'pending'
      },
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'legalName', 'contactEmail']
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        },
        {
          model: ContractItem,
          as: 'items'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`📋 Found ${pendingContracts.length} contracts pending approval`);
    console.log('📋 Contracts details:', pendingContracts.map(c => ({
      id: c.id,
      contractNumber: c.contractNumber,
      status: c.status,
      approvalStatus: c.approvalStatus,
      supplier: c.supplier?.legalName
    })));

    res.json({
      success: true,
      data: pendingContracts,
      count: pendingContracts.length
    });
  } catch (error) {
    console.error('Error fetching pending contract approvals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending contract approvals',
      error: error.message
    });
  }
};

// Approve or reject a contract
exports.approveContract = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    let { action, comments } = req.body;
    
    // Default to 'approve' if no action specified (for /approve endpoint)
    if (!action) {
      action = 'approve';
    }
    
    if (!['approve', 'reject'].includes(action)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "approve" or "reject"'
      });
    }

    const contract = await Contract.findByPk(id, {
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'legalName', 'contactEmail']
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        }
      ],
      transaction
    });

    if (!contract) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    if (contract.status !== 'pending_approval') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Contract is not pending approval'
      });
    }

    // Update contract based on action
    if (action === 'approve') {
      await contract.update({
        approvalStatus: 'approved',
        approvalDate: new Date(),
        approvedById: req.user?.id || contract.createdById, // Fallback if no user context
        status: 'pending_supplier_acceptance', // Contract pending supplier acceptance after approval
        notes: comments ? `${contract.notes || ''}\n\nApproval Notes: ${comments}` : contract.notes
      }, { transaction });

      // Create notification for contract creator
      try {
        const { Notification } = require('../models/sequelize');
        await Notification.create({
          itemId: contract.id,
          itemNumber: contract.contractNumber,
          shortDescription: 'Contract Approved - Pending Supplier Acceptance',
          notificationType: 'contract_approved',
          actionById: req.user?.id || contract.createdById,
          actionAt: new Date(),
          message: `Contract ${contract.contractNumber} has been approved. Waiting for acceptance confirmation from the supplier. An email has been sent to the supplier for contract acceptance.`,
          isRead: false,
          originalItemData: {
            contractId: contract.id,
            contractNumber: contract.contractNumber,
            approvedBy: req.user?.name || req.user?.email || 'System',
            status: 'pending_supplier_acceptance'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`📬 Contract approval notification created for contract ${contract.contractNumber}`);
      } catch (notificationError) {
        console.log('⚠️ Failed to create notification:', notificationError.message);
        // Continue without failing the approval
      }

      console.log(`✅ Contract ${contract.contractNumber} approved by ${req.user?.name || req.user?.email || 'System'}`);

    } else if (action === 'reject') {
      await contract.update({
        approvalStatus: 'rejected',
        approvalDate: new Date(),
        approvedById: req.user?.id || contract.createdById, // Fallback if no user context
        status: 'rejected',
        notes: comments ? `${contract.notes || ''}\n\nRejection Reason: ${comments}` : contract.notes
      }, { transaction });

      // Create notification for contract creator
      try {
        const notificationController = require('./notificationController');
        await notificationController.createNotification({
          userId: contract.createdById,
          type: 'contract_rejected',
          title: 'Contract Rejected',
          message: `Contract ${contract.contractNumber} has been rejected. Reason: ${comments || 'No reason provided'}`,
          referenceType: 'Contract',
          referenceId: contract.id,
          data: {
            contractId: contract.id,
            contractNumber: contract.contractNumber,
            rejectedBy: req.user?.name || req.user?.email || 'System',
            reason: comments
          }
        });
      } catch (notificationError) {
        console.log('⚠️ Failed to create notification:', notificationError.message);
        // Continue without failing the rejection
      }

      console.log(`❌ Contract ${contract.contractNumber} rejected by ${req.user?.name || req.user?.email || 'System'}`);
    }

    await transaction.commit();

    // Return updated contract
    const updatedContract = await Contract.findByPk(id, {
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'legalName', 'contactEmail']
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedContract,
      message: `Contract ${action}d successfully`,
      action: action
    });

  } catch (error) {
    await transaction.rollback();
    console.error(`Error ${action}ing contract:`, error);
    res.status(500).json({
      success: false,
      message: `Error ${action}ing contract`,
      error: error.message
    });
  }
};

// Send contract approval email to supplier
exports.sendContractApprovalEmail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contract = await Contract.findByPk(id, {
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

    if (contract.approvalStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Contract must be approved before sending email to supplier'
      });
    }

    if (!contract.supplier || !contract.supplier.contactEmail) {
      return res.status(400).json({
        success: false,
        message: 'Supplier email not found'
      });
    }

    // Send AI-generated email to supplier
    const aiEmailController = require('./aiEmailController');
    
    // Create a proper request object for the email controller
    const emailReq = {
      body: {
        to: contract.supplier.contactEmail,
        subject: `Contract Approved - ${contract.contractNumber}`,
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        supplierName: contract.supplier.legalName,
        type: 'approval'
      }
    };
    
    // Create a response object to capture the email result
    let emailSuccess = false;
    let emailError = null;
    
    const emailRes = {
      status: (code) => ({
        json: (data) => {
          if (code === 200) {
            emailSuccess = true;
          } else {
            emailError = data.message || 'Email sending failed';
          }
        }
      })
    };
    
    await aiEmailController.sendContractEmail(emailReq, emailRes);
    
    if (emailSuccess) {
      console.log(`📧 Contract approval email sent to supplier: ${contract.supplier.contactEmail}`);
      
      res.status(200).json({
        success: true,
        message: 'Contract approval email sent successfully',
        data: {
          contractId: contract.id,
          contractNumber: contract.contractNumber,
          emailSent: true,
          recipient: contract.supplier.contactEmail
        }
      });
    } else {
      throw new Error(emailError || 'Failed to send email');
    }

  } catch (error) {
    console.error('Error sending contract approval email:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending contract approval email',
      error: error.message
    });
  }
};

// Legacy functions for backward compatibility
// Get contracts for an item
exports.getItemContracts = async (req, res) => {
  console.log('📄 getItemContracts CALLED');
  try {
    const { itemId } = req.params;
    
    const contracts = await sequelize.query(`
      SELECT c.*, ci.*, s."legalName", s."tradeName", s."contactEmail"
      FROM "ContractItems" ci
      LEFT JOIN "Contracts" c ON ci."contractId" = c.id
      LEFT JOIN "Suppliers" s ON c."supplierId" = s.id
      WHERE ci."itemNumber" = (
        SELECT "itemNumber" FROM "ItemMasters" WHERE id = $1
      )
      ORDER BY c."startDate" DESC
    `, {
      bind: [itemId]
    });
    
    console.log(`✅ Found ${contracts[0].length} contracts for item`);
    
    res.status(200).json({
      success: true,
      data: contracts[0],
      message: `${contracts[0].length} contracts found`
    });
    
  } catch (error) {
    console.error('❌ Error getting item contracts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contracts',
      error: error.message
    });
  }
};

// Get all contracts with suppliers
exports.getActiveContracts = async (req, res) => {
  console.log('📋 getActiveContracts CALLED');
  try {
    const contracts = await sequelize.query(`
      SELECT c.*, s."legalName", s."tradeName", s."contactEmail",
             COUNT(ci.id) as "itemCount"
      FROM "Contracts" c
      LEFT JOIN "Suppliers" s ON c."supplierId" = s.id
      LEFT JOIN "ContractItems" ci ON c.id = ci."contractId"
      WHERE c.status = 'active' AND c."endDate" > NOW()
      GROUP BY c.id, s.id, s."legalName", s."tradeName", s."contactEmail"
      ORDER BY c."startDate" DESC
    `);
    
    console.log(`✅ Found ${contracts[0].length} active contracts`);
    
    res.status(200).json({
      success: true,
      data: contracts[0],
      message: `${contracts[0].length} active contracts found`
    });
    
  } catch (error) {
    console.error('❌ Error getting active contracts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contracts',
      error: error.message
    });
  }
};
