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
  const loadNotifications = async (onlyUnread = false) => {
    try {
      setLoading(true);
      const response = await axios.get('/item/notifications', {
        params: { onlyUnread: onlyUnread.toString() }
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
    <Menu style={{ width: 320, maxHeight: 400, overflowY: 'auto' }}>
      <Menu.Item key="header" disabled style={{ backgroundColor: '#f5f5f5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong>Rejection Notifications</Text>
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
      ) : (
        notifications.slice(0, 5).map((notif) => (
          <Menu.Item 
            key={notif.id}
            onClick={() => showNotificationDetails(notif)}
            style={{ 
              backgroundColor: notif.isRead ? 'transparent' : '#fff2e8',
              borderLeft: notif.isRead ? 'none' : '3px solid #ff7a00'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                <ExclamationCircleOutlined 
                  style={{ color: '#ff4d4f', marginRight: 8 }} 
                />
                <Text strong style={{ fontSize: '12px' }}>
                  Item Rejected
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
                {new Date(notif.rejectedAt).toLocaleDateString()}
              </Text>
            </div>
          </Menu.Item>
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
      </Dropdown>

      {/* Notification Details Modal */}      <Modal
        title="Rejection Details"
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
          ...(selectedNotification?.rejectionType === 'ALLOW_EDIT' ? [
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
              <Text strong>Rejected Date: </Text>
              <Text>{new Date(selectedNotification.rejectedAt).toLocaleString()}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Rejected By: </Text>
              <Text>{selectedNotification.rejectedByName || 'System'}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Rejection Type: </Text>
              <Text style={{ 
                color: selectedNotification.rejectionType === 'ALLOW_EDIT' ? '#52c41a' : '#ff4d4f',
                fontWeight: 'bold'
              }}>
                {selectedNotification.rejectionType === 'ALLOW_EDIT' 
                  ? '✏️ Can be edited and resubmitted' 
                  : '🗑️ Permanently deleted'
                }
              </Text>
            </div>
            <div>
              <Text strong>Rejection Reason: </Text>
              <div style={{ 
                backgroundColor: '#fff2f0', 
                border: '1px solid #ffccc7',
                borderRadius: '6px',
                padding: '12px',
                marginTop: '8px'
              }}>
                <Text>{selectedNotification.rejectionReason}</Text>
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
