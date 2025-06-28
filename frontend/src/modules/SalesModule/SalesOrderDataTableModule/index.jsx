import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Input, Select, DatePicker, Space, Row, Col, Tag, Tooltip, Modal, Descriptions, Typography, Statistic, Divider } from 'antd';
import { EyeOutlined, EditOutlined, PrinterOutlined, SearchOutlined, FilterOutlined, ReloadOutlined, ShoppingOutlined, DollarOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import request from '@/request';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const SalesOrderDataTableModule = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateRange: null,
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    orderCount: 0,
    avgOrderValue: 0,
  });

  useEffect(() => {
    loadSalesOrders();
    loadAnalytics();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadSalesOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
        dateFrom: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
        dateTo: filters.dateRange?.[1]?.format('YYYY-MM-DD'),
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await request.get('/sales-order', { params });
      
      if (response.data.success) {
        setSalesOrders(response.data.result);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
        }));
      }
    } catch (error) {
      console.error('Error loading sales orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const params = {};
      if (filters.dateRange) {
        params.dateFrom = filters.dateRange[0].format('YYYY-MM-DD');
        params.dateTo = filters.dateRange[1].format('YYYY-MM-DD');
      }

      const response = await request.get('/sales-order/analytics', { params });
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
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
      current: 1, // Reset to first page when filtering
    }));
  };

  const viewOrderDetails = async (orderId) => {
    try {
      setLoading(true);
      const response = await request.get(`/sales-order/${orderId}`);
      if (response.data.success) {
        setSelectedOrder(response.data.result);
        setDetailVisible(true);
      }
    } catch (error) {
      console.error('Error loading order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      confirmed: 'blue',
      processing: 'orange',
      shipped: 'purple',
      delivered: 'green',
      cancelled: 'red',
    };
    return colors[status] || 'default';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      paid: 'green',
      partial: 'blue',
      refunded: 'red',
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Order #',
      dataIndex: 'soNumber',
      key: 'soNumber',
      width: 120,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Receipt #',
      dataIndex: 'receiptNumber',
      key: 'receiptNumber',
      width: 120,
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: 'Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 120,
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
      sorter: true,
    },
    {
      title: 'Customer',
      key: 'customer',
      width: 150,
      render: (record) => (
        <div>
          <Text>{record.customerName || 'Walk-in Customer'}</Text>
          {record.customer && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.customer.customerNumber}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      width: 80,
      render: (items) => (
        <Tag color="blue">{items?.length || 0} items</Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 100,
      render: (amount) => (
        <Text strong style={{ color: '#1890ff' }}>
          ${parseFloat(amount).toFixed(2)}
        </Text>
      ),
      sorter: true,
    },
    {
      title: 'Payment',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 100,
      render: (status, record) => (
        <div>
          <Tag color={getPaymentStatusColor(status)}>
            {status?.toUpperCase()}
          </Tag>
          <div style={{ fontSize: '11px', color: '#666' }}>
            {record.paymentMethod}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Salesperson',
      key: 'salesperson',
      width: 120,
      render: (record) => (
        <Text>{record.salesperson?.name || 'Unknown'}</Text>
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
              onClick={() => viewOrderDetails(record.id)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Print Receipt">
            <Button
              type="text"
              icon={<PrinterOutlined />}
              onClick={() => printReceipt(record)}
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const printReceipt = (order) => {
    // Receipt printing simulation
    console.log('Printing receipt for order:', order.soNumber);
    // In real implementation, this would integrate with a receipt printer
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Analytics Cards */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Sales"
              value={analytics.totalSales}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Orders Count"
              value={analytics.orderCount}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Avg Order Value"
              value={analytics.avgOrderValue}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card
        title={
          <Space>
            <ShoppingOutlined />
            <span>Sales Orders</span>
          </Space>
        }
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={loadSalesOrders}
            loading={loading}
          >
            Refresh
          </Button>
        }
      >
        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8}>
            <Input
              placeholder="Search orders..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Order Status"
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
            >
              <Option value="draft">Draft</Option>
              <Option value="confirmed">Confirmed</Option>
              <Option value="processing">Processing</Option>
              <Option value="shipped">Shipped</Option>
              <Option value="delivered">Delivered</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Col>
          <Col xs={24} sm={10}>
            <RangePicker
              style={{ width: '100%' }}
              value={filters.dateRange}
              onChange={(dates) => handleFilterChange('dateRange', dates)}
              placeholder={['Start Date', 'End Date']}
            />
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={salesOrders}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} orders`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={`Order Details - ${selectedOrder?.soNumber}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="print" icon={<PrinterOutlined />}>
            Print Receipt
          </Button>,
          <Button key="close" onClick={() => setDetailVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Descriptions title="Order Information" size="small" column={1}>
                  <Descriptions.Item label="Order Number">
                    {selectedOrder.soNumber}
                  </Descriptions.Item>
                  <Descriptions.Item label="Receipt Number">
                    {selectedOrder.receiptNumber}
                  </Descriptions.Item>
                  <Descriptions.Item label="Order Date">
                    {dayjs(selectedOrder.orderDate).format('MMMM DD, YYYY HH:mm')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={getStatusColor(selectedOrder.orderStatus)}>
                      {selectedOrder.orderStatus?.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Store Location">
                    {selectedOrder.storeLocation}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Descriptions title="Customer & Payment" size="small" column={1}>
                  <Descriptions.Item label="Customer">
                    {selectedOrder.customerName}
                    {selectedOrder.customer && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {selectedOrder.customer.customerNumber}
                      </div>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Payment Method">
                    {selectedOrder.paymentMethod}
                  </Descriptions.Item>
                  <Descriptions.Item label="Payment Status">
                    <Tag color={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                      {selectedOrder.paymentStatus?.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Salesperson">
                    {selectedOrder.salesperson?.name}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>

            <Divider />

            <Title level={5}>Order Items</Title>
            <Table
              dataSource={selectedOrder.items}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Item',
                  dataIndex: 'itemDescription',
                  key: 'item',
                },
                {
                  title: 'Qty',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  width: 80,
                },
                {
                  title: 'Unit Price',
                  dataIndex: 'unitPrice',
                  key: 'unitPrice',
                  width: 100,
                  render: (price) => `$${parseFloat(price).toFixed(2)}`,
                },
                {
                  title: 'Line Total',
                  dataIndex: 'lineTotal',
                  key: 'lineTotal',
                  width: 100,
                  render: (total) => `$${parseFloat(total).toFixed(2)}`,
                },
              ]}
            />

            <Divider />

            <Row>
              <Col span={12} offset={12}>
                <div style={{ textAlign: 'right' }}>
                  <Row justify="space-between">
                    <Col>Subtotal:</Col>
                    <Col><strong>${parseFloat(selectedOrder.subtotal).toFixed(2)}</strong></Col>
                  </Row>
                  <Row justify="space-between">
                    <Col>VAT ({selectedOrder.vatRate}%):</Col>
                    <Col><strong>${parseFloat(selectedOrder.vatAmount).toFixed(2)}</strong></Col>
                  </Row>
                  <Row justify="space-between">
                    <Col>Discount:</Col>
                    <Col><strong>-${parseFloat(selectedOrder.discountAmount).toFixed(2)}</strong></Col>
                  </Row>
                  <Divider style={{ margin: '8px 0' }} />
                  <Row justify="space-between">
                    <Col><Title level={5}>Total:</Title></Col>
                    <Col><Title level={5} style={{ color: '#1890ff' }}>
                      ${parseFloat(selectedOrder.totalAmount).toFixed(2)}
                    </Title></Col>
                  </Row>
                </div>
              </Col>
            </Row>

            {selectedOrder.notes && (
              <>
                <Divider />
                <div>
                  <Title level={5}>Notes</Title>
                  <Text>{selectedOrder.notes}</Text>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SalesOrderDataTableModule;