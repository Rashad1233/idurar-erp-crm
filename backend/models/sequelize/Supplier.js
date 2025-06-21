// Database model for Supplier
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Supplier = sequelize.define('Supplier', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    supplierNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    legalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tradeName: {
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
    contactName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    complianceChecked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    supplierType: {
      type: DataTypes.ENUM('transactional', 'strategic', 'preferred', 'blacklisted'),
      defaultValue: 'transactional',
    },
    paymentTerms: {
      type: DataTypes.STRING, // e.g., "30 days", "45 days", "prepayment"
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    taxId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    registrationNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending_approval', 'rejected'),
      defaultValue: 'pending_approval',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    updatedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  });
  Supplier.associate = function(models) {
    Supplier.belongsTo(models.User, { as: 'createdBy', foreignKey: 'createdById' });
    Supplier.belongsTo(models.User, { as: 'updatedBy', foreignKey: 'updatedById' });
    Supplier.hasMany(models.Contract, { as: 'contracts', foreignKey: 'supplierId' });
    // TODO: Add these associations when the models are available
    // Supplier.hasMany(models.PurchaseOrder, { as: 'purchaseOrders', foreignKey: 'supplierId' });
    // Supplier.hasMany(models.RfqSupplier, { as: 'rfqs', foreignKey: 'supplierId' });
  };

  return Supplier;
};
