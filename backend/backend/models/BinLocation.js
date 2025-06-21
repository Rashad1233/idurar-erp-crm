const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const BinLocation = sequelize.define('BinLocation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    binCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    storageLocationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'StorageLocations',
        key: 'id',
      },
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['binCode', 'storageLocationId'],
      },
    ],
  });

  return BinLocation;
};
