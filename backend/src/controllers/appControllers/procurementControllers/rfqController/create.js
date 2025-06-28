const { RequestForQuotation, RfqItem, RfqSupplier, PurchaseRequisition, Supplier } = require('../../../../../models/sequelize');
const { generateRFQNumber } = require('../../../../../utils/numberGenerator');

const create = async (req, res) => {
  try {
    const {
      description,
      purchaseRequisitionId,
      dueDate,
      responseDeadline,
      notes,
      suppliers = [],
      items = [],
      manualSuppliers = []
    } = req.body;

    // Validate required fields
    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    if (!dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Due date is required'
      });
    }

    if (suppliers.length === 0 && manualSuppliers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one supplier must be selected or added manually'
      });
    }

    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item must be included'
      });
    }

    // Generate automatic RFQ number
    const rfqNumber = await generateRFQNumber();

    // Validate PR if provided
    let purchaseRequisition = null;
    if (purchaseRequisitionId) {
      purchaseRequisition = await PurchaseRequisition.findByPk(purchaseRequisitionId);
      if (!purchaseRequisition) {
        return res.status(404).json({
          success: false,
          message: 'Purchase Requisition not found'
        });
      }

      // Check if PR is approved
      if (purchaseRequisition.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Purchase Requisition must be approved before creating RFQ'
        });
      }

      // Check if materials/services are not part of existing contract
      // This would require additional contract checking logic
    }

    // Create RFQ
    const rfq = await RequestForQuotation.create({
      rfqNumber,
      description,
      purchaseRequisitionId,
      dueDate,
      responseDeadline: responseDeadline || dueDate,
      notes,
      status: 'draft',
      createdById: req.user?.id || '0b4afa3e-8582-452b-833c-f8bf695c4d60', // Default admin for now
      updatedById: req.user?.id || '0b4afa3e-8582-452b-833c-f8bf695c4d60' // Required field
    });

    // Add items to RFQ
    const rfqItems = [];
    for (const item of items) {
      const rfqItem = await RfqItem.create({
        requestForQuotationId: rfq.id,
        itemNumber: null, // Don't use auto-generated item numbers to avoid FK constraint
        description: item.description || item.itemName,
        quantity: item.quantity,
        uom: item.uom || 'each',
        purchaseRequisitionItemId: item.prItemId || null
      });
      rfqItems.push(rfqItem);
    }

    // Add registered suppliers
    const rfqSuppliers = [];
    for (const supplierId of suppliers) {
      const supplier = await Supplier.findByPk(supplierId);
      if (supplier) {
        const rfqSupplier = await RfqSupplier.create({
          requestForQuotationId: rfq.id,
          supplierId: supplier.id,
          supplierName: supplier.legalName || supplier.tradeName,
          contactName: supplier.contactName,
          contactEmail: supplier.contactEmail,
          contactEmailSecondary: supplier.contactEmailSecondary,
          contactPhone: supplier.contactPhone,
          status: 'pending',
          responseToken: generateResponseToken()
        });
        rfqSuppliers.push(rfqSupplier);
      }
    }

    // Add manual suppliers (not registered)
    for (const manualSupplier of manualSuppliers) {
      const rfqSupplier = await RfqSupplier.create({
        requestForQuotationId: rfq.id,
        supplierId: null, // No registered supplier
        supplierName: manualSupplier.name,
        contactName: manualSupplier.contactName,
        contactEmail: manualSupplier.email,
        contactEmailSecondary: manualSupplier.emailSecondary,
        contactPhone: manualSupplier.phone,
        status: 'pending',
        responseToken: generateResponseToken(),
        isManual: true
      });
      rfqSuppliers.push(rfqSupplier);
    }

    // Load complete RFQ with associations
    const completeRFQ = await RequestForQuotation.findByPk(rfq.id, {
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

    res.status(201).json({
      success: true,
      result: completeRFQ,
      message: `RFQ ${rfqNumber} created successfully`
    });

  } catch (error) {
    console.error('Error creating RFQ:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create RFQ',
      error: error.message
    });
  }
};

// Helper function to generate response token for suppliers
function generateResponseToken() {
  return require('crypto').randomBytes(32).toString('hex');
}

module.exports = create;