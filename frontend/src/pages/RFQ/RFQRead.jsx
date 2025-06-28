import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Card, 
  Descriptions, 
  Table, 
  Tag, 
  Steps, 
  Modal, 
  Form,
  Input,
  Alert,
  Divider,
  Timeline,
  Spin,
  Tabs,
  Space,
  Typography,
  Dropdown,
  Tooltip
} from 'antd';
import {
  FileTextOutlined,
  CheckOutlined,
  CloseOutlined,
  SendOutlined,
  ShoppingOutlined,
  EyeOutlined,
  DownloadOutlined,
  CalculatorOutlined,
  ShopOutlined,
  EditOutlined,
  DownOutlined
} from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/auth/selectors';
import { DOWNLOAD_BASE_URL } from '@/config/serverApiConfig';
import moment from 'moment';

const { Step } = Steps;
// Removed TabPane import - using items prop instead
const { TextArea } = Input;
const { Title } = Typography;

function RFQRead() {
  const { id } = useParams();
  const navigate = useNavigate();
  const translate = useLanguage();
  const currentUser = useSelector(selectCurrentUser);
  
  // Validate that we have a valid ID
  useEffect(() => {
    if (!id) {
      console.error('Missing RFQ ID parameter');
      navigate('/rfq');
    }
  }, [id, navigate]);
  
  const [rfq, setRFQ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rfqItems, setRFQItems] = useState([]);
  const [rfqSuppliers, setRFQSuppliers] = useState([]);
  const [supplierResponses, setSupplierResponses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [recordQuoteForm] = Form.useForm();
  const [recordQuoteModalVisible, setRecordQuoteModalVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [activeTab, setActiveTab] = useState('1');
  const [supplierResponsesLoading, setSupplierResponsesLoading] = useState(false);
  const [rfqAttachments, setRFQAttachments] = useState([]);

  // Define menu items for Dropdown
  const supplierActions = (supplier) => ({
    items: [
      {
        key: 'record',
        label: translate('Record Quote'),
        icon: <FileTextOutlined />,
        onClick: () => openRecordQuoteModal(supplier)
      },
      {
        key: 'view',
        label: translate('View History'),
        icon: <EyeOutlined />,
        onClick: () => {} // Implement view history functionality
      }
    ]
  });

  // Load RFQ data
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      
      try {
        const response = await request.read({ entity: 'rfq', id });
        console.log('🔍 RFQ Read Response:', response);
        if (response.success) {
          const rfqData = response.result || response.data;
          console.log('🔍 RFQ Data:', rfqData);
          
          // Process and set RFQ data
          setRFQ({
            ...rfqData,
            // Format dates consistently
            bidOpeningDate: rfqData.bidOpeningDate ? moment(rfqData.bidOpeningDate).format('YYYY-MM-DD') : null,
            bidClosingDate: rfqData.bidClosingDate ? moment(rfqData.bidClosingDate).format('YYYY-MM-DD') : null,
            dueDate: rfqData.dueDate ? moment(rfqData.dueDate).format('YYYY-MM-DD') : null,
            created: rfqData.created ? moment(rfqData.created).format('YYYY-MM-DD HH:mm') : null,
            updated: rfqData.updated ? moment(rfqData.updated).format('YYYY-MM-DD HH:mm') : null,
            // Ensure we have a number field
            rfqNumber: rfqData.rfqNumber || rfqData.number,
          });
          
          // Set items
          setRFQItems(rfqData.items?.map(item => ({
            ...item,
            id: item._id || item.id,
            key: item._id || item.id,
            requestedDeliveryDate: item.requestedDeliveryDate ? 
              moment(item.requestedDeliveryDate).format('YYYY-MM-DD') : null
          })) || []);
          
          // Set suppliers with formatting
          setRFQSuppliers(rfqData.suppliers?.map(s => ({
            ...s,
            id: s.id,
            key: s.id,
            name: s.supplierName || s.name,
            contact: s.contactName || s.contact,
            email: s.contactEmail || s.email,
            phone: s.contactPhone || s.phone,
            supplierName: s.supplierName,
            supplierEmail: s.contactEmail,
            supplierPhone: s.contactPhone
          })) || []);
          
          // Load associated supplier responses
          const responsesResponse = await request.list({ 
            entity: 'rfqSupplierResponse',
            options: { filter: { rfqId: id } }
          });
          
          if (responsesResponse.success) {
            setSupplierResponses(responsesResponse.result || []);
          }
        } else {
          throw new Error(response.message || 'Failed to load RFQ details');
        }
      } catch (err) {
        console.error('Error loading RFQ:', err);
        setError(err.message || 'Error loading RFQ details');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Handle RFQ submission to suppliers
  const handleSubmitRFQ = async () => {
    setSubmitting(true);
    
    try {
      const response = await request.create({
        entity: 'rfq/submit',
        jsonData: { id }
      });
      
      if (response.success) {
        // Refresh RFQ data
        const rfqResponse = await request.read({ entity: 'rfq', id });
        if (rfqResponse.success && rfqResponse.result) {
          setRFQ(rfqResponse.result);
        }
      }
    } catch (err) {
      console.error('Failed to submit RFQ:', err);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle opening the record quote modal
  const openRecordQuoteModal = (supplier) => {
    setSelectedSupplier(supplier);
    setRecordQuoteModalVisible(true);
    
    // Prepopulate form with items
    const initialFormValues = {
      items: rfqItems.map(item => ({
        itemId: item._id || item.id,
        name: item.name || item.itemName,
        quantity: item.quantity,
        price: '',
        notes: ''
      }))
    };
    
    recordQuoteForm.setFieldsValue(initialFormValues);
  };
  
  // Handle record quote submission
  const handleRecordQuote = async (values) => {
    if (!selectedSupplier) return;
    
    setSubmitting(true);
    
    try {
      const response = await request.create({
        entity: 'rfq/record-quote',
        jsonData: {
          id,
          supplierId: selectedSupplier._id || selectedSupplier.id,
          items: values.items
        }
      });
      
      if (response.success) {
        setRecordQuoteModalVisible(false);
        recordQuoteForm.resetFields();
        
        // Reload supplier responses
        const responsesResponse = await request.list({ 
          entity: 'rfqSupplierResponse',
          options: { filter: { rfqId: id } }
        });
        
        if (responsesResponse.success) {
          setSupplierResponses(responsesResponse.result || []);
        }
        
        // Refresh RFQ data
        const rfqResponse = await request.read({ entity: 'rfq', id });
        if (rfqResponse.success && rfqResponse.result) {
          setRFQ(rfqResponse.result);
        }
      }
    } catch (err) {
      console.error('Failed to record quote:', err);
    } finally {
      setSubmitting(false);
    }
  };
    // Navigate to RFQ comparison
  const navigateToComparison = () => {
    navigate(`/rfq/comparison/${id}`);
  };
  
  // Navigate to RFQ update
  const navigateToEdit = () => {
    navigate(`/rfq/update/${id}`);
  };
  
  // Navigate to RFQ send
  const navigateToSend = () => {
    navigate(`/rfq/send/${id}`);
  };
  
  // Helper function to get status tag color
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'sent':
        return 'processing';
      case 'quoted':
        return 'warning';
      case 'closed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'po_created':
        return 'cyan';
      default:
        return 'default';
    }
  };
  
  // Helper to truncate text with ellipsis and tooltip
  const renderEllipsis = (text, maxLength = 30) => {
    if (!text) return '';
    const display = text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
    return (
      <Tooltip title={text}>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', maxWidth: 200 }}>{display}</span>
      </Tooltip>
    );
  };
  
  // Item columns for the table
  const itemColumns = [
    {
      title: translate('Item'),
      dataIndex: 'name',
      key: 'name',
      render: (text) => renderEllipsis(text, 30),
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
      render: (text) => renderEllipsis(text, 50),
    },
    {
      title: translate('Quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: translate('Unit'),
      dataIndex: 'unit',
      key: 'unit',
    }
  ];
  
  // Supplier columns for the table
  const supplierColumns = [
    {
      title: translate('Supplier Name'),
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => record.supplierName || record.name || '-',
    },
    {
      title: translate('Contact'),
      dataIndex: 'contact',
      key: 'contact',
    },
    {
      title: translate('Email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: translate('Phone'),
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: translate('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Dropdown menu={supplierActions(record)}>
          <Button>
            {translate('Actions')} <DownOutlined />
          </Button>
        </Dropdown>
      )
    }
  ];
  
  // Supplier response columns
  const responseColumns = [
    {
      title: translate('Supplier'),
      dataIndex: ['supplier', 'name'],
      key: 'supplierName',
      render: (text, record) => record.supplier?.name || '-',
    },
    {
      title: translate('Date Received'),
      dataIndex: 'responseDate',
      key: 'responseDate',
      render: (text) => text ? moment(text).format('YYYY-MM-DD') : '-',
    },
    {
      title: translate('Total Quote'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (_, record) => {
        const total = record.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
        return `$${total.toFixed(2)}`;
      },
    },
    {
      title: translate('Lead Time'),
      dataIndex: 'leadTime',
      key: 'leadTime',
    },
    {
      title: translate('Notes'),
      dataIndex: 'notes',
      key: 'notes',
    }
  ];
  
  // Attachment columns
  const attachmentColumns = [
    {
      title: translate('File Name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: translate('Type'),
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: translate('Size'),
      dataIndex: 'size',
      key: 'size',
      render: (text) => {
        const size = Number(text);
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
      }
    },
    {
      title: translate('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<DownloadOutlined />}
          href={`${DOWNLOAD_BASE_URL}${record.path}`}
          target="_blank"
        >
          {translate('Download')}
        </Button>
      ),
    }
  ];

  if (loading) {
    return <Spin size="large" />;
  }

  if (error) {
    return <Alert message={error} type="error" />;
  }

  if (!rfq) {
    return <Alert message={translate('RFQ not found')} type="warning" />;
  }

  // Update tabs to use items prop
  const tabItems = [
    {
      key: '1',
      label: translate('Items'),
      children: (
        <Table 
          columns={itemColumns} 
          dataSource={rfqItems.map(item => ({ ...item, key: item._id || item.id }))}
          pagination={false}
          bordered
        />
      )
    },
    {
      key: '2',
      label: translate('Suppliers'),
      children: (
        <Table 
          columns={supplierColumns} 
          dataSource={rfqSuppliers.map(supplier => ({ ...supplier, key: supplier._id || supplier.id }))}
          pagination={false}
          bordered
        />
      )
    },
    {
      key: '3',
      label: translate('Supplier Responses'),
      children: (
        <Spin spinning={supplierResponsesLoading}>
          {supplierResponses.length > 0 ? (
            <Table 
              columns={responseColumns} 
              dataSource={supplierResponses.map(response => ({ ...response, key: response._id || response.id }))}
              pagination={false}
              bordered
            />
          ) : (
            <Alert message={translate('No supplier responses received yet')} type="info" />
          )}
        </Spin>
      )
    },
    {
      key: '4',
      label: translate('Attachments'),
      children: (
        rfqAttachments.length > 0 ? (
          <Table 
            columns={attachmentColumns} 
            dataSource={rfqAttachments.map(attachment => ({ ...attachment, key: attachment._id || attachment.id }))}
            pagination={false}
            bordered
          />
        ) : (
          <Alert message={translate('No attachments available')} type="info" />
        )
      )
    }
  ];

  return (
    <div className="rfq-read-page">
      <Card 
        title={
          <Space>
            <ShoppingOutlined />
            <span>{translate('RFQ Details')} - {rfq.rfqNumber}</span>
          </Space>
        }
        extra={
          <Space>
            <Button 
              onClick={() => navigate('/rfq')}
            >
              {translate('Back to List')}
            </Button>
              {rfq.status === 'draft' && (
              <>
                <Button 
                  onClick={navigateToEdit}
                  icon={<EditOutlined />}
                >
                  {translate('Edit')}
                </Button>
                
                <Button 
                  type="primary"
                  onClick={navigateToSend}
                  icon={<SendOutlined />}
                >
                  {translate('Send to Suppliers')}
                </Button>
              </>
            )}
            
            {rfq.status === 'quoted' && (
              <Button 
                type="primary"
                onClick={navigateToComparison}
                icon={<CalculatorOutlined />}
              >
                {translate('Compare Quotes')}
              </Button>
            )}
          </Space>
        }
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label={translate('RFQ Number')}>
            {rfq.rfqNumber || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('Status')}>
            <Tag color={getStatusColor(rfq.status)}>
              {translate(rfq.status?.toUpperCase() || 'DRAFT')}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label={translate('Date')}>
            {rfq.dueDate ? moment(rfq.dueDate).format('YYYY-MM-DD') : (rfq.createdAt ? moment(rfq.createdAt).format('YYYY-MM-DD') : '-')}
          </Descriptions.Item>
          <Descriptions.Item label={translate('Expiration Date')}>
            {rfq.responseDeadline ? moment(rfq.responseDeadline).format('YYYY-MM-DD') : (rfq.dueDate ? moment(rfq.dueDate).format('YYYY-MM-DD') : '-')}
          </Descriptions.Item>
          
          <Descriptions.Item label={translate('Requested By')}>
            {rfq.createdBy?.name || rfq.createdBy?.email || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('Department')}>
            {rfq.purchaseRequisition?.costCenter || '-'}
          </Descriptions.Item>

          <Descriptions.Item label={translate('Related PR')}>
            {rfq.purchaseRequisition ? (
              <a href={`/purchase-requisition/read/${rfq.purchaseRequisition.id}`}>
                {rfq.purchaseRequisition.prNumber}
              </a>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          
          <Descriptions.Item label={translate('Notes')} span={2}>
            {rfq.notes || '-'}
          </Descriptions.Item>
        </Descriptions>
        
        <Divider />
        
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>
      
      <Modal
        title={translate('Record Supplier Quote')}
        open={recordQuoteModalVisible}
        onCancel={() => setRecordQuoteModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={recordQuoteForm}
          layout="vertical"
          onFinish={handleRecordQuote}
        >
          <div className="supplier-info">
            <Title level={5}>{translate('Supplier')}: {selectedSupplier?.name}</Title>
          </div>
          
          <Form.List name="items">
            {(fields) => (
              <div>
                <Table
                  pagination={false}
                  bordered
                  dataSource={fields.map(field => ({
                    ...recordQuoteForm.getFieldValue(['items', field.name]),
                    fieldKey: field.key,
                    fieldName: field.name
                  }))}
                  columns={[
                    {
                      title: translate('Item'),
                      dataIndex: 'name',
                      key: 'name',
                    },
                    {
                      title: translate('Quantity'),
                      dataIndex: 'quantity',
                      key: 'quantity',
                    },
                    {
                      title: translate('Unit Price'),
                      key: 'price',
                      render: (text, record) => (
                        <Form.Item
                          name={[record.fieldName, 'price']}
                          noStyle
                        >
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            addonBefore="$"
                          />
                        </Form.Item>
                      )
                    },
                    {
                      title: translate('Notes'),
                      key: 'notes',
                      render: (text, record) => (
                        <Form.Item
                          name={[record.fieldName, 'notes']}
                          noStyle
                        >
                          <Input />
                        </Form.Item>
                      )
                    },
                    {
                      title: translate('Total'),
                      key: 'total',
                      render: (text, record) => {
                        const price = recordQuoteForm.getFieldValue(['items', record.fieldName, 'price']) || 0;
                        const quantity = record.quantity || 0;
                        return `$${(price * quantity).toFixed(2)}`;
                      }
                    }
                  ]}
                />
                
                <Form.Item label={translate('Lead Time')} name="leadTime" style={{ marginTop: 16 }}>
                  <Input placeholder={translate('Number of days for delivery')} />
                </Form.Item>
                
                <Form.Item label={translate('Additional Notes')} name="notes">
                  <TextArea rows={4} />
                </Form.Item>
              </div>
            )}
          </Form.List>
          
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setRecordQuoteModalVisible(false)}>
                {translate('Cancel')}
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
              >
                {translate('Save Quote')}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default RFQRead;
