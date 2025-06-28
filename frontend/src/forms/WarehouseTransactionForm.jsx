import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Select, 
  Input, 
  Button, 
  Row, 
  Col, 
  InputNumber, 
  Divider, 
  DatePicker, 
  Table, 
  Card,
  Typography,
  Space,
  Tag,
  Alert,
  message,
  Checkbox
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';
import { useDate } from '@/settings';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

export default function WarehouseTransactionForm({ transactionType = 'GR', isUpdateForm = false }) {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const [items, setItems] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [searchComplete, setSearchComplete] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [storageLocations, setStorageLocations] = useState([]);
  const [binLocations, setBinLocations] = useState([]);

  // Transaction type configurations
  const transactionConfigs = {
    'GR': {
      title: 'Goods Receipt (GR)',
      description: 'Receive goods from purchase orders into inventory',
      color: 'green',
      icon: <CheckCircleOutlined />,
      searchLabel: 'PO Number',
      searchPlaceholder: 'Search PO number to receipt items',
    },
    'GI': {
      title: 'Goods Issue (GI)',
      description: 'Issue items from inventory to cost centers or jobs',
      color: 'blue',
      icon: <ArrowRightOutlined />,
      searchLabel: 'Item Number / Cost Center',
      searchPlaceholder: 'Search item number or cost center',
    },
    'GE': {
      title: 'Goods Return (GE)',
      description: 'Return previously issued items back to inventory',
      color: 'orange',
      icon: <ExclamationCircleOutlined />,
      searchLabel: 'Item Number / Job',
      searchPlaceholder: 'Search item number or job to return items',
    },
    'GT': {
      title: 'Goods Transfer (GT)',
      description: 'Transfer items between different storage locations',
      color: 'purple',
      icon: <ArrowRightOutlined />,
      searchLabel: 'Item Number',
      searchPlaceholder: 'Search item number to transfer',
    },
  };

  const currentConfig = transactionConfigs[transactionType];
  // Enhanced columns for different transaction types
  const getColumns = () => {
    const baseColumns = [
      {
        title: translate('Select'),
        key: 'select',
        width: 60,
        render: (_, record, index) => (
          <Checkbox
            checked={selectedItems.includes(index)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedItems([...selectedItems, index]);
              } else {
                setSelectedItems(selectedItems.filter(i => i !== index));
              }
            }}
          />
        ),
      },
      {
        title: translate('Item Number'),
        dataIndex: 'itemNumber',
        key: 'itemNumber',
        render: (text) => <Text strong>{text}</Text>,
      },
      {
        title: translate('Description'),
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
      },
      {
        title: translate('UoM'),
        dataIndex: 'unitOfMeasure',
        key: 'unitOfMeasure',
        width: 80,
      },
    ];

    // Add transaction-specific columns
    switch (transactionType) {
      case 'GR':
        return [
          ...baseColumns,
          {
            title: translate('PO Qty'),
            dataIndex: 'poQuantity',
            key: 'poQuantity',
            width: 100,
          },
          {
            title: translate('Received'),
            dataIndex: 'receivedQuantity',
            key: 'receivedQuantity',
            width: 100,
          },
          {
            title: translate('Receipt Qty'),
            dataIndex: 'transactionQuantity',
            key: 'transactionQuantity',
            width: 120,
            render: (_, record, index) => (
              <InputNumber
                min={0}
                max={record.poQuantity - record.receivedQuantity}
                value={record.transactionQuantity}
                onChange={(value) => handleQtyChange(value, index)}
                disabled={!selectedItems.includes(index)}
              />
            ),
          },
          {
            title: translate('Unit Price'),
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            width: 100,
            render: (value) => `$${value?.toFixed(2)}`,
          },
          {
            title: translate('Status'),
            key: 'status',
            width: 100,
            render: (_, record) => {
              const remaining = record.poQuantity - record.receivedQuantity;
              return remaining > 0 ? 
                <Tag color="orange">Pending: {remaining}</Tag> : 
                <Tag color="green">Complete</Tag>;
            },
          },
        ];
      
      case 'GI':
        return [
          ...baseColumns,
          {
            title: translate('Available Qty'),
            dataIndex: 'availableQuantity',
            key: 'availableQuantity',
            width: 120,
          },
          {
            title: translate('Issue Qty'),
            dataIndex: 'transactionQuantity',
            key: 'transactionQuantity',
            width: 120,
            render: (_, record, index) => (
              <InputNumber
                min={0}
                max={record.availableQuantity}
                value={record.transactionQuantity}
                onChange={(value) => handleQtyChange(value, index)}
                disabled={!selectedItems.includes(index)}
              />
            ),
          },
          {
            title: translate('Cost Center'),
            dataIndex: 'costCenter',
            key: 'costCenter',
            width: 120,
            render: (_, record, index) => (
              <Input
                placeholder="e.g., BU1234"
                value={record.costCenter}
                onChange={(e) => handleCostCenterChange(e.target.value, index)}
                disabled={!selectedItems.includes(index)}
              />
            ),
          },
        ];

      case 'GE':
        return [
          ...baseColumns,
          {
            title: translate('Issued Qty'),
            dataIndex: 'issuedQuantity',
            key: 'issuedQuantity',
            width: 100,
          },
          {
            title: translate('Return Qty'),
            dataIndex: 'transactionQuantity',
            key: 'transactionQuantity',
            width: 120,
            render: (_, record, index) => (
              <InputNumber
                min={0}
                max={record.issuedQuantity}
                value={record.transactionQuantity}
                onChange={(value) => handleQtyChange(value, index)}
                disabled={!selectedItems.includes(index)}
              />
            ),
          },
          {
            title: translate('Return Reason'),
            dataIndex: 'returnReason',
            key: 'returnReason',
            width: 150,
            render: (_, record, index) => (
              <Select
                placeholder="Select reason"
                value={record.returnReason}
                onChange={(value) => handleReturnReasonChange(value, index)}
                disabled={!selectedItems.includes(index)}
                style={{ width: '100%' }}
              >
                <Option value="not_required">Not Required</Option>
                <Option value="defective">Defective</Option>
                <Option value="wrong_item">Wrong Item</Option>
                <Option value="excess">Excess Quantity</Option>
              </Select>
            ),
          },
        ];

      case 'GT':
        return [
          ...baseColumns,
          {
            title: translate('Current Location'),
            dataIndex: 'currentLocation',
            key: 'currentLocation',
            width: 150,
          },
          {
            title: translate('Available Qty'),
            dataIndex: 'availableQuantity',
            key: 'availableQuantity',
            width: 120,
          },
          {
            title: translate('Transfer Qty'),
            dataIndex: 'transactionQuantity',
            key: 'transactionQuantity',
            width: 120,
            render: (_, record, index) => (
              <InputNumber
                min={0}
                max={record.availableQuantity}
                value={record.transactionQuantity}
                onChange={(value) => handleQtyChange(value, index)}
                disabled={!selectedItems.includes(index)}
              />
            ),
          },
          {
            title: translate('To Location'),
            dataIndex: 'toLocation',
            key: 'toLocation',
            width: 150,
            render: (_, record, index) => (
              <Select
                placeholder="Select location"
                value={record.toLocation}
                onChange={(value) => handleLocationChange(value, index)}
                disabled={!selectedItems.includes(index)}
                style={{ width: '100%' }}
              >
                {storageLocations.map(location => (
                  <Option key={location.id} value={location.id}>
                    {location.code} - {location.description}
                  </Option>
                ))}
              </Select>
            ),
          },
        ];

      default:
        return baseColumns;
    }
  };
  // Enhanced mock data for different transaction types
  const mockData = {
    'GR': {
      'PO-1001': [
        {
          itemNumber: 'VALVE-GATE-001',
          description: 'VALVE, GATE: 6IN, CLASS 300, STAINLESS STEEL',
          unitOfMeasure: 'EA',
          poQuantity: 10,
          receivedQuantity: 0,
          transactionQuantity: 0,
          unitPrice: 150.00,
          lineTotal: 0,
          certification: true,
        },
        {
          itemNumber: 'GASKET-001',
          description: 'GASKET, SPIRAL WOUND: 6IN, STAINLESS STEEL',
          unitOfMeasure: 'EA',
          poQuantity: 20,
          receivedQuantity: 15,
          transactionQuantity: 0,
          unitPrice: 25.50,
          lineTotal: 0,
          certification: false,
        },
        {
          itemNumber: 'FLANGE-001',
          description: 'FLANGE, WELD NECK: 6IN, CLASS 300, STAINLESS STEEL',
          unitOfMeasure: 'EA',
          poQuantity: 8,
          receivedQuantity: 0,
          transactionQuantity: 0,
          unitPrice: 75.00,
          lineTotal: 0,
          certification: true,
        }
      ],
      'PO-1002': [
        {
          itemNumber: 'PUMP-CENT-001',
          description: 'PUMP, CENTRIFUGAL: 4IN, 100HP',
          unitOfMeasure: 'EA',
          poQuantity: 2,
          receivedQuantity: 0,
          transactionQuantity: 0,
          unitPrice: 5000.00,
          lineTotal: 0,
          certification: true,
        }
      ]
    },
    'GI': {
      'VALVE-GATE-001': {
        itemNumber: 'VALVE-GATE-001',
        description: 'VALVE, GATE: 6IN, CLASS 300, STAINLESS STEEL',
        unitOfMeasure: 'EA',
        availableQuantity: 8,
        transactionQuantity: 0,
        costCenter: '',
        location: 'BRG01-W1010105',
      },
      'GASKET-001': {
        itemNumber: 'GASKET-001',
        description: 'GASKET, SPIRAL WOUND: 6IN, STAINLESS STEEL',
        unitOfMeasure: 'EA',
        availableQuantity: 15,
        transactionQuantity: 0,
        costCenter: '',
        location: 'BRG01-W1010205',
      }
    },
    'GE': {
      'VALVE-GATE-001': {
        itemNumber: 'VALVE-GATE-001',
        description: 'VALVE, GATE: 6IN, CLASS 300, STAINLESS STEEL',
        unitOfMeasure: 'EA',
        issuedQuantity: 3,
        transactionQuantity: 0,
        returnReason: '',
        issuedTo: 'BU1234',
      }
    },
    'GT': {
      'VALVE-GATE-001': {
        itemNumber: 'VALVE-GATE-001',
        description: 'VALVE, GATE: 6IN, CLASS 300, STAINLESS STEEL',
        unitOfMeasure: 'EA',
        currentLocation: 'BRG01',
        availableQuantity: 5,
        transactionQuantity: 0,
        toLocation: '',
      }
    }
  };

  // Helper functions
  const handleSearch = (searchValue) => {
    setLoading(true);
    setTimeout(() => {
      let searchResults = [];
      
      switch (transactionType) {
        case 'GR':
          searchResults = mockData.GR[searchValue] || [];
          if (searchResults.length > 0) {
            setSelectedPO(searchValue);
            message.success(`Found ${searchResults.length} items in PO ${searchValue}`);
          } else {
            message.warning(`No items found for PO ${searchValue}`);
          }
          break;
          
        case 'GI':
          const item = mockData.GI[searchValue];
          if (item) {
            searchResults = [item];
            message.success(`Item ${searchValue} found with ${item.availableQuantity} available`);
          } else {
            message.warning(`Item ${searchValue} not found or out of stock`);
          }
          break;
          
        case 'GE':
          const returnItem = mockData.GE[searchValue];
          if (returnItem) {
            searchResults = [returnItem];
            message.success(`Item ${searchValue} found with ${returnItem.issuedQuantity} issued to ${returnItem.issuedTo}`);
          } else {
            message.warning(`No issued items found for ${searchValue}`);
          }
          break;
          
        case 'GT':
          const transferItem = mockData.GT[searchValue];
          if (transferItem) {
            searchResults = [transferItem];
            message.success(`Item ${searchValue} found at ${transferItem.currentLocation} with ${transferItem.availableQuantity} available`);
          } else {
            message.warning(`Item ${searchValue} not found in any location`);
          }
          break;
      }
      
      setItems(searchResults);
      setSearchComplete(searchResults.length > 0);
      setSelectedItems([]);
      setLoading(false);
    }, 1000);
  };

  const handleQtyChange = (value, index) => {
    const updatedItems = [...items];
    updatedItems[index].transactionQuantity = value || 0;
    if (updatedItems[index].unitPrice) {
      updatedItems[index].lineTotal = (value || 0) * updatedItems[index].unitPrice;
    }
    setItems(updatedItems);
  };

  const handleCostCenterChange = (value, index) => {
    const updatedItems = [...items];
    updatedItems[index].costCenter = value;
    setItems(updatedItems);
  };

  const handleReturnReasonChange = (value, index) => {
    const updatedItems = [...items];
    updatedItems[index].returnReason = value;
    setItems(updatedItems);
  };

  const handleLocationChange = (value, index) => {
    const updatedItems = [...items];
    updatedItems[index].toLocation = value;
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
