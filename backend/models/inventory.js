const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Inventory extends Model {
    static associate(models) {
      // Define the association with properly identified model
      this.belongsTo(models.ItemMaster, {
        foreignKey: 'itemId',
        as: 'item',
        targetKey: 'id'
      });
    }
  }

  Inventory.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    itemId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'item_master',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    location: {
      type: DataTypes.STRING
    },
    lastStockUpdate: {
      type: DataTypes.DATE
    },
    status: {
      type: DataTypes.ENUM('in_stock', 'out_of_stock', 'low_stock'),
      defaultValue: 'in_stock'
    }
  }, {
    sequelize,
    modelName: 'Inventory',
    tableName: 'inventory',
    timestamps: true
  });

  return Inventory;
};
