const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RFQResponseLineItem extends Model {
    static associate(models) {
      this.belongsTo(models.RFQResponse, {
        foreignKey: 'responseId',
        as: 'response'
      });
      
      this.belongsTo(models.RFQLineItem, {
        foreignKey: 'rfqLineItemId',
        as: 'rfqLineItem'
      });
    }
  }

  RFQResponseLineItem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    responseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'rfq_responses',
        key: 'id'
      }
    },
    rfqLineItemId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'rfq_line_items',
        key: 'id'
      }
    },
    unitPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    leadTime: {
      type: DataTypes.INTEGER, // in days
    },
    comments: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'RFQResponseLineItem',
    tableName: 'rfq_response_line_items',
    timestamps: true
  });

  return RFQResponseLineItem;
};
