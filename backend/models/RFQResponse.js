const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RFQResponse extends Model {
    static associate(models) {
      this.belongsTo(models.RequestForQuotation, {
        foreignKey: 'rfqId',
        as: 'rfq'
      });
      
      this.belongsTo(models.Supplier, {
        foreignKey: 'supplierId',
        as: 'supplier'
      });

      this.hasMany(models.RFQResponseLineItem, {
        foreignKey: 'responseId',
        as: 'lineItems'
      });
    }
  }

  RFQResponse.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    rfqId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'request_for_quotations',
        key: 'id'
      }
    },
    supplierId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'suppliers',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'submitted', 'accepted', 'rejected'),
      defaultValue: 'pending'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 2)
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD'
    },
    validUntil: {
      type: DataTypes.DATE
    },
    deliveryTerms: {
      type: DataTypes.TEXT
    },
    paymentTerms: {
      type: DataTypes.TEXT
    },
    comments: {
      type: DataTypes.TEXT
    },
    submittedAt: {
      type: DataTypes.DATE
    },
    responseToken: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'RFQResponse',
    tableName: 'rfq_responses',
    timestamps: true
  });

  return RFQResponse;
};
