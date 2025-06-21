const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserUnspscFavorite = sequelize.define('UserUnspscFavorite', {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    unspscCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    level: {
      type: DataTypes.ENUM('SEGMENT', 'FAMILY', 'CLASS', 'COMMODITY'),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },    segment: {
      type: DataTypes.STRING,
      allowNull: true
    },
    segmentTitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    family: {
      type: DataTypes.STRING,
      allowNull: true
    },
    familyTitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    class: {
      type: DataTypes.STRING,
      allowNull: true
    },
    classTitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    commodity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    commodityTitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'user_unspsc_favorites',
    timestamps: true
  });

  return UserUnspscFavorite;
};
