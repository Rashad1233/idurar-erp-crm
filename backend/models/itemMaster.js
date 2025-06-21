const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ItemMaster extends Model {
    static associate(models) {
      this.hasMany(models.PurchaseRequisitionItem, {
        foreignKey: 'itemId',
        as: 'purchaseRequisitionItems'
      });

      this.hasMany(models.Inventory, {
        foreignKey: 'itemId',
        as: 'inventories'
      });
      
      // Add association with UnspscCode
      if (models.UnspscCode) {
        this.belongsTo(models.UnspscCode, {
          foreignKey: 'unspscCodeId',
          as: 'unspsc'
        });
      }
      
      // Add association with User for createdBy
      if (models.User) {
        this.belongsTo(models.User, {
          foreignKey: 'createdById',
          as: 'createdBy'
        });
      }
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
    shortDescription: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    longDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    standardDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    manufacturerName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    manufacturerPartNumber: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    equipmentCategory: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    equipmentSubCategory: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    unspscCode: {
      type: DataTypes.STRING(8),
      allowNull: true
    },
    uom: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    equipmentTag: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    serialNumber: {
      type: DataTypes.STRING(1),
      defaultValue: 'N'
    },
    criticality: {
      type: DataTypes.STRING(20),
      defaultValue: 'NO'
    },
    stockItem: {
      type: DataTypes.STRING(1),
      defaultValue: 'N'
    },
    plannedStock: {
      type: DataTypes.STRING(1),
      defaultValue: 'N'
    },
    category: {
      type: DataTypes.STRING
    },
    subcategory: {
      type: DataTypes.STRING
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
    leadTime: {
      type: DataTypes.INTEGER,
      comment: 'Lead time in days'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'DRAFT'
    },
    unspscCodeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'unspsc_codes',
        key: 'id'
      }
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: true
    }  }, {
    sequelize,
    modelName: 'ItemMaster',
    tableName: 'ItemMasters',
    timestamps: true
  });

  return ItemMaster;
};
