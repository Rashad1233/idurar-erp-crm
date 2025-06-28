const { RequestForQuotation, RfqItem, RfqSupplier, PurchaseRequisition, User, sequelize } = require('../../../../../models/sequelize');

const read = async (req, res) => {
  try {
    console.log('🔍 Fetching RFQ details for ID:', req.params.id);
    
    // First try simple query without associations
    const rfq = await RequestForQuotation.findByPk(req.params.id);
    
    if (!rfq) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Request for Quotation not found'
      });
    }
    
    // Try to get related data separately to avoid association issues
    let items = [];
    let suppliers = [];
    let purchaseRequisition = null;
    let createdByUser = null;
    
    try {
      items = await RfqItem.findAll({
        where: { requestForQuotationId: req.params.id }
      });
      console.log(`✅ Found ${items.length} RFQ items`);
    } catch (itemError) {
      console.warn('Could not fetch RFQ items:', itemError.message);
    }
    
    try {
      suppliers = await RfqSupplier.findAll({
        where: { requestForQuotationId: req.params.id }
      });
      console.log(`✅ Found ${suppliers.length} RFQ suppliers`);
    } catch (supplierError) {
      console.warn('Could not fetch RFQ suppliers:', supplierError.message);
    }
    
    // Get Purchase Requisition details if linked
    if (rfq.purchaseRequisitionId) {
      try {
        purchaseRequisition = await PurchaseRequisition.findByPk(rfq.purchaseRequisitionId, {
          attributes: ['id', 'prNumber', 'description', 'costCenter', 'totalAmount', 'currency']
        });
        console.log(`✅ Found linked PR: ${purchaseRequisition?.prNumber}`);
      } catch (prError) {
        console.warn('Could not fetch PR details:', prError.message);
      }
    }
    
    // Get user details
    if (rfq.createdById) {
      try {
        createdByUser = await User.findByPk(rfq.createdById, {
          attributes: ['id', 'name', 'email']
        });
        console.log(`✅ Found creator: ${createdByUser?.name}`);
      } catch (userError) {
        console.warn('Could not fetch user details:', userError.message);
      }
    }
    
    // Format the response with all available data
    const formattedRfq = {
      id: rfq.id,
      rfqNumber: rfq.rfqNumber,
      description: rfq.description,
      status: rfq.status,
      dueDate: rfq.dueDate,
      responseDeadline: rfq.responseDeadline,
      notes: rfq.notes,
      purchaseRequisitionId: rfq.purchaseRequisitionId,
      createdAt: rfq.createdAt,
      updatedAt: rfq.updatedAt,
      createdById: rfq.createdById,
      updatedById: rfq.updatedById,
      
      // Related data
      items: items.map(item => ({
        id: item.id,
        itemNumber: item.itemNumber,
        description: item.description,
        quantity: item.quantity,
        uom: item.uom,
        purchaseRequisitionItemId: item.purchaseRequisitionItemId
      })),
      
      suppliers: suppliers.map(supplier => ({
        id: supplier.id,
        supplierName: supplier.supplierName,
        contactName: supplier.contactName,
        contactEmail: supplier.contactEmail,
        contactEmailSecondary: supplier.contactEmailSecondary,
        contactPhone: supplier.contactPhone,
        status: supplier.status,
        responseToken: supplier.responseToken
      })),
      
      // Purchase Requisition details
      purchaseRequisition: purchaseRequisition ? {
        id: purchaseRequisition.id,
        prNumber: purchaseRequisition.prNumber,
        description: purchaseRequisition.description,
        costCenter: purchaseRequisition.costCenter,
        totalAmount: purchaseRequisition.totalAmount,
        currency: purchaseRequisition.currency
      } : null,
      
      // User details
      createdBy: createdByUser ? {
        id: createdByUser.id,
        name: createdByUser.name,
        email: createdByUser.email
      } : null,
      
      // Additional computed fields for display
      itemCount: items.length,
      supplierCount: suppliers.length,
      hasItems: items.length > 0,
      hasSuppliers: suppliers.length > 0,
      hasPR: !!purchaseRequisition
    };
    
    console.log(`✅ RFQ ${rfq.rfqNumber} retrieved successfully with ${items.length} items and ${suppliers.length} suppliers`);
    
    res.status(200).json({
      success: true,
      result: formattedRfq,
      message: 'Request for Quotation retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error fetching RFQ:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Failed to fetch Request for Quotation',
      error: error.message
    });
  }
};

module.exports = read;