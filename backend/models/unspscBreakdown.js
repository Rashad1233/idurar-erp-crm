const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UnspscBreakdown = sequelize.define('UnspscBreakdown', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    unspscCode: {
      type: DataTypes.STRING(8),
      allowNull: false,
      unique: true,
      validate: {
        len: [8, 8],
        isNumeric: true
      }
    },
    segmentCode: {
      type: DataTypes.STRING(2),
      allowNull: false
    },
    segmentName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    familyCode: {
      type: DataTypes.STRING(2),
      allowNull: false
    },
    familyName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    commodityCode: {
      type: DataTypes.STRING(2),
      allowNull: false
    },
    commodityName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    businessFunctionCode: {
      type: DataTypes.STRING(2),
      allowNull: false
    },
    businessFunctionName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    isValid: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    fullAnalysis: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    formattedDisplay: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    aiModel: {
      type: DataTypes.STRING(50),
      allowNull: true
    }  }, {
    tableName: 'UnspscBreakdowns',
    freezeTableName: true,
    underscored: false,
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        fields: ['unspscCode']
      },
      {
        fields: ['segmentCode']
      },
      {
        fields: ['isValid']
      }
    ]
  });

  return UnspscBreakdown;
};
