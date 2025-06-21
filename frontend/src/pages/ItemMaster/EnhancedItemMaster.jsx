import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Input, 
  Button, 
  Card, 
  Space, 
  Tag, 
  Tooltip, 
  Modal, 
  Typography, 
  Row, 
  Col, 
  Descriptions, 
  Spin,
  message,
  Dropdown,
  Menu
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EyeOutlined, 
  EditOutlined, 
  MoreOutlined,
  ToolOutlined,
  BarcodeOutlined,
  TagsOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ErpLayout } from '@/layout';
import useLanguage from '@/locale/useLanguage';
import apiClient from '@/api/axiosConfig';

const { Search } = Input;
const { Title, Text } = Typography;

export default function EnhancedItemMaster() {
  const translate = useLanguage();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchMode, setSearchMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [unspscModalVisible, setUnspscModalVisible] = useState(false);
  const [unspscBreakdown, setUnspscBreakdown] = useState(null);
  const [loadingUnspsc, setLoadingUnspsc] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });

  // Add responsive table styles
  const tableStyles = `
    .item-master-table-container {
      max-width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
    }
    
    .responsive-item-table .ant-table {
      font-size: 13px;
    }
    
    .responsive-item-table .ant-table-tbody > tr > td {
      padding: 8px 12px;
      white-space: nowrap;
    }
    
    .responsive-item-table .ant-table-thead > tr > th {
      padding: 12px 12px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .responsive-item-table .ant-tag {
      margin: 0;
      font-size: 10px;
      line-height: 18px;
    }
    
    .responsive-item-table .ant-btn-sm {
      height: 24px;
      padding: 0 7px;
      font-size: 11px;
    }
    
    @media (max-width: 1200px) {
      .responsive-item-table .ant-table-tbody > tr > td {
        padding: 6px 8px;
      }
      .responsive-item-table .ant-table-thead > tr > th {
        padding: 10px 8px;
      }
    }
  `;

  // Inject styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = tableStyles;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Load all items on component mount
  useEffect(() => {
    loadItems();
  }, [pagination.current, pagination.pageSize]);
  const loadItems = async () => {
    setLoading(true);
    try {
      console.log('Loading items from /api/item endpoint...');
      const response = await apiClient.get('/item', {
        params: {
          page: pagination.current,
          items: pagination.pageSize
        }
      });
      
      console.log('API Response:', response.data);
      
      if (response.data.success && response.data.data) {
        const items = response.data.data || [];
        console.log(`✅ Loaded ${items.length} items successfully`);
        setItems(items);
        setPagination(prev => ({
          ...prev,
          total: response.data.count || items.length
        }));
      } else {
        console.warn('No items found or invalid response structure');
        setItems([]);
        setPagination(prev => ({
          ...prev,
          total: 0
        }));
      }
    } catch (error) {
      console.error('Error loading items:', error);
      message.error(`Failed to load items: ${error.response?.data?.message || error.message}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced search function
  const handleSearch = async (value) => {
    if (!value || value.trim().length < 1) {
      setSearchMode(false);
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setSearchMode(true);
    
    try {      // Determine search type based on input pattern
      const searchType = getSearchType(value);
      
      console.log(`Searching for "${value}" with type: ${searchType}`);
      const response = await apiClient.get('/item/search', {
        params: {
          searchTerm: value.trim(),
          searchType: searchType,
          limit: 50
        }
      });
      
      console.log('Search API Response:', response.data);
      
      if (response.data.success) {
        const results = response.data.result || [];
        setSearchResults(results);
        
        if (results.length === 0) {
          message.info(`No items found matching "${value}"`);
        } else if (searchType === 'number' && results.length === 1) {
          // Auto-show details for unique item number search
          setSelectedItem(results[0]);
          setDetailModalVisible(true);
        } else {
          message.success(`Found ${results.length} item(s) matching "${value}"`);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      message.error('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Determine search type based on input pattern
  const getSearchType = (value) => {
    // Check if it's a number (item number)
    if (/^\d+$/.test(value)) {
      return 'number';
    }
    
    // Check if it contains alphanumeric pattern (part number)
    if (/^[A-Z0-9\-]+$/i.test(value) && value.length > 3) {
      return 'partNumber';
    }
    
    // Default to description search
    return 'description';
  };

  // Generate item number for new items
  const generateInterimNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `TEMP-${timestamp}-${random}`;
  };
  // Show item details modal
  const showItemDetails = (item) => {
    setSelectedItem(item);
    setDetailModalVisible(true);
  };

  // Handle submit for review
  const handleSubmitForReview = async (item) => {
    try {
      const response = await apiClient.put(`/item/${item.id}`, {
        status: 'PENDING_REVIEW'
      });
      
      if (response.data.success) {
        message.success(`Item ${item.itemNumber} has been submitted for review! 📤`);
        // Reload items to show updated status
        if (searchMode) {
          handleSearch(document.querySelector('.ant-input').value);
        } else {
          loadItems();
        }
      }
    } catch (error) {
      console.error('Error submitting for review:', error);
      message.error('Failed to submit item for review. Please try again.');
    }
  };

  // Handle UNSPSC code click to show breakdown
  const handleUnspscClick = async (unspscCode) => {
    if (!unspscCode) return;
    
    setLoadingUnspsc(true);
    setUnspscModalVisible(true);
    
    try {
      const response = await apiClient.post('/ai/analyze-unspsc', {
        unspscCode: unspscCode
      });
        if (response.data.success) {
        setUnspscBreakdown(response.data.data);
      } else {
        message.error('Failed to analyze UNSPSC code');
        setUnspscBreakdown(null);
      }
    } catch (error) {
      console.error('Error analyzing UNSPSC:', error);
      message.error('Failed to analyze UNSPSC code');
      setUnspscBreakdown(null);
    } finally {
      setLoadingUnspsc(false);
    }
  };
  // Handle dropdown menu actions for approved items
  const handleMenuAction = (key, record) => {
    switch (key) {
      case 'duplicate':
        handleDuplicateItem(record);
        break;
      case 'history':
        handleViewHistory(record);
        break;
      case 'stock-levels':
        handleSetStockLevels(record);
        break;
      case 'add-contract':
        handleAddToContract(record);
        break;
      case 'create-inventory':
        handleCreateInventory(record);
        break;
      case 'view-inventory':
        handleViewInventory(record);
        break;
      default:
        console.log('Unknown menu action:', key);
    }
  };

  // Handle duplicate item
  const handleDuplicateItem = (record) => {
    // Navigate to create page with pre-filled data
    navigate('/item-master/create', { 
      state: { 
        duplicateFrom: record,
        mode: 'duplicate'
      }
    });
  };

  // Handle view history
  const handleViewHistory = (record) => {
    message.info(`View history for item: ${record.itemNumber}`);
    // TODO: Implement history modal
  };
  // Handle set stock levels (for ST2 items)
  const handleSetStockLevels = (record) => {
    // Validate item status
    if (record.status !== 'APPROVED') {
      Modal.warning({
        title: 'Item Not Approved',
        content: (
          <div>
            <p>Only approved items can have min/max levels configured.</p>
            <div style={{ marginTop: 8, padding: 8, backgroundColor: '#fff7e6', borderRadius: 4 }}>
              <Text strong>Current Status: </Text>
              <Tag color={record.status === 'PENDING_REVIEW' ? 'processing' : 'default'}>
                {record.status}
              </Tag>
              <br />
              <Text strong>Required Status: </Text>
              <Tag color="success">APPROVED</Tag>
            </div>
          </div>
        ),
      });
      return;
    }

    // Validate planned stock configuration
    if (record.plannedStock !== 'Y') {
      Modal.warning({
        title: 'Invalid Stock Configuration',
        content: (
          <div>
            <p>Only planned stock items (ST2) can have min/max levels configured.</p>
            <div style={{ marginTop: 8, padding: 8, backgroundColor: '#fff7e6', borderRadius: 4 }}>
              <Text strong>Current Stock Type: </Text>
              <Tag color={record.stockItem === 'Y' ? 'orange' : 'default'}>
                {record.plannedStock === 'Y' ? 'ST2 - Planned Stock' : 
                 record.stockItem === 'Y' ? 'ST1 - Stock Item' : 'NS3 - Non-Stock'}
              </Tag>
              <br />
              <Text strong>Required Stock Type: </Text>
              <Tag color="green">ST2 - Planned Stock</Tag>
            </div>
            <p style={{ marginTop: 8 }}>
              To enable min/max levels, edit this item and set "Planned Stock" to "Yes".
            </p>
          </div>
        ),
      });
      return;
    }
    
    // Navigate to inventory management
    navigate(`/inventory/stock-levels/${record.id}`, {
      state: { item: record }
    });
  };
  // Handle add to contract
  const handleAddToContract = (record) => {
    // Validate item status
    if (record.status !== 'APPROVED') {
      Modal.warning({
        title: 'Item Not Approved',
        content: (
          <div>
            <p>Only approved items can be added to contracts.</p>
            <div style={{ marginTop: 8, padding: 8, backgroundColor: '#fff7e6', borderRadius: 4 }}>
              <Text strong>Current Status: </Text>
              <Tag color={record.status === 'PENDING_REVIEW' ? 'processing' : 'default'}>
                {record.status}
              </Tag>
              <br />
              <Text strong>Required Status: </Text>
              <Tag color="success">APPROVED</Tag>
            </div>
            <p style={{ marginTop: 8 }}>
              Please wait for item approval before adding to contracts.
            </p>
          </div>
        ),
      });
      return;
    }
    
    // Navigate to contract management
    navigate(`/contracts/add-item/${record.id}`, {
      state: { item: record }
    });
  };
  // Handle create inventory record
  const handleCreateInventory = (record) => {
    // Validate item status
    if (record.status !== 'APPROVED') {
      Modal.warning({
        title: 'Item Not Approved',
        content: (
          <div>
            <p>Only approved items can be added to inventory.</p>
            <div style={{ marginTop: 8, padding: 8, backgroundColor: '#fff7e6', borderRadius: 4 }}>
              <Text strong>Current Status: </Text>
              <Tag color={record.status === 'PENDING_REVIEW' ? 'processing' : 'default'}>
                {record.status}
              </Tag>
              <br />
              <Text strong>Required Status: </Text>
              <Tag color="success">APPROVED</Tag>
            </div>
            <p style={{ marginTop: 8 }}>
              Please wait for item approval before adding to inventory.
            </p>
          </div>
        ),
      });
      return;
    }
    
    // Navigate to inventory creation
    navigate(`/inventory/create`, {
      state: { 
        itemMaster: record,
        mode: 'from-item-master'
      }
    });
  };

  // Handle view inventory status
  const handleViewInventory = (record) => {
    // Navigate to inventory view
    navigate(`/inventory/view/${record.id}`, {
      state: { item: record }
    });
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Item Number',
      dataIndex: 'itemNumber',
      key: 'itemNumber',
      width: 140,
      minWidth: 120,
      fixed: 'left',
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => showItemDetails(record)}
          style={{ padding: 0, fontFamily: 'monospace', fontWeight: 'bold', fontSize: '12px' }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'shortDescription',
      key: 'description',
      width: 280,
      minWidth: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text, record) => (
        <Tooltip title={record.longDescription || text}>
          <div>
            <div style={{ fontWeight: '500', fontSize: '13px' }}>{text}</div>
            {record.standardDescription && (
              <div style={{ fontSize: '11px', color: '#666', marginTop: 2 }}>
                {record.standardDescription}
              </div>
            )}
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Manufacturer',
      key: 'manufacturer',
      width: 180,
      minWidth: 150,
      ellipsis: true,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: '500', fontSize: '12px' }}>{record.manufacturerName || '-'}</div>
          {record.manufacturerPartNumber && (
            <div style={{ fontSize: '11px', color: '#666', fontFamily: 'monospace' }}>
              {record.manufacturerPartNumber}
            </div>
          )}
        </div>
      ),
    },    {
      title: 'Category',
      key: 'category',
      width: 140,
      minWidth: 120,
      ellipsis: true,
      render: (_, record) => (
        <div>
          <Tag color="blue" style={{ fontSize: '11px' }}>{record.equipmentCategory || 'N/A'}</Tag>
          {record.equipmentSubCategory && (
            <div style={{ fontSize: '10px', marginTop: 2 }}>
              {record.equipmentSubCategory}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'UNSPSC Code',
      key: 'unspscCode',
      width: 120,
      minWidth: 100,
      render: (_, record) => {
        if (!record.unspscCode) return <span style={{ color: '#ccc' }}>-</span>;
        
        return (
          <div>
            <Button
              type="link"
              size="small"
              onClick={() => handleUnspscClick(record.unspscCode)}
              style={{ 
                padding: 0, 
                fontFamily: 'monospace', 
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#1890ff'
              }}
            >
              {record.unspscCode}
            </Button>
            {record.unspscDescription && (
              <div style={{ 
                fontSize: '9px', 
                color: '#666', 
                marginTop: 1,
                maxWidth: '100px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {record.unspscDescription}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'UOM',
      dataIndex: 'uom',
      key: 'uom',
      width: 60,
      minWidth: 50,
      align: 'center',
      render: (text) => <Tag style={{ fontSize: '10px' }}>{text || 'EA'}</Tag>,
    },    {
      title: 'Stock Status',
      key: 'stockStatus',
      width: 130,
      minWidth: 110,
      render: (_, record) => {
        const getStockInfo = () => {
          if (record.plannedStock === 'Y') {
            return {
              code: 'ST2',
              label: 'Planned Stock',
              color: 'green',
              icon: '📊',
              description: 'Requires min/max stock levels'
            };
          } else if (record.stockItem === 'Y') {
            return {
              code: 'ST1',
              label: 'Stock Item',
              color: 'orange',
              icon: '📦',
              description: 'Keep stock for critical needs'
            };
          } else {
            return {
              code: 'NS3',
              label: 'Non-Stock',
              color: 'default',
              icon: '🔄',
              description: 'Direct orders without stock'
            };
          }
        };
        
        const stockInfo = getStockInfo();
        return (
          <Tooltip title={`${stockInfo.icon} ${stockInfo.description}`}>
            <div>
              <Tag color={stockInfo.color} style={{ fontSize: '10px', marginBottom: '2px' }}>
                {stockInfo.code}
              </Tag>
              <div style={{ fontSize: '9px', color: '#666' }}>
                {stockInfo.label}
              </div>
            </div>
          </Tooltip>
        );
      },
    },{
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      minWidth: 120,
      render: (status, record) => {
        const getStatusInfo = () => {
          switch(status) {
            case 'DRAFT':
              return {
                color: 'default',
                text: 'DRAFT',
                icon: '📝',
                description: 'New item with interim number'
              };
            case 'PENDING_REVIEW':
              return {
                color: 'processing',
                text: 'PENDING',
                icon: '⏳',
                description: 'Sent for quality review'
              };
            case 'APPROVED':
              return {
                color: 'success',
                text: 'APPROVED',
                icon: '✅',
                description: 'Final number assigned'
              };
            case 'REJECTED':
              return {
                color: 'error',
                text: 'REJECTED',
                icon: '❌',
                description: 'Needs revision'
              };
            default:
              return {
                color: 'default',
                text: status,
                icon: '❓',
                description: 'Unknown status'
              };
          }
        };
        
        const statusInfo = getStatusInfo();
        return (
          <Tooltip title={`${statusInfo.icon} ${statusInfo.description}`}>
            <div>
              <Tag color={statusInfo.color} style={{ fontSize: '10px', marginBottom: '2px' }}>
                {statusInfo.icon} {statusInfo.text}
              </Tag>
              {record.itemNumber && record.itemNumber.startsWith('TEMP-') && (
                <div style={{ fontSize: '9px', color: '#ff9c6e' }}>
                  Interim Number
                </div>
              )}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Criticality',
      dataIndex: 'criticality',
      key: 'criticality',
      width: 90,
      minWidth: 80,
      render: (criticality) => {
        const colors = {
          'HIGH': 'red',
          'MEDIUM': 'orange',
          'LOW': 'blue',
          'NO': 'default'
        };
        return <Tag color={colors[criticality] || 'default'} style={{ fontSize: '10px' }}>{criticality}</Tag>;
      },
    },    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 140,
      minWidth: 120,
      render: (_, record) => {
        const getWorkflowActions = () => {
          const baseActions = [
            <Tooltip title="View Details" key="view">
              <Button
                type="text"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => showItemDetails(record)}
              />
            </Tooltip>
          ];

          // Add status-specific actions
          if (record.status === 'DRAFT') {
            baseActions.push(
              <Tooltip title="Edit Draft" key="edit">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => navigate(`/item-master/update/${record.id}`)}
                />
              </Tooltip>,
              <Tooltip title="Submit for Review" key="submit">
                <Button
                  type="text"
                  icon={<span style={{ color: '#52c41a' }}>📤</span>}
                  size="small"
                  onClick={() => handleSubmitForReview(record)}
                />
              </Tooltip>
            );
          } else if (record.status === 'PENDING_REVIEW') {
            baseActions.push(
              <Tooltip title="Under Review" key="review">
                <Button
                  type="text"
                  icon={<span style={{ color: '#1890ff' }}>⏳</span>}
                  size="small"
                  disabled
                />
              </Tooltip>
            );
          } else if (record.status === 'APPROVED') {
            baseActions.push(
              <Tooltip title="Edit Approved Item" key="edit">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => navigate(`/item-master/update/${record.id}`)}
                />
              </Tooltip>
            );
          }

          return baseActions;
        };

        return (
          <Space size="small">
            {getWorkflowActions()}            <Dropdown
              overlay={
                <Menu onClick={({ key }) => handleMenuAction(key, record)}>
                  <Menu.Item key="duplicate">
                    <ToolOutlined /> Duplicate Item
                  </Menu.Item>
                  <Menu.Item key="history">
                    <BarcodeOutlined /> View History
                  </Menu.Item>
                  
                  {record.status === 'APPROVED' && (
                    <Menu.Divider />
                  )}
                  
                  {/* Inventory Actions - Only for Approved Items */}
                  {record.status === 'APPROVED' && (
                    <Menu.Item key="create-inventory">
                      <span style={{ color: '#52c41a' }}>📦</span> Create Inventory Record
                    </Menu.Item>
                  )}
                  
                  {/* Min/Max Levels - Only for Approved ST2 Items */}
                  {record.status === 'APPROVED' && record.plannedStock === 'Y' && (
                    <Menu.Item key="stock-levels">
                      <span style={{ color: '#52c41a' }}>📊</span> Set Min/Max Levels (ST2)
                    </Menu.Item>
                  )}
                  
                  {/* Contract Actions - Only for Approved Items */}
                  {record.status === 'APPROVED' && (
                    <Menu.Item key="add-contract">
                      <span style={{ color: '#1890ff' }}>📄</span> Add to Contract
                    </Menu.Item>
                  )}
                  
                  {/* Inventory Status - Only for Stock Items */}
                  {record.status === 'APPROVED' && record.stockItem === 'Y' && (
                    <Menu.Item key="view-inventory">
                      <span style={{ color: '#722ed1' }}>🏪</span> View Inventory Status
                    </Menu.Item>
                  )}
                  
                  {/* Disabled Actions for Non-Approved Items */}
                  {record.status !== 'APPROVED' && (
                    <Menu.Divider />
                  )}
                  
                  {record.status !== 'APPROVED' && (
                    <Menu.Item key="disabled-inventory" disabled>
                      <span style={{ color: '#ccc' }}>📦</span> Create Inventory (Requires Approval)
                    </Menu.Item>
                  )}
                  
                  {record.status !== 'APPROVED' && (
                    <Menu.Item key="disabled-contract" disabled>
                      <span style={{ color: '#ccc' }}>📄</span> Add to Contract (Requires Approval)
                    </Menu.Item>
                  )}
                  
                  {record.status === 'APPROVED' && record.plannedStock !== 'Y' && (
                    <Menu.Item key="disabled-minmax" disabled>
                      <span style={{ color: '#ccc' }}>📊</span> Set Min/Max (Requires ST2)
                    </Menu.Item>
                  )}
                </Menu>
              }
              trigger={['click']}
            >
              <Button type="text" icon={<MoreOutlined />} size="small" />
            </Dropdown>
          </Space>
        );
      },
    },
    {
      title: 'UNSPSC',
      dataIndex: 'unspscCode',
      key: 'unspscCode',
      width: 120,
      minWidth: 100,
      render: (text, record) => (
        <Button
          type="link"
          onClick={async () => {
            setUnspscModalVisible(true);
            setLoadingUnspsc(true);
            
            try {
              const response = await apiClient.get(`/item/${record.id}/unspsc-breakdown`);
              
              if (response.data.success) {
                setUnspscBreakdown(response.data.data);
              } else {
                message.warning('UNSPSC breakdown not found');
                setUnspscBreakdown(null);
              }
            } catch (error) {
              console.error('Error fetching UNSPSC breakdown:', error);
              message.error('Failed to load UNSPSC breakdown');
              setUnspscBreakdown(null);
            } finally {
              setLoadingUnspsc(false);
            }
          }}
          style={{ padding: 0, fontFamily: 'monospace', fontWeight: 'bold', fontSize: '12px' }}
        >
          {text || '-'}
        </Button>
      ),
    },
  ];

  const dataSource = searchMode ? (searchResults || []) : (items || []);
  return (
    <ErpLayout>
      <div style={{ 
        padding: '24px', 
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <TagsOutlined /> Item Master
            </Title>
            <Text type="secondary">
              Search by item number, description, manufacturer, or technical data
            </Text>
          </Col>          <Col>
            <Space>
              <Button
                icon={<UserOutlined />}
                onClick={() => navigate('/item-master/review')}
                style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: 'white' }}
              >
                Review Dashboard
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/item/create-new-item-master')}
                size="large"
              >
                Create Item Master
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Search Section */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={16} align="middle">
            <Col flex={1}>
              <Search
                placeholder="Search by Item Number, Description, Manufacturer Part Number, or Manufacturer Name..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                onChange={(e) => {
                  if (!e.target.value) {
                    setSearchMode(false);
                    setSearchResults([]);
                  }
                }}
              />
            </Col>
            <Col>
              {searchMode && (
                <Button
                  onClick={() => {
                    setSearchMode(false);
                    setSearchResults([]);
                  }}
                >
                  Show All Items
                </Button>
              )}
            </Col>
          </Row>
          
          <div style={{ marginTop: 16, fontSize: '12px', color: '#666' }}>
            <Space split="|">
              <span><strong>Number Search:</strong> Type item number (e.g., 100100100) for unique result</span>
              <span><strong>Name Search:</strong> Type description (e.g., "GASKET") for multiple variations</span>
              <span><strong>Part Number:</strong> Type manufacturer part number for specific item</span>
            </Space>
          </div>
        </Card>        {/* Results Summary */}
        {searchMode && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <Text>
              Found <strong>{searchResults.length}</strong> item(s) matching your search
              {searchResults.length === 1 && (
                <span> - <Text type="success">Unique result found</Text></span>
              )}
            </Text>
          </Card>
        )}

        {/* Review Process Information */}
        <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
          <Row gutter={16}>
            <Col span={24}>
              <Title level={5} style={{ margin: 0, color: '#52c41a' }}>
                📋 Item Master Review Process
              </Title>
              <div style={{ marginTop: 8, fontSize: '13px', color: '#666' }}>
                <Row gutter={[16, 8]}>
                  <Col span={8}>
                    <Text strong>🆕 DRAFT:</Text> New items with interim numbers (TEMP-YYYYMMDD-XXX)
                  </Col>
                  <Col span={8}>
                    <Text strong>⏳ PENDING_REVIEW:</Text> Submitted for quality check and approval
                  </Col>
                  <Col span={8}>
                    <Text strong>✅ APPROVED:</Text> Final item number assigned, ready for use
                  </Col>
                </Row>
                <div style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
                  <Text italic>
                    Stock Codes: ST1 (Stock Item), ST2 (Planned Stock - requires min/max levels), NS3 (Non-Stock)
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </Card>{/* Items Table */}
        <Card>
          <div 
            className="item-master-table-container"
            style={{ 
              overflowX: 'auto', 
              overflowY: 'hidden',
              maxWidth: '100%',
              border: '1px solid #f0f0f0',
              borderRadius: '6px',
              position: 'relative'
            }}
          >
            <Table
              columns={columns}
              dataSource={dataSource}
              rowKey="id"
              loading={loading}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
                onChange: (page, pageSize) =>
                  setPagination(prev => ({ ...prev, current: page, pageSize })),
                style: { padding: '16px 0' }
              }}
              scroll={{ 
                x: 'max-content',
                scrollToFirstRowOnChange: true
              }}
              size="middle"
              style={{ 
                minWidth: '100%',
                whiteSpace: 'nowrap'
              }}
              className="responsive-item-table"
            />
          </div>
          
          {/* Table scroll hint */}
          <div style={{ 
            textAlign: 'center', 
            color: '#999', 
            fontSize: '12px', 
            marginTop: '8px',
            padding: '4px 0'
          }}>
            💡 Scroll horizontally to view all columns
          </div>
        </Card>        {/* Item Detail Modal */}
        <Modal
          title={
            <Space>
              <TagsOutlined />
              Item Details - {selectedItem?.itemNumber}
              {selectedItem?.itemNumber?.startsWith('TEMP-') && (
                <Tag color="orange" style={{ marginLeft: 8 }}>Interim Number</Tag>
              )}
            </Space>
          }
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            selectedItem?.status === 'DRAFT' && (
              <Button 
                key="submit-review" 
                type="primary" 
                onClick={() => {
                  handleSubmitForReview(selectedItem);
                  setDetailModalVisible(false);
                }}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                📤 Submit for Review
              </Button>
            ),
            <Button key="edit" type="primary" onClick={() => {
              navigate(`/item-master/update/${selectedItem?.id}`);
              setDetailModalVisible(false);
            }}>
              Edit Item
            </Button>,
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Close
            </Button>
          ].filter(Boolean)}
          width={900}
        >
          {selectedItem && (
            <div>
              {/* Workflow Status Section */}
              <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f6ffed' }}>
                <Row gutter={16} align="middle">
                  <Col span={12}>
                    <Text strong>Workflow Status:</Text>
                    <div style={{ marginTop: 4 }}>
                      {selectedItem.status === 'DRAFT' && (
                        <Tag color="default" style={{ fontSize: '12px' }}>
                          📝 DRAFT - Ready for submission
                        </Tag>
                      )}
                      {selectedItem.status === 'PENDING_REVIEW' && (
                        <Tag color="processing" style={{ fontSize: '12px' }}>
                          ⏳ PENDING REVIEW - Quality check in progress
                        </Tag>
                      )}
                      {selectedItem.status === 'APPROVED' && (
                        <Tag color="success" style={{ fontSize: '12px' }}>
                          ✅ APPROVED - Final number assigned, ready for use
                        </Tag>
                      )}
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text strong>Stock Configuration:</Text>
                    <div style={{ marginTop: 4 }}>
                      {selectedItem.plannedStock === 'Y' && (
                        <Tag color="green" style={{ fontSize: '12px' }}>
                          📊 ST2 - Planned Stock (Min/Max required)
                        </Tag>
                      )}
                      {selectedItem.stockItem === 'Y' && selectedItem.plannedStock !== 'Y' && (
                        <Tag color="orange" style={{ fontSize: '12px' }}>
                          📦 ST1 - Stock Item (Critical/Long lead time)
                        </Tag>
                      )}
                      {selectedItem.stockItem !== 'Y' && (
                        <Tag color="default" style={{ fontSize: '12px' }}>
                          🔄 NS3 - Non-Stock (Direct orders/Contracts)
                        </Tag>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card>

              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Item Number" span={1}>
                  <Text strong style={{ fontFamily: 'monospace' }}>
                    {selectedItem.itemNumber}
                  </Text>
                  {selectedItem.itemNumber?.startsWith('TEMP-') && (
                    <div style={{ fontSize: '11px', color: '#ff9c6e', marginTop: 2 }}>
                      Interim number - will be replaced after approval
                    </div>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Status" span={1}>
                  <Tag color={selectedItem.status === 'APPROVED' ? 'success' : 'processing'}>
                    {selectedItem.status}
                  </Tag>
                </Descriptions.Item>
                
                <Descriptions.Item label="Short Description" span={2}>
                  <Text strong>{selectedItem.shortDescription}</Text>
                </Descriptions.Item>
                
                {selectedItem.standardDescription && (
                  <Descriptions.Item label="Standard Description (NOUN, MODIFIER)" span={2}>
                    <Text code style={{ fontSize: '12px' }}>{selectedItem.standardDescription}</Text>
                  </Descriptions.Item>
                )}
                
                <Descriptions.Item label="Manufacturer" span={1}>
                  {selectedItem.manufacturerName || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Manufacturer Part Number (MPN)" span={1}>
                  <Text code>{selectedItem.manufacturerPartNumber || 'N/A'}</Text>
                </Descriptions.Item>
                
                <Descriptions.Item label="Equipment Category" span={1}>
                  <Tag color="blue">{selectedItem.equipmentCategory}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Equipment Sub-Category" span={1}>
                  {selectedItem.equipmentSubCategory || 'N/A'}
                </Descriptions.Item>
                
                <Descriptions.Item label="UOM" span={1}>
                  <Tag>{selectedItem.uom}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Equipment Tag" span={1}>
                  <Text code>{selectedItem.equipmentTag || 'Not assigned'}</Text>
                </Descriptions.Item>
                
                <Descriptions.Item label="Serial Number" span={1}>
                  {selectedItem.serialNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Criticality" span={1}>
                  <Tag color={selectedItem.criticality === 'HIGH' ? 'red' : selectedItem.criticality === 'MEDIUM' ? 'orange' : 'default'}>
                    {selectedItem.criticality}
                  </Tag>
                </Descriptions.Item>
                
                <Descriptions.Item label="Stock Item" span={1}>
                  <Tag color={selectedItem.stockItem === 'Y' ? 'green' : 'default'}>
                    {selectedItem.stockItem === 'Y' ? 'Yes' : 'No'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Planned Stock" span={1}>
                  <Tag color={selectedItem.plannedStock === 'Y' ? 'green' : 'default'}>
                    {selectedItem.plannedStock === 'Y' ? 'Yes' : 'No'}
                  </Tag>
                  {selectedItem.plannedStock === 'Y' && (
                    <div style={{ fontSize: '11px', color: '#52c41a', marginTop: 2 }}>
                      ⚠️ Min/Max stock levels required
                    </div>
                  )}
                </Descriptions.Item>
                
                {selectedItem.supplierName && (
                  <Descriptions.Item label="Supplier" span={1}>
                    {selectedItem.supplierName}
                  </Descriptions.Item>
                )}
                
                {selectedItem.contractNumber && (
                  <Descriptions.Item label="Contract Number" span={1}>
                    <Text code style={{ color: '#1890ff' }}>{selectedItem.contractNumber}</Text>
                  </Descriptions.Item>
                )}
                
                <Descriptions.Item label="UNSPSC Code" span={1}>
                  <Button
                    type="link"
                    onClick={() => handleUnspscClick(selectedItem.unspscCode)}
                    style={{ padding: 0, fontFamily: 'monospace' }}
                  >
                    {selectedItem.unspscCode || 'Not assigned'}
                  </Button>
                </Descriptions.Item>
                
                <Descriptions.Item label="Equipment Tag" span={1}>
                  <Text code>{selectedItem.equipmentTag || 'Not assigned'}</Text>
                </Descriptions.Item>
              </Descriptions>

              {/* Inventory Status Section */}
              {selectedItem.status === 'APPROVED' && (selectedItem.stockItem === 'Y' || selectedItem.plannedStock === 'Y') && (
                <Card size="small" style={{ marginTop: 16, backgroundColor: '#f0f9ff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text strong>📦 Inventory Status</Text>
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => handleViewInventory(selectedItem)}
                    >
                      View Full Inventory →
                    </Button>
                  </div>
                  <Row gutter={16}>
                    <Col span={8}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                          0
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          Physical Balance
                        </div>
                      </div>
                    </Col>
                    {selectedItem.plannedStock === 'Y' && (
                      <>
                        <Col span={8}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fa8c16' }}>
                              Not Set
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              Min Level (ROP)
                            </div>
                          </div>
                        </Col>
                        <Col span={8}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                              Not Set
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              Max Level
                            </div>
                          </div>
                        </Col>
                      </>
                    )}
                  </Row>
                  {selectedItem.plannedStock === 'Y' && (
                    <div style={{ marginTop: 8, textAlign: 'center' }}>
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => handleSetStockLevels(selectedItem)}
                      >
                        Set Min/Max Levels
                      </Button>
                    </div>
                  )}
                </Card>
              )}

              {/* Contract Information Section */}
              {selectedItem.status === 'APPROVED' && (
                <Card size="small" style={{ marginTop: 16, backgroundColor: '#f9f0ff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text strong>📄 Contract Information</Text>
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => handleAddToContract(selectedItem)}
                    >
                      Add to Contract →
                    </Button>
                  </div>
                  {selectedItem.contractNumber ? (
                    <div>
                      <Text>Contract: </Text>
                      <Text code style={{ color: '#1890ff' }}>{selectedItem.contractNumber}</Text>
                      {selectedItem.supplierName && (
                        <div style={{ marginTop: 4 }}>
                          <Text>Supplier: </Text>
                          <Text strong>{selectedItem.supplierName}</Text>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Text type="secondary">This item is not assigned to any contract</Text>
                  )}
                </Card>
              )}
            </div>
          )}
        </Modal>        {/* UNSPSC Breakdown Modal */}
        <Modal
          title={`UNSPSC Code Analysis${unspscBreakdown ? ` - ${unspscBreakdown.unspscCode}` : ''}`}
          open={unspscModalVisible}
          onCancel={() => setUnspscModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setUnspscModalVisible(false)}>
              Close
            </Button>
          ]}
          width={700}
        >
          {loadingUnspsc ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin tip="Analyzing UNSPSC code..." />
            </div>
          ) : (
            <div>
              {unspscBreakdown ? (
                <div>
                  <Card 
                    size="small" 
                    style={{ marginBottom: 16, backgroundColor: unspscBreakdown.isValid ? '#f6ffed' : '#fff1f0' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong style={{ fontSize: '16px' }}>
                        {unspscBreakdown.formattedDisplay}
                      </Text>
                      <Tag color={unspscBreakdown.isValid ? 'success' : 'error'}>
                        {unspscBreakdown.isValid ? '✅ Valid' : '❌ Invalid'}
                      </Tag>
                    </div>
                  </Card>

                  <Table
                    dataSource={[
                      {
                        key: 'segment',
                        level: 'Segment',
                        code: unspscBreakdown.breakdown.segment.code,
                        name: unspscBreakdown.breakdown.segment.name,
                        description: 'Highest level classification'
                      },
                      {
                        key: 'family',
                        level: 'Family',
                        code: unspscBreakdown.breakdown.family.code,
                        name: unspscBreakdown.breakdown.family.name,
                        description: 'Related product/service group'
                      },
                      {
                        key: 'commodity',
                        level: 'Commodity',
                        code: unspscBreakdown.breakdown.commodity.code,
                        name: unspscBreakdown.breakdown.commodity.name,
                        description: 'Specific product/service category'
                      },
                      {
                        key: 'businessFunction',
                        level: 'Business Function',
                        code: unspscBreakdown.breakdown.businessFunction.code,
                        name: unspscBreakdown.breakdown.businessFunction.name,
                        description: 'Detailed specification'
                      }
                    ]}
                    rowKey="key"
                    pagination={false}
                    size="small"
                    bordered
                    columns={[
                      {
                        title: 'Level',
                        dataIndex: 'level',
                        key: 'level',
                        width: 120,
                        render: (text) => <Text strong>{text}</Text>
                      },
                      {
                        title: 'Code',
                        dataIndex: 'code',
                        key: 'code',
                        width: 60,
                        render: (text) => <Text code>{text}</Text>
                      },
                      {
                        title: 'Name',
                        dataIndex: 'name',
                        key: 'name',
                        render: (text) => <Text>{text}</Text>
                      },
                      {
                        title: 'Description',
                        dataIndex: 'description',
                        key: 'description',
                        width: 150,
                        render: (text) => <Text type="secondary" style={{ fontSize: '12px' }}>{text}</Text>
                      }
                    ]}
                  />

                  {unspscBreakdown.analysis && (
                    <Card 
                      title="AI Analysis" 
                      size="small" 
                      style={{ marginTop: 16 }}
                    >
                      <Text style={{ whiteSpace: 'pre-wrap', fontSize: '13px' }}>
                        {unspscBreakdown.analysis}
                      </Text>
                    </Card>                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
                  <Text type="secondary">No UNSPSC breakdown available for this item.</Text>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </ErpLayout>
  );
}
