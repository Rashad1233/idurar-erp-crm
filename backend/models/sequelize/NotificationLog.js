// Database model for Notification Logs
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NotificationLog = sequelize.define('NotificationLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    entityType: {
      type: DataTypes.ENUM('rfq', 'purchase_order', 'contract', 'supplier'),
      allowNull: false,
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    recipientEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    notificationType: {
      type: DataTypes.ENUM('approval_request', 'reminder', 'status_update', 'invitation'),
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deliveryStatus: {
      type: DataTypes.ENUM('sent', 'failed', 'bounced', 'opened'),
      defaultValue: 'sent',
    },
    sentAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    openedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  return NotificationLog;
};