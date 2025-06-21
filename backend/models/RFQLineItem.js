const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RFQLineItem extends Model {
    static associate(models) {
      this.belongsTo(models.RequestForQuotation, {
        foreignKey: 'rfqId',
        as: 'rfq'
      });
    }
  }

  RFQLineItem.init({
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
    itemNumber: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    uom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    requestedDeliveryDate: {
      type: DataTypes.DATE
    },
    specifications: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'RFQLineItem',
    tableName: 'rfq_line_items',
    timestamps: true
  });

  return RFQLineItem;
};
