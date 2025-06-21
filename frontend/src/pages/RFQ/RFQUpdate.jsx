import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  DatePicker, 
  Table, 
  Card, 
  Alert, 
  Spin, 
  Divider,
  Space,
  message,
  Typography,
  Transfer,
  InputNumber
} from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import moment from 'moment';

import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import { prepareTransferDataSource } from '@/utils/supplierIdValidation';
import { validateRfqFormData } from '@/utils/rfqValidation';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

function RFQUpdate() {
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const translate = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [rfq, setRFQ] = useState(null);
  const [rfqItems, setRFQItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [transferData, setTransferData] = useState([]);
  const [manualItems, setManualItems] = useState([]);
  
  // Load RFQ data
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Load RFQ details first
    request.read({ entity: 'rfq', id })
      .then(response => {
        if (response.success) {
          setRFQ(response.result);
          
          // Set items
          if (response.result.items && Array.isArray(response.result.items)) {
            const items = response.result.items.map(item => ({
              ...item,
              id: item._id || item.id,
              key: item._id || item.id
            }));
            setRFQItems(items);
            setManualItems(items);
          }
          
          // Set selected suppliers
          if (response.result.suppliers && Array.isArray(response.result.suppliers)) {
            const supplierIds = response.result.suppliers.map(s => 
              s.supplierId || (s.supplier ? (s.supplier._id || s.supplier.id) : null)
            ).filter(Boolean);
            
            setSelectedSuppliers(supplierIds);
          }
            // Set form values
          form.setFieldsValue({
            description: response.result.description || response.result.title,
            dueDate: response.result.dueDate ? moment(response.result.dueDate) : null
          });
        } else {
          setError('Failed to load RFQ details');
        }
        
        // Load supplier list
        return request.list({ entity: 'client' });
      })
      .then(response => {
        if (response && response.result) {
          // Filter for suppliers
          const suppliersList = response.result.filter(client => 
            client.type === 'supplier' || client.type === 'both'
          );
          
          setSuppliers(suppliersList);
          
          // Prepare transfer data
          const { targetKeys, transferData } = prepareTransferDataSource(
            suppliersList,
            selectedSuppliers
          );
          
          setTransferData(transferData);
          setSelectedSuppliers(targetKeys);
          
          // Set supplier form field
          form.setFieldsValue({
            suppliers: targetKeys
          });
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
  
  const handleSupplierChange = targetKeys => {
    setSelectedSuppliers(targetKeys);
    form.setFieldsValue({ suppliers: targetKeys });
  };
  
  const handleAddItem = () => {
    const newItem = {
      key: `new-${Date.now()}`,
      itemName: '',
      description: '',
      quantity: 1,
      uom: 'each'
    };
    
    setManualItems([...manualItems, newItem]);
  };
  
  const handleRemoveItem = key => {
    setManualItems(manualItems.filter(item => item.key !== key));
  };
  
  const handleItemChange = (key, field, value) => {
    setManualItems(manualItems.map(item => 
      item.key === key ? { ...item, [field]: value } : item
    ));
  };
  
  const handleSubmit = (values) => {
    setSubmitting(true);
    setError(null);
      // Prepare form data
    const formData = {
      ...values,
      dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : undefined,
      description: values.description || `RFQ-${moment().format('YYYY-MM-DD')}`,
      suppliers: selectedSuppliers,
      items: manualItems.map(item => ({
        id: item.id || item._id,
        itemName: item.itemName,
        description: item.description || '',
        quantity: parseFloat(item.quantity) || 1,
        uom: item.uom || 'each',
        prItemId: item.prItemId
      }))
    };
    
    // Validate form data
    const { isValid, normalizedFormData, errors } = validateRfqFormData(formData);
    
    if (!isValid) {
      setError(errors.join(', '));
      setSubmitting(false);
      message.error(translate(errors[0] || 'Validation failed'));
      return;
    }
    
    // Submit update request
    request.update({ entity: 'rfq', id, jsonData: normalizedFormData })
      .then(response => {
        message.success(translate('RFQ updated successfully'));
        navigate(`/rfq/read/${id}`);
      })
      .catch(err => {
        console.error('Error updating RFQ:', err);
        setError(err.message || 'Error updating RFQ');
        message.error(translate('Failed to update RFQ'));
      })
      .finally(() => {
        setSubmitting(false);
      });
  };
  
  const itemColumns = [
    {
      title: translate('Item Name'),
      dataIndex: 'itemName',
      key: 'itemName',
      render: (text, record) => (
        <Input 
          value={text} 
          onChange={e => handleItemChange(record.key, 'itemName', e.target.value)}
          placeholder={translate('Enter item name')}
        />
      ),
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => (
        <Input 
          value={text} 
          onChange={e => handleItemChange(record.key, 'description', e.target.value)}
          placeholder={translate('Enter description')}
        />
      ),
    },
    {
      title: translate('Quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record) => (
        <InputNumber 
          value={text} 
          min={1} 
          onChange={value => handleItemChange(record.key, 'quantity', value)}
        />
      ),
    },
    {
      title: translate('UOM'),
      dataIndex: 'uom',
      key: 'uom',
      render: (text, record) => (
        <Select 
          value={text} 
          onChange={value => handleItemChange(record.key, 'uom', value)}
          style={{ width: 120 }}
        >
          <Option value="each">{translate('Each')}</Option>
          <Option value="box">{translate('Box')}</Option>
          <Option value="kg">{translate('Kilogram')}</Option>
          <Option value="liter">{translate('Liter')}</Option>
          <Option value="meter">{translate('Meter')}</Option>
          <Option value="pack">{translate('Pack')}</Option>
          <Option value="set">{translate('Set')}</Option>
          <Option value="unit">{translate('Unit')}</Option>
        </Select>
      ),
    },
    {
      title: translate('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => handleRemoveItem(record.key)}
        />
      ),
    },
  ];
  
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }
  
  if (rfq && rfq.status !== 'draft') {
    return (
      <div className="container">
        <Alert
          message={translate('Cannot Edit RFQ')}
          description={translate(`Only draft RFQs can be edited. This RFQ is currently in '${rfq.status}' status.`)}
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
        <Title level={2}>{translate('Update Request for Quotation')}</Title>
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
      
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleSubmit}
      >        <Card title={translate('RFQ Details')} style={{ marginBottom: 16 }}>
          <Form.Item
            name="description"
            label={translate('RFQ Description')}
            rules={[{ required: true, message: translate('Please enter a description for this RFQ') }]}
          >
            <TextArea rows={3} placeholder={translate('Enter a descriptive title and details about this RFQ')} />
          </Form.Item>
          
          <Form.Item
            name="dueDate"
            label={translate('Due Date')}
            rules={[{ required: true, message: translate('Please select a due date') }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Card>
        
        <Card title={translate('Suppliers')} style={{ marginBottom: 16 }}>
          <Form.Item
            name="suppliers"
            rules={[{ required: true, message: translate('Please select at least one supplier') }]}
          >
            <Transfer
              dataSource={transferData}
              targetKeys={selectedSuppliers}
              onChange={handleSupplierChange}
              render={item => item.title}
              titles={[translate('Available'), translate('Selected')]}
              listStyle={{ width: '45%', height: 300 }}
            />
          </Form.Item>
        </Card>
        
        <Card 
          title={translate('Items')} 
          style={{ marginBottom: 16 }}
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>
              {translate('Add Item')}
            </Button>
          }
        >
          <Table 
            dataSource={manualItems} 
            columns={itemColumns}
            rowKey="key"
            pagination={false}
          />
        </Card>
        
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Space>
            <Button onClick={() => navigate('/rfq')}>
              {translate('Cancel')}
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting}
              icon={<SaveOutlined />}
            >
              {translate('Update RFQ')}
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
}

export default RFQUpdate;
