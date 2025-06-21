module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');
  
  const UnspscCode = sequelize.define('UnspscCode', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(8),
      allowNull: false,
      unique: true,
      validate: {
        is: /^\d{8}$/
      }
    },
    segment: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    family: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    class: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    commodity: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    definition: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    level: {
      type: DataTypes.ENUM('SEGMENT', 'FAMILY', 'CLASS', 'COMMODITY'),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  }, {
    tableName: 'unspsc_codes',
    timestamps: true,
  });
  
  return UnspscCode;
};
