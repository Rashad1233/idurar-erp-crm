import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Card, 
  Typography, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select,
  Row,
  Col,
  Descriptions,
  Divider,
  Steps,
  message,
  Alert,
  Statistic
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  SearchOutlined, 
  FileSearchOutlined,
  DollarOutlined,
  ExportOutlined,
  LinkOutlined,
  WarningOutlined
} from '@ant-design/icons';

import { ErpLayout } from '@/layout';
import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/auth/selectors';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

export default function ThreeWayMatching() {
  const translate = useLanguage();
  const currentUser = useSelector(selectCurrentUser);
  
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [matchDetails, setMatchDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [matchModalVisible, setMatchModalVisible] = useState(false);
  
  // Search form for filtering invoices
  const [searchForm] = Form.useForm();
  
  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, []);
  
  // Fetch invoices that need matching
  const fetchInvoices = () => {
    setLoading(true);
    request
      .get({ entity: 'invoice/pending-matching' })
      .then((data) => {
        setInvoices(data.result.items || []);
      })
      .catch((error) => {
        message.error(translate('Failed to fetch invoices'));
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  // Handle invoice search
  const handleSearch = (values) => {
    setLoading(true);
    
    const params = {};
    if (values.invoiceNumber) params.invoiceNumber = values.invoiceNumber;
    if (values.supplierName) params.supplierName = values.supplierName;
    if (values.status) params.status = values.status;
    
    request
      .get({ entity: 'invoice/search', params })
      .then((data) => {
        setInvoices(data.result.items || []);
      })
      .catch((error) => {
        message.error(translate('Failed to search invoices'));
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  // Reset search filters
  const resetSearch = () => {
    searchForm.resetFields();
    fetchInvoices();
  };
  
  // View three-way matching details for an invoice
  const viewMatchDetails = (invoice) => {
    setLoading(true);
    setSelectedInvoice(invoice);
    
    request
      .get({ entity: `invoice/matching/${invoice._id}` })
      .then((data) => {
        setMatchDetails(data.result);
        setMatchModalVisible(true);
      })
      .catch((error) => {
        message.error(translate('Failed to fetch matching details'));
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  // Calculate match status for an invoice
  const calculateMatchStatus = (invoice) => {
    if (!invoice || !invoice.matchStatus) return 'pending';
    
    return invoice.matchStatus;
  };
  
  // Get status color based on match status
  const getStatusColor = (status) => {
    switch (status) {
      case 'matched':
        return 'green';
      case 'partial_match':
        return 'orange';
      case 'exception':
        return 'red';
      case 'pending':
      default:
        return 'blue';
    }
  };
  
  // Get status text based on match status
  const getStatusText = (status) => {
    switch (status) {
      case 'matched':
        return translate('Matched');
      case 'partial_match':
        return translate('Partial Match');
      case 'exception':
        return translate('Exception');
      case 'pending':
      default:
        return translate('Pending');
    }
  };
  
  // Process match exceptions
  const processException = (invoice) => {
    setSelectedInvoice(invoice);
    setModalVisible(true);
  };
  
  // Clear exception and approve invoice for payment
  const approveInvoice = () => {
    if (!selectedInvoice) return;
    
    setLoading(true);
    request
      .post({
        entity: `invoice/approve/${selectedInvoice._id}`,
        jsonData: {
          approvedBy: currentUser._id,
          approvedAt: new Date().toISOString(),
        }
      })
      .then(() => {
        message.success(translate('Invoice approved for payment'));
        setModalVisible(false);
        fetchInvoices();
      })
      .catch((error) => {
        message.error(translate('Failed to approve invoice'));
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  // Invoice table columns
  const columns = [
    {
      title: translate('Invoice Number'),
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
    },
    {
      title: translate('Date'),
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: translate('Supplier'),
      dataIndex: 'supplierName',
      key: 'supplierName',
    },
    {
      title: translate('Amount'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `$${amount.toFixed(2)}`,
    },
    {
      title: translate('PO Number'),
      dataIndex: 'poNumber',
      key: 'poNumber',
    },
    {
      title: translate('Match Status'),
      key: 'matchStatus',
      render: (_, record) => {
        const status = calculateMatchStatus(record);
        return (
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)}
          </Tag>
        );
      },
    },
    {
      title: translate('Actions'),
      key: 'actions',
      render: (_, record) => {
        const status = calculateMatchStatus(record);
        return (
          <Space size="small">
            <Button 
              icon={<FileSearchOutlined />}
              onClick={() => viewMatchDetails(record)}
            >
              {translate('Details')}
            </Button>
            {status === 'exception' && (
              <Button 
                icon={<ExportOutlined />}
                type="primary"
                danger
                onClick={() => processException(record)}
              >
                {translate('Process Exception')}
              </Button>
            )}
            {status === 'matched' && (
              <Button 
                icon={<DollarOutlined />}
                type="primary"
                onClick={() => processException(record)} // Reuse the same modal for approval
              >
                {translate('Process Payment')}
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <ErpLayout>
      <Title level={2}>{translate('Three-Way Matching')}</Title>
      <Text type="secondary">
        {translate('Match Purchase Orders, Goods Receipts, and Supplier Invoices for payment processing')}
      </Text>
      
      <Card style={{ marginTop: 20 }}>
        <Form 
          form={searchForm} 
          layout="inline" 
          onFinish={handleSearch}
          style={{ marginBottom: 20 }}
        >
          <Form.Item name="invoiceNumber">
            <Input placeholder={translate('Invoice Number')} />
          </Form.Item>
          <Form.Item name="supplierName">
            <Input placeholder={translate('Supplier Name')} />
          </Form.Item>
          <Form.Item name="status">
            <Select 
              placeholder={translate('Match Status')} 
              style={{ width: 150 }}
              allowClear
            >
              <Option value="pending">{translate('Pending')}</Option>
              <Option value="matched">{translate('Matched')}</Option>
              <Option value="partial_match">{translate('Partial Match')}</Option>
              <Option value="exception">{translate('Exception')}</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              icon={<SearchOutlined />} 
              htmlType="submit"
              loading={loading}
            >
              {translate('Search')}
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={resetSearch}>
              {translate('Reset')}
            </Button>
          </Form.Item>
        </Form>
        
        <Table 
          columns={columns} 
          dataSource={invoices}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
      
      {/* Process Exception Modal */}
      <Modal
        title={
          selectedInvoice && calculateMatchStatus(selectedInvoice) === 'exception' 
            ? translate('Process Exception') 
            : translate('Process Payment')
        }
        open={modalVisible}
        onOk={approveInvoice}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
      >
        {selectedInvoice && (
          <>
            <Descriptions title={translate('Invoice Details')} bordered>
              <Descriptions.Item label={translate('Invoice Number')} span={3}>
                {selectedInvoice.invoiceNumber}
              </Descriptions.Item>
              <Descriptions.Item label={translate('Supplier')} span={3}>
                {selectedInvoice.supplierName}
              </Descriptions.Item>
              <Descriptions.Item label={translate('Total Amount')} span={3}>
                ${selectedInvoice.totalAmount?.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label={translate('PO Number')} span={3}>
                {selectedInvoice.poNumber}
              </Descriptions.Item>
            </Descriptions>
            
            {calculateMatchStatus(selectedInvoice) === 'exception' ? (
              <Alert
                message={translate('Exception Details')}
                description={
                  <>
                    <p>{translate('This invoice has exceptions that need to be resolved:')}</p>
                    <ul>
                      {selectedInvoice.exceptions?.map((exception, index) => (
                        <li key={index}>{exception}</li>
                      ))}
                    </ul>
                    <p>{translate('Do you want to approve this invoice for payment despite the exceptions?')}</p>
                  </>
                }
                type="warning"
                showIcon
                icon={<WarningOutlined />}
                style={{ marginTop: 20 }}
              />
            ) : (
              <Alert
                message={translate('Confirmation')}
                description={translate('This invoice has been fully matched. Do you want to approve it for payment?')}
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
                style={{ marginTop: 20 }}
              />
            )}
          </>
        )}
      </Modal>
      
      {/* Matching Details Modal */}
      <Modal
        title={translate('Three-Way Matching Details')}
        open={matchModalVisible}
        onCancel={() => setMatchModalVisible(false)}
        footer={null}
        width={1000}
      >
        {selectedInvoice && matchDetails && (
          <>
            <Steps 
              current={matchDetails.completedSteps || 0} 
              status={matchDetails.status === 'exception' ? 'error' : 'process'}
            >
              <Step 
                title={translate('Purchase Order')} 
                description={matchDetails.po ? translate('Verified') : translate('Not Found')} 
                icon={matchDetails.po ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              />
              <Step 
                title={translate('Goods Receipt')} 
                description={matchDetails.gr ? translate('Verified') : translate('Not Found')} 
                icon={matchDetails.gr ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              />
              <Step 
                title={translate('Invoice')} 
                description={translate('Processing')} 
              />
            </Steps>
            
            <Divider>{translate('Summary')}</Divider>
            
            <Row gutter={16}>
              <Col span={8}>
                <Statistic 
                  title={translate('PO Amount')} 
                  value={matchDetails.po?.totalAmount || 0}
                  precision={2}
                  prefix="$"
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title={translate('GR Amount')} 
                  value={matchDetails.gr?.totalAmount || 0}
                  precision={2}
                  prefix="$"
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title={translate('Invoice Amount')} 
                  value={selectedInvoice.totalAmount || 0}
                  precision={2}
                  prefix="$"
                />
              </Col>
            </Row>
            
            <div style={{ marginTop: 20 }}>
              <Alert
                message={translate('Match Status')}
                description={translate(matchDetails.statusDescription || '')}
                type={
                  matchDetails.status === 'matched' ? 'success' :
                  matchDetails.status === 'partial_match' ? 'warning' :
                  matchDetails.status === 'exception' ? 'error' : 'info'
                }
                showIcon
              />
            </div>
            
            {matchDetails.exceptions && matchDetails.exceptions.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <Title level={5}>{translate('Exceptions')}</Title>
                <ul>
                  {matchDetails.exceptions.map((exception, index) => (
                    <li key={index}>{exception}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <Divider>{translate('Purchase Order Details')}</Divider>
            {matchDetails.po ? (
              <Table 
                columns={[
                  {
                    title: translate('Item'),
                    dataIndex: 'itemName',
                    key: 'itemName',
                  },
                  {
                    title: translate('Quantity'),
                    dataIndex: 'quantity',
                    key: 'quantity',
                  },
                  {
                    title: translate('Unit Price'),
                    dataIndex: 'unitPrice',
                    key: 'unitPrice',
                    render: (price) => `$${price.toFixed(2)}`,
                  },
                  {
                    title: translate('Total'),
                    key: 'total',
                    render: (_, record) => `$${(record.quantity * record.unitPrice).toFixed(2)}`,
                  },
                ]}
                dataSource={matchDetails.po.items || []}
                rowKey="itemId"
                pagination={false}
              />
            ) : (
              <Alert
                message={translate('No Purchase Order Found')}
                type="warning"
                showIcon
              />
            )}
            
            <Divider>{translate('Goods Receipt Details')}</Divider>
            {matchDetails.gr ? (
              <Table 
                columns={[
                  {
                    title: translate('Item'),
                    dataIndex: 'itemName',
                    key: 'itemName',
                  },
                  {
                    title: translate('Ordered Quantity'),
                    dataIndex: 'orderedQuantity',
                    key: 'orderedQuantity',
                  },
                  {
                    title: translate('Received Quantity'),
                    dataIndex: 'receivedQuantity',
                    key: 'receivedQuantity',
                  },
                  {
                    title: translate('Status'),
                    key: 'status',
                    render: (_, record) => {
                      const received = record.receivedQuantity;
                      const ordered = record.orderedQuantity;
                      
                      if (received === ordered) {
                        return <Tag color="green">{translate('Complete')}</Tag>;
                      } else if (received < ordered) {
                        return <Tag color="orange">{translate('Partial')}</Tag>;
                      } else {
                        return <Tag color="red">{translate('Excess')}</Tag>;
                      }
                    },
                  },
                ]}
                dataSource={matchDetails.gr.items || []}
                rowKey="itemId"
                pagination={false}
              />
            ) : (
              <Alert
                message={translate('No Goods Receipt Found')}
                type="warning"
                showIcon
              />
            )}
            
            <Divider>{translate('Invoice Details')}</Divider>
            <Table 
              columns={[
                {
                  title: translate('Item'),
                  dataIndex: 'itemName',
                  key: 'itemName',
                },
                {
                  title: translate('Quantity'),
                  dataIndex: 'quantity',
                  key: 'quantity',
                },
                {
                  title: translate('Unit Price'),
                  dataIndex: 'unitPrice',
                  key: 'unitPrice',
                  render: (price) => `$${price.toFixed(2)}`,
                },
                {
                  title: translate('Total'),
                  key: 'total',
                  render: (_, record) => `$${(record.quantity * record.unitPrice).toFixed(2)}`,
                },
                {
                  title: translate('Match Status'),
                  key: 'matchStatus',
                  render: (_, record) => {
                    const poItem = matchDetails.po?.items?.find(item => item.itemId === record.itemId);
                    const grItem = matchDetails.gr?.items?.find(item => item.itemId === record.itemId);
                    
                    if (!poItem) {
                      return <Tag color="red">{translate('No PO Item')}</Tag>;
                    }
                    
                    if (!grItem) {
                      return <Tag color="red">{translate('No GR Item')}</Tag>;
                    }
                    
                    const priceMatch = poItem.unitPrice === record.unitPrice;
                    const quantityMatch = grItem.receivedQuantity === record.quantity;
                    
                    if (priceMatch && quantityMatch) {
                      return <Tag color="green">{translate('Matched')}</Tag>;
                    } else if (priceMatch || quantityMatch) {
                      return <Tag color="orange">{translate('Partial Match')}</Tag>;
                    } else {
                      return <Tag color="red">{translate('No Match')}</Tag>;
                    }
                  },
                },
              ]}
              dataSource={selectedInvoice.items || []}
              rowKey="itemId"
              pagination={false}
            />
          </>
        )}
      </Modal>
    </ErpLayout>
  );
}
