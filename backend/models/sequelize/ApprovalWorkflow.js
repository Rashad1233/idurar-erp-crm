// Database model for Approval Workflows
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ApprovalWorkflow = sequelize.define('ApprovalWorkflow', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entityType: {
      type: DataTypes.ENUM('purchase_order', 'contract', 'rfq'),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    updatedById: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  });

  ApprovalWorkflow.associate = function(models) {
    ApprovalWorkflow.belongsTo(models.User, { as: 'creator', foreignKey: 'createdById' });
    ApprovalWorkflow.belongsTo(models.User, { as: 'updater', foreignKey: 'updatedById' });
    ApprovalWorkflow.hasMany(models.ApprovalThreshold, { as: 'thresholds' });
  };

  return ApprovalWorkflow;
};