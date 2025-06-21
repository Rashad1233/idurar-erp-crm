// Database model for Contract Items
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ContractItem = sequelize.define('ContractItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    contractId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    itemNumber: {
      type: DataTypes.STRING,
      allowNull: true, // May link to a mastered item
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    uom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    leadTime: {
      type: DataTypes.INTEGER, // Days
      allowNull: true,
    },
    minimumOrderQuantity: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  });

  ContractItem.associate = function(models) {
    ContractItem.belongsTo(models.Contract, { as: 'contract', foreignKey: 'contractId' });
    ContractItem.belongsTo(models.ItemMaster, { as: 'itemMaster', foreignKey: 'itemNumber', targetKey: 'itemNumber' });
  };

  return ContractItem;
};
