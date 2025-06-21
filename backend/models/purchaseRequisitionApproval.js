const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class PurchaseRequisitionApproval extends Model {
    static associate(models) {
      this.belongsTo(models.PurchaseRequisition, {
        foreignKey: 'prId',
        as: 'purchaseRequisition'
      });

      this.belongsTo(models.User, {
        foreignKey: 'approverId',
        as: 'approver'
      });
    }
  }

  PurchaseRequisitionApproval.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },    prId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'PurchaseRequisitions',
        key: 'id'
      }
    },
    approverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    approvalLevel: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false
    },
    comments: {
      type: DataTypes.TEXT
    },
    actionDate: {
      type: DataTypes.DATE
    },
    threshold: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Maximum amount this approver can approve'
    }
  }, {
    sequelize,
    modelName: 'PurchaseRequisitionApproval',
    tableName: 'purchase_requisition_approvals',
    timestamps: true
  });

  return PurchaseRequisitionApproval;
};
