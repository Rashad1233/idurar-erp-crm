const { Notification, User } = require('../models/sequelize');

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const notificationData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const notification = await Notification.create(notificationData);

    console.log(`📬 Notification created for user ${notification.userId}: ${notification.title}`);

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
};

// Get notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { onlyUnread = false, limit = 50 } = req.query;

    const whereClause = { userId };
    if (onlyUnread === 'true') {
      whereClause.isRead = false;
    }

    const notifications = await Notification.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      include: [
        {
          model: User,
          as: 'actionBy',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: notifications,
      message: `${notifications.length} notifications found`
    });

  } catch (error) {
    console.error('❌ Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification',
      error: error.message
    });
  }
};
