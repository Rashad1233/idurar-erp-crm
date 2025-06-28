// Database model for RFQ Suppliers
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RfqSupplier = sequelize.define('RfqSupplier', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    requestForQuotationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    supplierId: {
      type: DataTypes.UUID,
      allowNull: true, // Can be null for non-registered suppliers
    },
    supplierName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactEmailSecondary: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'responded', 'selected', 'rejected', 'approved'),
      defaultValue: 'pending',
    },
    sentAt: {
      type: DataTypes.DATE,
    },
    respondedAt: {
      type: DataTypes.DATE,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    responseToken: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    tokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  RfqSupplier.associate = function(models) {
    RfqSupplier.belongsTo(models.RequestForQuotation, { as: 'rfq', foreignKey: 'requestForQuotationId' });
    RfqSupplier.belongsTo(models.Supplier, { as: 'supplier', foreignKey: 'supplierId' });
    RfqSupplier.hasMany(models.RfqQuoteItem, { as: 'quotedItems' });
  };

  return RfqSupplier;
};
