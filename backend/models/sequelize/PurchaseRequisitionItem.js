// Database model for Purchase Requisition Items
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PurchaseRequisitionItem = sequelize.define('PurchaseRequisitionItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    itemNumber: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for non-mastered items
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    uom: {
      type: DataTypes.STRING, // Unit of Measure (EA, PACK, BOX, M, etc.)
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 1.00,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true, // Price might be unknown at PR creation
      defaultValue: 0.00,
    },    totalPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0.00,
    },
    purchaseRequisitionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    contractId: {
      type: DataTypes.UUID,
      allowNull: true, // Optional contract reference
    },
    supplierId: {
      type: DataTypes.UUID,
      allowNull: true, // Optional supplier reference
    },
    supplierName: {
      type: DataTypes.STRING,
      allowNull: true, // For free text supplier input
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    inventoryId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    itemMasterId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    inventoryNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'ordered', 'delivered'),
      defaultValue: 'pending',
    },
  }, {
    tableName: 'PurchaseRequisitionItems',
    timestamps: true,
    underscored: false
  });PurchaseRequisitionItem.associate = function(models) {
    PurchaseRequisitionItem.belongsTo(models.PurchaseRequisition, { as: 'purchaseRequisition', foreignKey: 'purchaseRequisitionId' });
    PurchaseRequisitionItem.belongsTo(models.ItemMaster, { as: 'itemMaster', foreignKey: 'itemNumber', targetKey: 'itemNumber' });
    PurchaseRequisitionItem.belongsTo(models.Contract, { as: 'contract', foreignKey: 'contractId' });
    PurchaseRequisitionItem.belongsTo(models.Supplier, { as: 'supplier', foreignKey: 'supplierId' });
    PurchaseRequisitionItem.belongsTo(models.Inventory, { as: 'inventory', foreignKey: 'inventoryId' });
    // If itemMasterId is provided, establish a direct relationship
    PurchaseRequisitionItem.belongsTo(models.ItemMaster, { as: 'itemMasterDirect', foreignKey: 'itemMasterId' });
  };

  return PurchaseRequisitionItem;
};
