const { RequestForQuotation, RfqItem, RfqSupplier, User, PurchaseRequisition, Supplier } = require('../../../../../models/sequelize');
const { Op } = require('sequelize');

const search = async (req, res) => {
  try {
    const { q, status, dateFrom, dateTo } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        result: [],
        message: 'Search query parameter "q" is required'
      });
    }
    
    // Build query
    const query = {
      [Op.or]: [
        { rfqNumber: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
        { notes: { [Op.like]: `%${q}%` } }
      ]
    };
    
    // Additional filters
    if (status) {
      query.status = status;
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
      order: [['createdAt', 'DESC']],
      limit: 50 // Limit search results
    });
    
    res.status(200).json({
      success: true,
      result: rfqs,
      message: `Found ${rfqs.length} requests for quotation matching "${q}"`
    });
  } catch (error) {
    console.error('Error searching RFQs:', error);
    res.status(500).json({
      success: false,
      result: [],
      message: 'Failed to search Requests for Quotation',
      error: error.message
    });
  }
};

module.exports = search;