const {
  RequestForQuotation,
  RFQLineItem,
  RFQResponse,
  RFQResponseLineItem,
  Supplier,
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
