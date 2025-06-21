// Database model for Purchase Order Items
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PurchaseOrderItem = sequelize.define('PurchaseOrderItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    purchaseOrderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    rfqItemId: {
      type: DataTypes.UUID,
      allowNull: true, // Link to RFQ item if applicable
    },
    prItemId: {
      type: DataTypes.UUID,
      allowNull: true, // Link to PR item if applicable
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
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'partial', 'received', 'cancelled'),
      defaultValue: 'pending',
    },
    receivedQuantity: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },
    receivedAt: {
      type: DataTypes.DATE,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  });

  PurchaseOrderItem.associate = function(models) {
    PurchaseOrderItem.belongsTo(models.PurchaseOrder, { as: 'purchaseOrder', foreignKey: 'purchaseOrderId' });
    PurchaseOrderItem.belongsTo(models.RfqItem, { as: 'rfqItem', foreignKey: 'rfqItemId' });
    PurchaseOrderItem.belongsTo(models.PurchaseRequisitionItem, { as: 'prItem', foreignKey: 'prItemId' });
    PurchaseOrderItem.belongsTo(models.ItemMaster, { as: 'itemMaster', foreignKey: 'itemNumber', targetKey: 'itemNumber' });
  };

  return PurchaseOrderItem;
};
