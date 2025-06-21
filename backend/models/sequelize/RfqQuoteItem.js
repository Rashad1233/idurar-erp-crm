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
      allowNull: false,
    },
    rfqSupplierId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    deliveryTime: {
      type: DataTypes.INTEGER, // Number of days
      allowNull: true,
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    currencyCode: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
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
