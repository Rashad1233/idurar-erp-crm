const { RequestForQuotation, RfqItem, RfqSupplier, sequelize } = require('../../../../../models/sequelize');

const send = async (req, res) => {
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
        result: null,
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
        result: null,
        message: 'Not authorized to send this Request for Quotation'
      });
    }
    
    // RFQ can only be sent if in draft status
    if (rfq.status !== 'draft') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Request for Quotation can only be sent when in draft status'
      });
    }
    
    // Validate that RFQ has items
    if (!rfq.items || rfq.items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Request for Quotation must have at least one item'
      });
    }
    
    // Validate that RFQ has suppliers
    if (!rfq.suppliers || rfq.suppliers.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Request for Quotation must have at least one supplier'
      });
    }
    
    // Update RFQ status
    rfq.status = 'sent';
    rfq.sentAt = new Date();
    rfq.updatedById = req.user.id;
    
    await rfq.save({ transaction });
    
    // Update all suppliers status to 'sent'
    for (const supplier of rfq.suppliers) {
      supplier.status = 'sent';
      supplier.sentAt = new Date();
      await supplier.save({ transaction });
      
      // TODO: Implement email notification to suppliers here
      // This would involve using a notification service or email service
    }
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      result: rfq,
      message: 'Request for Quotation sent to suppliers successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error sending RFQ:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Failed to send Request for Quotation',
      error: error.message
    });
  }
};

module.exports = send;