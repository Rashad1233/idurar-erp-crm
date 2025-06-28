const { PurchaseRequisition, PurchaseRequisitionItem } = require('../models/sequelize');

// Get PR details by ID
exports.getPRDetails = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Fetching PR details for ID:', id);
    
    const pr = await PurchaseRequisition.findByPk(id, {
      attributes: [
        'id', 
        'prNumber', 
        'description', 
        'status',
        'totalAmount',
        'currency',
        'costCenter',
        'contractId',
        'createdAt'
      ]
    });
    
    if (!pr) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Requisition not found'
      });
    }
    
    // Try to get PR items (handle potential column name issues)
    let items = [];
    try {
      items = await PurchaseRequisitionItem.findAll({
        where: { purchaseRequisitionId: id },
        attributes: ['id', 'description', 'quantity', 'unitPrice', 'totalPrice']
      });
    } catch (itemError) {
      console.warn('Could not fetch PR items:', itemError.message);
      items = [];
    }
    
    const result = {
      _id: pr.id,
      id: pr.id,
      prNumber: pr.prNumber,
      number: pr.prNumber,
      description: pr.description,
      status: pr.status,
      totalAmount: pr.totalAmount,
      currency: pr.currency,
      costCenter: pr.costCenter,
      contractId: pr.contractId,
      createdAt: pr.createdAt,
      items: items.map(item => ({
        _id: item.id,
        id: item.id,
        itemName: item.description || 'Item',
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        uom: 'each'
      }))
    };
    
    console.log(`✅ Found PR: ${pr.prNumber} with ${items.length} items`);
    
    res.status(200).json({
      success: true,
      result: result,
      data: result
    });
    
  } catch (error) {
    console.error('❌ Error fetching PR details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch PR details',
      error: error.message
    });
  }
};

// Simple PR controller that bypasses association issues
exports.getApprovedPRs = async (req, res) => {
  try {
    console.log('🔍 Fetching approved PRs for RFQ...');
    
    const approvedPRs = await PurchaseRequisition.findAll({
      where: { 
        status: 'approved',
        contractId: null  // Only PRs without contracts are eligible for RFQ
      },
      attributes: [
        'id', 
        'prNumber', 
        'description', 
        'status',
        'totalAmount',
        'currency',
        'costCenter',
        'createdAt'
      ],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`✅ Found ${approvedPRs.length} approved PRs eligible for RFQ`);
    
    // Format response to match expected structure
    const formattedPRs = approvedPRs.map(pr => ({
      _id: pr.id,
      id: pr.id,
      prNumber: pr.prNumber,
      description: pr.description,
      status: pr.status,
      totalAmount: pr.totalAmount,
      currency: pr.currency,
      costCenter: pr.costCenter,
      createdAt: pr.createdAt
    }));
    
    res.status(200).json({
      success: true,
      result: formattedPRs,
      data: formattedPRs,
      count: formattedPRs.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching approved PRs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approved PRs',
      error: error.message
    });
  }
};