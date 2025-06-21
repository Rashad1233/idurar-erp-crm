const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const StorageLocation = sequelize.define('StorageLocation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    street: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    city: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    postalCode: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    country: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
  });

  return StorageLocation;
};
