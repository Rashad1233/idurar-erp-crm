const { RfqSupplier, RequestForQuotation, RfqQuoteItem } = require('../../../../../models/sequelize');

const list = async (req, res) => {
  try {
    console.log('🔍 Fetching RFQ supplier responses...');
    
    const { filter } = req.query;
    let whereClause = {};
    
    // Parse filter if provided
    if (filter && typeof filter === 'string') {
      try {
        const parsedFilter = JSON.parse(filter);
        if (parsedFilter.requestForQuotationId) {
          whereClause.requestForQuotationId = parsedFilter.requestForQuotationId;
        }
      } catch (e) {
        console.warn('Could not parse filter:', filter);
      }
    }
    
    const rfqSuppliers = await RfqSupplier.findAll({
      where: whereClause,
      include: [
        {
          model: RequestForQuotation,
          as: 'requestForQuotation',
          required: false,
          attributes: ['id', 'rfqNumber', 'description']
        },
        {
          model: RfqQuoteItem,
          as: 'quotes',
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`✅ Found ${rfqSuppliers.length} RFQ supplier responses`);
    
    res.status(200).json({
      success: true,
      result: rfqSuppliers,
      pagination: {
        total: rfqSuppliers.length,
        page: 1,
        pages: 1
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching RFQ supplier responses:', error);
    
    // Fallback to simple query
    try {
      const simpleRfqSuppliers = await RfqSupplier.findAll({
        order: [['createdAt', 'DESC']]
      });
      
      res.status(200).json({
        success: true,
        result: simpleRfqSuppliers,
        pagination: {
          total: simpleRfqSuppliers.length,
          page: 1,
          pages: 1
        }
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch RFQ supplier responses',
        error: error.message
      });
    }
  }
};

module.exports = list;