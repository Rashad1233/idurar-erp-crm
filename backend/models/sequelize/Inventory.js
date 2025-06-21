module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define('Inventory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },    inventoryNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    physicalBalance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    linePrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    condition: {
      type: DataTypes.ENUM('A', 'B', 'C', 'D', 'E'),
      defaultValue: 'A',
    },
    minimumLevel: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    maximumLevel: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },    binLocationText: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    warehouse: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    binLocationId: {
      type: DataTypes.UUID,
      references: {
        model: 'BinLocations',
        key: 'id',
      },
    },
    serialNumber: {
      type: DataTypes.STRING,
      defaultValue: '',
    },    itemMasterId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'ItemMasters',
        key: 'id',
      },
    },
    itemId: {
      type: DataTypes.UUID,
      allowNull: true, // Allow null for backward compatibility
      references: {
        model: 'ItemMasters',
        key: 'id',
      },
    },
    storageLocationId: {
      type: DataTypes.UUID,
      references: {
        model: 'StorageLocations',
        key: 'id',
      },
    },
    lastUpdatedById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },  }, {
    tableName: 'Inventories',
    timestamps: true,
    underscored: false, // Use camelCase column names, not snake_case
    hooks: {
      beforeCreate: (inventory) => {
        inventory.linePrice = Number(inventory.unitPrice) * Number(inventory.physicalBalance);
      },
      beforeUpdate: (inventory) => {
        if (inventory.changed('unitPrice') || inventory.changed('physicalBalance')) {
          inventory.linePrice = Number(inventory.unitPrice) * Number(inventory.physicalBalance);
        }
      }
    }
  });

  // Virtual getter for reorderQuantity (implemented through a getter method since Sequelize virtualFields don't work with JSON)
  Inventory.prototype.getReorderQuantity = function() {
    if (this.physicalBalance < this.minimumLevel) {
      return this.maximumLevel - this.physicalBalance;
    }
    return 0;
  };

  return Inventory;
};
