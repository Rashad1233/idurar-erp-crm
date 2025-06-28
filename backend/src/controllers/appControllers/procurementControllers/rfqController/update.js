const { RequestForQuotation, RfqItem, RfqSupplier, PurchaseRequisitionItem, ItemMaster, Supplier, sequelize } = require('../../../../../models/sequelize');

const update = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      description, 
      responseDeadline, 
      notes,
      items,
      suppliers
    } = req.body;
    
    const rfq = await RequestForQuotation.findByPk(req.params.id);
    
    if (!rfq) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Request for Quotation not found'
      });
    }
    
    // Check authorization - only creator or admin can update
    const isCreator = rfq.createdById === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isProcurementManager = req.user.role === 'procurement_manager';
    
    if (!isCreator && !isAdmin && !isProcurementManager) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        result: null,
        message: 'Not authorized to update this Request for Quotation'
      });
    }
    
    // RFQ can only be updated if in draft status
    if (rfq.status !== 'draft') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Request for Quotation can only be updated when in draft status'
      });
    }
    
    // Update RFQ
    if (description) rfq.description = description;
    if (responseDeadline) rfq.responseDeadline = new Date(responseDeadline);
    if (notes !== undefined) rfq.notes = notes;
    
    rfq.updatedById = req.user.id;
    
    // Update items if provided
    if (items && items.length > 0) {
      // Delete existing items
      await RfqItem.destroy({
        where: { requestForQuotationId: rfq.id },
        transaction
      });
      
      // Create new items
      for (const item of items) {
        // Check if PR item ID is provided and is valid
        if (item.purchaseRequisitionItemId) {
          const prItem = await PurchaseRequisitionItem.findByPk(item.purchaseRequisitionItemId);
          if (!prItem) {
            throw new Error(`PR Item with ID ${item.purchaseRequisitionItemId} not found`);
          }
        }
        
        // Check if item number is provided and is valid
        if (item.itemNumber) {
          const itemMaster = await ItemMaster.findOne({ 
            where: { itemNumber: item.itemNumber }
          });
          if (!itemMaster) {
            throw new Error(`Item with number ${item.itemNumber} not found`);
          }
        }
        
        await RfqItem.create({
          requestForQuotationId: rfq.id,
          itemNumber: item.itemNumber || null,
          description: item.description,
          uom: item.uom,
          quantity: item.quantity,
          purchaseRequisitionItemId: item.purchaseRequisitionItemId || null
        }, { transaction });
      }
    }
    
    // Update suppliers if provided
    if (suppliers && suppliers.length > 0) {
      // Delete existing suppliers
      await RfqSupplier.destroy({
        where: { requestForQuotationId: rfq.id },
        transaction
      });
      
      // Create new suppliers
      for (const supplier of suppliers) {
        // Check if supplier ID is provided and is valid
        if (supplier.supplierId) {
          const existingSupplier = await Supplier.findByPk(supplier.supplierId);
          if (!existingSupplier) {
            throw new Error(`Supplier with ID ${supplier.supplierId} not found`);
          }
          
          // Use existing supplier data if available
          if (!supplier.supplierName) {
            supplier.supplierName = existingSupplier.legalName || existingSupplier.tradeName;
          }
          if (!supplier.contactName && existingSupplier.contactPerson) {
            supplier.contactName = existingSupplier.contactPerson;
          }
          if (!supplier.contactEmail && existingSupplier.email) {
            supplier.contactEmail = existingSupplier.email;
          }
          if (!supplier.contactPhone && existingSupplier.phone) {
            supplier.contactPhone = existingSupplier.phone;
          }
        }
        
        // Validate supplier name
        if (!supplier.supplierName) {
          throw new Error('Supplier name is required');
        }
        
        await RfqSupplier.create({
          requestForQuotationId: rfq.id,
          supplierId: supplier.supplierId || null,
          supplierName: supplier.supplierName,
          contactName: supplier.contactName || null,
          contactEmail: supplier.contactEmail || null,
          contactEmailSecondary: supplier.contactEmailSecondary || null,
          contactPhone: supplier.contactPhone || null,
          status: 'pending',
          notes: supplier.notes || null
        }, { transaction });
      }
    }
    
    await rfq.save({ transaction });
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      result: rfq,
      message: 'Request for Quotation updated successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating RFQ:', error);
    res.status(500).json({
      success: false,
      result: null,
      message: 'Failed to update Request for Quotation',
      error: error.message
    });
  }
};

module.exports = update;