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
  Space,
  Typography,
  Alert,
  message,
  Tooltip,
  Badge,
  Descriptions,
  Row,
  Col,
  Statistic,
  Divider,
  Progress
} from 'antd';
import {
  DollarOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  MailOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SendOutlined,
  FileTextOutlined,
  TeamOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const POApprovals = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('approve'); // 'approve', 'reject', 'view', 'send'
  const [currentPO, setCurrentPO] = useState(null);
  const [form] = Form.useForm();

  // Mock data - replace with actual API calls
  const [poData, setPoData] = useState({
    pending: [
      {
        id: 1,
        poNumber: 'PO-2024-001',
        supplierName: 'ABC Supplies Co.',
        totalAmount: 25000,
        currency: 'USD',
        requestedBy: 'John Doe',
        requestDate: '2024-01-15',
        requiredBy: '2024-02-15',
        status: 'pending_approval',
        approvalLevel: 1,
        totalLevels: 3,
        description: 'Office supplies and equipment for Q1 2024',
        businessJustification: 'Required for new office setup and employee onboarding',
        urgency: 'medium'
      },
      {
        id: 2,
        poNumber: 'PO-2024-002',
        supplierName: 'Tech Solutions Ltd.',
        totalAmount: 150000,
        currency: 'USD',
        requestedBy: 'Jane Smith',
        requestDate: '2024-01-16',
        requiredBy: '2024-03-01',
        status: 'pending_approval',
        approvalLevel: 2,
        totalLevels: 3,
        description: 'IT equipment procurement for digital transformation',
        businessJustification: 'Critical for ongoing digital transformation initiative',
        urgency: 'high'
      },
      {
        id: 3,
        poNumber: 'PO-2024-003',
        supplierName: 'Construction Partners Inc.',
        totalAmount: 500000,
        currency: 'USD',
        requestedBy: 'Mike Johnson',
        requestDate: '2024-01-10',
        requiredBy: '2024-04-01',
        status: 'pending_approval',
        approvalLevel: 3,
        totalLevels: 3,
        description: 'Facility renovation and expansion project',
        businessJustification: 'Facility expansion required to accommodate growing workforce',
        urgency: 'low'
      }
    ],
    approved: [
      {
        id: 4,
        poNumber: 'PO-2024-004',
        supplierName: 'Professional Services Corp.',
        totalAmount: 75000,
        currency: 'USD',
        requestedBy: 'Sarah Wilson',
        requestDate: '2024-01-05',
        approvedDate: '2024-01-12',
        status: 'approved',
        approvedBy: 'David Brown',
        description: 'Legal and consulting services for compliance project'
      }
    ],
    rejected: [
      {
        id: 5,
        poNumber: 'PO-2024-005',
        supplierName: 'Overpriced Vendors Ltd.',
        totalAmount: 200000,
        currency: 'USD',
        requestedBy: 'Tom Anderson',
        requestDate: '2024-01-08',
        rejectedDate: '2024-01-14',
        status: 'rejected',
        rejectedBy: 'Lisa Johnson',
        rejectionReason: 'Budget exceeded without proper justification',
        description: 'Marketing campaign materials and services'
      }
    ]
  });

  const handleBulkApproval = async (action) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select purchase orders');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('/api/po/bulk-approval', {
        poIds: selectedRowKeys,
        action: action,
        comments: form.getFieldValue('comments')
      });

      if (response.data.success) {
        message.success(`${selectedRowKeys.length} purchase orders ${action}d successfully`);
        setModalVisible(false);
        setSelectedRowKeys([]);
        form.resetFields();
        loadPOData();
      }
    } catch (error) {
      message.error(`Failed to ${action} purchase orders`);
    }
    setLoading(false);
  };

  const handleSendForApproval = async (poIds) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/po/send-for-approval', {
        poIds: poIds,
        approvers: form.getFieldValue('approvers'),
        urgency: form.getFieldValue('urgency'),
        customMessage: form.getFieldValue('customMessage')
      });

      if (response.data.success) {
        message.success(`Approval emails sent for ${poIds.length} purchase orders`);
        setModalVisible(false);
        form.resetFields();
        loadPOData();
      }
    } catch (error) {
      message.error('Failed to send approval emails');
    }
    setLoading(false);
  };

  const loadPOData = async () => {
    // API call to load PO data
    // setPoData(response.data);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'PO Number',
      dataIndex: 'poNumber',
      key: 'poNumber',
      render: (text, record) => (
        <Space>
          <Text strong>{text}</Text>
          {record.urgency && (
            <Tag color={getUrgencyColor(record.urgency)}>
              {record.urgency.toUpperCase()}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Supplier',
      dataIndex: 'supplierName',
      key: 'supplierName',
    },
    {
      title: 'Amount',
      key: 'totalAmount',
      render: (_, record) => (
        <Text strong style={{ color: '#1890ff' }}>
          {record.currency} {record.totalAmount?.toLocaleString()}
        </Text>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: 'Requested By',
      dataIndex: 'requestedBy',
      key: 'requestedBy',
    },
    {
      title: 'Request Date',
      dataIndex: 'requestDate',
      key: 'requestDate',
      render: (date) => moment(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Required By',
      dataIndex: 'requiredBy',
      key: 'requiredBy',
      render: (date) => date ? moment(date).format('MMM DD, YYYY') : '-',
    },
    {
      title: 'Approval Progress',
      key: 'approvalProgress',
      render: (_, record) => {
        if (record.status === 'pending_approval') {
          const percent = (record.approvalLevel / record.totalLevels) * 100;
          return (
            <div>
              <Progress 
                percent={percent} 
                size="small" 
                status="active"
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Level {record.approvalLevel} of {record.totalLevels}
              </Text>
            </div>
          );
        }
        return '-';
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          pending_approval: { color: 'processing', text: 'Pending Approval' },
          approved: { color: 'success', text: 'Approved' },
          rejected: { color: 'error', text: 'Rejected' },
          cancelled: { color: 'default', text: 'Cancelled' }
        };
        const config = statusConfig[status] || statusConfig.pending_approval;
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
                setCurrentPO(record);
                setModalType('view');
                setModalVisible(true);
              }}
            />
          </Tooltip>
          {record.status === 'pending_approval' && (
            <>
              <Tooltip title="Approve">
                <Button
                  icon={<CheckOutlined />}
                  size="small"
                  type="primary"
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  onClick={() => {
                    setCurrentPO(record);
                    setModalType('approve');
                    setModalVisible(true);
                  }}
                />
              </Tooltip>
              <Tooltip title="Reject">
                <Button
                  icon={<CloseOutlined />}
                  size="small"
                  danger
                  onClick={() => {
                    setCurrentPO(record);
                    setModalType('reject');
                    setModalVisible(true);
                  }}
                />
              </Tooltip>
              <Tooltip title="Send to External Approver">
                <Button
                  icon={<SendOutlined />}
                  size="small"
                  onClick={() => {
                    setCurrentPO(record);
                    setModalType('send');
                    setModalVisible(true);
                  }}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    getCheckboxProps: (record) => ({
      disabled: record.status !== 'pending_approval',
    }),
  };

  const tabItems = [
    {
      key: 'pending',
      label: (
        <Space>
          <ClockCircleOutlined />
          Pending Approval
          <Badge count={poData.pending.length} size="small" />
        </Space>
      ),
      children: (
        <Card>
          <div style={{ marginBottom: 16 }}>
            <Space>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => {
                  setModalType('bulk-approve');
                  setModalVisible(true);
                }}
                disabled={selectedRowKeys.length === 0}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Bulk Approve
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  setModalType('bulk-reject');
                  setModalVisible(true);
                }}
                disabled={selectedRowKeys.length === 0}
              >
                Bulk Reject
              </Button>
              <Button
                icon={<SendOutlined />}
                onClick={() => {
                  setModalType('bulk-send');
                  setModalVisible(true);
                }}
                disabled={selectedRowKeys.length === 0}
              >
                Send for External Approval
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadPOData}>
                Refresh
              </Button>
            </Space>
          </div>
          <Table
            dataSource={poData.pending}
            columns={columns}
            rowKey="id"
            rowSelection={rowSelection}
            size="small"
            scroll={{ x: 1200 }}
          />
        </Card>
      ),
    },
    {
      key: 'approved',
      label: (
        <Space>
          <CheckOutlined />
          Approved
          <Badge count={poData.approved.length} size="small" />
        </Space>
      ),
      children: (
        <Card>
          <Table
            dataSource={poData.approved}
            columns={columns}
            rowKey="id"
            size="small"
            scroll={{ x: 1200 }}
          />
        </Card>
      ),
    },
    {
      key: 'rejected',
      label: (
        <Space>
          <CloseOutlined />
          Rejected
          <Badge count={poData.rejected.length} size="small" />
        </Space>
      ),
      children: (
        <Card>
          <Table
            dataSource={poData.rejected}
            columns={[
              ...columns,
              {
                title: 'Rejection Reason',
                dataIndex: 'rejectionReason',
                key: 'rejectionReason',
                render: (text) => text || '-',
              },
            ]}
            rowKey="id"
            size="small"
            scroll={{ x: 1200 }}
          />
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <DollarOutlined /> Purchase Order Approvals
        </Title>
        <Text type="secondary">
          Review and approve purchase orders, manage approval workflows, and track approval status
        </Text>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Approval"
              value={poData.pending.length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Value Pending"
              value={poData.pending.reduce((sum, po) => sum + po.totalAmount, 0)}
              prefix="$"
              precision={0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Approved This Month"
              value={poData.approved.length}
              prefix={<CheckOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="High Priority"
              value={poData.pending.filter(po => po.urgency === 'high').length}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* PO Management Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />

      {/* Action Modals */}
      <Modal
        title={
          modalType === 'view' ? 'Purchase Order Details' :
          modalType === 'approve' ? 'Approve Purchase Order' :
          modalType === 'reject' ? 'Reject Purchase Order' :
          modalType === 'send' ? 'Send for External Approval' :
          modalType === 'bulk-approve' ? 'Bulk Approve Purchase Orders' :
          modalType === 'bulk-reject' ? 'Bulk Reject Purchase Orders' :
          'Send for External Approval'
        }
        visible={modalVisible}
        onOk={() => {
          if (modalType === 'view') {
            setModalVisible(false);
          } else if (modalType.includes('bulk')) {
            const action = modalType.includes('approve') ? 'approve' : 'reject';
            handleBulkApproval(action);
          } else if (modalType === 'send' || modalType === 'bulk-send') {
            form.submit();
          } else {
            form.submit();
          }
        }}
        onCancel={() => setModalVisible(false)}
        width={modalType === 'view' ? 800 : 600}
        confirmLoading={loading}
        okText={
          modalType === 'view' ? 'Close' :
          modalType === 'approve' || modalType === 'bulk-approve' ? 'Approve' :
          modalType === 'reject' || modalType === 'bulk-reject' ? 'Reject' :
          'Send'
        }
        cancelText="Cancel"
      >
        {modalType === 'view' && currentPO ? (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="PO Number">
                {currentPO.poNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color="processing">{currentPO.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Supplier">
                {currentPO.supplierName}
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                  {currentPO.currency} {currentPO.totalAmount?.toLocaleString()}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Requested By">
                {currentPO.requestedBy}
              </Descriptions.Item>
              <Descriptions.Item label="Request Date">
                {moment(currentPO.requestDate).format('MMMM DD, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Required By">
                {currentPO.requiredBy ? moment(currentPO.requiredBy).format('MMMM DD, YYYY') : 'Not specified'}
              </Descriptions.Item>
              <Descriptions.Item label="Urgency">
                <Tag color={getUrgencyColor(currentPO.urgency)}>
                  {currentPO.urgency?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {currentPO.description}
              </Descriptions.Item>
              <Descriptions.Item label="Business Justification" span={2}>
                {currentPO.businessJustification}
              </Descriptions.Item>
              {currentPO.approvalLevel && (
                <Descriptions.Item label="Approval Progress" span={2}>
                  <Progress 
                    percent={(currentPO.approvalLevel / currentPO.totalLevels) * 100}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                  <Text>Level {currentPO.approvalLevel} of {currentPO.totalLevels}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => {
              if (modalType === 'send' || modalType === 'bulk-send') {
                const poIds = modalType === 'send' ? [currentPO.id] : selectedRowKeys;
                handleSendForApproval(poIds);
              } else {
                const action = modalType.includes('approve') ? 'approve' : 'reject';
                handleBulkApproval(action);
              }
            }}
          >
            {(modalType === 'send' || modalType === 'bulk-send') ? (
              <>
                <Alert
                  message="External Approval Required"
                  description={`Send ${modalType === 'send' ? 'this purchase order' : 'selected purchase orders'} to external approvers via email. They will receive a secure link to review and approve/reject.`}
                  type="info"
                  style={{ marginBottom: 16 }}
                />

                <Form.Item
                  name="approvers"
                  label="External Approvers"
                  rules={[{ required: true, message: 'Please select approvers' }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Select approvers to send email"
                    style={{ width: '100%' }}
                  >
                    <Option value="ceo@company.com">CEO - John Smith</Option>
                    <Option value="cfo@company.com">CFO - Jane Doe</Option>
                    <Option value="director@company.com">Director - Mike Johnson</Option>
                    <Option value="manager@company.com">Manager - Sarah Wilson</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="urgency"
                  label="Urgency Level"
                  rules={[{ required: true, message: 'Please select urgency level' }]}
                >
                  <Select placeholder="Select urgency level">
                    <Option value="low">Low - Standard approval timeline</Option>
                    <Option value="medium">Medium - Expedited review needed</Option>
                    <Option value="high">High - Urgent approval required</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="customMessage"
                  label="Custom Message (Optional)"
                >
                  <TextArea
                    rows={4}
                    placeholder="Add any special instructions or context for the approvers..."
                  />
                </Form.Item>
              </>
            ) : (
              <>
                <Alert
                  message={modalType.includes('approve') ? 'Approval Confirmation' : 'Rejection Confirmation'}
                  description={`You are about to ${modalType.includes('approve') ? 'approve' : 'reject'} ${modalType.includes('bulk') ? `${selectedRowKeys.length} purchase orders` : 'this purchase order'}. This action will be recorded with your credentials and timestamp.`}
                  type={modalType.includes('approve') ? 'info' : 'warning'}
                  style={{ marginBottom: 16 }}
                />

                <Form.Item
                  name="comments"
                  label="Comments"
                  rules={[
                    { 
                      required: modalType.includes('reject'), 
                      message: 'Please provide a reason for rejection' 
                    }
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder={
                      modalType.includes('approve')
                        ? 'Optional comments for this approval'
                        : 'Please specify the reason for rejection and any required changes'
                    }
                  />
                </Form.Item>
              </>
            )}
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default POApprovals;