// Database model for Purchase Requisition
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PurchaseRequisition = sequelize.define('PurchaseRequisition', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    prNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'submitted', 'approved', 'partially_approved', 'rejected', 'completed'),
      defaultValue: 'draft',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
    },    costCenter: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contractId: {
      type: DataTypes.UUID,
      allowNull: true,
    },requestorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    approverId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    currentApproverId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    attachments: {
      type: DataTypes.JSON, // Store file paths as JSON array
      defaultValue: [],
    },
    submittedAt: {
      type: DataTypes.DATE,
    },
    approvedAt: {
      type: DataTypes.DATE,
    },
    rejectedAt: {
      type: DataTypes.DATE,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
    },    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
    },    updatedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    tableName: 'PurchaseRequisitions',
    timestamps: true,
    underscored: false
  });
  PurchaseRequisition.associate = function(models) {
    PurchaseRequisition.belongsTo(models.User, { as: 'requestor', foreignKey: 'requestorId' });    PurchaseRequisition.belongsTo(models.User, { as: 'approver', foreignKey: 'approverId' });
    PurchaseRequisition.belongsTo(models.User, { as: 'currentApprover', foreignKey: 'currentApproverId' });
    PurchaseRequisition.belongsTo(models.User, { as: 'createdBy', foreignKey: 'createdById' });
    PurchaseRequisition.belongsTo(models.User, { as: 'updatedBy', foreignKey: 'updatedById' });
    PurchaseRequisition.belongsTo(models.Contract, { as: 'contract', foreignKey: 'contractId' });
    PurchaseRequisition.hasMany(models.PurchaseRequisitionItem, { as: 'items', foreignKey: 'purchaseRequisitionId' });
    // TODO: Add this association when ApprovalHistory model is available
    // PurchaseRequisition.hasMany(models.ApprovalHistory, { as: 'approvalHistory', foreignKey: 'referenceId', constraints: false, scope: { referenceType: 'PurchaseRequisition' } });
  };

  return PurchaseRequisition;
};
