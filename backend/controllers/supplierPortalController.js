const {
  RequestForQuotation,
  RFQLineItem,
  RFQResponse,
  RFQResponseLineItem,
  Supplier,
  Contract,
  Notification,
  sequelize
} = require('../models/sequelize');

// @desc    Get RFQ details for supplier portal
// @route   GET /api/supplier-portal/rfq/:token
// @access  Public
exports.getSupplierRFQ = async (req, res) => {
  try {
    const response = await RFQResponse.findOne({
      where: { responseToken: req.params.token },
      include: [
        {
          model: RequestForQuotation,
          as: 'rfq',
          include: [
            {
              model: RFQLineItem,
              as: 'lineItems'
            }
          ]
        },
        {
          model: Supplier,
          as: 'supplier'
        }
      ]
    });

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'RFQ response not found'
      });
    }

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching RFQ for supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching RFQ details',
      error: error.message
    });
  }
};

// @desc    Submit supplier's RFQ response
// @route   POST /api/supplier-portal/rfq/:token
// @access  Public
exports.submitSupplierResponse = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      lineItems,
      totalAmount,
      currency,
      validUntil,
      deliveryTerms,
      paymentTerms,
      comments
    } = req.body;

    const response = await RFQResponse.findOne({
      where: { responseToken: req.params.token },
      include: [
        {
          model: RequestForQuotation,
          as: 'rfq'
        }
      ],
      transaction
    });

    if (!response) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'RFQ response not found'
      });
    }

    // Update response
    await response.update({
      status: 'submitted',
      totalAmount,
      currency,
      validUntil,
      deliveryTerms,
      paymentTerms,
      comments,
      submittedAt: new Date()
    }, { transaction });

    // Create response line items
    await Promise.all(lineItems.map(item =>
      RFQResponseLineItem.create({
        responseId: response.id,
        rfqLineItemId: item.rfqLineItemId,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        leadTime: item.leadTime,
        comments: item.comments
      }, { transaction })
    ));

    await transaction.commit();

    res.json({
      success: true,
      message: 'RFQ response submitted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error submitting RFQ response:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting RFQ response',
      error: error.message
    });
  }
};

// @desc    Get contract details for supplier acceptance
// @route   GET /api/supplier-portal/contract-acceptance/:contractId
// @access  Public
exports.getContractForAcceptance = async (req, res) => {
  try {
    const { contractId } = req.params;
    
    const contract = await Contract.findOne({
      where: { 
        id: contractId,
        status: 'pending_supplier_acceptance'
      },
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
        message: 'Contract not found or not available for acceptance'
      });
    }

    res.json({
      success: true,
      data: contract
    });
  } catch (error) {
    console.error('Error fetching contract for acceptance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contract details',
      error: error.message
    });
  }
};

// @desc    Accept contract by supplier
// @route   POST /api/supplier-portal/contract-acceptance/:contractId
// @access  Public
exports.acceptContract = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { contractId } = req.params;
    const { supplierName, supplierEmail, acceptanceNotes } = req.body;
    
    const contract = await Contract.findOne({
      where: { id: contractId },
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'legalName', 'contactEmail']
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

    // Check if contract is approved and pending supplier acceptance
    if (contract.approvalStatus !== 'approved' || contract.status !== 'pending_supplier_acceptance') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Contract is not available for acceptance. Current status: ${contract.status}`,
        status: contract.status
      });
    }

    // Update contract with supplier acceptance
    await contract.update({
      status: 'active',
      supplierAcceptedAt: new Date(),
      supplierAcceptanceNotes: acceptanceNotes,
      notes: contract.notes ? 
        `${contract.notes}\n\nSupplier Acceptance: ${acceptanceNotes || 'Contract accepted by supplier'}` :
        `Supplier Acceptance: ${acceptanceNotes || 'Contract accepted by supplier'}`
    }, { transaction });

    // Create notification for contract creator
    try {
      await Notification.create({
        itemId: contract.id,
        itemNumber: contract.contractNumber,
        shortDescription: 'Contract Accepted by Supplier',
        notificationType: 'contract_supplier_accepted',
        actionById: null, // Supplier action, no internal user ID
        actionAt: new Date(),
        message: `Contract ${contract.contractNumber} has been accepted by ${contract.supplier.legalName}. The contract is now active.`,
        isRead: false,
        originalItemData: {
          contractId: contract.id,
          contractNumber: contract.contractNumber,
          supplierName: contract.supplier.legalName,
          acceptedAt: new Date(),
          status: 'active'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`📬 Contract acceptance notification created for contract ${contract.contractNumber}`);
    } catch (notificationError) {
      console.log('⚠️ Failed to create notification:', notificationError.message);
    }

    await transaction.commit();

    console.log(`✅ Contract ${contract.contractNumber} accepted by supplier: ${contract.supplier.legalName}`);

    res.json({
      success: true,
      message: 'Contract accepted successfully',
      data: {
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        status: 'active',
        acceptedAt: new Date()
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error accepting contract:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting contract',
      error: error.message
    });
  }
};

// @desc    Reject contract by supplier
// @route   POST /api/supplier-portal/contract-rejection/:contractId
// @access  Public
exports.rejectContract = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { contractId } = req.params;
    const { supplierName, supplierEmail, rejectionReason } = req.body;
    
    const contract = await Contract.findOne({
      where: { id: contractId },
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'legalName', 'contactEmail']
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

    // Check if contract is approved and pending supplier acceptance
    if (contract.approvalStatus !== 'approved' || contract.status !== 'pending_supplier_acceptance') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Contract is not available for rejection. Current status: ${contract.status}`,
        status: contract.status
      });
    }

    // Update contract with supplier rejection
    await contract.update({
      status: 'rejected',
      supplierRejectedAt: new Date(),
      supplierRejectionReason: rejectionReason,
      notes: contract.notes ? 
        `${contract.notes}\n\nSupplier Rejection: ${rejectionReason || 'Contract rejected by supplier'}` :
        `Supplier Rejection: ${rejectionReason || 'Contract rejected by supplier'}`
    }, { transaction });

    // Create notification for contract creator
    try {
      await Notification.create({
        itemId: contract.id,
        itemNumber: contract.contractNumber,
        shortDescription: 'Contract Rejected by Supplier',
        notificationType: 'contract_supplier_rejected',
        actionById: null, // Supplier action, no internal user ID
        actionAt: new Date(),
        message: `Contract ${contract.contractNumber} has been rejected by ${contract.supplier.legalName}. Reason: ${rejectionReason || 'No reason provided'}`,
        isRead: false,
        originalItemData: {
          contractId: contract.id,
          contractNumber: contract.contractNumber,
          supplierName: contract.supplier.legalName,
          rejectionReason: rejectionReason,
          rejectedAt: new Date(),
          status: 'rejected'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`📬 Contract rejection notification created for contract ${contract.contractNumber}`);
    } catch (notificationError) {
      console.log('⚠️ Failed to create notification:', notificationError.message);
    }

    await transaction.commit();

    console.log(`❌ Contract ${contract.contractNumber} rejected by supplier: ${contract.supplier.legalName}`);

    res.json({
      success: true,
      message: 'Contract rejected successfully',
      data: {
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        status: 'rejected',
        rejectedAt: new Date(),
        rejectionReason: rejectionReason
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error rejecting contract:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting contract',
      error: error.message
    });
  }
};
