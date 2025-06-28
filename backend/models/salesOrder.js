const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SalesOrder extends Model {
    static associate(models) {
      this.belongsTo(models.Customer, { foreignKey: 'customerId', as: 'customer' });
      this.belongsTo(models.User, { foreignKey: 'salesPersonId', as: 'salesPerson' });
      this.belongsTo(models.User, { foreignKey: 'createdById', as: 'createdBy' });
      this.belongsTo(models.User, { foreignKey: 'updatedById', as: 'updatedBy' });
      this.hasMany(models.SalesOrderItem, { foreignKey: 'salesOrderId', as: 'items' });
    }
  }
  SalesOrder.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    salesPersonId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: true
    },
    updatedById: {
      type: DataTypes.UUID,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'draft'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      defaultValue: 0
    },
    vatRate: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false,
      defaultValue: 0
    },
    discountType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    discountValue: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    seasonalDiscount: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    specialDiscount: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    storeLocation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    receiptNumber: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'SalesOrder',
    tableName: 'SalesOrders',
    timestamps: true
  });
  return SalesOrder;
};
