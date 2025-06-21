import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Input, Space, Modal, message, Typography, App } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { ErpLayout } from '@/layout';
import SimpleTable from '@/components/SimpleTable';
import useApiData from '@/hooks/useApiData';
import useLanguage from '@/locale/useLanguage';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import EditSupplier from '@/components/EditSupplier';

const { Title, Text } = Typography;

function SimpleCrudModule({ 
  entity, 
  originalEntity, // Used for navigation but not for data fetching
  dataTableColumns, 
  entityDisplayLabels = [],
  searchConfig = {
    displayLabels: [],
    searchFields: '',
    outputValue: '_id',
  },
  extraButtons = []
}) {
  const { message, modal, notification } = App.useApp(); // Use the App context for all Ant Design components
  const translate = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshToggle, setRefreshToggle] = useState(false);
  const { data: items, loading: isLoading, error } = useApiData(`/${entity}`, refreshToggle);
  
  const refreshTable = () => {
    setRefreshToggle(!refreshToggle);
  };
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const filteredItems = searchQuery && items
    ? items.filter((item) => {
        // Split search fields and check each one
        const searchFields = searchConfig.searchFields.split(',');
        return searchFields.some(field => {
          if (item[field]) {
            return item[field].toString().toLowerCase().includes(searchQuery.toLowerCase());
          }
          return false;
        });
      })
    : items || [];
    
  // Handle deleting an item
  const handleDelete = async (recordId) => {
    try {
      if (!recordId) {
        message.error(translate('Invalid ID: Cannot delete this item'));
        return;
      }
      
      // Normalize API URL to prevent double slashes
      const normalizedBase = API_BASE_URL.replace(/\/+$/, '');
      const normalizedEntity = entity.replace(/^\/+/, '');
      
      // Determine the correct endpoint - for warehouse items, we need to use originalEntity instead
      let url;
      if (originalEntity && (entity === 'simple-storage-locations' || entity === 'simple-bin-locations')) {
        // Use originalEntity for warehouse items
        const normalizedOriginalEntity = originalEntity.replace(/^\/+/, '');
        url = `${normalizedBase}/${normalizedOriginalEntity}/${recordId}`;
      } else {
        // Use entity for regular items
        url = `${normalizedBase}/${normalizedEntity}/${recordId}`;
      }
      
      console.log('Deleting item with URL:', url);
      
      const response = await axios.delete(url);
      if (response.data && response.data.success) {
        message.success(translate('Item deleted successfully'));
        refreshTable();
      } else {
        throw new Error(response.data?.message || 'Delete operation failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      message.error(translate('Error deleting item: ') + (error.response?.data?.message || error.message));
    }
  };

  const showDeleteConfirm = (recordId, name) => {
    if (!recordId) {
      message.error(translate('Invalid ID: Cannot delete this item'));
      return;
    }
    
    modal.confirm({
      title: translate('Are you sure you want to delete this item?'),
      icon: <ExclamationCircleOutlined />,
      content: name ? `${name}` : translate('This action cannot be undone'),
      okText: translate('Yes'),
      okType: 'danger',
      cancelText: translate('No'),
      onOk() {
        handleDelete(recordId);
      },
    });
  };

  // Add actions column and link to the first column
  const columnsWithLinks = [...dataTableColumns];
    // Add link to first column
  if (columnsWithLinks.length > 0) {
    columnsWithLinks[0] = {
      ...columnsWithLinks[0],
      render: (text, record) => {
        try {
          const id = record._id || record.id;
          if (!id) return text || '-';
          
          // Use originalEntity for navigation if provided
          const navigationEntity = originalEntity || entity;
            // Special case for warehouse entities
          let viewPath = `/${entity}/read/${id}`;
          
          // Handle different routing patterns for warehouse entities
          if (navigationEntity === 'warehouse/storage-location' || entity === 'simple-storage-locations') {
            viewPath = `/warehouse/location/read/${id}`;
          } else if (navigationEntity === 'warehouse/bin-location' || entity === 'simple-bin-locations') {
            viewPath = `/warehouse/bin/read/${id}`;
          } else if (navigationEntity === 'item') {
            // Special case for item master
            viewPath = `/item-master/read/${id}`;
          }
          
          return <Link to={viewPath}>{text || '-'}</Link>;
        } catch (error) {
          console.error('Error rendering link cell:', error);
          return text || '-';
        }
      }
    };
  }
    // Add actions column
  columnsWithLinks.push({
    title: translate('Actions'),
    key: 'actions',
    render: (_, record) => {
      try {
        // For supplier entities, use the EditSupplier component
        if (entity === 'supplier') {
          return <EditSupplier supplier={record} onSuccess={refreshTable} />;
        }
        
        // For other entities, use the default actions
        const id = record._id || record.id;
        if (!id) {
          return <Text type="danger">No ID</Text>;
        }
          // Use originalEntity for navigation if provided
        const navigationEntity = originalEntity || entity;
        
        // Special case for warehouse entities to match frontend route structure
        let viewPath = `/${navigationEntity}/read/${id}`;
        let editPath = `/${navigationEntity}/update/${id}`;
      
      if (navigationEntity === 'warehouse/storage-location') {
        viewPath = `/warehouse/location/read/${id}`;
        editPath = `/warehouse/location/edit/${id}`;
      } else if (navigationEntity === 'warehouse/bin-location') {
        viewPath = `/warehouse/bin/read/${id}`;
        editPath = `/warehouse/bin/edit/${id}`;
      } else if (navigationEntity === 'item') {
        // Special case for item master
        viewPath = `/item-master/read/${id}`;
        editPath = `/item-master/update/${id}`;
      }
      
      return (
        <Space>
          <Button            type="primary" 
            size="small" 
            onClick={() => navigate(viewPath)}
          >
            {translate('View')}
          </Button>
          <Button 
            size="small" 
            onClick={() => navigate(editPath)}
          >
            {translate('Edit')}
          </Button>
          <Button 
            danger 
            size="small" 
            onClick={() => {
              const displayName = entityDisplayLabels.map(label => record[label]).filter(Boolean).join(' - ');
              showDeleteConfirm(id, displayName);
            }}
          >
            {translate('Delete')}
          </Button>
        </Space>
      );
      } catch (error) {
        console.error('Error rendering actions:', error);
        return <Text type="danger">Error</Text>;
      }
    }
  });
  
  // Check if this is the item master module
  const isItemMaster = entity === 'item';
  
  return (
    <App>
      <ErpLayout>
        <div className={`${isItemMaster ? 'item-master-container' : ''}`}>
          <div className="action-panel">
            <div className="title-action-panel">
              <Title level={3}>{translate(entity)}</Title>
              <Text type="secondary">{translate(`Manage ${entity} records`)}</Text>
            </div>          <div className="action-buttons">
            <Space>              <Button
                type="primary"
                icon={<PlusOutlined />}                onClick={() => {
                  // Use originalEntity for navigation if provided
                  const navigationEntity = originalEntity || entity;
                  
                  // Special case for ItemMaster to use fixed form
                  if (navigationEntity === 'item') {
                    navigate('/item/create-new-item-master');
                  }
                  // Special case for warehouse entities to match route structure
                  else if (navigationEntity === 'warehouse/storage-location') {
                    navigate('/warehouse/location/create');
                  } else if (navigationEntity === 'warehouse/bin-location') {
                    navigate('/warehouse/bin/create');
                  } else {
                    navigate(`/${navigationEntity}/create`);
                  }
                }}
              >
                {translate('Create New')}
              </Button>
              {extraButtons.map((button, index) => (
                React.cloneElement(button, { key: `extra-button-${index}` })
              ))}
              <Button
                onClick={refreshTable}
                icon={<SearchOutlined />}
              >
                {translate('Refresh')}
              </Button>
            </Space>
          </div>
        </div>
        
        {error && (
          <div style={{ marginBottom: 16 }}>
            <Text type="danger">{translate('Error loading data')}: {error.message}</Text>
          </div>
        )}          <div className={`table-responsive wide-table ${isItemMaster ? 'item-master-table' : ''}`}>
          <div className="search-container">
            <Input
              prefix={<SearchOutlined />}
              placeholder={translate("Search")}
              value={searchQuery}
              onChange={handleSearch}
              style={{ width: 250, marginBottom: 16 }}
            />
          </div>
          <SimpleTable
            columns={columnsWithLinks}
            dataSource={filteredItems}
            isLoading={isLoading}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              pageSize: 10
            }}
            rowKey={(record) => record._id || record.id || Math.random().toString()}
          />
        </div>
      </div>
    </ErpLayout>
    </App>
  );
}

export default SimpleCrudModule;
