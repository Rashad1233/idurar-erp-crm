import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, DatePicker, InputNumber, Divider, Space, Alert, Switch } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';

import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

const ItemForm = ({ form, index, remove, itemsLength }) => {
  const translate = useLanguage();
  
  const [showItemMasterSearch, setShowItemMasterSearch] = useState(false);
  const [itemMasters, setItemMasters] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (showItemMasterSearch) {
      setLoading(true);
      request.list({ entity: 'item-master' })
        .then(({ result }) => {
          setItemMasters(result);
        })
        .catch((error) => console.error('Error loading item masters:', error))
        .finally(() => setLoading(false));
    }
  }, [showItemMasterSearch]);
  
  const handleItemMasterSelect = (itemMasterId) => {
    const selectedItem = itemMasters.find(item => item._id === itemMasterId);
    
    if (selectedItem) {
      form.setFieldsValue({
        items: {
          ...form.getFieldValue('items'),
          [index]: {
            ...form.getFieldValue('items')[index],
            itemMasterId: selectedItem._id,
            itemName: selectedItem.name,
            description: selectedItem.description,
            uom: selectedItem.uom
          }
        }
      });
    }
  };
  
  return (
    <div style={{ marginBottom: 16, padding: 16, border: '1px solid #f0f0f0', borderRadius: 8 }}>
      <Form.Item
        label={translate('Item Type')}
        name={[index, 'itemType']}
        initialValue="manual"
      >
        <Select onChange={(value) => setShowItemMasterSearch(value === 'catalog')}>
          <Option value="manual">{translate('Manual Entry')}</Option>
          <Option value="catalog">{translate('Catalog Item')}</Option>
        </Select>
      </Form.Item>
      
      {showItemMasterSearch && (
        <Form.Item 
          label={translate('Select from Catalog')} 
          name={[index, 'itemMasterId']}
        >
          <Select 
            placeholder={translate('Search catalog items')}
            loading={loading}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            onChange={handleItemMasterSelect}
          >
            {itemMasters.map(item => (
              <Option key={item._id} value={item._id}>
                {item.name} ({item.code})
              </Option>
            ))}
          </Select>
        </Form.Item>
      )}
      
      <Form.Item 
        label={translate('Item Name')} 
        name={[index, 'itemName']}
        rules={[
          { required: true, message: translate('Please enter item name') }
        ]}
      >
        <Input />
      </Form.Item>
      
      <Form.Item 
        label={translate('Item Description')} 
        name={[index, 'description']}
      >
        <TextArea rows={2} />
      </Form.Item>
      
      <div style={{ display: 'flex', gap: 16 }}>
        <Form.Item 
          label={translate('Quantity')} 
          name={[index, 'quantity']}
          rules={[
            { required: true, message: translate('Please enter quantity') }
          ]}
          style={{ flex: 1 }}
        >
          <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item 
          label={translate('Unit of Measure')} 
          name={[index, 'uom']}
          rules={[
            { required: true, message: translate('Please specify UOM') }
          ]}
          style={{ flex: 1 }}
        >
          <Select>
            <Option value="EA">EA (Each)</Option>
            <Option value="PCS">PCS (Pieces)</Option>
            <Option value="KG">KG (Kilogram)</Option>
            <Option value="LTR">LTR (Liter)</Option>
            <Option value="M">M (Meter)</Option>
            <Option value="BOX">BOX</Option>
            <Option value="PACK">PACK</Option>
          </Select>
        </Form.Item>
        
        <Form.Item 
          label={translate('Est. Price')} 
          name={[index, 'price']}
          style={{ flex: 1 }}
        >
          <InputNumber 
            min={0} 
            step={0.01} 
            style={{ width: '100%' }} 
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>
      </div>
      
      {itemsLength > 1 && (
        <Button 
          type="dashed"
          danger
          icon={<DeleteOutlined />}
          onClick={() => remove(index)}
          style={{ marginTop: 8 }}
        >
          {translate('Remove Item')}
        </Button>
      )}
    </div>
  );
};

function PurchaseRequisitionCreate() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const translate = useLanguage();
    const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [costCenters, setCostCenters] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [useContract, setUseContract] = useState(false);
  
  // Load cost centers and suppliers
  useEffect(() => {
    // In a real application, you would fetch these from an API
    setCostCenters([
      { id: 'CC001', name: 'IT Department' },
      { id: 'CC002', name: 'HR Department' },
      { id: 'CC003', name: 'Finance Department' },
      { id: 'CC004', name: 'Operations' },
      { id: 'CC005', name: 'Marketing' },
    ]);      // Load suppliers from the correct entity
    request.list({ entity: 'procurement/supplier' })
      .then(({ result }) => {
        setSuppliers(result);
      })
      .catch(error => console.error('Error loading suppliers:', error));
      
    // Load active contracts
    request.list({ entity: 'procurement/contract' })
      .then(({ result }) => {
        setContracts(result);
      })
      .catch(error => console.error('Error loading contracts:', error));
  }, []);  const onFinish = (values) => {
    setLoading(true);
    setError(null);
    
    // Validate that at least one item is provided
    if (!values.items || values.items.length === 0) {
      setError('Please add at least one item to the purchase requisition');
      setLoading(false);
      return;
    }
    
    // Validate that all items have required fields
    const invalidItems = values.items.filter(item => !item.itemName || !item.quantity || !item.uom);
    if (invalidItems.length > 0) {
      setError('Please fill in all required fields (Item Name, Quantity, UOM) for all items');
      setLoading(false);
      return;
    }
      // Process items to ensure they have all required fields and calculate totals
    const processedItems = (values.items || []).map(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.price) || 0; // Map price to unitPrice
      const totalPrice = quantity * unitPrice;
      
      return {
        itemNumber: item.itemMasterId || null, // Use itemMasterId as itemNumber if available
        description: item.description || item.itemName, // Use description or itemName
        uom: item.uom || 'EA',
        quantity: quantity,
        unitPrice: unitPrice, // Backend expects unitPrice, not price
        totalPrice: totalPrice, // Backend expects totalPrice, not total
        supplierId: item.supplierId || null,
        supplierName: item.supplierName || null,
        comments: item.comments || null,
        deliveryDate: item.deliveryDate || null,
        inventoryId: item.inventoryId || null,
        contractId: item.contractId || null,
        itemMasterId: item.itemMasterId || null
      };
    });      // Convert any moment objects to ISO strings and map field names correctly
    const formData = {
      description: values.description,
      costCenter: values.costCenter,
      currency: values.currency || 'USD',
      notes: values.comments, // Map comments to notes
      requiredDate: values.requiredDate ? values.requiredDate.format('YYYY-MM-DD') : null,
      approverId: values.supplier || null, // Optional preferred supplier as approver
      contractId: useContract ? values.contractId : null, // Include contract if selected
      items: processedItems
    };
    
    console.log('Submitting PR data:', formData);
    
    // Add debugging to see what's actually being sent
    if (processedItems.length > 0) {
      console.log('Items being sent:', processedItems);
    } else {
      console.warn('No items are being sent!');
    }
    request.post({ entity: 'procurement/purchase-requisition', jsonData: formData })      .then(response => {
        console.log('PR created successfully:', response);
        // Add success notification
        if (window.notification) {
          window.notification.success({
            message: 'Purchase Requisition Created',
            description: `PR created successfully with ${processedItems.length} item(s)`
          });
        }
        navigate('/purchase-requisition');
      })
      .catch(error => {
        console.error('Error creating PR:', error);
        // Log more detailed error information
        if (error.response) {
          console.error('Error response data:', error.response.data);
          setError(error.response.data?.message || error.response.data?.error || 'Error creating purchase requisition');
        } else if (error.message) {
          setError(error.message);
        } else {
          setError('Error creating purchase requisition. Please check your input and try again.');
        }
      })
      .finally(() => setLoading(false));
  };
  
  return (
    <div>
      <div className="container">
        <div className="page-header">
          <h1>{translate('Create Purchase Requisition')}</h1>
        </div>
        
        {error && (
          <Alert 
            message="Error" 
            description={error} 
            type="error" 
            showIcon 
            style={{ marginBottom: 16 }} 
          />
        )}
        
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div style={{ backgroundColor: '#fff', padding: 24, borderRadius: 8, marginBottom: 24 }}>
            <h2>{translate('General Information')}</h2>
            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item 
                label={translate('Description')} 
                name="description"
                rules={[
                  { required: true, message: translate('Please enter a description') }
                ]}
                style={{ flex: 2 }}
              >
                <Input placeholder={translate('Short description of what you need')} />
              </Form.Item>
              
              <Form.Item 
                label={translate('Cost Center')} 
                name="costCenter"
                rules={[
                  { required: true, message: translate('Please select a cost center') }
                ]}
                style={{ flex: 1 }}
              >
                <Select placeholder={translate('Select cost center')}>
                  {costCenters.map(center => (
                    <Option key={center.id} value={center.id}>
                      {center.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            
            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item 
                label={translate('Currency')} 
                name="currency"
                initialValue="USD"
                style={{ flex: 1 }}
              >
                <Select>
                  <Option value="USD">USD</Option>
                  <Option value="EUR">EUR</Option>
                  <Option value="GBP">GBP</Option>
                  <Option value="CAD">CAD</Option>
                  <Option value="AUD">AUD</Option>
                </Select>
              </Form.Item>
              
              <Form.Item 
                label={translate('Required Date')} 
                name="requiredDate"
                style={{ flex: 1 }}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
                <Form.Item 
                label={translate('Preferred Supplier (Optional)')} 
                name="supplier"
                style={{ flex: 2 }}
              >
                <Select 
                  placeholder={translate('Select supplier if you have a preference')}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {suppliers.map(supplier => (
                    <Option key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'end' }}>
              <Form.Item 
                label={translate('Use Contract')} 
                style={{ flex: 1 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Switch
                    checked={useContract}
                    onChange={setUseContract}
                    checkedChildren="YES"
                    unCheckedChildren="NO"
                  />
                  <span style={{ marginLeft: 8, color: useContract ? '#52c41a' : '#999' }}>
                    {useContract ? translate('Contract Enabled') : translate('No Contract')}
                  </span>
                </div>
              </Form.Item>
              
              {useContract && (
                <Form.Item 
                  label={translate('Select Contract')} 
                  name="contractId"
                  style={{ flex: 2 }}
                  rules={useContract ? [{ required: true, message: translate('Please select a contract') }] : []}
                >
                  <Select
                    placeholder={translate('Select an active contract')}
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    allowClear
                  >
                    {contracts.map(contract => (
                      <Option key={contract.id} value={contract.id}>
                        {contract.contractName} - {contract.supplier?.name} ({contract.contractNumber})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
            </div>
            
            <Form.Item 
              label={translate('Additional Comments')} 
              name="comments"
            >
              <TextArea rows={3} placeholder={translate('Any additional information that might help procurement')} />
            </Form.Item>
          </div>
          
          <div style={{ backgroundColor: '#fff', padding: 24, borderRadius: 8, marginBottom: 24 }}>
            <h2>{translate('Items')}</h2>
            
            <Form.List
              name="items"
              initialValue={[{}]} // Start with one empty item
            >
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <ItemForm 
                      key={field.key}
                      form={form}
                      index={field.name}
                      remove={remove}
                      itemsLength={fields.length}
                    />
                  ))}
                  
                  <Form.Item>
                    <Button 
                      type="dashed" 
                      onClick={() => add()} 
                      block 
                      icon={<PlusOutlined />}
                    >
                      {translate('Add Item')}
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {translate('Save as Draft')}
              </Button>
              <Button onClick={() => navigate('/purchase-requisition')}>
                {translate('Cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default PurchaseRequisitionCreate;
