// Database model for RFQ Quote Items (supplier responses)
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RfqQuoteItem = sequelize.define('RfqQuoteItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    rfqItemId: {
      type: DataTypes.UUID,
      allowNull: true, // Allow null for standalone items
    },
    rfqSupplierId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    itemDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 1.00,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
    },
    leadTime: {
      type: DataTypes.INTEGER, // Number of days
      allowNull: true,
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    isSelected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  RfqQuoteItem.associate = function(models) {
    RfqQuoteItem.belongsTo(models.RfqItem, { as: 'rfqItem', foreignKey: 'rfqItemId' });
    RfqQuoteItem.belongsTo(models.RfqSupplier, { as: 'rfqSupplier', foreignKey: 'rfqSupplierId' });
  };

  return RfqQuoteItem;
};
