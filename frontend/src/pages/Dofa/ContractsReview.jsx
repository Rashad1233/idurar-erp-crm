import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Space, 
  message, 
  Descriptions,
  Row,
  Col,
  Typography,
  Alert,
  Divider
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  FileProtectOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';

const { TextArea } = Input;
const { Title, Text } = Typography;

// Configure axios with token
function configureAxios() {
  const auth = storePersist.get('auth');
  if (auth?.current?.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${auth.current.token}`;
    axios.defaults.headers.common['x-auth-token'] = auth.current.token;
  }
  axios.defaults.baseURL = API_BASE_URL;
  axios.defaults.withCredentials = true;
}

function ContractsReview() {
  const [pendingContracts, setPendingContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [selectedContract, setSelectedContract] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [form] = Form.useForm();

  // Load contracts pending approval
  const loadPendingContracts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/dofa/contracts/review');
      if (response.data.success) {
        setPendingContracts(response.data.data);
      }
    } catch (error) {
      console.error('Error loading pending contracts:', error);
      message.error('Failed to load pending contracts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingContracts();
  }, []);

  // Handle approval/rejection action
  const handleAction = async (values) => {
    if (!selectedContract) return;
    
    setActionInProgress(true);
    try {
      const endpoint = actionType === 'approve' 
        ? `/api/dofa/contracts/${selectedContract.id}/approve`
        : `/api/dofa/contracts/${selectedContract.id}/reject`;
      
      const payload = {
        comments: values.comments,
        reason: values.reason
      };

      const response = await axios.post(endpoint, payload);
      
      if (response.data.success) {
        message.success(`Contract ${actionType}d successfully`);
        setModalVisible(false);
        form.resetFields();
        loadPendingContracts();
        
        // Send notification to contract creator
        await sendNotificationToCreator(selectedContract, actionType, values.comments);
        
        // If approved, send email to supplier
        if (actionType === 'approve') {
          await sendEmailToSupplier(selectedContract);
        }
      } else {
        message.error(response.data.message || `Failed to ${actionType} contract`);
      }
    } catch (error) {
      console.error(`Error ${actionType}ing contract:`, error);
      message.error(`Failed to ${actionType} contract`);
    } finally {
      setActionInProgress(false);
    }
  };

  // Send notification to contract creator
  const sendNotificationToCreator = async (contract, action, comments) => {
    try {
      const notificationData = {
        userId: contract.createdById,
        title: `Contract ${action.charAt(0).toUpperCase() + action.slice(1)}d`,
        message: `Your contract "${contract.contractName}" has been ${action}d by DoFA. ${comments ? 'Comments: ' + comments : ''}`,
        type: action === 'approve' ? 'success' : 'warning',
        relatedEntity: 'contract',
        relatedEntityId: contract.id
      };
      
      await axios.post('/api/notifications', notificationData);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // Send email to supplier using AI
  const sendEmailToSupplier = async (contract) => {
    try {
      const emailData = {
        to: contract.supplier.contactEmail,
        subject: `Contract Approval - ${contract.contractName}`,
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        supplierName: contract.supplier.legalName,
        type: 'contract_approval'
      };
      
      await axios.post('/api/ai/send-contract-email', emailData);
      message.success('Email sent to supplier successfully');
    } catch (error) {
      console.error('Error sending email to supplier:', error);
      message.warning('Contract approved but failed to send email to supplier');
    }
  };

  // Show approval/rejection modal
  const showActionModal = (contract, action) => {
    setSelectedContract(contract);
    setActionType(action);
    setModalVisible(true);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Contract Number',
      dataIndex: 'contractNumber',
      key: 'contractNumber',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Contract Name',
      dataIndex: 'contractName',
      key: 'contractName',
    },
    {
      title: 'Supplier',
      dataIndex: ['supplier', 'legalName'],
      key: 'supplier',
      render: (text, record) => (
        <div>
          <div><Text strong>{record.supplier?.legalName}</Text></div>
          {record.supplier?.tradeName && (
            <div><Text type="secondary">({record.supplier.tradeName})</Text></div>
          )}
        </div>
      )
    },
    {
      title: 'Total Value',
      dataIndex: 'totalValue',
      key: 'totalValue',
      render: (value, record) => (
        <Text strong>{record.currency} {value ? Number(value).toLocaleString() : '0'}</Text>
      )
    },
    {
      title: 'Contract Period',
      key: 'period',
      render: (_, record) => (
        <div>
          <div>{new Date(record.startDate).toLocaleDateString()}</div>
          <div>to {new Date(record.endDate).toLocaleDateString()}</div>
        </div>
      )
    },
    {
      title: 'Submitted By',
      dataIndex: ['createdBy', 'name'],
      key: 'createdBy',
      render: (text) => (
        <span>
          <UserOutlined /> {text}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => showActionModal(record, 'approve')}
            size="small"
          >
            Approve
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={() => showActionModal(record, 'reject')}
            size="small"
          >
            Reject
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {/* TODO: View contract details */}}
            size="small"
          >
            View
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>
            <FileProtectOutlined /> Contracts Review (DoFA)
          </Title>
          <p>Review and approve/reject contracts submitted for DoFA approval.</p>
        </Col>
      </Row>

      <Alert
        message="DoFA Contract Approval Process"
        description="Review contract details, approve or reject with comments. Approved contracts will automatically notify the creator and send email to the supplier."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Card>
        <Table
          columns={columns}
          dataSource={pendingContracts}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} pending contracts`
          }}
          locale={{
            emptyText: 'No contracts pending approval'
          }}
        />
      </Card>

      <Modal
        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Contract`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedContract && (
          <>
            <Descriptions
              bordered
              size="small"
              column={1}
              style={{ marginBottom: 16 }}
            >
              <Descriptions.Item label="Contract Number">
                {selectedContract.contractNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Contract Name">
                {selectedContract.contractName}
              </Descriptions.Item>
              <Descriptions.Item label="Supplier">
                {selectedContract.supplier?.legalName}
                {selectedContract.supplier?.tradeName && ` (${selectedContract.supplier.tradeName})`}
              </Descriptions.Item>
              <Descriptions.Item label="Total Value">
                {selectedContract.currency} {selectedContract.totalValue ? Number(selectedContract.totalValue).toLocaleString() : '0'}
              </Descriptions.Item>
              <Descriptions.Item label="Contract Period">
                {new Date(selectedContract.startDate).toLocaleDateString()} to {new Date(selectedContract.endDate).toLocaleDateString()}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Form
              form={form}
              layout="vertical"
              onFinish={handleAction}
            >
              <Form.Item
                label="Comments"
                name="comments"
                rules={[
                  { required: true, message: 'Please provide comments for your decision' }
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder={`Please provide ${actionType === 'approve' ? 'approval' : 'rejection'} comments...`}
                />
              </Form.Item>

              {actionType === 'reject' && (
                <Form.Item
                  label="Rejection Reason"
                  name="reason"
                  rules={[
                    { required: true, message: 'Please provide a reason for rejection' }
                  ]}
                >
                  <Input placeholder="e.g., Insufficient documentation, Budget concerns, etc." />
                </Form.Item>
              )}

              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={actionInProgress}
                  danger={actionType === 'reject'}
                >
                  {actionType === 'approve' ? 'Approve Contract' : 'Reject Contract'}
                </Button>
                <Button
                  onClick={() => {
                    setModalVisible(false);
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>
              </Space>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
}

export default ContractsReview;
