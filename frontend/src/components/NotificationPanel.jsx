import React, { useState, useEffect } from 'react';
import { notification, Badge, Dropdown, Menu, Button, Modal, Typography, Spin, Empty } from 'antd';
import { BellOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from '../api/axiosConfig';
import ItemEditFromNotificationModal from './ItemEditFromNotificationModal';

const { Text } = Typography;

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  // Load notifications
  const loadNotifications = async (onlyUnread = false, type = 'ALL') => {
    try {
      setLoading(true);
      const response = await axios.get('/item/notifications', {
        params: { 
          onlyUnread: onlyUnread.toString(),
          type: type
        }
      });
      
      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to load notifications'
      });
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/item/notifications/${notificationId}/read`);
      await loadNotifications();
      notification.success({
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to mark notification as read'
      });
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.put('/item/notifications/mark-all-read');
      await loadNotifications();
      notification.success({
        message: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to mark all notifications as read'
      });
    }
  };
  // Delete a single notification
  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/item/notifications/${notificationId}`);
      await loadNotifications();
      notification.success({
        message: 'Notification deleted'
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to delete notification'
      });
    }
  };

  // Show notification details
  const showNotificationDetails = (notif) => {
    setSelectedNotification(notif);
    setModalVisible(true);
    
    // Mark as read when viewing details
    if (!notif.isRead) {
      markAsRead(notif.id);
    }
  };

  // Open edit modal for notification
  const openEditModal = (notif) => {
    setSelectedNotification(notif);
    setEditModalVisible(true);
    setModalVisible(false); // Close details modal
  };

  // Handle successful item edit/creation
  const handleEditSuccess = (newItem) => {
    notification.success({
      message: 'Success',
      description: `Item recreated successfully: ${newItem.itemNumber}`,
      duration: 6
    });
    
    // Refresh notifications
    loadNotifications();
    setEditModalVisible(false);
    setSelectedNotification(null);
  };

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Notification dropdown menu
  const notificationMenu = (
    <Menu style={{ width: 320, maxHeight: 400, overflowY: 'auto' }}>      <Menu.Item key="header" disabled style={{ backgroundColor: '#f5f5f5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong>Notifications</Text>
          {unreadCount > 0 && (
            <Button 
              type="link" 
              size="small" 
              onClick={markAllAsRead}
              style={{ padding: 0 }}
            >
              Mark all read
            </Button>
          )}
        </div>
      </Menu.Item>      
      {loading ? (
        <Menu.Item key="loading" disabled>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="small" />
          </div>
        </Menu.Item>
      ) : notifications.length === 0 ? (
        <Menu.Item key="empty" disabled>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description="No notifications"
              style={{ margin: 0 }}
            />
          </div>
        </Menu.Item>
      ) : (        notifications.slice(0, 5).map((notif) => (          <Menu.Item 
            key={notif.id}
            style={{ 
              backgroundColor: notif.isRead ? 'transparent' : (notif.notificationType === 'APPROVAL' ? '#f6ffed' : '#fff2e8'),
              borderLeft: notif.isRead ? 'none' : (notif.notificationType === 'APPROVAL' ? '3px solid #52c41a' : '3px solid #ff7a00'),
              position: 'relative'
            }}
          >
            <div onClick={() => showNotificationDetails(notif)}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                <ExclamationCircleOutlined 
                  style={{ 
                    color: notif.notificationType === 'APPROVAL' ? '#52c41a' : '#ff4d4f', 
                    marginRight: 8 
                  }} 
                />
                <Text strong style={{ fontSize: '12px' }}>
                  Item {notif.notificationType === 'APPROVAL' ? 'Approved' : 'Rejected'}
                </Text>
                {!notif.isRead && (
                  <Badge dot style={{ marginLeft: 'auto' }} />
                )}
              </div>
              <Text style={{ fontSize: '11px', color: '#666' }}>
                {notif.itemNumber} - {notif.shortDescription}
              </Text>
              <br />
              <Text style={{ fontSize: '10px', color: '#999' }}>
                {new Date(notif.actionAt).toLocaleDateString()}
              </Text>
            </div>
            <Button
              size="small"
              type="text"
              danger
              onClick={(e) => {
                e.stopPropagation();
                deleteNotification(notif.id);
              }}
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                fontSize: '10px',
                height: '20px',
                width: '20px',
                padding: 0
              }}
            >
              ×
            </Button></Menu.Item>
        ))
      )}
      
      {notifications.length > 5 && (
        <Menu.Item key="view-all">
          <Button 
            type="link" 
            block 
            onClick={() => setModalVisible(true)}
            style={{ textAlign: 'center' }}
          >
            View all notifications
          </Button>
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <>      <Dropdown 
        dropdownRender={() => notificationMenu}
        trigger={['click']} 
        placement="bottomRight"
        onOpenChange={(open) => {
          if (open) {
            loadNotifications();
          }
        }}
      >
        <Badge count={unreadCount} size="small">
          <Button 
            type="text" 
            icon={<BellOutlined />} 
            style={{ 
              border: 'none',
              boxShadow: 'none',
              fontSize: '16px'
            }}
          />
        </Badge>
      </Dropdown>      {/* Notification Details Modal */}      <Modal
        title={selectedNotification?.notificationType === 'APPROVAL' ? 'Approval Details' : 'Rejection Details'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedNotification(null);
        }}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
          // Show "Duplicate & Edit" button only for rejections that allow editing
          ...(selectedNotification?.notificationType === 'REJECTION' && 
              selectedNotification?.originalItemData?.rejectionType === 'ALLOW_EDIT' ? [
            <Button 
              key="edit" 
              type="primary"
              onClick={() => openEditModal(selectedNotification)}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              📝 Duplicate & Edit
            </Button>
          ] : [])
        ]}
        width={600}
      >
        {selectedNotification ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Item Number: </Text>
              <Text>{selectedNotification.itemNumber}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Description: </Text>
              <Text>{selectedNotification.shortDescription}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>{selectedNotification.notificationType === 'APPROVAL' ? 'Approved' : 'Rejected'} Date: </Text>
              <Text>{new Date(selectedNotification.actionAt).toLocaleString()}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>{selectedNotification.notificationType === 'APPROVAL' ? 'Approved' : 'Rejected'} By: </Text>
              <Text>{selectedNotification.actionByName || 'System'}</Text>
            </div>
            {selectedNotification.notificationType === 'REJECTION' && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Rejection Type: </Text>
                  <Text style={{ 
                    color: selectedNotification.originalItemData?.rejectionType === 'ALLOW_EDIT' ? '#52c41a' : '#ff4d4f',
                    fontWeight: 'bold'
                  }}>
                    {selectedNotification.originalItemData?.rejectionType === 'ALLOW_EDIT' 
                      ? '✏️ Can be edited and resubmitted' 
                      : '🗑️ Permanently deleted'
                    }
                  </Text>
                </div>
              </>
            )}
            <div>
              <Text strong>{selectedNotification.notificationType === 'APPROVAL' ? 'Message' : 'Rejection Reason'}: </Text>
              <div style={{ 
                backgroundColor: selectedNotification.notificationType === 'APPROVAL' ? '#f6ffed' : '#fff2f0', 
                border: selectedNotification.notificationType === 'APPROVAL' ? '1px solid #b7eb8f' : '1px solid #ffccc7',
                borderRadius: '6px',
                padding: '12px',
                marginTop: '8px'
              }}>
                <Text>{selectedNotification.message}</Text>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin />
          </div>
        )}
      </Modal>

      {/* Edit Item Modal */}      <ItemEditFromNotificationModal
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedNotification(null);
        }}
        notification={selectedNotification}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default NotificationPanel;
