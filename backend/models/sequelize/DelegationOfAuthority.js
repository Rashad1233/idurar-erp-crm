// Database model for Delegation of Financial Authority (DoFA)
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DelegationOfAuthority = sequelize.define('DelegationOfAuthority', {    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    costCenter: {
      type: DataTypes.STRING,
      allowNull: true, // If null, applies to all cost centers
    },
    documentType: {
      type: DataTypes.ENUM('PR', 'PO', 'Contract', 'All'),
      defaultValue: 'All',
    },
    approvalLevel: {
      type: DataTypes.INTEGER, // 1, 2, 3, etc.
      allowNull: false,
    },
    amountFrom: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    amountTo: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true, // Null means no end date
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

  DelegationOfAuthority.associate = function(models) {
    DelegationOfAuthority.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
    DelegationOfAuthority.belongsTo(models.User, { as: 'createdBy', foreignKey: 'createdById' });
    DelegationOfAuthority.belongsTo(models.User, { as: 'updatedBy', foreignKey: 'updatedById' });
  };

  return DelegationOfAuthority;
};
