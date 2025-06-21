// UserUnspscHierarchy model to store user-specific UNSPSC hierarchical selections
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserUnspscHierarchy = sequelize.define('UserUnspscHierarchy', {
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
    },
    segment: {
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
    useFrequency: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    lastUsed: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'user_unspsc_hierarchy',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'unspscCode']
      }
    ]
  });

  return UserUnspscHierarchy;
};
