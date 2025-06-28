import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Modal,
  Space,
  Typography,
  Alert,
  message,
  Tooltip,
  Switch,
  Divider,
  Row,
  Col,
  Tag,
  Steps,
  Descriptions
} from 'antd';
import {
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

const ApprovalWorkflows = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'view'
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [form] = Form.useForm();

  // Mock data - replace with actual API calls
  const [workflows, setWorkflows] = useState([
    {
      id: 1,
      name: 'Standard Purchase Order Approval',
      entityType: 'purchase_order',
      isActive: true,
      thresholds: [
        { minAmount: 0, maxAmount: 1000, level: 1, role: 'Supervisor', email: 'supervisor@company.com' },
        { minAmount: 1000, maxAmount: 10000, level: 2, role: 'Manager', email: 'manager@company.com' },
        { minAmount: 10000, maxAmount: 50000, level: 3, role: 'Director', email: 'director@company.com' },
        { minAmount: 50000, maxAmount: 999999999, level: 4, role: 'CEO', email: 'ceo@company.com' }
      ],
      description: 'Standard approval workflow for purchase orders based on monetary thresholds',
      createdBy: 'Admin',
      createdAt: '2024-01-01',
      lastModified: '2024-01-15'
    },
    {
      id: 2,
      name: 'Contract Approval Workflow',
      entityType: 'contract',
      isActive: true,
      thresholds: [
        { minAmount: 0, maxAmount: 25000, level: 1, role: 'Legal Team', email: 'legal@company.com' },
        { minAmount: 25000, maxAmount: 100000, level: 2, role: 'Director', email: 'director@company.com' },
        { minAmount: 100000, maxAmount: 999999999, level: 3, role: 'CEO', email: 'ceo@company.com' }
      ],
      description: 'Approval workflow for contracts requiring legal and executive review',
      createdBy: 'Legal Admin',
      createdAt: '2024-01-05',
      lastModified: '2024-01-10'
    },
    {
      id: 3,
      name: 'RFQ Response Evaluation',
      entityType: 'rfq',
      isActive: true,
      thresholds: [
        { minAmount: 0, maxAmount: 50000, level: 1, role: 'Procurement Team', email: 'procurement@company.com' },
        { minAmount: 50000, maxAmount: 999999999, level: 2, role: 'Director', email: 'director@company.com' }
      ],
      description: 'Workflow for evaluating and approving RFQ responses from suppliers',
      createdBy: 'Procurement Admin',
      createdAt: '2024-01-08',
      lastModified: '2024-01-12'
    }
  ]);

  const handleSaveWorkflow = async (values) => {
    setLoading(true);
    try {
      if (modalType === 'create') {
        // API call to create workflow
        const newWorkflow = {
          id: Date.now(),
          ...values,
          createdBy: 'Current User',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        };
        setWorkflows([...workflows, newWorkflow]);
        message.success('Approval workflow created successfully');
      } else if (modalType === 'edit') {
        // API call to update workflow
        const updatedWorkflows = workflows.map(w => 
          w.id === currentWorkflow.id 
            ? { ...w, ...values, lastModified: new Date().toISOString() }
            : w
        );
        setWorkflows(updatedWorkflows);
        message.success('Approval workflow updated successfully');
      }
      
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to save approval workflow');
    }
    setLoading(false);
  };

  const handleDeleteWorkflow = async (workflowId) => {
    Modal.confirm({
      title: 'Delete Approval Workflow',
      content: 'Are you sure you want to delete this workflow? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          // API call to delete workflow
          setWorkflows(workflows.filter(w => w.id !== workflowId));
          message.success('Approval workflow deleted successfully');
        } catch (error) {
          message.error('Failed to delete approval workflow');
        }
      }
    });
  };

  const handleToggleActive = async (workflowId, isActive) => {
    try {
      // API call to toggle workflow status
      const updatedWorkflows = workflows.map(w => 
        w.id === workflowId ? { ...w, isActive: !isActive } : w
      );
      setWorkflows(updatedWorkflows);
      message.success(`Workflow ${isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      message.error('Failed to update workflow status');
    }
  };

  const columns = [
    {
      title: 'Workflow Name',
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
      title: 'Entity Type',
      dataIndex: 'entityType',
      key: 'entityType',
      render: (type) => {
        const typeConfig = {
          purchase_order: { color: 'blue', text: 'Purchase Order' },
          contract: { color: 'green', text: 'Contract' },
          rfq: { color: 'purple', text: 'RFQ' }
        };
        const config = typeConfig[type] || { color: 'default', text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Approval Levels',
      key: 'levels',
      render: (_, record) => record.thresholds?.length || 0,
    },
    {
      title: 'Amount Range',
      key: 'amountRange',
      render: (_, record) => {
        if (!record.thresholds?.length) return '-';
        const min = Math.min(...record.thresholds.map(t => t.minAmount));
        const max = Math.max(...record.thresholds.map(t => t.maxAmount));
        return `$${min.toLocaleString()} - $${max === 999999999 ? '∞' : max.toLocaleString()}`;
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record.id, isActive)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
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
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setCurrentWorkflow(record);
                setModalType('view');
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Workflow">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setCurrentWorkflow(record);
                setModalType('edit');
                form.setFieldsValue(record);
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete Workflow">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => handleDeleteWorkflow(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const thresholdColumns = [
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 80,
    },
    {
      title: 'Min Amount',
      dataIndex: 'minAmount',
      key: 'minAmount',
      render: (amount) => `$${amount.toLocaleString()}`,
    },
    {
      title: 'Max Amount',
      dataIndex: 'maxAmount',
      key: 'maxAmount',
      render: (amount) => amount === 999999999 ? '∞' : `$${amount.toLocaleString()}`,
    },
    {
      title: 'Approver Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <SettingOutlined /> Approval Workflows
        </Title>
        <Text type="secondary">
          Configure approval chains, thresholds, and delegation rules for different document types
        </Text>
      </div>

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
            Create New Workflow
          </Button>
        </div>

        <Table
          dataSource={workflows}
          columns={columns}
          rowKey="id"
          size="small"
        />
      </Card>

      {/* Workflow Modal */}
      <Modal
        title={
          modalType === 'create' ? 'Create Approval Workflow' :
          modalType === 'edit' ? 'Edit Approval Workflow' :
          'Workflow Details'
        }
        visible={modalVisible}
        onOk={() => {
          if (modalType === 'view') {
            setModalVisible(false);
          } else {
            form.submit();
          }
        }}
        onCancel={() => setModalVisible(false)}
        width={800}
        confirmLoading={loading}
        okText={modalType === 'view' ? 'Close' : 'Save'}
        cancelText="Cancel"
      >
        {modalType === 'view' && currentWorkflow ? (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Workflow Name">
                {currentWorkflow.name}
              </Descriptions.Item>
              <Descriptions.Item label="Entity Type">
                <Tag color="blue">{currentWorkflow.entityType}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={currentWorkflow.isActive ? 'success' : 'default'}>
                  {currentWorkflow.isActive ? 'Active' : 'Inactive'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created By">
                {currentWorkflow.createdBy}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {currentWorkflow.description}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Approval Thresholds</Divider>
            
            <Table
              dataSource={currentWorkflow.thresholds}
              columns={thresholdColumns}
              pagination={false}
              size="small"
            />

            <Divider>Approval Flow Visualization</Divider>
            
            <Steps
              direction="vertical"
              size="small"
              current={-1}
            >
              {currentWorkflow.thresholds?.map((threshold, index) => (
                <Step
                  key={index}
                  title={`Level ${threshold.level} - ${threshold.role}`}
                  description={
                    <div>
                      <Text>Amount: ${threshold.minAmount.toLocaleString()} - {threshold.maxAmount === 999999999 ? '∞' : `$${threshold.maxAmount.toLocaleString()}`}</Text>
                      <br />
                      <Text type="secondary">Approver: {threshold.email}</Text>
                    </div>
                  }
                  icon={<UserOutlined />}
                />
              ))}
            </Steps>
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveWorkflow}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Workflow Name"
                  rules={[{ required: true, message: 'Please enter workflow name' }]}
                >
                  <Input placeholder="Enter workflow name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="entityType"
                  label="Entity Type"
                  rules={[{ required: true, message: 'Please select entity type' }]}
                >
                  <Select placeholder="Select entity type">
                    <Option value="purchase_order">Purchase Order</Option>
                    <Option value="contract">Contract</Option>
                    <Option value="rfq">RFQ</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <TextArea rows={3} placeholder="Describe the workflow purpose and usage" />
            </Form.Item>

            <Form.Item
              name="isActive"
              label="Status"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>

            <Divider>Approval Thresholds</Divider>

            <Alert
              message="Approval Threshold Configuration"
              description="Define monetary thresholds and corresponding approvers. The system will automatically route documents to the appropriate approver based on the total amount."
              type="info"
              style={{ marginBottom: 16 }}
            />

            <Form.List name="thresholds">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} size="small" style={{ marginBottom: 8 }}>
                      <Row gutter={16}>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, 'level']}
                            label="Level"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <InputNumber min={1} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            {...restField}
                            name={[name, 'minAmount']}
                            label="Min Amount"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <InputNumber
                              min={0}
                              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={value => value.replace(/\$\s?|(,*)/g, '')}
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            {...restField}
                            name={[name, 'maxAmount']}
                            label="Max Amount"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <InputNumber
                              min={0}
                              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={value => value.replace(/\$\s?|(,*)/g, '')}
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, 'role']}
                            label="Role"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <Input placeholder="Role" />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            {...restField}
                            name={[name, 'email']}
                            label="Email"
                            rules={[
                              { required: true, message: 'Required' },
                              { type: 'email', message: 'Invalid email' }
                            ]}
                          >
                            <Input placeholder="approver@company.com" />
                          </Form.Item>
                        </Col>
                        <Col span={1}>
                          <Form.Item label=" ">
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => remove(name)}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Approval Threshold
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ApprovalWorkflows;