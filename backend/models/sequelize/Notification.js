const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    itemId: {  // Use actual database column name
      type: DataTypes.UUID,
      allowNull: true
    },
    itemNumber: {  // Use actual database column name
      type: DataTypes.STRING,
      allowNull: true
    },
    shortDescription: {  // Use actual database column name
      type: DataTypes.TEXT,
      allowNull: true
    },
    notificationType: {  // Use actual database column name
      type: DataTypes.STRING,
      allowNull: true
    },
    actionById: {  // Use actual database column name
      type: DataTypes.UUID,
      allowNull: true
    },
    actionAt: {  // Use actual database column name
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isRead: {  // Use actual database column name
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    originalItemData: {  // Use actual database column name
      type: DataTypes.JSONB, // Use JSONB type as in database
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }  }, {
    tableName: 'Notifications',
    timestamps: true
  });

  Notification.associate = (models) => {
    if (models.User) {
      Notification.belongsTo(models.User, {
        foreignKey: 'actionById',  // Use actual database column name
        as: 'actionBy'
      });
    }
  };

  return Notification;
};
