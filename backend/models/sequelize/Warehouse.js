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

  const Warehouse = sequelize.define('Warehouse', {
    // Warehouse model definition
    // ...
  });

  return { StorageLocation, BinLocation, Warehouse };
};
