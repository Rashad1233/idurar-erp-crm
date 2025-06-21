// Database model for Contract
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Contract = sequelize.define('Contract', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    contractNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    contractName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },    supplierId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'expired', 'terminated'),
      defaultValue: 'draft',
    },
    incoterms: {
      type: DataTypes.STRING, // DDP, FCA, CIP, EXW, etc.
      allowNull: true,
    },
    paymentTerms: {
      type: DataTypes.STRING, // 30 days, 45 days, prepayment, etc.
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
    },
    totalValue: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },
    attachments: {
      type: DataTypes.JSON, // Store file paths as JSON array
      defaultValue: [],
    },
    notes: {
      type: DataTypes.TEXT,
    },    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    updatedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  });
  Contract.associate = function(models) {
    Contract.belongsTo(models.Supplier, { as: 'supplier', foreignKey: 'supplierId' });
    Contract.belongsTo(models.User, { as: 'createdBy', foreignKey: 'createdById' });
    Contract.belongsTo(models.User, { as: 'updatedBy', foreignKey: 'updatedById' });
    // TODO: Add these associations when ContractItem and PurchaseOrder models are available
    // Contract.hasMany(models.ContractItem, { as: 'items' });
    // Contract.hasMany(models.PurchaseOrder, { as: 'purchaseOrders' });
  };

  return Contract;
};
