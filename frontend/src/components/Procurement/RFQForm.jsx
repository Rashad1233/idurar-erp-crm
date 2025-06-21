import React, { useEffect, useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  DatePicker, 
  Select, 
  Table, 
  Space, 
  Divider, 
  Card,
  Row,
  Col,
  InputNumber,
  message,
  Spin
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  SaveOutlined, 
  SendOutlined,
  LinkOutlined,
  UnlinkOutlined
} from '@ant-design/icons';
import { useHistory, useParams } from 'react-router-dom';
import dayjs from 'dayjs';

import procurementService from '@/services/procurementService';
import SelectAsync from '@/components/SelectAsync';

const { TextArea } = Input;
const { Option } = Select;

export default function RFQForm() {
  const [form] = Form.useForm();
  const history = useHistory();
  const { id, prId } = useParams(); // prId is for creating RFQ from PR
  
  const [isLoading, setIsLoading] = useState(false);
  const [rfqData, setRfqData] = useState(null);
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isFromPR, setIsFromPR] = useState(false);
  const [prData, setPrData] = useState(null);
  const [availableSuppliers, setAvailableSuppliers] = useState([]);
  
  // Fetch data for editing
  const fetchRFQ = async (rfqId) => {
    setIsLoading(true);
    try {
      const result = await procurementService.getRFQ(rfqId);
      if (result.success && result.data) {
        setRfqData(result.data);
        setItems(result.data.items || []);
        setSuppliers(result.data.suppliers || []);
        
        // Populate form fields
        form.setFieldsValue({
          description: result.data.description,
          responseDeadline: result.data.responseDeadline ? dayjs(result.data.responseDeadline) : null,
          notes: result.data.notes || '',
        });
      } else {
        message.error('Failed to fetch RFQ data');
      }
    } catch (error) {
      console.error('Error fetching RFQ:', error);
      message.error('Error fetching RFQ data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch PR data if creating from PR
  const fetchPRData = async (prId) => {
    setIsLoading(true);
    setIsFromPR(true);
    try {
      const result = await procurementService.getPurchaseRequisition(prId);
      if (result.success && result.data) {
        setPrData(result.data);
        
        // Set initial form values from PR
        form.setFieldsValue({
          description: `RFQ for ${result.data.prNumber}: ${result.data.description}`,
          purchaseRequisitionId: result.data.id,
          responseDeadline: dayjs().add(7, 'day'), // Default to 7 days from today
        });
        
        // Set initial items from PR items
        if (result.data.items && result.data.items.length > 0) {
          const initialItems = result.data.items.map(item => ({
            id: item.id,
            itemNumber: item.itemNumber,
            description: item.description,
            uom: item.uom,
            quantity: item.quantity,
            purchaseRequisitionItemId: item.id
          }));
          setItems(initialItems);
        }
      } else {
        message.error('Failed to fetch Purchase Requisition data');
      }
    } catch (error) {
      console.error('Error fetching PR:', error);
      message.error('Error fetching Purchase Requisition data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch available suppliers
  const fetchSuppliers = async () => {
    try {
      const result = await procurementService.getSuppliers();
      if (result.success && result.data) {
        setAvailableSuppliers(result.data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };
  
  useEffect(() => {
    fetchSuppliers();
    
    if (id) {
      fetchRFQ(id);
    } else if (prId) {
      fetchPRData(prId);
    }
  }, [id, prId]);
  
  // Handle adding a new item
  const handleAddItem = () => {
    const newItem = {
      key: Date.now(),
      description: '',
      quantity: 1,
      uom: '',
      itemNumber: null
    };
    setItems([...items, newItem]);
  };
  
  // Handle removing an item
  const handleRemoveItem = (key) => {
    setItems(items.filter(item => item.key !== key && item.id !== key));
  };
  
  // Handle item field change
  const handleItemChange = (key, field, value) => {
    const updatedItems = items.map(item => {
      if (item.key === key || item.id === key) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setItems(updatedItems);
  };
  
  // Handle adding a new supplier
  const handleAddSupplier = () => {
    const newSupplier = {
      key: Date.now(),
      supplierName: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      supplierId: null
    };
    setSuppliers([...suppliers, newSupplier]);
  };
  
  // Handle removing a supplier
  const handleRemoveSupplier = (key) => {
    setSuppliers(suppliers.filter(supplier => supplier.key !== key && supplier.id !== key));
  };
  
  // Handle supplier field change
  const handleSupplierChange = (key, field, value) => {
    const updatedSuppliers = suppliers.map(supplier => {
      if (supplier.key === key || supplier.id === key) {
        return { ...supplier, [field]: value };
      }
      return supplier;
    });
    setSuppliers(updatedSuppliers);
  };
  
  // Handle supplier selection from dropdown
  const handleSupplierSelect = (key, supplierId) => {
    const selectedSupplier = availableSuppliers.find(s => s.id === supplierId);
    if (selectedSupplier) {
      const updatedSuppliers = suppliers.map(supplier => {
        if (supplier.key === key || supplier.id === key) {
          return {
            ...supplier,
            supplierId: selectedSupplier.id,
            supplierName: selectedSupplier.legalName || selectedSupplier.tradeName,
            contactName: selectedSupplier.contactPerson || supplier.contactName,
            contactEmail: selectedSupplier.email || supplier.contactEmail,
            contactPhone: selectedSupplier.phone || supplier.contactPhone
          };
        }
        return supplier;
      });
      setSuppliers(updatedSuppliers);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (values) => {
    if (items.length === 0) {
      message.error('Please add at least one item');
      return;
    }
    
    if (suppliers.length === 0) {
      message.error('Please add at least one supplier');
      return;
    }
    
    // Validate required fields for items
    const invalidItems = items.filter(item => !item.description || !item.quantity || !item.uom);
    if (invalidItems.length > 0) {
      message.error('Please fill in all required fields for items');
      return;
    }
    
    // Validate required fields for suppliers
    const invalidSuppliers = suppliers.filter(supplier => !supplier.supplierName);
    if (invalidSuppliers.length > 0) {
      message.error('Please fill in all required fields for suppliers');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const rfqFormData = {
        ...values,
        responseDeadline: values.responseDeadline?.format('YYYY-MM-DD'),
        items,
        suppliers
      };
      
      let result;
      
      if (isFromPR && prId) {
        // Create RFQ from PR
        result = await procurementService.createRFQFromPR(prId, rfqFormData);
      } else if (id) {
        // Update existing RFQ
        result = await procurementService.updateRFQ(id, rfqFormData);
      } else {
        // Create new RFQ
        result = await procurementService.createRFQ(rfqFormData);
      }
      
      if (result.success) {
        message.success(id ? 'RFQ updated successfully' : 'RFQ created successfully');
        history.push('/procurement/rfq');
      } else {
        message.error(result.message || 'Failed to save RFQ');
      }
    } catch (error) {
      console.error('Error saving RFQ:', error);
      message.error('An error occurred while saving the RFQ');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Columns for items table
  const itemColumns = [
    {
      title: 'Item Number',
      dataIndex: 'itemNumber',
      key: 'itemNumber',
      width: '15%',
      render: (_, record) => (
        <Input 
          value={record.itemNumber || ''}
          onChange={e => handleItemChange(record.key || record.id, 'itemNumber', e.target.value)}
          placeholder="Item Number"
          disabled={isFromPR && record.purchaseRequisitionItemId}
        />
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '30%',
      render: (_, record) => (
        <Input 
          value={record.description || ''}
          onChange={e => handleItemChange(record.key || record.id, 'description', e.target.value)}
          placeholder="Item Description"
          required
          disabled={isFromPR && record.purchaseRequisitionItemId}
        />
      )
    },
    {
      title: 'UOM',
      dataIndex: 'uom',
      key: 'uom',
      width: '10%',
      render: (_, record) => (
        <Input 
          value={record.uom || ''}
          onChange={e => handleItemChange(record.key || record.id, 'uom', e.target.value)}
          placeholder="UOM"
          required
          disabled={isFromPR && record.purchaseRequisitionItemId}
        />
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '15%',
      render: (_, record) => (
        <InputNumber 
          value={record.quantity || 0}
          onChange={value => handleItemChange(record.key || record.id, 'quantity', value)}
          min={1}
          style={{ width: '100%' }}
          required
          disabled={isFromPR && record.purchaseRequisitionItemId}
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      render: (_, record) => (
        <Space>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleRemoveItem(record.key || record.id)}
            disabled={isFromPR && record.purchaseRequisitionItemId}
          />
        </Space>
      )
    }
  ];
  
  // Columns for suppliers table
  const supplierColumns = [
    {
      title: 'Supplier',
      key: 'supplier',
      width: '25%',
      render: (_, record) => (
        <div>
          <Select
            style={{ width: '100%', marginBottom: 8 }}
            placeholder="Select supplier"
            value={record.supplierId}
            onChange={value => handleSupplierSelect(record.key || record.id, value)}
            allowClear
          >
            {availableSuppliers.map(supplier => (
              <Option key={supplier.id} value={supplier.id}>
                {supplier.legalName || supplier.tradeName}
              </Option>
            ))}
          </Select>
          <Input 
            value={record.supplierName || ''}
            onChange={e => handleSupplierChange(record.key || record.id, 'supplierName', e.target.value)}
            placeholder="Supplier Name"
            required
          />
        </div>
      )
    },
    {
      title: 'Contact Name',
      dataIndex: 'contactName',
      key: 'contactName',
      width: '20%',
      render: (_, record) => (
        <Input 
          value={record.contactName || ''}
          onChange={e => handleSupplierChange(record.key || record.id, 'contactName', e.target.value)}
          placeholder="Contact Name"
        />
      )
    },
    {
      title: 'Contact Email',
      dataIndex: 'contactEmail',
      key: 'contactEmail',
      width: '20%',
      render: (_, record) => (
        <Input 
          value={record.contactEmail || ''}
          onChange={e => handleSupplierChange(record.key || record.id, 'contactEmail', e.target.value)}
          placeholder="Contact Email"
        />
      )
    },
    {
      title: 'Contact Phone',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: '20%',
      render: (_, record) => (
        <Input 
          value={record.contactPhone || ''}
          onChange={e => handleSupplierChange(record.key || record.id, 'contactPhone', e.target.value)}
          placeholder="Contact Phone"
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      render: (_, record) => (
        <Space>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleRemoveSupplier(record.key || record.id)}
          />
        </Space>
      )
    }
  ];
  
  return (
    <Spin spinning={isLoading}>
      <Card title={id ? 'Edit Request for Quotation' : 'Create Request for Quotation'}>
        {isFromPR && prData && (
          <div style={{ marginBottom: 16, padding: 16, background: '#f0f2f5', borderRadius: 4 }}>
            <h4>Creating RFQ from Purchase Requisition: {prData.prNumber}</h4>
            <p>{prData.description}</p>
          </div>
        )}
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Please enter RFQ description' }]}
              >
                <TextArea rows={4} placeholder="RFQ Description" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="responseDeadline"
                label="Response Deadline"
                rules={[{ required: true, message: 'Please select response deadline' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
              
              <Form.Item
                name="notes"
                label="Notes"
              >
                <TextArea rows={2} placeholder="Additional notes" />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider orientation="left">Items</Divider>
          
          <div style={{ marginBottom: 16 }}>
            <Button 
              type="dashed" 
              onClick={handleAddItem} 
              icon={<PlusOutlined />}
              disabled={isFromPR && prData && prData.items && prData.items.length > 0}
            >
              Add Item
            </Button>
          </div>
          
          <Table 
            dataSource={items} 
            columns={itemColumns}
            pagination={false}
            rowKey={record => record.id || record.key}
            size="small"
          />
          
          <Divider orientation="left">Suppliers</Divider>
          
          <div style={{ marginBottom: 16 }}>
            <Button 
              type="dashed" 
              onClick={handleAddSupplier} 
              icon={<PlusOutlined />}
            >
              Add Supplier
            </Button>
          </div>
          
          <Table 
            dataSource={suppliers} 
            columns={supplierColumns}
            pagination={false}
            rowKey={record => record.id || record.key}
            size="small"
          />
          
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <Button style={{ marginRight: 8 }} onClick={() => history.push('/procurement/rfq')}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Save
            </Button>
          </div>
        </Form>
      </Card>
    </Spin>
  );
}
