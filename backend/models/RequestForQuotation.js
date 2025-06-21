const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RequestForQuotation extends Model {
    static associate(models) {
      // Associations with other models
      this.belongsTo(models.PurchaseRequisition, {
        foreignKey: 'purchaseRequisitionId',
        as: 'purchaseRequisition'
      });
      
      this.belongsTo(models.User, {
        foreignKey: 'createdById',
        as: 'createdBy'
      });

      this.belongsTo(models.User, {
        foreignKey: 'updatedById',
        as: 'updatedBy'
      });

      // RFQ can have multiple suppliers
      this.belongsToMany(models.Supplier, {
        through: models.RFQSupplier,
        foreignKey: 'rfqId',
        as: 'suppliers'
      });

      // RFQ can have multiple line items
      this.hasMany(models.RFQLineItem, {
        foreignKey: 'rfqId',
        as: 'lineItems'
      });

      // RFQ can have multiple supplier responses
      this.hasMany(models.RFQResponse, {
        foreignKey: 'rfqId',
        as: 'responses'
      });
    }
  }

  RequestForQuotation.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    rfqNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('draft', 'sent', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'draft',
      allowNull: false
    },
    submissionDeadline: {
      type: DataTypes.DATE,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    purchaseRequisitionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'PurchaseRequisitions',
        key: 'id'
      }
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    updatedById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'RequestForQuotation',
    tableName: 'request_for_quotations',
    timestamps: true
  });

  return RequestForQuotation;
};
