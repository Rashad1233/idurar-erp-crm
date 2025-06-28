import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Tabs,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Typography,
  Alert,
  message,
  Tooltip,
  Badge,
  Divider,
  Descriptions,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  ShoppingOutlined,
  SendOutlined,
  EyeOutlined,
  MailOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  ReloadOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const RFQReview = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('draft');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('send'); // 'send', 'view', 'cancel'
  const [currentRFQ, setCurrentRFQ] = useState(null);
  const [form] = Form.useForm();

  // Mock data - replace with actual API calls
  const [rfqData, setRfqData] = useState({
    draft: [
      {
        id: 1,
        rfqNumber: 'RFQ-2024-001',
        title: 'Office Supplies and Equipment',
        description: 'Procurement of office supplies for Q1 2024',
        totalValue: 25000,
        currency: 'USD',
        createdBy: 'John Doe',
        createdAt: '2024-01-15',
        status: 'draft',
        supplierCount: 0,
        responseCount: 0,
        submissionDeadline: null
      },
      {
        id: 2,
        rfqNumber: 'RFQ-2024-002',
        title: 'IT Equipment Procurement',
        description: 'Laptops and networking equipment for IT department',
        totalValue: 150000,
        currency: 'USD',
        createdBy: 'Jane Smith',
        createdAt: '2024-01-16',
        status: 'draft',
        supplierCount: 0,
        responseCount: 0,
        submissionDeadline: null
      }
    ],
    sent: [
      {
        id: 3,
        rfqNumber: 'RFQ-2024-003',
        title: 'Construction Materials',
        description: 'Raw materials for facility renovation project',
        totalValue: 500000,
        currency: 'USD',
        createdBy: 'Mike Johnson',
        createdAt: '2024-01-10',
        sentDate: '2024-01-12',
        status: 'sent',
        supplierCount: 5,
        responseCount: 2,
        submissionDeadline: '2024-01-25'
      }
    ],
    evaluation: [
      {
        id: 4,
        rfqNumber: 'RFQ-2024-004',
        title: 'Professional Services',
        description: 'Legal and consulting services for compliance project',
        totalValue: 75000,
        currency: 'USD',
        createdBy: 'Sarah Wilson',
        createdAt: '2024-01-05',
        sentDate: '2024-01-07',
        status: 'evaluation',
        supplierCount: 3,
        responseCount: 3,
        submissionDeadline: '2024-01-20'
      }
    ],
    completed: [
      {
        id: 5,
        rfqNumber: 'RFQ-2024-005',
        title: 'Vehicle Fleet Maintenance',
        description: 'Annual maintenance contract for company vehicles',
        totalValue: 120000,
        currency: 'USD',
        createdBy: 'David Brown',
        createdAt: '2024-01-01',
        sentDate: '2024-01-03',
        completedDate: '2024-01-14',
        status: 'completed',
        supplierCount: 4,
        responseCount: 4,
        submissionDeadline: '2024-01-12',
        selectedSupplier: 'ABC Maintenance Services'
      }
    ]
  });

  const handleSendRFQ = async (rfqIds) => {
    setLoading(true);
    try {
      // API call to send RFQ to suppliers
      const response = await axios.post('/api/rfq/send-to-suppliers', {
        rfqIds: rfqIds,
        suppliers: form.getFieldValue('suppliers'),
        submissionDeadline: form.getFieldValue('submissionDeadline').toISOString(),
        customMessage: form.getFieldValue('customMessage')
      });

      if (response.data.success) {
        message.success(`RFQ sent to ${response.data.supplierCount} suppliers successfully`);
        setModalVisible(false);
        setSelectedRowKeys([]);
        form.resetFields();
        // Refresh data
        loadRFQData();
      }
    } catch (error) {
      message.error('Failed to send RFQ');
    }
    setLoading(false);
  };

  const handleBulkSend = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select RFQs to send');
      return;
    }
    setModalType('send');
    setModalVisible(true);
  };

  const loadRFQData = async () => {
    // API call to load RFQ data
    // setRfqData(response.data);
  };

  const columns = [
    {
      title: 'RFQ Number',
      dataIndex: 'rfqNumber',
      key: 'rfqNumber',
      render: (text, record) => (
        <Space>
          <Text strong>{text}</Text>
          {record.status === 'sent' && moment(record.submissionDeadline).isBefore(moment()) && (
            <Tag color="red">Overdue</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Total Value',
      key: 'totalValue',
      render: (_, record) => `${record.currency} ${record.totalValue?.toLocaleString()}`,
    },
    {
      title: 'Suppliers',
      key: 'suppliers',
      render: (_, record) => (
        <Space>
          <Text>{record.supplierCount}</Text>
          {record.responseCount > 0 && (
            <Badge count={record.responseCount} size="small" />
          )}
        </Space>
      ),
    },
    {
      title: 'Deadline',
      dataIndex: 'submissionDeadline',
      key: 'submissionDeadline',
      render: (date) => date ? moment(date).format('MMM DD, YYYY') : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          draft: { color: 'default', text: 'Draft' },
          sent: { color: 'processing', text: 'Sent to Suppliers' },
          evaluation: { color: 'warning', text: 'Under Evaluation' },
          completed: { color: 'success', text: 'Completed' },
          cancelled: { color: 'error', text: 'Cancelled' }
        };
        const config = statusConfig[status] || statusConfig.draft;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setCurrentRFQ(record);
                setModalType('view');
                setModalVisible(true);
              }}
            />
          </Tooltip>
          {record.status === 'draft' && (
            <Tooltip title="Send to Suppliers">
              <Button
                icon={<SendOutlined />}
                size="small"
                type="primary"
                onClick={() => {
                  setCurrentRFQ(record);
                  setModalType('send');
                  setModalVisible(true);
                }}
              />
            </Tooltip>
          )}
          {record.status === 'sent' && (
            <Tooltip title="Send Reminder">
              <Button
                icon={<MailOutlined />}
                size="small"
                onClick={() => {
                  setCurrentRFQ(record);
                  setModalType('remind');
                  setModalVisible(true);
                }}
              />
            </Tooltip>
          )}
          {record.status === 'evaluation' && (
            <Tooltip title="Download Responses">
              <Button
                icon={<DownloadOutlined />}
                size="small"
                onClick={() => {
                  // Download RFQ responses
                  message.info('Downloading RFQ responses...');
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    getCheckboxProps: (record) => ({
      disabled: record.status !== 'draft',
    }),
  };

  const tabItems = [
    {
      key: 'draft',
      label: (
        <Space>
          <PlusOutlined />
          Draft RFQs
          <Badge count={rfqData.draft.length} size="small" />
        </Space>
      ),
      children: (
        <Card>
          <div style={{ marginBottom: 16 }}>
            <Space>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleBulkSend}
                disabled={selectedRowKeys.length === 0}
              >
                Send Selected RFQs
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadRFQData}>
                Refresh
              </Button>
            </Space>
          </div>
          <Table
            dataSource={rfqData.draft}
            columns={columns}
            rowKey="id"
            rowSelection={rowSelection}
            size="small"
          />
        </Card>
      ),
    },
    {
      key: 'sent',
      label: (
        <Space>
          <ClockCircleOutlined />
          Sent to Suppliers
          <Badge count={rfqData.sent.length} size="small" />
        </Space>
      ),
      children: (
        <Card>
          <Table
            dataSource={rfqData.sent}
            columns={columns}
            rowKey="id"
            size="small"
          />
        </Card>
      ),
    },
    {
      key: 'evaluation',
      label: (
        <Space>
          <EyeOutlined />
          Under Evaluation
          <Badge count={rfqData.evaluation.length} size="small" />
        </Space>
      ),
      children: (
        <Card>
          <Table
            dataSource={rfqData.evaluation}
            columns={columns}
            rowKey="id"
            size="small"
          />
        </Card>
      ),
    },
    {
      key: 'completed',
      label: (
        <Space>
          <CheckOutlined />
          Completed
          <Badge count={rfqData.completed.length} size="small" />
        </Space>
      ),
      children: (
        <Card>
          <Table
            dataSource={rfqData.completed}
            columns={columns}
            rowKey="id"
            size="small"
          />
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <ShoppingOutlined /> RFQ Review Center
        </Title>
        <Text type="secondary">
          Manage Request for Quotations, send invitations to suppliers, and review responses
        </Text>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Draft RFQs"
              value={rfqData.draft.length}
              prefix={<PlusOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sent to Suppliers"
              value={rfqData.sent.length}
              prefix={<SendOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Under Evaluation"
              value={rfqData.evaluation.length}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completed"
              value={rfqData.completed.length}
              prefix={<CheckOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* RFQ Management Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />

      {/* Send RFQ Modal */}
      <Modal
        title={modalType === 'send' ? 'Send RFQ to Suppliers' : 'View RFQ Details'}
        visible={modalVisible}
        onOk={() => {
          if (modalType === 'send') {
            form.submit();
          } else {
            setModalVisible(false);
          }
        }}
        onCancel={() => setModalVisible(false)}
        width={700}
        confirmLoading={loading}
        okText={modalType === 'send' ? 'Send RFQ' : 'Close'}
        cancelText="Cancel"
      >
        {modalType === 'send' ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => {
              const rfqIds = currentRFQ ? [currentRFQ.id] : selectedRowKeys;
              handleSendRFQ(rfqIds);
            }}
          >
            <Alert
              message="RFQ Distribution"
              description={`You are about to send ${currentRFQ ? 1 : selectedRowKeys.length} RFQ(s) to selected suppliers. Each supplier will receive a personalized email with a direct link to respond.`}
              type="info"
              style={{ marginBottom: 16 }}
            />

            <Form.Item
              name="suppliers"
              label="Select Suppliers"
              rules={[{ required: true, message: 'Please select suppliers' }]}
            >
              <Select
                mode="multiple"
                placeholder="Choose suppliers to send RFQ"
                style={{ width: '100%' }}
              >
                <Option value="supplier1">ABC Supplies Co.</Option>
                <Option value="supplier2">Global Procurement Ltd.</Option>
                <Option value="supplier3">Premium Vendors Inc.</Option>
                <Option value="supplier4">Quality Materials Corp.</Option>
                <Option value="supplier5">Reliable Suppliers Ltd.</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="submissionDeadline"
              label="Submission Deadline"
              rules={[{ required: true, message: 'Please set submission deadline' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                disabledDate={(current) => current && current < moment().startOf('day')}
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
              />
            </Form.Item>

            <Form.Item
              name="customMessage"
              label="Custom Message (Optional)"
            >
              <TextArea
                rows={4}
                placeholder="Add any special instructions or additional information for suppliers..."
              />
            </Form.Item>
          </Form>
        ) : (
          currentRFQ && (
            <div>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="RFQ Number">
                  {currentRFQ.rfqNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color="processing">{currentRFQ.status}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Title" span={2}>
                  {currentRFQ.title}
                </Descriptions.Item>
                <Descriptions.Item label="Description" span={2}>
                  {currentRFQ.description}
                </Descriptions.Item>
                <Descriptions.Item label="Total Value">
                  {currentRFQ.currency} {currentRFQ.totalValue?.toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Created By">
                  {currentRFQ.createdBy}
                </Descriptions.Item>
                <Descriptions.Item label="Created Date">
                  {moment(currentRFQ.createdAt).format('MMMM DD, YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Suppliers Invited">
                  {currentRFQ.supplierCount}
                </Descriptions.Item>
                {currentRFQ.submissionDeadline && (
                  <Descriptions.Item label="Submission Deadline">
                    {moment(currentRFQ.submissionDeadline).format('MMMM DD, YYYY HH:mm')}
                  </Descriptions.Item>
                )}
                {currentRFQ.responseCount > 0 && (
                  <Descriptions.Item label="Responses Received">
                    {currentRFQ.responseCount}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>
          )
        )}
      </Modal>
    </div>
  );
};

export default RFQReview;