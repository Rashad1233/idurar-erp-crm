import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { 
  List, Button, Card, Typography, Space, Modal, Form, 
  Input, message, Popconfirm, Tooltip, Divider, Empty, Tag, Spin 
} from 'antd';
import { 
  StarOutlined, StarFilled, EditOutlined, DeleteOutlined, 
  PlusOutlined, ExclamationCircleOutlined, SaveOutlined
} from '@ant-design/icons';
import unspscFavoritesService from '@/services/unspscFavoritesService';
import './UnspscFavorites.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const UnspscFavorites = forwardRef((props, ref) => {
  const { onSelect } = props;
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentFavorite, setCurrentFavorite] = useState(null);
  const [form] = Form.useForm();
  // Expose the fetchFavorites method to parent components via ref
  useImperativeHandle(ref, () => ({
    fetchFavorites,
    refreshFavorites: () => fetchFavorites(true)
  }));
  // Fetch favorites on component mount
  useEffect(() => {
    fetchFavorites();
  }, []);

  // Debug: Log when favorites state changes
  useEffect(() => {
    console.log('Favorites state updated:', favorites.length, 'items');
  }, [favorites]);
  const fetchFavorites = async (forceRefresh = false) => {
    if (forceRefresh) {
      console.log('Force refreshing favorites list...');
    }
    setLoading(true);
    try {
      const response = await unspscFavoritesService.getFavorites();
      console.log('Favorites API response:', response);
      if (response.success) {
        const favoritesData = response.data || [];
        console.log('Setting favorites data:', favoritesData);
        setFavorites(favoritesData);
      } else {
        console.error('Failed to load favorites:', response.message);
        message.error('Failed to load favorites');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      message.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    form.resetFields();
    setCurrentFavorite(null);
    setEditMode(false);
    setModalVisible(true);
  };

  const showEditModal = (favorite) => {
    setCurrentFavorite(favorite);
    form.setFieldsValue({
      name: favorite.name,
      description: favorite.description,
      isDefault: favorite.isDefault
    });
    setEditMode(true);
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };
  const handleSubmit = async (values) => {
    try {
      if (editMode && currentFavorite) {
        // Update existing favorite
        const response = await unspscFavoritesService.updateFavorite(
          currentFavorite.id, 
          values
        );
          if (response.success) {
          message.success('Favorite updated successfully');
          await fetchFavorites(true);
          setModalVisible(false);
        } else {
          message.error(response.message || 'Failed to update favorite');
        }
      } else {
        // Need to get the UNSPSC code data from the parent
        message.info('Please select a UNSPSC code first to save as favorite');
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
      message.error(`Failed to update favorite: ${error.message || 'Unknown error'}`);
    }
  };
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await unspscFavoritesService.deleteFavorite(id);      if (response.success) {
        message.success('Favorite deleted successfully');
        await fetchFavorites(true);
      } else {
        message.error(response.message || 'Failed to delete favorite');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error deleting favorite:', error);
      message.error(`Failed to delete favorite: ${error.message || 'Unknown error'}`);
      setLoading(false);
    }
  };
  const handleSetDefault = async (favorite) => {
    try {
      setLoading(true);
      const response = await unspscFavoritesService.updateFavorite(
        favorite.id,
        { isDefault: true }
      );
        if (response.success) {
        message.success('Default favorite set successfully');
        await fetchFavorites(true);
      } else {
        message.error(response.message || 'Failed to set default favorite');
      }
    } catch (error) {
      console.error('Error setting default favorite:', error);
      message.error('Failed to set default favorite');
    } finally {
      setLoading(false);
    }
  };
  const handleSelectFavorite = (favorite) => {
    if (onSelect) {
      // Format the data for the parent component
      const selectedData = {
        code: favorite.unspscCode,
        title: favorite.title,
        level: favorite.level,
        // Include segment code and title
        segment: favorite.segment,
        segmentTitle: favorite.segmentTitle,
        // Include family code and title
        family: favorite.family,
        familyTitle: favorite.familyTitle,
        // Include class code and title
        class: favorite.class,
        classTitle: favorite.classTitle,
        // Include commodity code and title
        commodity: favorite.commodity,
        commodityTitle: favorite.commodityTitle,
        // Include the ID to help with UUID matching
        id: favorite.id
      };
      
      console.log('Selecting favorite with data:', selectedData);
      onSelect(selectedData);
      message.success(`Selected: ${favorite.name}`);
    }
  };

  const saveFavorite = async (unspscData) => {
    if (!unspscData) {
      message.error('No UNSPSC code selected');
      return;
    }
    
    form.resetFields();
    setModalVisible(true);
    
    // When the form is submitted, we'll merge this data with the form values
    setCurrentFavorite({
      unspscCode: unspscData.code,
      level: unspscData.level,
      title: unspscData.title,
      segment: unspscData.segment || '',
      family: unspscData.family || '',
      class: unspscData.class || '',
      commodity: unspscData.commodity || ''
    });
  };
  // Handle the form submission for a new favorite
  const handleSaveNew = async (values) => {
    if (!currentFavorite) {
      message.error('No UNSPSC code selected');
      return;
    }
    
    try {
      const favoriteData = {
        ...currentFavorite,
        name: values.name,
        description: values.description,
        isDefault: values.isDefault || false
      };
      
      const response = await unspscFavoritesService.saveFavorite(favoriteData);
      
      if (response.success) {
        message.success('Favorite saved successfully');
        fetchFavorites();
        setModalVisible(false);
      } else {
        message.error(response.message || 'Failed to save favorite');
      }
    } catch (error) {
      console.error('Error saving favorite:', error);
      message.error(`Failed to save favorite: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="unspsc-favorites-container">      <div className="favorites-header">
        <Title level={5}>My UNSPSC Favorites</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => message.info('To add a new favorite, search for a UNSPSC code in the AI Search tab and click the star icon')}
        >
          Add New
        </Button>
      </div>

      <Divider />
        {loading ? (
        <div className="favorites-spinner">
          <Spin size="large">
            <div style={{ minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Loading favorites...
            </div>
          </Spin>
        </div>
      ) : favorites.length === 0 ? (
        <Empty 
          description="No saved favorites yet" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      ) : (
        <List
          dataSource={favorites}
          renderItem={(favorite) => (
            <List.Item
              key={favorite.id}
              actions={[
                <Tooltip title="Use this code">
                  <Button 
                    type="text" 
                    icon={<SaveOutlined />} 
                    onClick={() => handleSelectFavorite(favorite)} 
                  />
                </Tooltip>,
                <Tooltip title={favorite.isDefault ? "Default favorite" : "Set as default"}>
                  <Button 
                    type="text" 
                    icon={favorite.isDefault ? <StarFilled /> : <StarOutlined />} 
                    onClick={() => handleSetDefault(favorite)}
                  />
                </Tooltip>,
                <Tooltip title="Edit">
                  <Button 
                    type="text" 
                    icon={<EditOutlined />} 
                    onClick={() => showEditModal(favorite)} 
                  />
                </Tooltip>,
                <Tooltip title="Delete">
                  <Popconfirm
                    title="Delete this favorite?"
                    description="This action cannot be undone."
                    onConfirm={() => handleDelete(favorite.id)}
                    okText="Yes"
                    cancelText="No"
                    icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                  >
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                    />
                  </Popconfirm>
                </Tooltip>
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong>{favorite.name}</Text>
                    {favorite.isDefault && <Tag color="gold">Default</Tag>}
                  </Space>
                }                description={
                  <div>
                    <Paragraph type="secondary">
                      {favorite.description || 'No description'}
                    </Paragraph>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space>
                        <Tag color="blue">{favorite.unspscCode}</Tag>
                        <Tag color="green">{favorite.level}</Tag>
                        <Text>{favorite.title}</Text>
                      </Space>                      <div style={{ marginTop: '8px' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          <strong>Classification Path:</strong>
                        </Text>
                        <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
                          {favorite.segmentTitle || favorite.familyTitle || favorite.classTitle || favorite.commodityTitle ? (
                            <>
                              {favorite.segmentTitle && (
                                <span>
                                  <strong>Segment:</strong> {favorite.segment?.substring(0, 2)} ({favorite.segmentTitle})
                                </span>
                              )}
                              {favorite.familyTitle && (
                                <>
                                  {favorite.segmentTitle && ' > '}
                                  <strong>Family:</strong> {favorite.family?.substring(2, 4)} ({favorite.familyTitle})
                                </>
                              )}
                              {favorite.classTitle && (
                                <>
                                  {(favorite.segmentTitle || favorite.familyTitle) && ' > '}
                                  <strong>Class:</strong> {favorite.class?.substring(4, 6)} ({favorite.classTitle})
                                </>
                              )}
                              {favorite.commodityTitle && (
                                <>
                                  {(favorite.segmentTitle || favorite.familyTitle || favorite.classTitle) && ' > '}
                                  <strong>Commodity:</strong> {favorite.commodity?.substring(6, 8)} ({favorite.commodityTitle})
                                </>
                              )}
                            </>
                          ) : (
                            <span style={{ fontStyle: 'italic' }}>
                              Classification details not available
                            </span>
                          )}
                        </div>
                      </div>
                    </Space>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}

      <Modal
        title={editMode ? "Edit Favorite" : "Save New Favorite"}
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editMode ? handleSubmit : handleSaveNew}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter a name for this favorite' }]}
          >
            <Input placeholder="E.g., Common Office Supplies" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description (Optional)"
          >
            <TextArea 
              rows={3} 
              placeholder="Add any notes or details about this UNSPSC code"
            />
          </Form.Item>
          
          <Form.Item
            name="isDefault"
            valuePropName="checked"
          >
            <Input 
              type="checkbox" 
              style={{ width: 'auto' }} 
            /> Set as default favorite
          </Form.Item>
          
          <Form.Item>
            <Space style={{ float: 'right' }}>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editMode ? 'Update' : 'Save'}
              </Button>
            </Space>
          </Form.Item>
        </Form>      </Modal>
    </div>
  );
});

export default UnspscFavorites;
