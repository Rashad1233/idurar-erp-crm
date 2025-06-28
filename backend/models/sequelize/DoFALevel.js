const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DoFALevel = sequelize.define('DoFALevel', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    minAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      allowNull: false,
    },
    maxAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    approverId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'DoFALevels',
    timestamps: true,
  });

  DoFALevel.associate = (models) => {
    DoFALevel.belongsTo(models.User, {
      foreignKey: 'approverId',
      as: 'approver',
    });
    
    DoFALevel.belongsTo(models.User, {
      foreignKey: 'createdById',
      as: 'createdBy',
    });
    
    DoFALevel.belongsTo(models.User, {
      foreignKey: 'updatedById',
      as: 'updatedBy',
    });

    DoFALevel.hasMany(models.DoFACostCenter, {
      foreignKey: 'dofaLevelId',
      as: 'costCenters',
    });
  };

  return DoFALevel;
};
