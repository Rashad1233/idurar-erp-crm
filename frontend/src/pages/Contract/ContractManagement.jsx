import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber, 
  Divider,
  Card,
  Row,
  Col,
  message,
  Popconfirm,
  Typography,
  Tabs,
  AutoComplete,
  Drawer,
  Alert,
  Badge,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import axios from '../../api/axiosConfig';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Title } = Typography;
const { TabPane } = Tabs;

const ContractManagement = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [itemMasters, setItemMasters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [itemDrawerVisible, setItemDrawerVisible] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [contractItems, setContractItems] = useState([]);
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();
  // Auto-generate contract number
  const generateContractNumber = () => {
    const prefix = 'CTR';
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}-${year}-${timestamp}${random}`;
  };

  // Load contracts
  const loadContracts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/procurement/contract');
      if (response.data.success) {
        setContracts(response.data.data);
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
      message.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };
  // Load suppliers
  const loadSuppliers = async () => {
    try {
      const response = await axios.get('/procurement/supplier');
      if (response.data.success) {
        setSuppliers(response.data.data);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      message.error('Failed to load suppliers');
    }
  };
  // Load item masters
  const loadItemMasters = async () => {
    try {
      const response = await axios.get('/procurement/item-master');
      if (response.data.success) {
        setItemMasters(response.data.data);
      }
    } catch (error) {
      console.error('Error loading item masters:', error);
      message.error('Failed to load item masters');
    }
  };
  // Load contract items
  const loadContractItems = async (contractId) => {
    try {
      const response = await axios.get(`/procurement/contract/${contractId}/items`);
      if (response.data.success) {
        setContractItems(response.data.data);
      }
    } catch (error) {
      console.error('Error loading contract items:', error);
      message.error('Failed to load contract items');
    }
  };
  useEffect(() => {
    loadContracts();
    loadSuppliers();
    loadItemMasters();
  }, []);
  // Create or update contract
  const handleSubmit = async (values) => {
    try {
      const contractData = {
        ...values,
        contractNumber: values.contractNumber || generateContractNumber(),
        startDate: values.contractDates[0].format('YYYY-MM-DD'),
        endDate: values.contractDates[1].format('YYYY-MM-DD'),
        contractDates: undefined // Remove the range picker field
      };

      if (editingContract) {
        await axios.put(`/procurement/contract/${editingContract.id}`, contractData);
        message.success('Contract updated successfully');
      } else {
        await axios.post('/procurement/contract', contractData);
        message.success('Contract created successfully');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingContract(null);
      loadContracts();
    } catch (error) {
      console.error('Error saving contract:', error);
      message.error('Failed to save contract');
    }
  };

  // Edit contract
  const handleEdit = (contract) => {
    setEditingContract(contract);
    form.setFieldsValue({
      ...contract,
      contractDates: [moment(contract.startDate), moment(contract.endDate)]
    });
    setModalVisible(true);
  };

  // Delete contract
  const handleDelete = async (contractId) => {
    try {
      await axios.delete(`/procurement/contract/${contractId}`);
      message.success('Contract deleted successfully');
      loadContracts();
    } catch (error) {
      console.error('Error deleting contract:', error);
      message.error('Failed to delete contract');
    }
  };
  // View contract details
  const handleView = (contract) => {
    setSelectedContract(contract);
    loadContractItems(contract.id);
    setItemDrawerVisible(true);
  };

  // Add item to contract
  const handleAddItem = async (values) => {
    try {
      const selectedItem = itemMasters.find(item => item.id === values.itemId);
      const itemData = {
        itemNumber: selectedItem.itemNumber,
        description: selectedItem.shortDescription,
        uom: selectedItem.uom,
        unitPrice: values.unitPrice,
        leadTime: values.leadTime,
        minimumOrderQuantity: values.minimumOrderQuantity,
        notes: values.notes
      };

      await axios.post(`/procurement/contract/${selectedContract.id}/items`, itemData);
      message.success('Item added to contract successfully');
      itemForm.resetFields();
      loadContractItems(selectedContract.id);
    } catch (error) {
      console.error('Error adding item to contract:', error);
      message.error('Failed to add item to contract');
    }
  };

  // Remove item from contract
  const handleRemoveItem = async (itemId) => {
    try {
      await axios.delete(`/procurement/contract/item/${itemId}`);
      message.success('Item removed from contract successfully');
      loadContractItems(selectedContract.id);
    } catch (error) {
      console.error('Error removing item from contract:', error);
      message.error('Failed to remove item from contract');
    }
  };

  // Submit contract for approval
  const submitContract = async (contractId) => {
    try {
      const response = await axios.post(`/procurement/contract/${contractId}/submit`);
      if (response.data.success) {
        message.success('Contract submitted for approval');
        loadContracts();
      } else {
        message.error(response.data.message || 'Failed to submit contract');
      }
    } catch (error) {
      message.error('Error submitting contract');
    }
  };

  const columns = [    {
      title: 'Contract Number',
      dataIndex: 'contractNumber',
      key: 'contractNumber',
      render: (text, record) => (
        <Button type="link" onClick={() => handleView(record)}>
          {text}
        </Button>
      )
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
      render: (text, record) => record.supplier ? `${record.supplier.legalName}${record.supplier.tradeName ? ' (' + record.supplier.tradeName + ')' : ''}` : '',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          draft: 'orange',
          active: 'green',
          expired: 'red',
          terminated: 'grey'
        };
        const icons = {
          draft: <ExclamationCircleOutlined />,
          active: <CheckCircleOutlined />,
          expired: <InfoCircleOutlined />,
          terminated: <InfoCircleOutlined />
        };
        return (
          <Tag color={colors[status]} icon={icons[status]}>
            {status.toUpperCase()}
          </Tag>
        );
      }
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => moment(date).format('YYYY-MM-DD')
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => moment(date).format('YYYY-MM-DD')
    },
    {
      title: 'Total Value',
      dataIndex: 'totalValue',
      key: 'totalValue',
      render: (value, record) => `${record.currency} ${Number(value).toLocaleString()}`
    },
    {
      title: 'Actions',
      key: 'actions',      render: (text, record) => (
        <Space>
          <Tooltip title="View Contract Details">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Contract">
            <Button 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this contract?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Contract">
              <Button 
                icon={<DeleteOutlined />} 
                danger
              />
            </Tooltip>
          </Popconfirm>
          {record.status === 'draft' && (
            <Button type="primary" onClick={() => submitContract(record.id)}>
              Submit for Approval
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>
            <FileTextOutlined /> Contract Management
          </Title>
          <p>
            Build contracts with suppliers for regular items to ensure competitive delivery time, quality and price.
            <br />
            Follow competitive process for standard items and establish contracts for selected suppliers.
          </p>
        </Col>
        <Col>          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingContract(null);
              form.resetFields();
              form.setFieldsValue({
                contractNumber: generateContractNumber(),
                status: 'draft',
                currency: 'USD',
                incoterms: 'DDP',
                paymentTerms: '30 days'
              });
              setModalVisible(true);
            }}
          >
            Create Contract
          </Button>
        </Col>
      </Row>

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
            showTotal: (total) => `Total ${total} contracts`
          }}
        />
      </Card>

      <Modal
        title={editingContract ? 'Edit Contract' : 'Create New Contract'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingContract(null);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'draft',
            currency: 'USD',
            incoterms: 'DDP',
            paymentTerms: '30 days'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Contract Name"
                name="contractName"
                rules={[{ required: true, message: 'Please enter contract name' }]}
                help="e.g., Supply of Maintenance Materials, Provision of Fabrication Services"
              >
                <Input placeholder="e.g., Supply of Maintenance Materials" />
              </Form.Item>
            </Col>
            <Col span={12}>              <Form.Item
                label="Contract Number"
                name="contractNumber"
                rules={[{ required: true, message: 'Please enter contract number' }]}
                help="Auto-generated template number"
              >
                <Input 
                  placeholder="Auto-generated contract number" 
                  suffix={
                    <Tooltip title="Auto-generate contract number">
                      <Button 
                        type="link" 
                        size="small"
                        onClick={() => form.setFieldsValue({ contractNumber: generateContractNumber() })}
                      >
                        Generate
                      </Button>
                    </Tooltip>
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea rows={3} placeholder="Contract description and scope" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Registered Supplier"
                name="supplierId"
                rules={[{ required: true, message: 'Please select a registered supplier' }]}
                help="Select supplier from competitive process"
              >
                <Select
                  placeholder="Select registered supplier"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {suppliers.map(supplier => (
                    <Option key={supplier.id} value={supplier.id}>
                      {supplier.legalName}{supplier.tradeName ? ` (${supplier.tradeName})` : ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select>
                  <Option value="draft">Draft</Option>
                  <Option value="active">Active</Option>
                  <Option value="expired">Expired</Option>
                  <Option value="terminated">Terminated</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Contract Period"
                name="contractDates"
                rules={[{ required: true, message: 'Please select contract period' }]}
              >
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Currency"
                name="currency"
              >
                <Select>
                  <Option value="USD">USD</Option>
                  <Option value="EUR">EUR</Option>
                  <Option value="GBP">GBP</Option>
                  <Option value="CAD">CAD</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Total Value"
                name="totalValue"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={0.01}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Incoterms"
                name="incoterms"
                help="Delivery terms (DDP, FCA, CIP, EXW, etc.)"
              >                <Select>
                  <Option value="DDP">DDP (Delivered Duty Paid)</Option>
                  <Option value="FCA">FCA (Free Carrier)</Option>
                  <Option value="CIP">CIP (Carriage and Insurance Paid)</Option>
                  <Option value="EXW">EXW (Ex Works)</Option>
                  <Option value="FOB">FOB (Free on Board)</Option>
                  <Option value="CFR">CFR (Cost and Freight)</Option>
                  <Option value="CIF">CIF (Cost, Insurance and Freight)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Payment Terms"
                name="paymentTerms"
                help="Payment terms (30 days, 45 days, prepayment, etc.)"
              >                <Select>
                  <Option value="30 days">Net 30 days</Option>
                  <Option value="45 days">Net 45 days</Option>
                  <Option value="60 days">Net 60 days</Option>
                  <Option value="15 days">Net 15 days</Option>
                  <Option value="Prepayment">Prepayment Required</Option>
                  <Option value="Cash on delivery">Cash on Delivery</Option>
                  <Option value="2/10 net 30">2/10 Net 30</Option>
                  <Option value="Letter of credit">Letter of Credit</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Notes"
            name="notes"
          >
            <TextArea rows={3} placeholder="Additional notes and terms" />
          </Form.Item>

          <Divider />          <div style={{ backgroundColor: '#f6f6f6', padding: 16, borderRadius: 4, marginBottom: 16 }}>
            <Title level={5}>Contract Process:</Title>
            <ul>
              <li>✅ Contract template selected (number auto-generated)</li>
              <li>✅ Contract name inputted manually</li>
              <li>✅ Registered supplier selected</li>
              <li>🔄 Add materials or services (must be mastered through Item Master)</li>
              <li>🔄 Validate item UoM (Unit of Measure)</li>
              <li>🔄 Add item prices and default lead times</li>
              <li>✅ Configure incoterms and payment terms</li>
            </ul>
            <Alert 
              message="After creating the contract, use the 'View Details' button to add items and configure pricing." 
              type="info" 
              showIcon 
            />
          </div>

          <Space>
            <Button type="primary" htmlType="submit">
              {editingContract ? 'Update Contract' : 'Create Contract'}
            </Button>
            <Button onClick={() => {
              setModalVisible(false);
              form.resetFields();
              setEditingContract(null);
            }}>
              Cancel
            </Button>
          </Space>        </Form>
      </Modal>

      {/* Contract Items Management Drawer */}
      <Drawer
        title={
          <Space>
            <FileTextOutlined />
            Contract Details: {selectedContract?.contractName}
            <Tag color={selectedContract?.status === 'active' ? 'green' : 'orange'}>
              {selectedContract?.status?.toUpperCase()}
            </Tag>
          </Space>
        }
        placement="right"
        onClose={() => {
          setItemDrawerVisible(false);
          setSelectedContract(null);
          setContractItems([]);
        }}
        open={itemDrawerVisible}
        width={800}
      >
        {selectedContract && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Contract Information" key="1">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card size="small" title="Basic Information">
                    <p><strong>Contract Number:</strong> {selectedContract.contractNumber}</p>
                    <p><strong>Supplier:</strong> {selectedContract.supplier?.name}</p>
                    <p><strong>Status:</strong> 
                      <Tag color={selectedContract.status === 'active' ? 'green' : 'orange'} style={{ marginLeft: 8 }}>
                        {selectedContract.status?.toUpperCase()}
                      </Tag>
                    </p>
                    <p><strong>Period:</strong> {moment(selectedContract.startDate).format('YYYY-MM-DD')} to {moment(selectedContract.endDate).format('YYYY-MM-DD')}</p>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="Commercial Terms">
                    <p><strong>Currency:</strong> {selectedContract.currency}</p>
                    <p><strong>Total Value:</strong> {selectedContract.currency} {Number(selectedContract.totalValue || 0).toLocaleString()}</p>
                    <p><strong>Incoterms:</strong> {selectedContract.incoterms}</p>
                    <p><strong>Payment Terms:</strong> {selectedContract.paymentTerms}</p>
                  </Card>
                </Col>
                {selectedContract.description && (
                  <Col span={24}>
                    <Card size="small" title="Description">
                      <p>{selectedContract.description}</p>
                    </Card>
                  </Col>
                )}
                {selectedContract.notes && (
                  <Col span={24}>
                    <Card size="small" title="Notes">
                      <p>{selectedContract.notes}</p>
                    </Card>
                  </Col>
                )}
              </Row>
            </TabPane>
            
            <TabPane 
              tab={
                <Badge count={contractItems.length} offset={[10, 0]}>
                  <ShoppingCartOutlined /> Contract Items
                </Badge>
              } 
              key="2"
            >
              <div style={{ marginBottom: 16 }}>
                <Alert
                  message="Add Items/Services to Contract"
                  description="Materials or services must be mastered through Item Master before adding to contract. Item UoM will be validated automatically."
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                
                <Form
                  form={itemForm}
                  layout="inline"
                  onFinish={handleAddItem}
                  style={{ marginBottom: 16 }}
                >
                  <Form.Item
                    name="itemId"
                    rules={[{ required: true, message: 'Please select an item' }]}
                    style={{ width: 200 }}
                  >
                    <Select
                      placeholder="Select item from Item Master"
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {itemMasters.map(item => (
                        <Option key={item.id} value={item.id}>
                          {item.itemNumber} - {item.shortDescription}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    name="unitPrice"
                    rules={[{ required: true, message: 'Enter unit price' }]}
                  >
                    <InputNumber
                      placeholder="Unit Price"
                      min={0}
                      step={0.01}
                      style={{ width: 120 }}
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="leadTime"
                  >
                    <InputNumber
                      placeholder="Lead Time (days)"
                      min={0}
                      style={{ width: 120 }}
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="minimumOrderQuantity"
                  >
                    <InputNumber
                      placeholder="Min Order Qty"
                      min={0}
                      step={0.01}
                      style={{ width: 120 }}
                    />
                  </Form.Item>
                  
                  <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                      Add Item
                    </Button>
                  </Form.Item>
                </Form>
              </div>

              <Table
                dataSource={contractItems}
                rowKey="id"
                size="small"
                columns={[
                  {
                    title: 'Item Number',
                    dataIndex: 'itemNumber',
                    key: 'itemNumber',
                  },
                  {
                    title: 'Description',
                    dataIndex: 'description',
                    key: 'description',
                  },
                  {
                    title: 'UoM',
                    dataIndex: 'uom',
                    key: 'uom',
                    render: (uom) => <Tag>{uom}</Tag>
                  },
                  {
                    title: 'Unit Price',
                    dataIndex: 'unitPrice',
                    key: 'unitPrice',
                    render: (price) => `${selectedContract.currency} ${Number(price).toFixed(2)}`
                  },
                  {
                    title: 'Lead Time',
                    dataIndex: 'leadTime',
                    key: 'leadTime',
                    render: (days) => days ? `${days} days` : '-'
                  },
                  {
                    title: 'Min Order Qty',
                    dataIndex: 'minimumOrderQuantity',
                    key: 'minimumOrderQuantity',
                    render: (qty) => qty || '-'
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    render: (text, record) => (
                      <Popconfirm
                        title="Remove this item from contract?"
                        onConfirm={() => handleRemoveItem(record.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button 
                          type="link" 
                          danger 
                          size="small"
                          icon={<DeleteOutlined />}
                        >
                          Remove
                        </Button>
                      </Popconfirm>
                    )
                  }
                ]}
                pagination={false}
              />
            </TabPane>
          </Tabs>
        )}
      </Drawer>
    </div>
  );
};

export default ContractManagement;
