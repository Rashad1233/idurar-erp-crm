import React, { useEffect, useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  Table, 
  Card, 
  Descriptions, 
  Tag, 
  InputNumber, 
  DatePicker, 
  Divider, 
  message, 
  Spin, 
  Space,
  Tooltip
} from 'antd';
import { 
  SaveOutlined, 
  DollarOutlined, 
  ClockCircleOutlined,
  FileTextOutlined 
} from '@ant-design/icons';
import { useHistory, useParams } from 'react-router-dom';
import dayjs from 'dayjs';

import procurementService from '@/services/procurementService';

const { TextArea } = Input;
const { Option } = Select;

export default function RecordQuote() {
  const { id } = useParams();
  const history = useHistory();
  const [form] = Form.useForm();
  
  const [isLoading, setIsLoading] = useState(false);
  const [rfqData, setRfqData] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [quoteItems, setQuoteItems] = useState([]);
  
  // Fetch RFQ data
  const fetchRFQ = async () => {
    setIsLoading(true);
    try {
      const result = await procurementService.getRFQ(id);
      if (result.success && result.data) {
        setRfqData(result.data);
        
        // Only show suppliers that haven't responded or were selected
        const filteredSuppliers = (result.data.suppliers || []).filter(
          supplier => ['pending', 'sent', 'selected'].includes(supplier.status)
        );
        
        if (filteredSuppliers.length === 0) {
          message.warning('All suppliers have already responded to this RFQ');
        }
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
  
  useEffect(() => {
    if (id) {
      fetchRFQ();
    }
  }, [id]);
  
  // Handle supplier selection
  const handleSupplierChange = (supplierId) => {
    if (!rfqData || !supplierId) {
      setSelectedSupplier(null);
      setQuoteItems([]);
      return;
    }
    
    const supplier = rfqData.suppliers.find(s => s.id === supplierId);
    if (supplier) {
      setSelectedSupplier(supplier);
      
      // Initialize quote items based on RFQ items
      const initialQuoteItems = (rfqData.items || []).map(item => {
        // Check if there's an existing quote for this item from this supplier
        const existingQuote = item.quotes?.find(q => q.rfqSupplierId === supplierId);
        
        return {
          rfqItemId: item.id,
          description: item.description,
          quantity: item.quantity,
          uom: item.uom,
          unitPrice: existingQuote?.unitPrice || 0,
          deliveryTime: existingQuote?.deliveryTime || null,
          deliveryDate: existingQuote?.deliveryDate ? dayjs(existingQuote.deliveryDate) : null,
          currencyCode: existingQuote?.currencyCode || 'USD',
          notes: existingQuote?.notes || ''
        };
      });
      
      setQuoteItems(initialQuoteItems);
    }
  };
  
  // Handle item field change
  const handleItemChange = (index, field, value) => {
    const newItems = [...quoteItems];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setQuoteItems(newItems);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedSupplier) {
      message.error('Please select a supplier');
      return;
    }
    
    // Validate all items have a price
    const invalidItems = quoteItems.filter(item => !item.unitPrice);
    if (invalidItems.length > 0) {
      message.error('Please enter unit price for all items');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format data for API
      const formattedItems = quoteItems.map(item => ({
        rfqItemId: item.rfqItemId,
        unitPrice: item.unitPrice,
        deliveryTime: item.deliveryTime,
        deliveryDate: item.deliveryDate ? item.deliveryDate.format('YYYY-MM-DD') : null,
        currencyCode: item.currencyCode || 'USD',
        notes: item.notes
      }));
      
      const quoteData = {
        rfqSupplierId: selectedSupplier.id,
        quotedItems: formattedItems
      };
      
      const result = await procurementService.recordSupplierQuote(id, quoteData);
      
      if (result.success) {
        message.success('Supplier quote recorded successfully');
        history.push(`/procurement/rfq/${id}`);
      } else {
        message.error(result.message || 'Failed to record supplier quote');
      }
    } catch (error) {
      console.error('Error recording supplier quote:', error);
      message.error('An error occurred while recording the supplier quote');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render supplier status tag
  const renderSupplierStatus = (status) => {
    const statusMap = {
      pending: { color: 'default', text: 'Pending' },
      sent: { color: 'processing', text: 'Sent' },
      responded: { color: 'success', text: 'Responded' },
      selected: { color: 'success', text: 'Selected' },
      rejected: { color: 'error', text: 'Rejected' }
    };
    
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };
  
  // Quote items columns
  const quoteItemsColumns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '30%'
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '10%',
      render: (text, record) => (
        <span>{text} {record.uom}</span>
      )
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: '15%',
      render: (text, record, index) => (
        <InputNumber
          prefix={<DollarOutlined />}
          value={record.unitPrice}
          onChange={(value) => handleItemChange(index, 'unitPrice', value)}
          min={0}
          precision={2}
          style={{ width: '100%' }}
          placeholder="Unit Price"
          required
        />
      )
    },
    {
      title: 'Currency',
      dataIndex: 'currencyCode',
      key: 'currencyCode',
      width: '10%',
      render: (text, record, index) => (
        <Select
          value={record.currencyCode || 'USD'}
          onChange={(value) => handleItemChange(index, 'currencyCode', value)}
          style={{ width: '100%' }}
        >
          <Option value="USD">USD</Option>
          <Option value="EUR">EUR</Option>
          <Option value="GBP">GBP</Option>
          <Option value="CAD">CAD</Option>
          <Option value="AUD">AUD</Option>
        </Select>
      )
    },
    {
      title: 'Delivery Time (Days)',
      dataIndex: 'deliveryTime',
      key: 'deliveryTime',
      width: '15%',
      render: (text, record, index) => (
        <InputNumber
          prefix={<ClockCircleOutlined />}
          value={record.deliveryTime}
          onChange={(value) => handleItemChange(index, 'deliveryTime', value)}
          min={0}
          style={{ width: '100%' }}
          placeholder="Days"
        />
      )
    },
    {
      title: 'Delivery Date',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      width: '15%',
      render: (text, record, index) => (
        <DatePicker
          value={record.deliveryDate}
          onChange={(value) => handleItemChange(index, 'deliveryDate', value)}
          style={{ width: '100%' }}
          format="YYYY-MM-DD"
        />
      )
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      width: '15%',
      render: (text, record, index) => (
        <Input
          prefix={<FileTextOutlined />}
          value={record.notes}
          onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
          placeholder="Notes"
        />
      )
    }
  ];
  
  if (!rfqData) {
    return (
      <Spin spinning={isLoading}>
        <Card title="Record Supplier Quote">
          <p>Loading RFQ data...</p>
        </Card>
      </Spin>
    );
  }
  
  return (
    <Spin spinning={isLoading}>
      <Card title="Record Supplier Quote">
        <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
          <Descriptions.Item label="RFQ Number">{rfqData.rfqNumber}</Descriptions.Item>
          <Descriptions.Item label="Response Deadline">
            {dayjs(rfqData.responseDeadline).format('YYYY-MM-DD')}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>{rfqData.description}</Descriptions.Item>
        </Descriptions>
        
        <Divider orientation="left">Select Supplier</Divider>
        
        <Form form={form} layout="vertical">
          <Form.Item 
            name="supplierId" 
            label="Supplier"
            rules={[{ required: true, message: 'Please select a supplier' }]}
          >
            <Select
              placeholder="Select Supplier"
              onChange={handleSupplierChange}
              style={{ width: '100%' }}
              optionFilterProp="children"
              showSearch
            >
              {rfqData.suppliers && rfqData.suppliers.map(supplier => (
                <Option key={supplier.id} value={supplier.id}>
                  {supplier.supplierName} {renderSupplierStatus(supplier.status)}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
        
        {selectedSupplier && (
          <>
            <Divider orientation="left">Supplier Details</Divider>
            
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Supplier Name">{selectedSupplier.supplierName}</Descriptions.Item>
              <Descriptions.Item label="Status">{renderSupplierStatus(selectedSupplier.status)}</Descriptions.Item>
              <Descriptions.Item label="Contact Name">{selectedSupplier.contactName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Contact Email">{selectedSupplier.contactEmail || '-'}</Descriptions.Item>
            </Descriptions>
            
            <Divider orientation="left">Quote Items</Divider>
            
            <Table
              dataSource={quoteItems}
              columns={quoteItemsColumns}
              rowKey="rfqItemId"
              pagination={false}
            />
            
            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => history.push(`/procurement/rfq/${id}`)}>
                  Cancel
                </Button>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit}>
                  Save Quote
                </Button>
              </Space>
            </div>
          </>
        )}
      </Card>
    </Spin>
  );
}
