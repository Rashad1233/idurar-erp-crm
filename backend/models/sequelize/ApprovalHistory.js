// Database model for Approval History
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ApprovalHistory = sequelize.define('ApprovalHistory', {    referenceId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    referenceType: {
      type: DataTypes.STRING, // 'PurchaseRequisition', 'PurchaseOrder', etc.
      allowNull: false,
    },    approverId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    level: {
      type: DataTypes.INTEGER, // Approval level/sequence
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    comments: {
      type: DataTypes.TEXT,
    },
    actionDate: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'ApprovalHistories', // Use the existing table name
    underscored: false // Keep camelCase field names
  });

  ApprovalHistory.associate = function(models) {
    ApprovalHistory.belongsTo(models.User, { as: 'approver', foreignKey: 'approverId' });
  };

  return ApprovalHistory;
};
