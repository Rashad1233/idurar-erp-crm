const { RequestForQuotation, RfqItem, RfqSupplier, User, PurchaseRequisition, Supplier } = require('../../../../../models/sequelize');
const { Op } = require('sequelize');

const filter = async (req, res) => {
  try {
    // Build query based on query parameters
    const query = {};
    const { status, createdById, dateFrom, dateTo } = req.query;
    
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
    
    // Determine if we should filter by current user's role
    const isAdmin = req.user && req.user.role === 'admin';
    const isProcurementManager = req.user && req.user.role === 'procurement_manager';
    
    // Regular users can only see their own RFQs
    if (!isAdmin && !isProcurementManager && req.user) {
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
      result: rfqs,
      message: `Successfully filtered ${rfqs.length} requests for quotation`
    });
  } catch (error) {
    console.error('Error filtering RFQs:', error);
    res.status(500).json({
      success: false,
      result: [],
      message: 'Failed to filter Requests for Quotation',
      error: error.message
    });
  }
};

module.exports = filter;