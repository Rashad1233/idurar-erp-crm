import React, { useState, useEffect } from 'react';
import { 
  Table, 
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
  message,
  Badge,
  Tabs,
  Alert,
  Input,
  Select,
  Divider
} from 'antd';
import { 
  CheckOutlined, 
  CloseOutlined, 
  EyeOutlined, 
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  TagsOutlined,
  UserOutlined,
  HistoryOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { ErpLayout } from '@/layout';
import useLanguage from '@/locale/useLanguage';
import apiClient from '@/api/axiosConfig';

const { Search } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { confirm } = Modal;

export default function ItemMasterReviewDashboard() {
  const translate = useLanguage();
  
  const [loading, setLoading] = useState(false);
  const [pendingItems, setPendingItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [filters, setFilters] = useState({
    category: '',
    criticality: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });

  // Load pending items for review
  useEffect(() => {
    loadPendingItems();
    if (activeTab === 'all') {
      loadAllItems();
    }
  }, [activeTab, filters, pagination.current, pagination.pageSize]);

  const loadPendingItems = async () => {
    setLoading(true);
    try {
      console.log('Loading pending review items...');
      const response = await apiClient.get('/item/pending-review', {
        params: {
          page: pagination.current,
          items: pagination.pageSize,
          ...filters
        }
      });
      
      console.log('Pending items response:', response.data);
      
      if (response.data.success && response.data.data) {
        const items = response.data.data || [];
        setPendingItems(items);
        setPagination(prev => ({
          ...prev,
          total: response.data.count || items.length
        }));
      } else {
        // If no specific pending endpoint, filter from main endpoint
        const allResponse = await apiClient.get('/item', {
          params: {
            status: 'PENDING_REVIEW',
            page: pagination.current,
            items: pagination.pageSize,
            ...filters
          }
        });
        
        if (allResponse.data.success) {
          const items = (allResponse.data.data || []).filter(item => item.status === 'PENDING_REVIEW');
          setPendingItems(items);
          setPagination(prev => ({
            ...prev,
            total: items.length
          }));
        }
      }
    } catch (error) {
      console.error('Error loading pending items:', error);
      message.error('Failed to load pending review items');
      setPendingItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllItems = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/item', {
        params: {
          page: pagination.current,
          items: pagination.pageSize,
          ...filters
        }
      });
      
      if (response.data.success) {
        setAllItems(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading all items:', error);
      message.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  // Handle item approval
  const handleApproveItem = async (item) => {
    confirm({
      title: 'Approve Item Master',
      icon: <CheckOutlined style={{ color: '#52c41a' }} />,
      content: (
        <div>
          <p>Are you sure you want to approve this item?</p>
          <div style={{ marginTop: 12, padding: 12, backgroundColor: '#f6ffed', borderRadius: 6 }}>
            <Text strong>Item: </Text><Text code>{item.itemNumber}</Text><br/>
            <Text strong>Description: </Text><Text>{item.shortDescription}</Text><br/>
            <Text strong>Category: </Text><Tag color="blue">{item.equipmentCategory}</Tag>
          </div>
          <Alert
            style={{ marginTop: 12 }}
            message="After approval:"
            description="A final item number will be assigned based on category and sub-category, replacing the interim number."
            type="info"
            showIcon
          />
        </div>
      ),      onOk: async () => {
        try {
          setLoading(true);
          
          const response = await apiClient.put(`/item/${item.id}/review`, {
            action: 'approve',
            reviewComments: 'Approved via Review Dashboard'
          });
          
          if (response.data.success) {
            const finalItemNumber = response.data.data?.itemNumber || 'Unknown';
            message.success(`✅ Item approved! Final number assigned: ${finalItemNumber}`);
            loadPendingItems();
            if (activeTab === 'all') loadAllItems();
          }
        } catch (error) {
          console.error('Error approving item:', error);
          message.error('Failed to approve item. Please try again.');
        } finally {
          setLoading(false);
        }
      },
    });
  };  // Handle item rejection with reason - show choice modal first
  const handleRejectItem = (item) => {
    // First modal to choose rejection type
    Modal.confirm({
      title: 'Choose Rejection Type',
      icon: <CloseOutlined style={{ color: '#ff4d4f' }} />,
      width: 500,
      content: (
        <div>
          <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#fff2f0', borderRadius: 6 }}>
            <Text strong>Item: </Text><Text code>{item.itemNumber}</Text><br/>
            <Text strong>Description: </Text><Text>{item.shortDescription}</Text>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Text>How would you like to handle this rejection?</Text>
          </div>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px'
          }}>
            <div style={{ 
              padding: '12px', 
              border: '1px solid #ffa39e', 
              borderRadius: '6px',
              backgroundColor: '#fff1f0'
            }}>
              <Text strong style={{ color: '#cf1322' }}>🗑️ Reject & Delete Permanently</Text>
              <br />
              <Text style={{ fontSize: '12px', color: '#666' }}>
                Item will be completely removed and cannot be recovered
              </Text>
            </div>
            <div style={{ 
              padding: '12px', 
              border: '1px solid #ffbb96', 
              borderRadius: '6px',
              backgroundColor: '#fff7e6'
            }}>
              <Text strong style={{ color: '#d46b08' }}>✏️ Reject & Allow Re-creation</Text>
              <br />
              <Text style={{ fontSize: '12px', color: '#666' }}>
                Item will be deleted but can be recreated from notifications
              </Text>
            </div>
          </div>
        </div>
      ),
      okText: 'Choose Option',
      cancelText: 'Cancel',
      onOk: () => {
        // Show second modal to choose specific option
        showRejectionChoiceModal(item);
      }
    });
  };

  // Show rejection choice modal
  const showRejectionChoiceModal = (item) => {
    Modal.confirm({
      title: 'Select Rejection Action',
      icon: <CloseOutlined style={{ color: '#ff4d4f' }} />,
      width: 500,
      content: (
        <div>
          <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#fff2f0', borderRadius: 6 }}>
            <Text strong>Item: </Text><Text code>{item.itemNumber}</Text><br/>
            <Text strong>Description: </Text><Text>{item.shortDescription}</Text>
          </div>
          <Text>Choose how to handle this rejection:</Text>
        </div>
      ),
      footer: [
        <Button key="cancel" onClick={() => Modal.destroyAll()}>
          Cancel
        </Button>,
        <Button 
          key="delete" 
          danger 
          onClick={() => {
            Modal.destroyAll();
            showRejectionReasonModal(item, 'DELETE');
          }}
        >
          🗑️ Reject & Delete Permanently
        </Button>,
        <Button 
          key="allow-edit" 
          style={{ 
            backgroundColor: '#fff7e6', 
            borderColor: '#ffbb96', 
            color: '#d46b08' 
          }}
          onClick={() => {
            Modal.destroyAll();
            showRejectionReasonModal(item, 'ALLOW_EDIT');
          }}
        >
          ✏️ Reject & Allow Re-creation
        </Button>
      ]
    });
  };

  // Show rejection reason modal
  const showRejectionReasonModal = (item, rejectionType) => {
    let rejectionReason = '';
    
    const isDelete = rejectionType === 'DELETE';
    
    Modal.confirm({
      title: `${isDelete ? 'Reject & Delete' : 'Reject & Allow Re-creation'}`,
      icon: <CloseOutlined style={{ color: '#ff4d4f' }} />,
      width: 500,
      content: (
        <div>
          <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#fff2f0', borderRadius: 6 }}>
            <Text strong>Item: </Text><Text code>{item.itemNumber}</Text><br/>
            <Text strong>Description: </Text><Text>{item.shortDescription}</Text>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ color: '#ff4d4f' }}>Rejection Reason (Required):</Text>
            <Input.TextArea
              placeholder="Please provide a detailed reason for rejection..."
              rows={4}
              style={{ marginTop: 8 }}
              onChange={(e) => { rejectionReason = e.target.value; }}
            />
          </div>
          <Alert
            style={{ marginTop: 12 }}
            message={isDelete ? "⚠️ Permanent Deletion" : "⚠️ Temporary Rejection"}
            description={
              isDelete 
                ? "The item will be permanently deleted and cannot be recovered."
                : "The item will be deleted but can be recreated later from the notifications panel."
            }
            type={isDelete ? "error" : "warning"}
            showIcon
          />
        </div>
      ),
      okText: isDelete ? 'Reject & Delete' : 'Reject & Allow Edit',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        if (!rejectionReason || rejectionReason.trim().length === 0) {
          message.error('Rejection reason is required');
          return Promise.reject();
        }

        try {
          setLoading(true);
          
          const response = await apiClient.put(`/item/${item.id}/review`, {
            action: 'reject',
            rejectionReason: rejectionReason.trim(),
            rejectionType: rejectionType
          });
          
          if (response.data.success) {
            // Show notification with item details and rejection reason
            message.success({
              content: response.data.message,
              duration: 6, // Show for 6 seconds since it's a longer message
            });
            
            // Refresh the pending items list
            loadPendingItems();
            if (activeTab === 'all') loadAllItems();
            
            // Close detail modal if it's open
            setDetailModalVisible(false);
          }
        } catch (error) {
          console.error('Error rejecting item:', error);
          const errorMessage = error.response?.data?.message || 'Failed to reject item. Please try again.';
          message.error(errorMessage);
          return Promise.reject();
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Generate final item number based on category
  const generateFinalItemNumber = (item) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const category = (item.equipmentCategory || 'ITEM').toUpperCase();
    const subCategory = (item.equipmentSubCategory || '').toUpperCase();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    if (subCategory) {
      return `${category}-${subCategory}-${year}${month}${day}-${random}`;
    } else {
      return `${category}-${year}${month}${day}-${random}`;
    }
  };

  // Show item details
  const showItemDetails = (item) => {
    setSelectedItem(item);
    setDetailModalVisible(true);
  };

  // Review table columns
  const reviewColumns = [
    {
      title: 'Priority',
      key: 'priority',
      width: 80,
      render: (_, record) => {
        const daysSinceSubmission = record.updatedAt ? 
          Math.floor((new Date() - new Date(record.updatedAt)) / (1000 * 60 * 60 * 24)) : 0;
        
        if (daysSinceSubmission > 3) {
          return <Badge status="error" text="Urgent" />;
        } else if (daysSinceSubmission > 1) {
          return <Badge status="warning" text="High" />;
        } else {
          return <Badge status="processing" text="Normal" />;
        }
      },
    },
    {
      title: 'Item Number',
      dataIndex: 'itemNumber',
      key: 'itemNumber',
      width: 150,
      render: (text, record) => (
        <div>
          <Button
            type="link"
            onClick={() => showItemDetails(record)}
            style={{ padding: 0, fontFamily: 'monospace', fontWeight: 'bold' }}
          >
            {text}
          </Button>
          <div style={{ fontSize: '10px', color: '#ff9c6e' }}>
            Interim Number
          </div>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'shortDescription',
      key: 'description',
      width: 250,
      ellipsis: true,
      render: (text, record) => (
        <Tooltip title={record.longDescription || text}>
          <div>
            <div style={{ fontWeight: '500' }}>{text}</div>
            {record.standardDescription && (
              <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
                {record.standardDescription}
              </div>
            )}
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Category',
      key: 'category',
      width: 150,
      render: (_, record) => (
        <div>
          <Tag color="blue">{record.equipmentCategory || 'N/A'}</Tag>
          {record.equipmentSubCategory && (
            <div style={{ fontSize: '11px', marginTop: 2 }}>
              {record.equipmentSubCategory}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Manufacturer',
      key: 'manufacturer',
      width: 180,
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
    },
    {
      title: 'Criticality',
      dataIndex: 'criticality',
      key: 'criticality',
      width: 100,
      render: (criticality) => {
        const colors = {
          'HIGH': 'red',
          'MEDIUM': 'orange',
          'LOW': 'blue',
          'NO': 'default'
        };
        return <Tag color={colors[criticality] || 'default'}>{criticality}</Tag>;
      },
    },
    {
      title: 'Submitted',
      dataIndex: 'updatedAt',
      key: 'submitted',
      width: 120,
      render: (date) => {
        if (!date) return '-';
        const submitDate = new Date(date);
        const daysDiff = Math.floor((new Date() - submitDate) / (1000 * 60 * 60 * 24));
        
        return (
          <div>
            <div style={{ fontSize: '12px' }}>
              {submitDate.toLocaleDateString()}
            </div>
            <div style={{ fontSize: '10px', color: daysDiff > 3 ? '#ff4d4f' : '#666' }}>
              {daysDiff === 0 ? 'Today' : `${daysDiff} days ago`}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Review Actions',
      key: 'actions',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showItemDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Approve Item">
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleApproveItem(record)}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Approve
            </Button>
          </Tooltip>
          <Tooltip title="Reject Item">
            <Button
              danger
              icon={<CloseOutlined />}
              onClick={() => handleRejectItem(record)}
            >
              Reject
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

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
              <UserOutlined /> Item Master Review Dashboard
            </Title>
            <Text type="secondary">
              Review and approve pending Item Master submissions
            </Text>
          </Col>
          <Col>
            <Space>
              <Badge count={pendingItems.length} offset={[10, 0]}>
                <Button icon={<ClockCircleOutlined />}>
                  Pending Reviews
                </Button>
              </Badge>
            </Space>
          </Col>
        </Row>

        {/* Review Statistics */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9c6e' }}>
                  {pendingItems.length}
                </div>
                <div style={{ color: '#666' }}>Pending Review</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>
                  {pendingItems.filter(item => {
                    const daysDiff = item.updatedAt ? 
                      Math.floor((new Date() - new Date(item.updatedAt)) / (1000 * 60 * 60 * 24)) : 0;
                    return daysDiff > 3;
                  }).length}
                </div>
                <div style={{ color: '#666' }}>Urgent (3+ days)</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                  {pendingItems.filter(item => item.criticality === 'HIGH').length}
                </div>
                <div style={{ color: '#666' }}>High Criticality</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {new Set(pendingItems.map(item => item.equipmentCategory)).size}
                </div>
                <div style={{ color: '#666' }}>Categories</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col span={8}>
              <Search
                placeholder="Search by item number or description..."
                allowClear
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="Category"
                allowClear
                style={{ width: '100%' }}
                value={filters.category}
                onChange={(value) => setFilters({...filters, category: value})}
              >
                {[...new Set(pendingItems.map(item => item.equipmentCategory))].map(category => (
                  <Option key={category} value={category}>{category}</Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="Criticality"
                allowClear
                style={{ width: '100%' }}
                value={filters.criticality}
                onChange={(value) => setFilters({...filters, criticality: value})}
              >
                <Option value="HIGH">High</Option>
                <Option value="MEDIUM">Medium</Option>
                <Option value="LOW">Low</Option>
                <Option value="NO">No</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Review Queue */}
        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane 
              tab={
                <span>
                  <ClockCircleOutlined />
                  Pending Review ({pendingItems.length})
                </span>
              } 
              key="pending"
            >
              {pendingItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <ClockCircleOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                  <div style={{ marginTop: 16, fontSize: '16px', color: '#666' }}>
                    No items pending review
                  </div>
                  <div style={{ color: '#999' }}>
                    All submissions have been processed
                  </div>
                </div>
              ) : (
                <div style={{ 
                  overflowX: 'auto', 
                  maxWidth: '100%',
                  border: '1px solid #f0f0f0',
                  borderRadius: '6px'
                }}>
                  <Table
                    columns={reviewColumns}
                    dataSource={pendingItems}
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
                    }}
                    scroll={{ x: 'max-content' }}
                    size="middle"
                  />
                </div>
              )}
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <HistoryOutlined />
                  All Items
                </span>
              } 
              key="all"
            >
              <div style={{ 
                overflowX: 'auto', 
                maxWidth: '100%',
                border: '1px solid #f0f0f0',
                borderRadius: '6px'
              }}>
                <Table
                  columns={reviewColumns.filter(col => col.key !== 'actions')} // Remove action column for all items
                  dataSource={allItems}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    onChange: (page, pageSize) =>
                      setPagination(prev => ({ ...prev, current: page, pageSize })),
                  }}
                  scroll={{ x: 'max-content' }}
                  size="middle"
                />
              </div>
            </TabPane>
          </Tabs>
        </Card>

        {/* Item Detail Modal */}
        <Modal
          title={
            <Space>
              <UserOutlined />
              Review Item Details - {selectedItem?.itemNumber}
              <Tag color="orange">PENDING REVIEW</Tag>
            </Space>
          }
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            selectedItem?.status === 'PENDING_REVIEW' && (
              <Button 
                key="reject" 
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  handleRejectItem(selectedItem);
                  setDetailModalVisible(false);
                }}
              >
                Reject Item
              </Button>
            ),
            selectedItem?.status === 'PENDING_REVIEW' && (
              <Button 
                key="approve" 
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => {
                  handleApproveItem(selectedItem);
                  setDetailModalVisible(false);
                }}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Approve Item
              </Button>
            ),
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Close
            </Button>
          ].filter(Boolean)}
          width={900}
        >
          {selectedItem && (
            <div>
              {/* Review Instructions */}
              <Alert
                message="Review Checklist"
                description={
                  <div>
                    <p>Please verify the following before approval:</p>
                    <ul>
                      <li>✓ Standard description follows NOUN, MODIFIER format</li>
                      <li>✓ Equipment category and sub-category are correct</li>
                      <li>✓ Manufacturer information is accurate</li>
                      <li>✓ UNSPSC code is appropriate</li>
                      <li>✓ Stock configuration matches business requirements</li>
                    </ul>
                  </div>
                }
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Current Item Number" span={1}>
                  <Text code style={{ color: '#ff9c6e' }}>{selectedItem.itemNumber}</Text>
                  <div style={{ fontSize: '11px', color: '#ff9c6e', marginTop: 2 }}>
                    Will be replaced with final number after approval
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Proposed Final Number" span={1}>
                  <Text code style={{ color: '#52c41a' }}>
                    {generateFinalItemNumber(selectedItem)}
                  </Text>
                  <div style={{ fontSize: '11px', color: '#52c41a', marginTop: 2 }}>
                    Based on category and sub-category
                  </div>
                </Descriptions.Item>
                
                <Descriptions.Item label="Short Description" span={2}>
                  <Text strong>{selectedItem.shortDescription}</Text>
                </Descriptions.Item>
                
                <Descriptions.Item label="Standard Description (NOUN, MODIFIER)" span={2}>
                  <Text code style={{ fontSize: '12px' }}>
                    {selectedItem.standardDescription || 'Not provided'}
                  </Text>
                </Descriptions.Item>
                
                <Descriptions.Item label="Equipment Category" span={1}>
                  <Tag color="blue">{selectedItem.equipmentCategory}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Equipment Sub-Category" span={1}>
                  {selectedItem.equipmentSubCategory || 'N/A'}
                </Descriptions.Item>
                
                <Descriptions.Item label="Manufacturer" span={1}>
                  {selectedItem.manufacturerName || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Manufacturer Part Number (MPN)" span={1}>
                  <Text code>{selectedItem.manufacturerPartNumber || 'N/A'}</Text>
                </Descriptions.Item>
                
                <Descriptions.Item label="UOM" span={1}>
                  <Tag>{selectedItem.uom}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Criticality" span={1}>
                  <Tag color={selectedItem.criticality === 'HIGH' ? 'red' : 'default'}>
                    {selectedItem.criticality}
                  </Tag>
                </Descriptions.Item>
                
                <Descriptions.Item label="Stock Configuration" span={2}>
                  <div>
                    {selectedItem.plannedStock === 'Y' && (
                      <Tag color="green">ST2 - Planned Stock (Min/Max required)</Tag>
                    )}
                    {selectedItem.stockItem === 'Y' && selectedItem.plannedStock !== 'Y' && (
                      <Tag color="orange">ST1 - Stock Item</Tag>
                    )}
                    {selectedItem.stockItem !== 'Y' && (
                      <Tag color="default">NS3 - Non-Stock</Tag>
                    )}
                  </div>
                </Descriptions.Item>
                
                <Descriptions.Item label="UNSPSC Code" span={2}>
                  <Text code>{selectedItem.unspscCode || 'Not assigned'}</Text>
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Modal>
      </div>
    </ErpLayout>
  );
}
