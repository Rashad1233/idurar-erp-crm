const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RejectionNotification = sequelize.define('RejectionNotification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    itemNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'itemNumber'
    },
    shortDescription: {
      type: DataTypes.TEXT,
      field: 'shortDescription'
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'rejectionReason'
    },
    rejectedById: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'rejectedById'
    },
    rejectedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'rejectedAt'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'isRead'
    }  }, {
    tableName: 'RejectionNotifications',
    timestamps: false // Disable timestamps since the database table doesn't have these columns
  });

  RejectionNotification.associate = (models) => {
    RejectionNotification.belongsTo(models.User, {
      foreignKey: 'rejectedById',
      as: 'rejectedBy'
    });
  };

  return RejectionNotification;
};
