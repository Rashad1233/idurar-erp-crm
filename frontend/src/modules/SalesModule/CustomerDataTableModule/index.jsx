import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Input, Select, Space, Row, Col, Tag, Tooltip, Modal, Form, Typography, Divider, message } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, EyeOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import request from '@/request';

const { Option } = Select;
const { Title, Text } = Typography;

const CustomerDataTableModule = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    customerType: '',
    isActive: '',
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [createVisible, setCreateVisible] = useState(false);
  
  const [form] = Form.useForm();

  useEffect(() => {
    loadCustomers();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await request.get('/customer', { params });
      
      if (response.data.success) {
        setCustomers(response.data.result);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
        }));
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      message.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (paginationInfo) => {
    setPagination(paginationInfo);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setPagination(prev => ({
      ...prev,
      current: 1,
    }));
  };

  const viewCustomerDetails = async (customerId) => {
    try {
      setLoading(true);
      const response = await request.get(`/customer/${customerId}`);
      if (response.data.success) {
        setSelectedCustomer(response.data.result);
        setDetailVisible(true);
      }
    } catch (error) {
      console.error('Error loading customer details:', error);
      message.error('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const editCustomer = (customer) => {
    setSelectedCustomer(customer);
    form.setFieldsValue(customer);
    setEditVisible(true);
  };

  const createCustomer = () => {
    form.resetFields();
    setCreateVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      if (editVisible) {
        // Update customer
        await request.put(`/customer/${selectedCustomer.id}`, values);
        message.success('Customer updated successfully');
        setEditVisible(false);
      } else {
        // Create customer
        await request.post('/customer', values);
        message.success('Customer created successfully');
        setCreateVisible(false);
      }
      
      loadCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      message.error('Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  const getCustomerTypeColor = (type) => {
    const colors = {
      individual: 'blue',
      business: 'green',
      'walk-in': 'orange',
    };
    return colors[type] || 'default';
  };

  const columns = [
    {
      title: 'Customer #',
      dataIndex: 'customerNumber',
      key: 'customerNumber',
      width: 120,
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Type',
      dataIndex: 'customerType',
      key: 'customerType',
      width: 100,
      render: (type) => (
        <Tag color={getCustomerTypeColor(type)}>
          {type?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      width: 200,
      render: (record) => (
        <div>
          {record.email && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                📧 {record.email}
              </Text>
            </div>
          )}
          {record.phone && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                📞 {record.phone}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      width: 150,
      render: (record) => (
        <div>
          {record.city && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.city}
              {record.state && `, ${record.state}`}
            </Text>
          )}
          {record.country && (
            <div>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                {record.country}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Credit Limit',
      dataIndex: 'creditLimit',
      key: 'creditLimit',
      width: 120,
      render: (amount) => (
        <Text>${parseFloat(amount || 0).toFixed(2)}</Text>
      ),
    },
    {
      title: 'Payment Terms',
      dataIndex: 'paymentTerms',
      key: 'paymentTerms',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => viewCustomerDetails(record.id)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => editCustomer(record)}
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const CustomerForm = ({ visible, onCancel, onSubmit, isEdit = false }) => (
    <Modal
      title={isEdit ? 'Edit Customer' : 'Create Customer'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Customer Name"
              rules={[{ required: true, message: 'Please enter customer name' }]}
            >
              <Input placeholder="Enter customer name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="customerType"
              label="Customer Type"
              rules={[{ required: true, message: 'Please select customer type' }]}
            >
              <Select placeholder="Select customer type">
                <Option value="individual">Individual</Option>
                <Option value="business">Business</Option>
                <Option value="walk-in">Walk-in</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: 'email', message: 'Please enter valid email' }]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="phone" label="Phone">
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="address" label="Address">
          <Input.TextArea placeholder="Enter full address" rows={2} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="city" label="City">
              <Input placeholder="City" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="state" label="State">
              <Input placeholder="State" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="zipCode" label="ZIP Code">
              <Input placeholder="ZIP Code" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="country" label="Country">
              <Input placeholder="Country" defaultValue="US" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="creditLimit" label="Credit Limit">
              <Input type="number" placeholder="0.00" step="0.01" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="paymentTerms" label="Payment Terms">
              <Select placeholder="Payment terms">
                <Option value="Cash">Cash</Option>
                <Option value="Net 30">Net 30</Option>
                <Option value="Net 60">Net 60</Option>
                <Option value="COD">COD</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="taxId" label="Tax ID">
          <Input placeholder="Tax identification number" />
        </Form.Item>

        <Form.Item name="notes" label="Notes">
          <Input.TextArea placeholder="Additional notes..." rows={3} />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? 'Update' : 'Create'} Customer
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  return (
    <div style={{ padding: '20px' }}>
      <Card
        title={
          <Space>
            <UserOutlined />
            <span>Customer Management</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadCustomers}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={createCustomer}
            >
              Add Customer
            </Button>
          </Space>
        }
      >
        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8}>
            <Input
              placeholder="Search customers..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Customer Type"
              style={{ width: '100%' }}
              value={filters.customerType}
              onChange={(value) => handleFilterChange('customerType', value)}
              allowClear
            >
              <Option value="individual">Individual</Option>
              <Option value="business">Business</Option>
              <Option value="walk-in">Walk-in</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Status"
              style={{ width: '100%' }}
              value={filters.isActive}
              onChange={(value) => handleFilterChange('isActive', value)}
              allowClear
            >
              <Option value="true">Active</Option>
              <Option value="false">Inactive</Option>
            </Select>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={customers}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} customers`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Card>

      {/* Customer Detail Modal */}
      <Modal
        title={`Customer Details - ${selectedCustomer?.name}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="edit" type="primary" onClick={() => {
            setDetailVisible(false);
            editCustomer(selectedCustomer);
          }}>
            Edit Customer
          </Button>,
          <Button key="close" onClick={() => setDetailVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedCustomer && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Title level={5}>Basic Information</Title>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Customer Number:</Text>
                  <div><Text code>{selectedCustomer.customerNumber}</Text></div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Name:</Text>
                  <div><Text>{selectedCustomer.name}</Text></div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Type:</Text>
                  <div>
                    <Tag color={getCustomerTypeColor(selectedCustomer.customerType)}>
                      {selectedCustomer.customerType?.toUpperCase()}
                    </Tag>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Status:</Text>
                  <div>
                    <Tag color={selectedCustomer.isActive ? 'green' : 'red'}>
                      {selectedCustomer.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Tag>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <Title level={5}>Contact Information</Title>
                {selectedCustomer.email && (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Email:</Text>
                    <div><Text>{selectedCustomer.email}</Text></div>
                  </div>
                )}
                {selectedCustomer.phone && (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Phone:</Text>
                    <div><Text>{selectedCustomer.phone}</Text></div>
                  </div>
                )}
                {selectedCustomer.address && (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Address:</Text>
                    <div><Text>{selectedCustomer.address}</Text></div>
                  </div>
                )}
                {(selectedCustomer.city || selectedCustomer.state || selectedCustomer.zipCode) && (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Location:</Text>
                    <div>
                      <Text>
                        {[selectedCustomer.city, selectedCustomer.state, selectedCustomer.zipCode]
                          .filter(Boolean).join(', ')}
                      </Text>
                    </div>
                  </div>
                )}
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Title level={5}>Financial Information</Title>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Credit Limit:</Text>
                  <div><Text>${parseFloat(selectedCustomer.creditLimit || 0).toFixed(2)}</Text></div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Payment Terms:</Text>
                  <div><Text>{selectedCustomer.paymentTerms}</Text></div>
                </div>
                {selectedCustomer.taxId && (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Tax ID:</Text>
                    <div><Text>{selectedCustomer.taxId}</Text></div>
                  </div>
                )}
              </Col>
              <Col span={12}>
                <Title level={5}>Recent Orders</Title>
                {selectedCustomer.salesOrders && selectedCustomer.salesOrders.length > 0 ? (
                  selectedCustomer.salesOrders.map(order => (
                    <div key={order.id} style={{ marginBottom: 8, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                      <Text strong>{order.soNumber}</Text>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {order.orderDate} - ${parseFloat(order.totalAmount).toFixed(2)} - {order.orderStatus}
                      </div>
                    </div>
                  ))
                ) : (
                  <Text type="secondary">No recent orders</Text>
                )}
              </Col>
            </Row>

            {selectedCustomer.notes && (
              <>
                <Divider />
                <Title level={5}>Notes</Title>
                <Text>{selectedCustomer.notes}</Text>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Create/Edit Customer Forms */}
      <CustomerForm
        visible={createVisible}
        onCancel={() => setCreateVisible(false)}
        onSubmit={handleSubmit}
        isEdit={false}
      />

      <CustomerForm
        visible={editVisible}
        onCancel={() => setEditVisible(false)}
        onSubmit={handleSubmit}
        isEdit={true}
      />
    </div>
  );
};

export default CustomerDataTableModule;