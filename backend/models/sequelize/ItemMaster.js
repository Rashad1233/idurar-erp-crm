module.exports = (sequelize, DataTypes) => {
  const ItemMaster = sequelize.define('ItemMaster', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },    itemNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    shortDescription: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    longDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    standardDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    manufacturerName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    manufacturerPartNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    equipmentCategory: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    equipmentSubCategory: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    unspscCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    unspscCodeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'UnspscCodes',
        key: 'id'
      },
    },    uom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantityPerKg: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      comment: 'Quantity per kilogram (for weight-based calculations)',
    },
    quantityPerCubicMeter: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      comment: 'Quantity per cubic meter (for volume-based calculations)',
    },
    equipmentTag: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    serialNumber: {
      type: DataTypes.STRING,
      defaultValue: 'N',
    },
    criticality: {
      type: DataTypes.STRING,
      defaultValue: 'NO',
    },
    stockItem: {
      type: DataTypes.STRING,
      defaultValue: 'N',
    },
    plannedStock: {
      type: DataTypes.STRING,
      defaultValue: 'N',
    },
    stockCode: {
      type: DataTypes.STRING,
      defaultValue: 'NS3',
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'DRAFT',
    },
    contractNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    supplierName: {
      type: DataTypes.STRING,
      allowNull: true,
    },    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    reviewedById: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    approvedById: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    updatedById: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    }}, {
    tableName: 'ItemMasters',
    timestamps: true,
    underscored: false,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    hooks: {
      beforeCreate: (item) => {
        // Auto-generate stock code based on stockItem and plannedStock
        if (item.stockItem === 'Y') {
          if (item.plannedStock === 'Y') {
            item.stockCode = 'ST2';
          } else {
            item.stockCode = 'ST1';
          }
        } else {
          item.stockCode = 'NS3';
        }
      },
      beforeUpdate: (item) => {
        if (item.changed('stockItem') || item.changed('plannedStock')) {
          if (item.stockItem === 'Y') {
            if (item.plannedStock === 'Y') {
              item.stockCode = 'ST2';
            } else {
              item.stockCode = 'ST1';
            }
          } else {
            item.stockCode = 'NS3';
          }
        }
      }
    }
  });

  return ItemMaster;
};
