// Database model for RFQ Items
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RfqItem = sequelize.define('RfqItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    itemNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    uom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 1.00,
    },    requestForQuotationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    purchaseRequisitionItemId: {
      type: DataTypes.UUID,
      allowNull: true, // Link to original PR item if applicable
    },
  });

  RfqItem.associate = function(models) {
    RfqItem.belongsTo(models.RequestForQuotation, { as: 'requestForQuotation', foreignKey: 'requestForQuotationId' });
    RfqItem.belongsTo(models.PurchaseRequisitionItem, { as: 'prItem', foreignKey: 'purchaseRequisitionItemId' });
    RfqItem.belongsTo(models.ItemMaster, { as: 'itemMaster', foreignKey: 'itemNumber', targetKey: 'itemNumber' });
    RfqItem.hasMany(models.RfqQuoteItem, { as: 'quotes' });
  };

  return RfqItem;
};
