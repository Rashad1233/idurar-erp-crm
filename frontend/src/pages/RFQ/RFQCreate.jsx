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
  Transfer
} from 'antd';
import { PlusOutlined, WarningOutlined } from '@ant-design/icons';
import moment from 'moment';

import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import { normalizeSuppliers, prepareTransferDataSource } from '@/utils/supplierIdValidation';
import { validateRfqFormData } from '@/utils/rfqValidation';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

function RFQCreate() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const translate = useLanguage();
  
  const [loading, setLoading] = useState(false);
  const [prLoading, setPrLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [purchaseRequisition, setPurchaseRequisition] = useState(null);
  const [prItems, setPrItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [supplierError, setSupplierError] = useState(null);
  const [supplierWarnings, setSupplierWarnings] = useState([]);
  const [manualItems, setManualItems] = useState([]);
  
  // Parse query params to get PR ID if provided
  const queryParams = new URLSearchParams(location.search);
  const prId = queryParams.get('prId');
  
  // Fetch PR data if PR ID is provided
  useEffect(() => {
    if (prId) {
      setPrLoading(true);
      setError(null);
      
      console.log('DEBUG: Fetching PR with ID:', prId);
      
      request.read({ entity: 'purchase-requisition', id: prId })
        .then(response => {
          console.log('DEBUG: PR API Response:', response);
          const result = response.result;
          setPurchaseRequisition(result);
          
          // Set PR items
          if (result.items && result.items.length > 0) {
            console.log('DEBUG: PR Items received:', result.items);
            setPrItems(result.items);
            
            // Select all items by default, handling both id and _id
            const itemIds = result.items.map(item => item._id || item.id);
            console.log('DEBUG: Selected item IDs:', itemIds);
            setSelectedItems(itemIds);
              // Set form fields
            form.setFieldsValue({
              description: result.description || `RFQ for ${result.number}`,
              prId: result._id || result.id
            });
          } else {
            console.error('DEBUG: No items found in the purchase requisition response:', result);
            console.warn('DEBUG: PR object structure:', Object.keys(result));
            setError('Purchase requisition has no items');
          }
        })
        .catch(err => {
          console.error('DEBUG: Error loading purchase requisition:', err);
          setError(err.message || 'Error loading purchase requisition');
        })
        .finally(() => {
          setPrLoading(false);
        });
    }
  }, [prId, form]);  // Load suppliers with improved ID handling
  useEffect(() => {
    setSupplierWarnings([]);
    setSupplierError(null);
    
    request.list({ entity: 'client' })
      .then(({ result }) => {
        // Filter for suppliers (include those with type 'both' as well - they can be suppliers)
        const suppliersList = result.filter(client => 
          client.type === 'supplier' || client.type === 'both'
        );
        
        console.log(`Found ${suppliersList.length} suppliers in total`);
        
        // Use our utility function to normalize suppliers
        const { 
          normalizedSuppliers, 
          isValid, 
          hasDuplicates, 
          hasMissingIds,
          errors 
        } = normalizeSuppliers(suppliersList);
        
        if (!isValid) {
          // Store errors/warnings but continue with normalized suppliers
          if (hasMissingIds) {
            setSupplierWarnings(prev => [...prev, 'Some suppliers are missing IDs. Temporary IDs have been assigned.']);
          }
          
          if (hasDuplicates) {
            setSupplierWarnings(prev => [...prev, 'Some suppliers have duplicate IDs. Unique IDs have been assigned.']);
          }
          
          console.warn('Supplier validation issues:', errors);
        }
        
        setSuppliers(normalizedSuppliers);
      })
      .catch(error => {
        console.error('Error loading suppliers:', error);
        setSupplierError('Failed to load suppliers. Please refresh the page and try again.');
      });
  }, []);
  const handleSupplierChange = (selectedTargetKeys) => {
    // Enhanced validation to ensure they're not empty or undefined
    const validKeys = [];
    const invalidKeys = [];
    
    selectedTargetKeys.forEach(key => {
      if (key && typeof key === 'string' && key.trim() !== '') {
        validKeys.push(key);
      } else {
        invalidKeys.push(key);
      }
    });
    
    if (validKeys.length !== selectedTargetKeys.length) {
      console.warn(`Filtered out ${invalidKeys.length} invalid supplier keys:`, invalidKeys);
      
      // Log which suppliers are causing problems
      const selectedSupplierNames = suppliers
        .filter(s => selectedTargetKeys.includes(s._id || s.id))
        .map(s => `${s.name || 'Unnamed'} (${s._id || s.id})`);
      
      console.log('Selected suppliers:', selectedSupplierNames);
    }
    
    // Log before setting state for debugging
    console.log(`Setting ${validKeys.length} valid supplier keys in state`);
    
    setSelectedSuppliers(validKeys);
    
    form.setFieldsValue({
      suppliers: validKeys
    });
  };
  
  const handleAddManualItem = () => {
    setManualItems([
      ...manualItems,
      {
        key: Date.now(),
        itemName: '',
        description: '',
        quantity: 1,
        uom: 'each',
      },
    ]);
  };

  const handleManualItemChange = (key, field, value) => {
    setManualItems(manualItems.map(item =>
      item.key === key ? { ...item, [field]: value } : item
    ));
  };

  const handleRemoveManualItem = (key) => {
    setManualItems(manualItems.filter(item => item.key !== key));
  };

  const itemsToUse = prItems.length > 0 ? prItems : manualItems;

  const  handleSubmit = (values) => {
    // Validate suppliers exist and have valid IDs
    if (!selectedSuppliers || selectedSuppliers.length === 0) {
      message.error(translate('Please select at least one supplier'));
      return;
    }
    
    // Additional validation to ensure all supplier IDs are valid
    const validSupplierIds = selectedSuppliers.filter(key => key && typeof key === 'string' && key.trim() !== '');
    if (validSupplierIds.length !== selectedSuppliers.length) {
      console.error('Found invalid supplier IDs in selection:', 
        selectedSuppliers.filter(id => !validSupplierIds.includes(id)));
      message.error(translate('Some selected suppliers have invalid IDs. Please try selecting them again.'));
      return;
    }
    
    // Validate items exist
    const itemsSource = prItems.length > 0 ? selectedItems : manualItems.map(i => i.key);
    if (!itemsSource || itemsSource.length === 0) {
      message.error(translate('Please add at least one item'));
      return;
    }
    
    setLoading(true);
    setError(null);
      // Format dates and ensure all required fields are present
    const formData = {
      ...values,
      dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : moment().add(7, 'days').format('YYYY-MM-DD'),
      description: values.description || `RFQ-${moment().format('YYYY-MM-DD')}`,
      // Process suppliers
      suppliers: selectedSuppliers,
      // Process items
      items: itemsSource === 'pr' 
        ? selectedItems.map(itemId => {
            const item = prItems.find(i => (i._id === itemId) || (i.id === itemId));
            if (!item) return null;
            return {
              prItemId: item._id || item.id,
              itemName: item.itemName || item.name || 'Unnamed Item',
              description: item.description || '',
              quantity: parseFloat(item.quantity) || 1,
              uom: item.uom || 'each',
              requestedDeliveryDate: item.requestedDeliveryDate || values.dueDate?.format('YYYY-MM-DD')
            };
          }).filter(Boolean)
        : manualItems.map(item => ({
            itemName: item.itemName,
            description: item.description || '',
            quantity: parseFloat(item.quantity) || 1,
            uom: item.uom || 'each',
            requestedDeliveryDate: item.requestedDeliveryDate || values.dueDate?.format('YYYY-MM-DD')
          }))
    };

    // Validate the form data
    const { isValid, normalizedFormData, errors } = validateRfqFormData(formData);
    
    if (!isValid) {
      setError(errors.join(', '));
      setLoading(false);
      return;
    }

    // Submit the form
    request.create({ entity: 'rfq', jsonData: normalizedFormData })
      .then(response => {
        if (response.success) {
          message.success(translate('RFQ created successfully'));
          navigate('/rfq/list');
        } else {
          throw new Error(response.message || 'Error creating RFQ');
        }
      })
      .catch(err => {
        console.error('Error creating RFQ:', err);
        setError(err.message || 'Error creating RFQ');
        message.error(translate('Failed to create RFQ'));
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  const itemColumns = [
    {
      title: translate('Item Name'),
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
      render: text => text || '-',
    },
    {
      title: translate('Quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: translate('UOM'),
      dataIndex: 'uom',
      key: 'uom',
    },
  ];
  
  if (prLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }
  
  return (
    <div className="container">
      <div className="page-header">
        <Title level={2}>{translate('Create Request for Quotation')}</Title>
      </div>
        {error && (
        <Alert 
          message={translate('Error Creating RFQ')} 
          description={
            <div>
              <p>{error}</p>
              <p>{translate('Please check the form and try again. If the problem persists, contact support.')}</p>
            </div>
          }
          type="error" 
          showIcon 
          style={{ marginBottom: 16 }} 
        />
      )}
      
      <Form 
        form={form} 
        layout="vertical"        onFinish={handleSubmit}
        initialValues={{
          dueDate: moment().add(7, 'days')
        }}
      >
        <Card title={translate('RFQ Details')} style={{ marginBottom: 16 }}>
          <Form.Item
            name="description"
            label={translate('RFQ Description')}
            rules={[{ required: true, message: translate('Please enter a description for this RFQ') }]}
          >
            <TextArea rows={3} placeholder={translate('Enter a descriptive title and details about this RFQ')} />
          </Form.Item>
          
          <Form.Item
            name="prId"
            label={translate('Purchase Requisition')}
            hidden={!prId}
          >
            <Input disabled />
          </Form.Item>          <Form.Item
            name="dueDate"
            label={translate('Due Date')}
            rules={[{ required: true, message: translate('Please select a due date') }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Card>
          <Card title={translate('Suppliers')} style={{ marginBottom: 16 }}>
          <Alert 
            message={translate('Select at least one supplier to send this RFQ to')} 
            type="info" 
            showIcon 
            style={{ marginBottom: 16 }} 
          />
          
          {supplierError && (
            <Alert
              message={translate("Error Loading Suppliers")}
              description={supplierError}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          
          {supplierWarnings.length > 0 && (
            <Alert
              message={translate("Supplier Data Issues Detected")}
              description={
                <ul>
                  {supplierWarnings.map((warning, index) => (
                    <li key={index}>{translate(warning)}</li>
                  ))}
                </ul>
              }
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          
          <Transfer
            dataSource={prepareTransferDataSource(suppliers)}
            titles={[translate('Available Suppliers'), translate('Selected Suppliers')]}
            targetKeys={selectedSuppliers}
            onChange={handleSupplierChange}
            render={item => (
              <div>
                <strong>{item.title}</strong> {item.description ? `(${item.description})` : ''}
              </div>
            )}
            listStyle={{
              width: '45%',
              height: 300,
            }}
            style={{ marginBottom: 16 }}
            filterOption={(inputValue, item) => {
              const searchValue = inputValue.toLowerCase();
              return (
                (item.title && item.title.toLowerCase().includes(searchValue)) ||
                (item.description && item.description.toLowerCase().includes(searchValue))
              );
            }}
            showSearch
          />
          
          <Form.Item name="suppliers" hidden>
            <Input />
          </Form.Item>
        </Card>
        
        <Card title={translate('Items')}>
          {prItems.length > 0 ? (
            <>
              <Alert 
                message={translate('These items will be included in the RFQ')} 
                type="info" 
                showIcon 
                style={{ marginBottom: 16 }} 
              />
              
              {/* Debug information to show what items we have */}
              <div style={{ marginBottom: 16, padding: 10, background: '#f0f2f5', border: '1px dashed #d9d9d9' }}>
                <h4>Debug: Available Items ({prItems.length})</h4>
                <ul>
                  {prItems.map((item, index) => (
                    <li key={item._id || item.id || index}>
                      {item.itemName} ({item.quantity} {item.uom}) - 
                      ID: {item._id || item.id || 'unknown'} - 
                      PR ID: {item.prId}
                    </li>
                  ))}
                </ul>
              </div>
              
              <Table
                rowSelection={{
                  selectedRowKeys: selectedItems,
                  onChange: selectedRowKeys => setSelectedItems(selectedRowKeys),
                }}                
                columns={itemColumns}
                dataSource={prItems}
                rowKey={record => record._id || record.id || `item-${Math.random().toString(36).substring(2, 10)}`}
                pagination={false}
                locale={{
                  emptyText: translate('No items available')
                }}
                rowClassName={(record) => {
                  // Apply a class for easier debugging if needed
                  return record._id ? '' : 'item-missing-id';
                }}
              />
            </>
          ) : (
            <>
              <Alert
                message={translate('No PR selected or PR has no items. Please add items manually below.')}
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Button type="dashed" onClick={handleAddManualItem} icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
                {translate('Add Item')}
              </Button>
              <Table
                dataSource={manualItems}
                columns={[
                  {
                    title: translate('Item Name'),
                    dataIndex: 'itemName',
                    key: 'itemName',
                    render: (text, record) => (
                      <Input
                        value={text}
                        onChange={e => handleManualItemChange(record.key, 'itemName', e.target.value)}
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
                        onChange={e => handleManualItemChange(record.key, 'description', e.target.value)}
                        placeholder={translate('Enter description')}
                      />
                    ),
                  },
                  {
                    title: translate('Quantity'),
                    dataIndex: 'quantity',
                    key: 'quantity',
                    render: (text, record) => (
                      <Input
                        type="number"
                        min={1}
                        value={text}
                        onChange={e => handleManualItemChange(record.key, 'quantity', e.target.value)}
                        placeholder={translate('Quantity')}
                      />
                    ),
                  },
                  {
                    title: translate('UOM'),
                    dataIndex: 'uom',
                    key: 'uom',
                    render: (text, record) => (
                      <Input
                        value={text}
                        onChange={e => handleManualItemChange(record.key, 'uom', e.target.value)}
                        placeholder={translate('Unit of Measure')}
                      />
                    ),
                  },
                  {
                    title: '',
                    key: 'action',
                    render: (_, record) => (
                      <Button danger onClick={() => handleRemoveManualItem(record.key)}>
                        {translate('Remove')}
                      </Button>
                    ),
                  },
                ]}
                rowKey={record => record.key}
                pagination={false}
                locale={{ emptyText: translate('No items. Click "Add Item" to add.') }}
              />
            </>
          )}
        </Card>
        
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Space>
            <Button onClick={() => navigate('/rfq')}>
              {translate('Cancel')}
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              disabled={prItems.length === 0 && manualItems.length === 0}
            >
              {translate('Create RFQ')}
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
}

export default RFQCreate;
