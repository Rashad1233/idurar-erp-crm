import React, { useState, useEffect } from 'react';
import { Form, Select, Input, Button, Row, Col, InputNumber, Divider, DatePicker, Table } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';
import { useDate } from '@/settings';
import dayjs from 'dayjs';

export default function WarehouseTransactionForm({ transactionType = 'GR', isUpdateForm = false }) {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const [items, setItems] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [searchComplete, setSearchComplete] = useState(false);

  // Define columns for items table
  const columns = [
    {
      title: translate('Item Number'),
      dataIndex: 'itemNumber',
      key: 'itemNumber',
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
    },
    {
      title: translate('PO Qty'),
      dataIndex: 'poQuantity',
      key: 'poQuantity',
    },
    {
      title: translate('Received Qty'),
      dataIndex: 'receivedQuantity',
      key: 'receivedQuantity',
    },
    {
      title: translate('Transaction Qty'),
      dataIndex: 'transactionQuantity',
      key: 'transactionQuantity',
      render: (_, record, index) => (
        <InputNumber
          min={0}
          max={transactionType === 'GR' ? record.poQuantity - record.receivedQuantity : record.receivedQuantity}
          onChange={(value) => handleQtyChange(value, index)}
        />
      ),
    },
    {
      title: translate('Unit Price'),
      dataIndex: 'unitPrice',
      key: 'unitPrice',
    },
    {
      title: translate('Line Total'),
      dataIndex: 'lineTotal',
      key: 'lineTotal',
    },
  ];

  // Mock data for PO items - in real implementation this would come from an API call
  const mockPOItems = {
    'PO-1001': [
      {
        itemNumber: '000400',
        description: 'GASKET',
        unitOfMeasure: 'EA',
        poQuantity: 2,
        receivedQuantity: 0,
        transactionQuantity: 0,
        unitPrice: 50,
        lineTotal: 0,
      },
      {
        itemNumber: '004500',
        description: 'FLANGE',
        unitOfMeasure: 'EA',
        poQuantity: 4,
        receivedQuantity: 0,
        transactionQuantity: 0,
        unitPrice: 75,
        lineTotal: 0,
      }
    ],
    'PO-1002': [
      {
        itemNumber: '001234',
        description: 'VALVE, BALL',
        unitOfMeasure: 'EA',
        poQuantity: 5,
        receivedQuantity: 3,
        transactionQuantity: 0,
        unitPrice: 120,
        lineTotal: 0,
      }
    ]
  };

  const handleSearch = (poNumber) => {
    // In real implementation, this would fetch data from an API
    const poItems = mockPOItems[poNumber];
    if (poItems) {
      setItems(poItems);
      setSearchComplete(true);
    }
  };

  const handleQtyChange = (value, index) => {
    const updatedItems = [...items];
    updatedItems[index].transactionQuantity = value;
    updatedItems[index].lineTotal = value * updatedItems[index].unitPrice;
    setItems(updatedItems);
  };

  // Determine which form fields to show based on transaction type
  const renderTransactionTypeFields = () => {
    switch (transactionType) {
      case 'GR': // Goods Receipt
        return (
          <>
            <Form.Item
              label={translate('PO Number')}
              name="poNumber"
              rules={[
                {
                  required: true,
                  message: translate('Please input the PO number!'),
                },
              ]}
            >
              <Input.Search 
                placeholder="Enter PO number" 
                enterButton={<SearchOutlined />}
                onSearch={(value) => {
                  handleSearch(value);
                  setSelectedPO(value);
                }}
              />
            </Form.Item>
            
            <Form.Item
              label={translate('Supplier')}
              name="supplier"
            >
              <Input disabled />
            </Form.Item>
            
            <Form.Item
              label={translate('Receipt Date')}
              name="transactionDate"
              initialValue={dayjs()}
              rules={[
                {
                  required: true,
                  message: translate('Please select the receipt date!'),
                },
              ]}
            >
              <DatePicker format={dateFormat} style={{ width: '100%' }} />
            </Form.Item>
          </>
        );
        
      case 'GI': // Goods Issue
        return (
          <>
            <Form.Item
              label={translate('Issue To')}
              name="issueTo"
              rules={[
                {
                  required: true,
                  message: translate('Please select who to issue to!'),
                },
              ]}
            >
              <Select>
                <Select.Option value="job">Job</Select.Option>
                <Select.Option value="costCenter">Cost Center</Select.Option>
                <Select.Option value="project">Project</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              label={translate('Reference')}
              name="reference"
              rules={[
                {
                  required: true,
                  message: translate('Please input the reference!'),
                },
              ]}
            >
              <Input placeholder="e.g., Cost Center BU1234" />
            </Form.Item>
            
            <Form.Item
              label={translate('Issue Date')}
              name="transactionDate"
              initialValue={dayjs()}
              rules={[
                {
                  required: true,
                  message: translate('Please select the issue date!'),
                },
              ]}
            >
              <DatePicker format={dateFormat} style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              label={translate('Item Number')}
              name="itemNumber"
              rules={[
                {
                  required: true,
                  message: translate('Please select an item!'),
                },
              ]}
            >
              <SelectAsync
                entity={'item'}
                displayLabels={['itemNumber', 'description']}
                placeholder={translate('Search by item number or description')}
                searchFields='itemNumber,description'
                onSelect={(item) => {
                  // Add item to the list
                  setItems([{
                    itemNumber: item.itemNumber,
                    description: item.description,
                    unitOfMeasure: item.unitOfMeasure,
                    poQuantity: 0,
                    receivedQuantity: item.physicalBalance || 0,
                    transactionQuantity: 0,
                    unitPrice: item.unitPrice || 0,
                    lineTotal: 0
                  }]);
                  setSearchComplete(true);
                }}
              />
            </Form.Item>
          </>
        );
        
      case 'GE': // Goods Return
        return (
          <>
            <Form.Item
              label={translate('Return From')}
              name="returnFrom"
              rules={[
                {
                  required: true,
                  message: translate('Please select where to return from!'),
                },
              ]}
            >
              <Select>
                <Select.Option value="job">Job</Select.Option>
                <Select.Option value="costCenter">Cost Center</Select.Option>
                <Select.Option value="project">Project</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              label={translate('Reference')}
              name="reference"
              rules={[
                {
                  required: true,
                  message: translate('Please input the reference!'),
                },
              ]}
            >
              <Input placeholder="e.g., Job J5678" />
            </Form.Item>
            
            <Form.Item
              label={translate('Return Date')}
              name="transactionDate"
              initialValue={dayjs()}
              rules={[
                {
                  required: true,
                  message: translate('Please select the return date!'),
                },
              ]}
            >
              <DatePicker format={dateFormat} style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              label={translate('Item Number')}
              name="itemNumber"
              rules={[
                {
                  required: true,
                  message: translate('Please select an item to return!'),
                },
              ]}
            >
              <SelectAsync
                entity={'item'}
                displayLabels={['itemNumber', 'description']}
                placeholder={translate('Search by item number or description')}
                searchFields='itemNumber,description'
                onSelect={(item) => {
                  // Similar to GI but for returns
                  setItems([{
                    itemNumber: item.itemNumber,
                    description: item.description,
                    unitOfMeasure: item.unitOfMeasure,
                    poQuantity: 0,
                    receivedQuantity: 0,
                    transactionQuantity: 0,
                    unitPrice: item.unitPrice || 0,
                    lineTotal: 0
                  }]);
                  setSearchComplete(true);
                }}
              />
            </Form.Item>
          </>
        );
        
      case 'GT': // Goods Transfer
        return (
          <>
            <Form.Item
              label={translate('From Location')}
              name="fromLocation"
              rules={[
                {
                  required: true,
                  message: translate('Please select source location!'),
                },
              ]}
            >
              <SelectAsync
                entity={'warehouse'}
                displayLabels={['code', 'name']}
                placeholder={translate('Select Source Storage Location')}
                searchFields='code,name'
              />
            </Form.Item>
            
            <Form.Item
              label={translate('To Location')}
              name="toLocation"
              rules={[
                {
                  required: true,
                  message: translate('Please select destination location!'),
                },
              ]}
            >
              <SelectAsync
                entity={'warehouse'}
                displayLabels={['code', 'name']}
                placeholder={translate('Select Destination Storage Location')}
                searchFields='code,name'
              />
            </Form.Item>
            
            <Form.Item
              label={translate('Transfer Date')}
              name="transactionDate"
              initialValue={dayjs()}
              rules={[
                {
                  required: true,
                  message: translate('Please select the transfer date!'),
                },
              ]}
            >
              <DatePicker format={dateFormat} style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              label={translate('Item Number')}
              name="itemNumber"
              rules={[
                {
                  required: true,
                  message: translate('Please select an item to transfer!'),
                },
              ]}
            >
              <SelectAsync
                entity={'item'}
                displayLabels={['itemNumber', 'description']}
                placeholder={translate('Search by item number or description')}
                searchFields='itemNumber,description'
                onSelect={(item) => {
                  setItems([{
                    itemNumber: item.itemNumber,
                    description: item.description,
                    unitOfMeasure: item.unitOfMeasure,
                    poQuantity: 0,
                    receivedQuantity: item.physicalBalance || 0,
                    transactionQuantity: 0,
                    unitPrice: item.unitPrice || 0,
                    lineTotal: 0
                  }]);
                  setSearchComplete(true);
                }}
              />
            </Form.Item>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <>
      <Form.Item
        label={translate('Transaction Type')}
        name="transactionType"
        initialValue={transactionType}
      >
        <Select disabled={isUpdateForm}>
          <Select.Option value="GR">{translate('Goods Receipt (GR)')}</Select.Option>
          <Select.Option value="GI">{translate('Goods Issue (GI)')}</Select.Option>
          <Select.Option value="GE">{translate('Goods Return (GE)')}</Select.Option>
          <Select.Option value="GT">{translate('Goods Transfer (GT)')}</Select.Option>
        </Select>
      </Form.Item>

      {renderTransactionTypeFields()}
      
      {searchComplete && (
        <>
          <Divider>{translate('Items')}</Divider>
          <Table
            dataSource={items}
            columns={columns}
            rowKey="itemNumber"
            pagination={false}
          />
          
          <Form.Item
            label={translate('Notes')}
            name="notes"
            style={{ marginTop: 20 }}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </>
      )}
    </>
  );
}
