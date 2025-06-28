const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SalesOrderItem extends Model {
    static associate(models) {
      this.belongsTo(models.SalesOrder, { foreignKey: 'salesOrderId', as: 'salesOrder' });
      this.belongsTo(models.ItemMaster, { foreignKey: 'itemMasterId', as: 'item' });
    }
  }
  SalesOrderItem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    salesOrderId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    itemMasterId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    itemNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    itemDescription: {
      type: DataTypes.STRING,
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    uom: {
      type: DataTypes.STRING,
      allowNull: true
    },
    unitPrice: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      defaultValue: 0
    },
    discount: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    discountPercent: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: true
    },
    lineTotal: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      defaultValue: 0
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true
    },
    barcode: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'SalesOrderItem',
    tableName: 'SalesOrderItems',
    timestamps: true
  });
  return SalesOrderItem;
};
