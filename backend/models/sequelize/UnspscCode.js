module.exports = (sequelize, DataTypes) => {
  const UnspscCode = sequelize.define('UnspscCode', {
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
    segment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    family: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    class: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    commodity: {
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
      allowNull: false,
    },    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  }, {
    tableName: 'UnspscCodes',
    timestamps: true,
    underscored: false,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        fields: ['code'],
        unique: true
      },
      {
        fields: ['segment']
      },
      {
        fields: ['family']
      },
      {
        fields: ['class']
      },
      {
        fields: ['commodity']
      }
    ]
  });

  return UnspscCode;
};
