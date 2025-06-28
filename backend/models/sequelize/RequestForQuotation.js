// Database model for Request for Quotation (RFQ)
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RequestForQuotation = sequelize.define('RequestForQuotation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    rfqNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'sent', 'in_progress', 'completed', 'cancelled', 'rejected'),
      defaultValue: 'draft',
    },
    responseDeadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    attachments: {
      type: DataTypes.JSON, // Store file paths as JSON array
      defaultValue: [],
    },
    purchaseRequisitionId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    updatedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    sentAt: {
      type: DataTypes.DATE,
    },
    completedAt: {
      type: DataTypes.DATE,
    },
  });

  RequestForQuotation.associate = function(models) {
    RequestForQuotation.belongsTo(models.PurchaseRequisition, { as: 'purchaseRequisition', foreignKey: 'purchaseRequisitionId' });
    RequestForQuotation.belongsTo(models.User, { as: 'createdBy', foreignKey: 'createdById' });
    RequestForQuotation.belongsTo(models.User, { as: 'updatedBy', foreignKey: 'updatedById' });
    RequestForQuotation.hasMany(models.RfqSupplier, { as: 'suppliers', foreignKey: 'requestForQuotationId' });
    RequestForQuotation.hasMany(models.RfqItem, { as: 'items', foreignKey: 'requestForQuotationId' });
  };

  return RequestForQuotation;
};
