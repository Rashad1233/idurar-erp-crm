import React, { useState } from 'react';
import { Form, Input, Select, DatePicker, Button, Table, InputNumber, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';
import { useDate } from '@/settings';
import dayjs from 'dayjs';

export default function ContractForm({ isUpdateForm = false }) {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const [items, setItems] = useState([]);
  
  // Handle adding a new item to the contract
  const handleAddItem = () => {
    const newItem = {
      key: Date.now(),
      itemNumber: '',
      description: '',
      unitOfMeasure: '',
      price: '',
      leadTime: '',
      total: 0
    };
    
    setItems([...items, newItem]);
  };
  
  // Remove an item from the contract
  const handleRemoveItem = (key) => {
    const updatedItems = items.filter(item => item.key !== key);
    setItems(updatedItems);
  };
  
  // Handle item selection
  const handleItemSelect = (value, option, index) => {
    const updatedItems = [...items];
    updatedItems[index].itemNumber = option.itemNumber;
    updatedItems[index].description = option.description;
    updatedItems[index].unitOfMeasure = option.unitOfMeasure || '';
    setItems(updatedItems);
  };
  
  // Update item price
  const handlePriceChange = (value, index) => {
    const updatedItems = [...items];
    updatedItems[index].price = value;
    setItems(updatedItems);
  };
  
  // Update lead time
  const handleLeadTimeChange = (value, index) => {
    const updatedItems = [...items];
    updatedItems[index].leadTime = value;
    setItems(updatedItems);
  };
  
  // Define columns for the items table
  const columns = [
    {
      title: translate('Item'),
      dataIndex: 'item',
      key: 'item',
      render: (_, record, index) => (
        <SelectAsync
          entity={'item'}
          displayLabels={['itemNumber', 'description']}
          placeholder={translate('Search Item')}
          searchFields='itemNumber,description'
          onSelect={(value, option) => handleItemSelect(value, option, index)}
        />
      ),
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: translate('UoM'),
      dataIndex: 'unitOfMeasure',
      key: 'unitOfMeasure',
      width: 100,
    },
    {
      title: translate('Price'),
      key: 'price',
      width: 120,
      render: (_, record, index) => (
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          step={0.01}
          onChange={(value) => handlePriceChange(value, index)}
          placeholder={translate('Price')}
        />
      ),
    },
    {
      title: translate('Lead Time (days)'),
      key: 'leadTime',
      width: 150,
      render: (_, record, index) => (
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          onChange={(value) => handleLeadTimeChange(value, index)}
          placeholder={translate('Lead Time')}
        />
      ),
    },
    {
      title: translate('Action'),
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button danger onClick={() => handleRemoveItem(record.key)}>
          X
        </Button>
      ),
    },
  ];
  
  return (
    <>
      <Form.Item
        label={translate('Contract Number')}
        name="contractNumber"
        rules={[
          {
            required: isUpdateForm,
            message: translate('Contract number is required for updates'),
          },
        ]}
      >
        <Input disabled={isUpdateForm} placeholder={isUpdateForm ? '' : translate('Auto-generated')} />
      </Form.Item>
      
      <Form.Item
        label={translate('Contract Name')}
        name="contractName"
        rules={[
          {
            required: true,
            message: translate('Please input the contract name!'),
          },
        ]}
      >
        <Input placeholder="e.g., Supply of maintenance materials" />
      </Form.Item>
      
      <Form.Item
        label={translate('Supplier')}
        name="supplier"
        rules={[
          {
            required: true,
            message: translate('Please select a supplier!'),
          },
        ]}
      >
        <SelectAsync
          entity={'supplier'}
          displayLabels={['tradeName', 'legalName']}
          placeholder={translate('Select Supplier')}
          searchFields='tradeName,legalName'
        />
      </Form.Item>
      
      <Form.Item
        label={translate('Start Date')}
        name="startDate"
        initialValue={dayjs()}
        rules={[
          {
            required: true,
            message: translate('Please select the start date!'),
          },
        ]}
      >
        <DatePicker format={dateFormat} style={{ width: '100%' }} />
      </Form.Item>
      
      <Form.Item
        label={translate('End Date')}
        name="endDate"
        rules={[
          {
            required: true,
            message: translate('Please select the end date!'),
          },
        ]}
      >
        <DatePicker format={dateFormat} style={{ width: '100%' }} />
      </Form.Item>
      
      <Form.Item
        label={translate('Incoterms')}
        name="incoterms"
      >
        <Select placeholder={translate('Select Incoterms')}>
          <Select.Option value="DDP">DDP - Delivered Duty Paid</Select.Option>
          <Select.Option value="FCA">FCA - Free Carrier</Select.Option>
          <Select.Option value="CIP">CIP - Carriage and Insurance Paid To</Select.Option>
          <Select.Option value="EXW">EXW - Ex Works</Select.Option>
          <Select.Option value="FOB">FOB - Free On Board</Select.Option>
          <Select.Option value="CFR">CFR - Cost and Freight</Select.Option>
          <Select.Option value="CIF">CIF - Cost, Insurance, and Freight</Select.Option>
        </Select>
      </Form.Item>
      
      <Form.Item
        label={translate('Payment Terms')}
        name="paymentTerms"
      >
        <Select placeholder={translate('Select Payment Terms')}>
          <Select.Option value="30">30 days</Select.Option>
          <Select.Option value="45">45 days</Select.Option>
          <Select.Option value="60">60 days</Select.Option>
          <Select.Option value="immediate">Immediate payment</Select.Option>
          <Select.Option value="prepaid">Prepaid</Select.Option>
          <Select.Option value="partial">Partial prepayment</Select.Option>
        </Select>
      </Form.Item>
      
      <Divider>{translate('Contract Items')}</Divider>
      
      <Table
        dataSource={items}
        columns={columns}
        pagination={false}
        rowKey="key"
        size="middle"
      />
      
      <Button
        type="dashed"
        onClick={handleAddItem}
        style={{ width: '100%', marginTop: 16 }}
        icon={<PlusOutlined />}
      >
        {translate('Add Item')}
      </Button>
      
      <Form.Item
        label={translate('Notes')}
        name="notes"
        style={{ marginTop: 16 }}
      >
        <Input.TextArea rows={3} />
      </Form.Item>
    </>
  );
}
