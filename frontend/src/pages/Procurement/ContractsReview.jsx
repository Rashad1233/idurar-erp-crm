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
  Typography,
  Divider,
  Alert,
  Row,
  Col,
  Descriptions
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  FileProtectOutlined,
  MailOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ContractsReview = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [actionType, setActionType] = useState('approve'); // 'approve' or 'reject'
  const [form] = Form.useForm();

  // Load contracts pending approval
  const loadPendingContracts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/dofa/contracts/pending');
      if (response.data.success) {
        setContracts(response.data.data);
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
      message.error('Failed to load pending contracts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingContracts();
  }, []);

  // Handle approval action
  const handleAction = async (values) => {
    try {
      const endpoint = actionType === 'approve' 
        ? `/dofa/contracts/${selectedContract.id}/approve`
        : `/dofa/contracts/${selectedContract.id}/reject`;
      
      const response = await axios.post(endpoint, {
        comments: values.comments,
        notifySupplier: actionType === 'approve'
      });

      if (response.data.success) {
        message.success(`Contract ${actionType}d successfully`);
        
        // Send notification to requestor
        await sendNotificationToRequestor(selectedContract, actionType, values.comments);
        
        // If approved, send email to supplier
        if (actionType === 'approve') {
          await sendEmailToSupplier(selectedContract);
        }

        setActionModalVisible(false);
        form.resetFields();
        loadPendingContracts();
      }
    } catch (error) {
      console.error(`Error ${actionType}ing contract:`, error);
      message.error(`Failed to ${actionType} contract`);
    }
  };

  // Send notification to contract requestor
  const sendNotificationToRequestor = async (contract, action, comments) => {
    try {
      await axios.post('/api/notifications', {
        userId: contract.createdById,
        type: 'CONTRACT_DECISION',
        title: `Contract ${action.toUpperCase()}`,
        message: `Your contract "${contract.contractName}" has been ${action}d by DoFA.${comments ? ` Comments: ${comments}` : ''}`,
        data: {
          contractId: contract.id,
          action: action,
          comments: comments
        }
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // Send AI-generated email to supplier
  const sendEmailToSupplier = async (contract) => {
    try {
      // Generate email content using AI
      const emailResponse = await axios.post('/api/ai/generate-supplier-email', {
        contractData: {
          contractName: contract.contractName,
          supplierName: contract.supplier?.legalName || contract.supplier?.tradeName,
          contractNumber: contract.contractNumber,
          startDate: contract.startDate,
          endDate: contract.endDate
        }
      });

      // Send email to supplier
      await axios.post('/api/email/send-to-supplier', {
        to: contract.supplier?.contactEmail,
        subject: `Contract Approval - ${contract.contractName}`,
        htmlContent: emailResponse.data.emailContent,
        contractId: contract.id,
        includeAcceptanceButton: true
      });

      message.success('Email sent to supplier successfully');
    } catch (error) {
      console.error('Error sending email to supplier:', error);
      message.warning('Contract approved but failed to send email to supplier');
    }
  };

  // Show action modal
  const showActionModal = (contract, type) => {
    setSelectedContract(contract);
    setActionType(type);
    setActionModalVisible(true);
  };

  // Show contract details
  const showContractDetails = (contract) => {
    setSelectedContract(contract);
    setDetailModalVisible(true);
  };

  const columns = [
    {
      title: 'Contract Number',
      dataIndex: 'contractNumber',
      key: 'contractNumber',
    },
    {
      title: 'Contract Name',
      dataIndex: 'contractName',
      key: 'contractName',
    },
    {
      title: 'Supplier',
      key: 'supplier',
      render: (_, record) => record.supplier ? 
        `${record.supplier.legalName}${record.supplier.tradeName ? ` (${record.supplier.tradeName})` : ''}` : 'N/A',
    },
    {
      title: 'Value',
      dataIndex: 'totalValue',
      key: 'totalValue',
      render: (value, record) => value ? `${record.currency || 'USD'} ${parseFloat(value).toLocaleString()}` : 'N/A',
    },
    {
      title: 'Period',
      key: 'period',
      render: (_, record) => `${new Date(record.startDate).toLocaleDateString()} - ${new Date(record.endDate).toLocaleDateString()}`,
    },
    {
      title: 'Requested By',
      key: 'requestedBy',
      render: (_, record) => record.createdBy?.name || 'Unknown',
    },
    {
      title: 'Submitted Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => showContractDetails(record)}
            size="small"
          >
            View
          </Button>
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
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>
            <FileProtectOutlined /> Contracts Review (DoFA)
          </Title>
          <Text type="secondary">
            Review and approve/reject contracts pending DoFA approval
          </Text>
        </Col>
      </Row>

      <Alert
        message="DoFA Contract Approval Workflow"
        description="Upon approval, the system will automatically notify the requestor and send an AI-generated email to the supplier with acceptance button."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Card>
        <Table
          columns={columns}
          dataSource={contracts}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} contracts pending approval`
          }}
        />
      </Card>

      {/* Action Modal (Approve/Reject) */}
      <Modal
        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Contract`}
        open={actionModalVisible}
        onCancel={() => {
          setActionModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedContract && (
          <>
            <Descriptions title="Contract Details" bordered size="small">
              <Descriptions.Item label="Contract Number">{selectedContract.contractNumber}</Descriptions.Item>
              <Descriptions.Item label="Contract Name">{selectedContract.contractName}</Descriptions.Item>
              <Descriptions.Item label="Supplier">
                {selectedContract.supplier ? 
                  `${selectedContract.supplier.legalName}${selectedContract.supplier.tradeName ? ` (${selectedContract.supplier.tradeName})` : ''}` : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Value">
                {selectedContract.totalValue ? `${selectedContract.currency || 'USD'} ${parseFloat(selectedContract.totalValue).toLocaleString()}` : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleAction}
            >
              <Form.Item
                label={`${actionType === 'approve' ? 'Approval' : 'Rejection'} Comments`}
                name="comments"
                rules={[
                  { required: actionType === 'reject', message: 'Please provide rejection reason' }
                ]}
              >
                <TextArea 
                  rows={4} 
                  placeholder={actionType === 'approve' 
                    ? 'Optional approval comments...' 
                    : 'Please provide reason for rejection...'
                  } 
                />
              </Form.Item>

              {actionType === 'approve' && (
                <Alert
                  message="Upon approval, the following will happen automatically:"
                  description={
                    <ul>
                      <li>Contract status will be changed to 'Active'</li>
                      <li>Requestor will receive a notification</li>
                      <li>Supplier will receive an AI-generated email with acceptance button</li>
                    </ul>
                  }
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  icon={actionType === 'approve' ? <CheckOutlined /> : <CloseOutlined />}
                >
                  {actionType === 'approve' ? 'Approve Contract' : 'Reject Contract'}
                </Button>
                <Button onClick={() => {
                  setActionModalVisible(false);
                  form.resetFields();
                }}>
                  Cancel
                </Button>
              </Space>
            </Form>
          </>
        )}
      </Modal>

      {/* Contract Details Modal */}
      <Modal
        title="Contract Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedContract && (
          <Descriptions title="Full Contract Information" bordered>
            <Descriptions.Item label="Contract Number" span={2}>{selectedContract.contractNumber}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color="orange">{selectedContract.status?.toUpperCase()}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Contract Name" span={3}>{selectedContract.contractName}</Descriptions.Item>
            <Descriptions.Item label="Description" span={3}>{selectedContract.description || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Supplier" span={2}>
              {selectedContract.supplier ? 
                `${selectedContract.supplier.legalName}${selectedContract.supplier.tradeName ? ` (${selectedContract.supplier.tradeName})` : ''}` : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Supplier Email">
              {selectedContract.supplier?.contactEmail || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Start Date">{new Date(selectedContract.startDate).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="End Date">{new Date(selectedContract.endDate).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Total Value">
              {selectedContract.totalValue ? `${selectedContract.currency || 'USD'} ${parseFloat(selectedContract.totalValue).toLocaleString()}` : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Incoterms">{selectedContract.incoterms || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Payment Terms">{selectedContract.paymentTerms || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Currency">{selectedContract.currency || 'USD'}</Descriptions.Item>
            <Descriptions.Item label="Notes" span={3}>{selectedContract.notes || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Requested By">{selectedContract.createdBy?.name || 'Unknown'}</Descriptions.Item>
            <Descriptions.Item label="Submitted Date">{new Date(selectedContract.createdAt).toLocaleDateString()}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ContractsReview;
