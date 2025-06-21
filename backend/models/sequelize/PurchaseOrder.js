// Database model for Purchase Order
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PurchaseOrder = sequelize.define('PurchaseOrder', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    poNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },    requestForQuotationId: {
      type: DataTypes.UUID,
      allowNull: true, // Optional RFQ reference
    },
    supplierId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    contractId: {
      type: DataTypes.UUID,
      allowNull: true, // Optional contract reference
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending_approval', 'approved', 'sent', 'acknowledged', 'partially_received', 'completed', 'cancelled'),
      defaultValue: 'draft',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
    },
    incoterms: {
      type: DataTypes.STRING, // DDP, FCA, CIP, EXW, etc.
      allowNull: true,
    },
    paymentTerms: {
      type: DataTypes.STRING, // 30 days, 45 days, prepayment, etc.
      allowNull: true,
    },
    deliveryAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
    },    requestorId: {
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
    sentAt: {
      type: DataTypes.DATE,
    },
    acknowledgedAt: {
      type: DataTypes.DATE,
    },
    completedAt: {
      type: DataTypes.DATE,
    },
    cancelledAt: {
      type: DataTypes.DATE,
    },    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    updatedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    costCenter: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  PurchaseOrder.associate = function(models) {
    PurchaseOrder.belongsTo(models.User, { as: 'requestor', foreignKey: 'requestorId' });
    PurchaseOrder.belongsTo(models.User, { as: 'approver', foreignKey: 'approverId' });
    PurchaseOrder.belongsTo(models.User, { as: 'currentApprover', foreignKey: 'currentApproverId' });
    PurchaseOrder.belongsTo(models.User, { as: 'createdBy', foreignKey: 'createdById' });
    PurchaseOrder.belongsTo(models.User, { as: 'updatedBy', foreignKey: 'updatedById' });
    PurchaseOrder.belongsTo(models.Supplier, { as: 'supplier', foreignKey: 'supplierId' });
    PurchaseOrder.belongsTo(models.Contract, { as: 'contract', foreignKey: 'contractId' });
    PurchaseOrder.belongsTo(models.RequestForQuotation, { as: 'requestForQuotation', foreignKey: 'requestForQuotationId' });
    PurchaseOrder.hasMany(models.PurchaseOrderItem, { as: 'items' });
    PurchaseOrder.hasMany(models.ApprovalHistory, { as: 'approvalHistory', foreignKey: 'referenceId', constraints: false, scope: { referenceType: 'PurchaseOrder' } });
  };

  return PurchaseOrder;
};
