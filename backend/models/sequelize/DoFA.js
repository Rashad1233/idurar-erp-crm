const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DoFA = sequelize.define('DoFA', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    costCenterId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'CostCenters',
        key: 'id'
      }
    },
    itemCategoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'ItemCategories',
        key: 'id'
      }
    },
    approvalType: {
      type: DataTypes.ENUM('PR', 'PO', 'Item', 'Invoice'),
      allowNull: false
    },
    thresholdMin: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    thresholdMax: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    approvalOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Order in the approval chain, lower numbers are processed first'
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    effectiveFrom: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    effectiveTo: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'DoFAs',
    paranoid: true, // Enable soft deletes
    indexes: [
      {
        unique: false,
        fields: ['approvalType', 'userId', 'approvalOrder']
      },
      {
        unique: false,
        fields: ['isActive', 'effectiveFrom', 'effectiveTo']
      }
    ]
  });

  // Define associations
  DoFA.associate = (models) => {
    DoFA.belongsTo(models.User, { foreignKey: 'userId', as: 'approver' });
    if (models.CostCenter) {
      DoFA.belongsTo(models.CostCenter, { foreignKey: 'costCenterId', as: 'costCenter' });
    }
    if (models.ItemCategory) {
      DoFA.belongsTo(models.ItemCategory, { foreignKey: 'itemCategoryId', as: 'itemCategory' });
    }
  };

  return DoFA;
};
