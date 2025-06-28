// Database model for Approval Thresholds
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ApprovalThreshold = sequelize.define('ApprovalThreshold', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    approvalWorkflowId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    minAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    maxAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 999999999.99,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });

  ApprovalThreshold.associate = function(models) {
    ApprovalThreshold.belongsTo(models.ApprovalWorkflow, { 
      as: 'workflow', 
      foreignKey: 'approvalWorkflowId' 
    });
  };

  return ApprovalThreshold;
};