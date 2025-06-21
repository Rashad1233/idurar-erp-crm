const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ItemMaster extends Model {
    static associate(models) {
      // Define associations
      ItemMaster.belongsTo(models.User, {
        foreignKey: 'createdById',
        as: 'createdBy'
      });
      
      ItemMaster.belongsTo(models.User, {
        foreignKey: 'updatedById',
        as: 'updatedBy'
      });
      
      ItemMaster.hasMany(models.PurchaseRequisitionItem, {
        foreignKey: 'itemId',
        as: 'purchaseRequisitionItems'
      });

      ItemMaster.hasMany(models.Inventory, {
        foreignKey: 'itemId',
        as: 'inventories'
      });
    }
  }

  ItemMaster.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    itemNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING
    },
    subcategory: {
      type: DataTypes.STRING
    },
    uom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    specifications: {
      type: DataTypes.TEXT
    },
    minimumOrderQuantity: {
      type: DataTypes.DECIMAL(10, 2)
    },
    reorderPoint: {
      type: DataTypes.DECIMAL(10, 2)
    },
    unspsc: {
      type: DataTypes.STRING
    },
    manufacturer: {
      type: DataTypes.STRING
    },
    manufacturerPartNumber: {
      type: DataTypes.STRING
    },
    barcode: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active'
    },
    createdById: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    updatedById: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    // Add timestamps
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ItemMaster',
    tableName: 'ItemMasters',
    timestamps: true,
    underscored: true
  });

  return ItemMaster;
};
