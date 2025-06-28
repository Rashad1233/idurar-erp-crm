import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Alert,
  Spin,
  message,
  Typography,
  Checkbox,
  Select,
  Divider,
  List,
  Avatar,
  Space,
  Tag
} from 'antd';
import { SendOutlined, ShopOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

function RFQSend() {
  const { id } = useParams();
  const navigate = useNavigate();
  const translate = useLanguage();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [rfq, setRFQ] = useState(null);
  const [rfqSuppliers, setRFQSuppliers] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Load RFQ data
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    request.read({ entity: 'rfq', id })
      .then(response => {
        console.log('🔍 RFQ Read Response:', response);
        if (response.success) {
          const rfqData = response.result || response.data;
          console.log('🔍 RFQ Data:', rfqData);
          setRFQ(rfqData);
          
          // Process suppliers
          if (rfqData.suppliers && Array.isArray(rfqData.suppliers)) {
            const suppliers = rfqData.suppliers.map(s => ({
              id: s.id || s._id,
              supplierId: s.supplierId,
              status: s.status || 'pending',
              supplierName: s.supplier ? s.supplier.name : 'Unknown Supplier',
              supplierEmail: s.supplier ? s.supplier.email : '',
              supplierContact: s.supplier ? s.supplier.phone : '',
              selected: true // Select all suppliers by default
            }));
            
            setRFQSuppliers(suppliers);
            setSelectedSuppliers(suppliers.map(s => s.supplierId));
            setSelectAll(true);
              // Set default email subject and message
            form.setFieldsValue({
              emailSubject: `Request for Quotation: ${rfqData.rfqNumber || 'RFQ'} - ${rfqData.description || ''}`,
              message: `Dear Supplier,

We are pleased to invite you to submit a quotation for the following items:

${rfqData.items ? rfqData.items.map(item => `- ${item.description || item.itemName} (Qty: ${item.quantity} ${item.uom})`).join('\n') : 'Items as per the attached RFQ'}

Please provide your best price and delivery timeline.

Thank you,
[Your Company Name]`
            });
          }
          
        } else {
          setError('Failed to load RFQ details');
        }
      })
      .catch(err => {
        console.error('Error loading RFQ data:', err);
        setError(err.message || 'Error loading RFQ data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, form]);
  
  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    
    if (checked) {
      // Select all suppliers
      setSelectedSuppliers(rfqSuppliers.map(s => s.supplierId));
    } else {
      // Deselect all suppliers
      setSelectedSuppliers([]);
    }
  };
  
  const handleSupplierSelect = (supplierId, checked) => {
    if (checked) {
      setSelectedSuppliers([...selectedSuppliers, supplierId]);
      // If all suppliers are now selected, update selectAll checkbox
      if (selectedSuppliers.length + 1 === rfqSuppliers.length) {
        setSelectAll(true);
      }
    } else {
      setSelectedSuppliers(selectedSuppliers.filter(id => id !== supplierId));
      setSelectAll(false);
    }
  };
  
  const handleSubmit = async (values) => {
    if (selectedSuppliers.length === 0) {
      message.warning(translate('Please select at least one supplier to send the RFQ to'));
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Import the API client
      const { default: apiClient } = await import('@/api/axiosConfig');
      
      // Make PUT request to the correct endpoint
      const response = await apiClient.put(`procurement/rfq/${id}/send`, {
        supplierIds: selectedSuppliers,
        message: values.message,
        emailSubject: values.emailSubject
      });
      
      message.success(translate('RFQ sent to suppliers successfully'));
      navigate(`/rfq/read/${id}`);
    } catch (err) {
      console.error('Error sending RFQ:', err);
      setError(err.response?.data?.message || err.message || 'Error sending RFQ');
      message.error(translate('Failed to send RFQ to suppliers'));
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }
  
  if (rfq && rfq.status !== 'draft') {
    return (
      <div className="container">
        <Alert
          message={translate('Cannot Send RFQ')}
          description={translate(`Only draft RFQs can be sent to suppliers. This RFQ is currently in '${rfq.status}' status.`)}
          type="warning"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate(`/rfq/read/${id}`)}>
              {translate('View RFQ')}
            </Button>
          }
        />
      </div>
    );
  }
  
  return (
    <div className="container">
      <div className="page-header">
        <Title level={2}>{translate('Send Request for Quotation to Suppliers')}</Title>
      </div>
      
      {error && (
        <Alert 
          message={translate('Error')} 
          description={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: 16 }}
        />
      )}
      
      {rfq && (
        <Card title={translate('RFQ Details')} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <Text strong>{translate('RFQ Number')}: </Text>
              <Text>{rfq.number || 'N/A'}</Text>
            </div>            <div>
              <Text strong>{translate('Description')}: </Text>
              <Text>{rfq.description || 'N/A'}</Text>
            </div>
            <div>
              <Text strong>{translate('Items')}: </Text>
              <Text>{rfq.items ? rfq.items.length : 0} items</Text>
            </div>
            <div>
              <Text strong>{translate('Due Date')}: </Text>
              <Text>{rfq.dueDate ? new Date(rfq.dueDate).toLocaleDateString() : 'N/A'}</Text>
            </div>
          </div>
        </Card>
      )}
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Card title={translate('Select Suppliers')} style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <Checkbox 
              checked={selectAll} 
              onChange={handleSelectAll}
              style={{ marginBottom: 16 }}
            >
              {translate('Select All Suppliers')}
            </Checkbox>
            
            <List
              dataSource={rfqSuppliers}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Checkbox 
                          checked={selectedSuppliers.includes(item.supplierId)}
                          onChange={e => handleSupplierSelect(item.supplierId, e.target.checked)}
                        />
                        <span>{item.supplierName}</span>
                      </div>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        {item.supplierEmail && <span><MailOutlined /> {item.supplierEmail}</span>}
                        {item.status && <Tag color={item.status === 'pending' ? 'default' : 'blue'}>{item.status}</Tag>}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        </Card>
        
        <Card title={translate('Email Message')} style={{ marginBottom: 16 }}>
          <Form.Item
            name="emailSubject"
            label={translate('Email Subject')}
            rules={[{ required: true, message: translate('Please enter an email subject') }]}
          >
            <Input placeholder={translate('Enter email subject')} />
          </Form.Item>
          
          <Form.Item
            name="message"
            label={translate('Message to Suppliers')}
            rules={[{ required: true, message: translate('Please enter a message to the suppliers') }]}
          >
            <TextArea rows={8} placeholder={translate('Enter your message to suppliers')} />
          </Form.Item>
          
          <div style={{ marginTop: 16 }}>
            <Alert
              message={translate('Note')}
              description={translate('Suppliers will receive an email with this message and a link to view and respond to the RFQ online.')}
              type="info"
              showIcon
            />
          </div>
        </Card>
        
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Space>
            <Button onClick={() => navigate(`/rfq/read/${id}`)}>
              {translate('Cancel')}
            </Button>
            <Button 
              onClick={() => {
                // Open supplier approval for each supplier
                if (rfqSuppliers.length > 0) {
                  // For demo: open the first supplier's approval page
                  const supplierId = rfqSuppliers[0].supplierId;
                  navigate(`/rfq/supplier-approval/${id}/${supplierId}`);
                } else {
                  message.warning('No suppliers available for approval test.');
                }
              }}
              style={{ marginRight: 8 }}
            >
              {translate('Test Supplier Approval')}
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting}
              icon={<SendOutlined />}
              disabled={selectedSuppliers.length === 0}
            >
              {translate('Send to Suppliers')}
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
}

export default RFQSend;
