import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  InputNumber
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';

import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

// Create Form component to be passed to the CreateItem component
function POCreateForm({ subTotal, offerTotal }) {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const translate = useLanguage();
  
  const [loading, setLoading] = useState(false);
  const [rfqLoading, setRfqLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [rfqData, setRfqData] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [items, setItems] = useState([]);
  
  // Parse query params to get RFQ ID if provided
  const queryParams = new URLSearchParams(location.search);
  const rfqId = queryParams.get('rfqId');
  const supplierId = queryParams.get('supplierId');
  
  // Load suppliers
  useEffect(() => {
    setLoading(true);
    
    request.list({ entity: 'client', query: { type: 'supplier' } })
      .then(response => {
        if (response.success && response.result) {
          setSuppliers(response.result);
        }
      })
      .catch(err => {
        console.error('Failed to load suppliers:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  
  // Load RFQ data if RFQ ID is provided
  useEffect(() => {
    if (rfqId) {
      setRfqLoading(true);
      
      request.read({ entity: 'rfq', id: rfqId })
        .then(response => {
          if (response.success && response.result) {
            setRfqData(response.result);
            
            // Load selected supplier and quote items if supplier ID is provided
            if (supplierId) {
              const supplier = response.result.suppliers.find(s => (s._id || s.id) === supplierId);
              if (supplier) {
                setSelectedSupplier(supplier);
                
                // Get supplier quote items
                request.filter({
                  entity: 'rfqsupplierresponse',
                  filter: { rfq: rfqId, supplier: supplierId }
                })
                  .then(quoteResponse => {
                    if (quoteResponse.success && quoteResponse.result && quoteResponse.result.length > 0) {
                      const quoteItems = quoteResponse.result[0].items || [];
                      
                      // Merge quote items with RFQ items
                      const rfqItems = response.result.items || [];
                      const mergedItems = rfqItems.map(rfqItem => {
                        const quoteItem = quoteItems.find(qi => 
                          (qi.itemId === (rfqItem._id || rfqItem.id)) || 
                          (qi.itemName === rfqItem.name)
                        );
                        
                        return {
                          itemId: rfqItem._id || rfqItem.id,
                          name: rfqItem.name,
                          description: rfqItem.description,
                          quantity: rfqItem.quantity,
                          price: quoteItem?.price || 0,
                          unit: rfqItem.unit
                        };
                      });
                      
                      setItems(mergedItems);
                      
                      // Set form values
                      form.setFieldsValue({
                        supplier: supplierId,
                        rfq: rfqId,
                        date: moment(),
                        expectedDeliveryDate: moment().add(14, 'days'),
                        items: mergedItems
                      });
                    }
                  })
                  .catch(err => {
                    console.error('Failed to load supplier quotes:', err);
                  });
              }
            }
          }
        })
        .catch(err => {
          console.error('Failed to load RFQ data:', err);
        })
        .finally(() => {
          setRfqLoading(false);
        });
    }
  }, [rfqId, supplierId]);
  
  // Add item row
  const addItem = () => {
    const newItem = {
      key: Date.now(),
      name: '',
      description: '',
      quantity: 1,
      price: 0,
      unit: 'each'
    };
    
    setItems([...items, newItem]);
    
    const formItems = form.getFieldValue('items') || [];
    form.setFieldsValue({
      items: [...formItems, newItem]
    });
  };
  
  // Remove item row
  const removeItem = (itemKey) => {
    const newItems = items.filter(item => item.key !== itemKey);
    setItems(newItems);
    
    const formItems = form.getFieldValue('items') || [];
    form.setFieldsValue({
      items: formItems.filter(item => item.key !== itemKey)
    });
  };
  
  // Calculate item total
  const calculateItemTotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    return quantity * price;
  };
  
  const itemColumns = [
    {
      title: translate('Item Name'),
      dataIndex: 'name',
      key: 'name',
      render: (_, record, index) => (
        <Form.Item
          name={['items', index, 'name']}
          rules={[{ required: true, message: translate('Please enter item name') }]}
          style={{ margin: 0 }}
        >
          <Input placeholder={translate('Item name')} />
        </Form.Item>
      )
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
      render: (_, record, index) => (
        <Form.Item
          name={['items', index, 'description']}
          style={{ margin: 0 }}
        >
          <Input placeholder={translate('Description')} />
        </Form.Item>
      )
    },
    {
      title: translate('Quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (_, record, index) => (
        <Form.Item
          name={['items', index, 'quantity']}
          rules={[{ required: true, message: translate('Required') }]}
          style={{ margin: 0 }}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
      )
    },
    {
      title: translate('Unit'),
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
      render: (_, record, index) => (
        <Form.Item
          name={['items', index, 'unit']}
          style={{ margin: 0 }}
        >
          <Select style={{ width: '100%' }}>
            <Option value="each">{translate('Each')}</Option>
            <Option value="kg">{translate('Kg')}</Option>
            <Option value="liter">{translate('Liter')}</Option>
            <Option value="box">{translate('Box')}</Option>
            <Option value="set">{translate('Set')}</Option>
          </Select>
        </Form.Item>
      )
    },
    {
      title: translate('Price'),
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (_, record, index) => (
        <Form.Item
          name={['items', index, 'price']}
          rules={[{ required: true, message: translate('Required') }]}
          style={{ margin: 0 }}
        >
          <InputNumber 
            min={0} 
            style={{ width: '100%' }} 
            formatter={(value) => `$${value}`}
            parser={(value) => value.replace(/^\$\s?/, '')}
          />
        </Form.Item>
      )
    },
    {
      title: translate('Total'),
      key: 'total',
      width: 120,
      render: (_, record, index) => {
        const formValues = form.getFieldsValue();
        const item = formValues.items?.[index] || {};
        const total = calculateItemTotal(item);
        return `$${total.toFixed(2)}`;
      }
    },
    {
      title: translate('Actions'),
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => removeItem(record.key)}
        />
      )
    }
  ];
  
  return (
    <>
      <Form.Item
        name="supplier"
        label={translate('Supplier')}
        rules={[{ required: true, message: translate('Please select a supplier') }]}
      >
        <Select 
          placeholder={translate('Select Supplier')}
          loading={loading}
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {suppliers.map(supplier => (
            <Option key={supplier._id || supplier.id} value={supplier._id || supplier.id}>{supplier.name}</Option>
          ))}
        </Select>
      </Form.Item>
      
      <Form.Item name="rfq" label={translate('RFQ Reference')}>
        <Input disabled={!!rfqId} />
      </Form.Item>
      
      <Form.Item name="customerRef" label={translate('Customer Reference')}>
        <Input placeholder={translate('Customer PO number, etc.')} />
      </Form.Item>

      <Space size="large" style={{ display: 'flex' }}>
        <Form.Item
          name="date"
          label={translate('Date')}
          rules={[{ required: true, message: translate('Please select date') }]}
          style={{ width: '100%' }}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="expectedDeliveryDate"
          label={translate('Expected Delivery Date')}
          rules={[{ required: true, message: translate('Please select expected delivery date') }]}
          style={{ width: '100%' }}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Space>

      <Form.Item name="department" label={translate('Department')}>
        <Input placeholder={translate('Requesting department')} />
      </Form.Item>

      <Form.Item name="notes" label={translate('Notes')}>
        <TextArea rows={4} placeholder={translate('Notes or special instructions')} />
      </Form.Item>

      <Divider>{translate('Items')}</Divider>

      <Form.List name="items">
        {(fields, { add, remove }) => (
          <>
            <Table
              columns={itemColumns}
              dataSource={fields.map(field => ({
                ...field,
                key: field.key,
                fieldKey: field.fieldKey
              }))}
              pagination={false}
              bordered
              footer={() => (
                <Button
                  type="dashed"
                  onClick={addItem}
                  block
                  icon={<PlusOutlined />}
                >
                  {translate('Add Item')}
                </Button>
              )}
            />
          </>
        )}
      </Form.List>

      <Divider />
      
      <div style={{ textAlign: 'right' }}>
        <Title level={4}>{translate('Subtotal')}: ${subTotal.toFixed(2)}</Title>
      </div>
    </>
  );
}

function PurchaseOrderCreate() {
  const config = {
    entity: 'purchase-order',
  };

  return <CreateItem config={config} CreateForm={POCreateForm} />;
}

export default PurchaseOrderCreate;
