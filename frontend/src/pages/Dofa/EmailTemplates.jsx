import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Form,
  Input,
  Select,
  Modal,
  Space,
  Typography,
  Alert,
  message,
  Tooltip,
  Switch,
  Tabs,
  Tag,
  Preview,
  Divider
} from 'antd';
import {
  MailOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SendOutlined,
  CopyOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const EmailTemplates = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  const [modalVisible, setModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'preview', 'test'
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [form] = Form.useForm();

  // Mock data - replace with actual API calls
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'RFQ Invitation Email',
      type: 'rfq_invitation',
      subject: 'Request for Quotation - {rfqNumber}',
      isActive: true,
      language: 'English',
      lastModified: '2024-01-15',
      usageCount: 25,
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1890ff;">Request for Quotation</h2>
          <p>Dear {supplierName},</p>
          <p>We are pleased to invite you to submit a quotation for the following procurement opportunity.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3>RFQ Details</h3>
            <p><strong>RFQ Number:</strong> {rfqNumber}</p>
            <p><strong>Submission Deadline:</strong> {submissionDeadline}</p>
            <p><strong>Description:</strong> {description}</p>
          </div>
          <p>Please click the button below to review requirements and submit your quotation.</p>
        </div>
      `
    },
    {
      id: 2,
      name: 'Purchase Order Approval Request',
      type: 'po_approval',
      subject: 'Purchase Order Approval Required - {poNumber}',
      isActive: true,
      language: 'English',
      lastModified: '2024-01-12',
      usageCount: 18,
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #fa8c16;">Purchase Order Approval Required</h2>
          <p>Dear {approverName},</p>
          <p>A purchase order requires your approval. Please review the details below.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3>Purchase Order Details</h3>
            <p><strong>PO Number:</strong> {poNumber}</p>
            <p><strong>Supplier:</strong> {supplierName}</p>
            <p><strong>Total Amount:</strong> {currency} {totalAmount}</p>
          </div>
          <p>Please click the button below to review and approve or reject this purchase order.</p>
        </div>
      `
    },
    {
      id: 3,
      name: 'Contract Acceptance Request',
      type: 'contract_acceptance',
      subject: 'Contract Acceptance Required - {contractNumber}',
      isActive: true,
      language: 'English',
      lastModified: '2024-01-10',
      usageCount: 12,
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1890ff;">Contract Acceptance Required</h2>
          <p>Dear {supplierName},</p>
          <p>We have prepared a contract for your review and acceptance.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3>Contract Details</h3>
            <p><strong>Contract Number:</strong> {contractNumber}</p>
            <p><strong>Supplier:</strong> {supplierName}</p>
            <p><strong>Status:</strong> Awaiting Your Acceptance</p>
          </div>
          <p>Please review the contract terms and accept to proceed with our partnership.</p>
        </div>
      `
    },
    {
      id: 4,
      name: 'Supplier Onboarding Welcome',
      type: 'supplier_welcome',
      subject: 'Welcome to Our Supplier Network - Action Required',
      isActive: true,
      language: 'English',
      lastModified: '2024-01-08',
      usageCount: 8,
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #52c41a;">Welcome to Our Supplier Network</h2>
          <p>Dear {supplierName},</p>
          <p>Welcome! We're excited to begin our business relationship with you.</p>
          <p>To complete your onboarding, please click the link below to accept our supplier agreement.</p>
          <div style="background: #f6ffed; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3>Next Steps</h3>
            <p>• Review and accept supplier agreement</p>
            <p>• Complete supplier profile</p>
            <p>• Begin receiving RFQ invitations</p>
          </div>
        </div>
      `
    }
  ]);

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.company.com',
    smtpPort: 587,
    smtpUser: 'procurement@company.com',
    smtpSecure: true,
    defaultFrom: 'procurement@company.com',
    defaultFromName: 'Procurement Team',
    signatureEnabled: true,
    signature: `
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e8e8e8;">
        <p style="margin: 0; color: #666; font-size: 12px;">
          Best regards,<br>
          <strong>Procurement Team</strong><br>
          Company Name | procurement@company.com
        </p>
      </div>
    `
  });

  const handleSaveTemplate = async (values) => {
    setLoading(true);
    try {
      if (modalType === 'create') {
        const newTemplate = {
          id: Date.now(),
          ...values,
          lastModified: new Date().toISOString(),
          usageCount: 0
        };
        setTemplates([...templates, newTemplate]);
        message.success('Email template created successfully');
      } else if (modalType === 'edit') {
        const updatedTemplates = templates.map(t => 
          t.id === currentTemplate.id 
            ? { ...t, ...values, lastModified: new Date().toISOString() }
            : t
        );
        setTemplates(updatedTemplates);
        message.success('Email template updated successfully');
      }
      
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to save email template');
    }
    setLoading(false);
  };

  const handleDeleteTemplate = async (templateId) => {
    Modal.confirm({
      title: 'Delete Email Template',
      content: 'Are you sure you want to delete this template? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          setTemplates(templates.filter(t => t.id !== templateId));
          message.success('Email template deleted successfully');
        } catch (error) {
          message.error('Failed to delete email template');
        }
      }
    });
  };

  const handleSendTestEmail = async (values) => {
    setLoading(true);
    try {
      // API call to send test email
      message.success(`Test email sent to ${values.testEmail}`);
      setModalVisible(false);
    } catch (error) {
      message.error('Failed to send test email');
    }
    setLoading(false);
  };

  const templateColumns = [
    {
      title: 'Template Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Text strong>{text}</Text>
          {!record.isActive && <Tag color="default">Inactive</Tag>}
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeConfig = {
          rfq_invitation: { color: 'purple', text: 'RFQ Invitation' },
          po_approval: { color: 'orange', text: 'PO Approval' },
          contract_acceptance: { color: 'blue', text: 'Contract Acceptance' },
          supplier_welcome: { color: 'green', text: 'Supplier Welcome' }
        };
        const config = typeConfig[type] || { color: 'default', text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
    },
    {
      title: 'Usage Count',
      dataIndex: 'usageCount',
      key: 'usageCount',
      render: (count) => <Text type="secondary">{count} sent</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Last Modified',
      dataIndex: 'lastModified',
      key: 'lastModified',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Preview Template">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setCurrentTemplate(record);
                setPreviewVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Template">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setCurrentTemplate(record);
                setModalType('edit');
                form.setFieldsValue(record);
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Send Test Email">
            <Button
              icon={<SendOutlined />}
              size="small"
              onClick={() => {
                setCurrentTemplate(record);
                setModalType('test');
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Duplicate Template">
            <Button
              icon={<CopyOutlined />}
              size="small"
              onClick={() => {
                const duplicated = {
                  ...record,
                  id: Date.now(),
                  name: `${record.name} (Copy)`,
                  usageCount: 0,
                  lastModified: new Date().toISOString()
                };
                setTemplates([...templates, duplicated]);
                message.success('Template duplicated successfully');
              }}
            />
          </Tooltip>
          <Tooltip title="Delete Template">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => handleDeleteTemplate(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'templates',
      label: (
        <Space>
          <MailOutlined />
          Email Templates
        </Space>
      ),
      children: (
        <Card>
          <div style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setModalType('create');
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Create New Template
            </Button>
          </div>

          <Table
            dataSource={templates}
            columns={templateColumns}
            rowKey="id"
            size="small"
          />
        </Card>
      ),
    },
    {
      key: 'settings',
      label: (
        <Space>
          <CheckCircleOutlined />
          Email Settings
        </Space>
      ),
      children: (
        <Card title="Email Configuration">
          <Form
            layout="vertical"
            initialValues={emailSettings}
            onFinish={(values) => {
              setEmailSettings(values);
              message.success('Email settings updated successfully');
            }}
          >
            <Alert
              message="SMTP Configuration"
              description="Configure your email server settings to enable email sending functionality."
              type="info"
              style={{ marginBottom: 24 }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <Form.Item
                name="smtpHost"
                label="SMTP Host"
                rules={[{ required: true, message: 'Please enter SMTP host' }]}
              >
                <Input placeholder="smtp.company.com" />
              </Form.Item>

              <Form.Item
                name="smtpPort"
                label="SMTP Port"
                rules={[{ required: true, message: 'Please enter SMTP port' }]}
              >
                <Input placeholder="587" />
              </Form.Item>

              <Form.Item
                name="smtpUser"
                label="SMTP Username"
                rules={[{ required: true, message: 'Please enter SMTP username' }]}
              >
                <Input placeholder="user@company.com" />
              </Form.Item>

              <Form.Item
                name="defaultFrom"
                label="Default From Email"
                rules={[{ required: true, message: 'Please enter default from email' }]}
              >
                <Input placeholder="procurement@company.com" />
              </Form.Item>

              <Form.Item
                name="defaultFromName"
                label="Default From Name"
              >
                <Input placeholder="Procurement Team" />
              </Form.Item>

              <Form.Item
                name="smtpSecure"
                label="Use TLS/SSL"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </div>

            <Divider />

            <Form.Item
              name="signatureEnabled"
              label="Enable Email Signature"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="signature"
              label="Email Signature"
            >
              <TextArea
                rows={6}
                placeholder="Enter your email signature HTML..."
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Settings
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <MailOutlined /> Email Templates
        </Title>
        <Text type="secondary">
          Customize approval emails, notifications, and communication templates
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />

      {/* Template Modal */}
      <Modal
        title={
          modalType === 'create' ? 'Create Email Template' :
          modalType === 'edit' ? 'Edit Email Template' :
          'Send Test Email'
        }
        visible={modalVisible}
        onOk={() => {
          if (modalType === 'test') {
            form.submit();
          } else {
            form.submit();
          }
        }}
        onCancel={() => setModalVisible(false)}
        width={800}
        confirmLoading={loading}
        okText={modalType === 'test' ? 'Send Test' : 'Save'}
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={modalType === 'test' ? handleSendTestEmail : handleSaveTemplate}
        >
          {modalType === 'test' ? (
            <>
              <Alert
                message="Test Email"
                description={`Send a test email using the template "${currentTemplate?.name}" to verify formatting and content.`}
                type="info"
                style={{ marginBottom: 16 }}
              />
              
              <Form.Item
                name="testEmail"
                label="Test Email Address"
                rules={[
                  { required: true, message: 'Please enter test email' },
                  { type: 'email', message: 'Please enter valid email' }
                ]}
              >
                <Input placeholder="test@company.com" />
              </Form.Item>
            </>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <Form.Item
                  name="name"
                  label="Template Name"
                  rules={[{ required: true, message: 'Please enter template name' }]}
                >
                  <Input placeholder="Enter template name" />
                </Form.Item>

                <Form.Item
                  name="type"
                  label="Template Type"
                  rules={[{ required: true, message: 'Please select template type' }]}
                >
                  <Select placeholder="Select template type">
                    <Option value="rfq_invitation">RFQ Invitation</Option>
                    <Option value="po_approval">PO Approval</Option>
                    <Option value="contract_acceptance">Contract Acceptance</Option>
                    <Option value="supplier_welcome">Supplier Welcome</Option>
                  </Select>
                </Form.Item>
              </div>

              <Form.Item
                name="subject"
                label="Email Subject"
                rules={[{ required: true, message: 'Please enter email subject' }]}
              >
                <Input placeholder="Enter email subject (use variables like {rfqNumber})" />
              </Form.Item>

              <Form.Item
                name="language"
                label="Language"
                initialValue="English"
              >
                <Select>
                  <Option value="English">English</Option>
                  <Option value="Spanish">Spanish</Option>
                  <Option value="French">French</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="content"
                label="Email Content (HTML)"
                rules={[{ required: true, message: 'Please enter email content' }]}
              >
                <TextArea
                  rows={12}
                  placeholder="Enter HTML email content (use variables like {supplierName}, {rfqNumber})"
                />
              </Form.Item>

              <Form.Item
                name="isActive"
                label="Active"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>

              <Alert
                message="Available Variables"
                description="Use these variables in your template: {supplierName}, {rfqNumber}, {poNumber}, {contractNumber}, {totalAmount}, {currency}, {submissionDeadline}, {approverName}"
                type="info"
              />
            </>
          )}
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title="Template Preview"
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {currentTemplate && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Subject: </Text>
              <Text>{currentTemplate.subject}</Text>
            </div>
            <Divider />
            <div
              style={{
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                padding: '16px',
                backgroundColor: '#fafafa'
              }}
              dangerouslySetInnerHTML={{ __html: currentTemplate.content }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmailTemplates;