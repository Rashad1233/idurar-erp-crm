import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Card, Row, Col, Select, Form, Typography, Tag } from 'antd';
import { SearchOutlined, SyncOutlined, FilterOutlined } from '@ant-design/icons';
import { ErpLayout } from '@/layout';
import inventoryService from '@/services/inventoryService';
import useLanguage from '@/locale/useLanguage';

const { Text, Title } = Typography;
const { Option } = Select;

export default function InventorySearch() {
  const translate = useLanguage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [searchParams, setSearchParams] = useState({});
  
  useEffect(() => {
    // Initial load with empty search parameters
    handleSearch({});
  }, []);
  
  const handleSearch = async (values) => {
    setLoading(true);
    setSearchParams(values);
    
    try {
      const response = await inventoryService.getInventoryItems(values);
      if (response.success) {
        setInventoryItems(response.data);
      } else {
        message.error(response.message || 'Failed to load inventory items');
      }
    } catch (error) {
      console.error('Error searching inventory:', error);
      message.error('Failed to search inventory items');
    } finally {
      setLoading(false);
    }
  };
  
  const resetSearch = () => {
    form.resetFields();
    handleSearch({});
  };
  
  const getCriticalityTag = (criticality) => {
    const colorMap = {
      HIGH: 'red',
      MEDIUM: 'orange',
      LOW: 'green'
    };
    return <Tag color={colorMap[criticality] || 'blue'}>{criticality}</Tag>;
  };
  
  const getConditionTag = (condition) => {
    const conditionMap = {
      'A': { color: 'green', text: 'A - New' },
      'B': { color: 'blue', text: 'B - Used' },
      'C': { color: 'orange', text: 'C - Requires inspection' },
      'D': { color: 'purple', text: 'D - Requires repair' },
      'E': { color: 'red', text: 'E - Scrap' }
    };
    const conditionInfo = conditionMap[condition] || { color: 'default', text: condition };
    return <Tag color={conditionInfo.color}>{conditionInfo.text}</Tag>;
  };
  
  const columns = [
    {
      title: translate('Inventory Number'),
      dataIndex: 'inventoryNumber',
      key: 'inventoryNumber',
      render: (text, record) => (
        <a href={`/inventory/details/${record._id}`}>{text}</a>
      ),
    },
    {
      title: translate('Description'),
      dataIndex: 'shortDescription',
      key: 'shortDescription',
      render: (text, record) => (
        <span>
          {record.itemMaster?.shortDescription || text || 'N/A'}
        </span>
      ),
    },
    {
      title: translate('UNSPSC'),
      dataIndex: 'unspscCode',
      key: 'unspscCode',
      render: (text, record) => (
        <span>
          {record.itemMaster?.unspscCode || text || 'N/A'}
        </span>
      ),
    },
    {
      title: translate('Criticality'),
      dataIndex: 'criticality',
      key: 'criticality',
      render: (text) => getCriticalityTag(text),
    },
    {
      title: translate('Physical Balance'),
      dataIndex: 'physicalBalance',
      key: 'physicalBalance',
      render: (text, record) => (
        <span>
          {text} {record.uom}
        </span>
      ),
    },
    {
      title: translate('Condition'),
      dataIndex: 'condition',
      key: 'condition',
      render: (text) => getConditionTag(text),
    },
    {
      title: translate('Stock Levels'),
      key: 'stockLevels',      render: (_, record) => (
        <span>
          Min: {record.minimumLevel} / Max: {record.maximumLevel}
        </span>
      ),
    },
    {
      title: translate('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" href={`/inventory/edit/${record._id}`}>
            {translate('Edit')}
          </Button>
          <Button type="link" size="small" href={`/inventory/transaction/${record._id}`}>
            {translate('Transactions')}
          </Button>
        </Space>
      ),
    },
  ];
  
  return (
    <ErpLayout>
      <Card
        title={<Title level={4}>{translate('Inventory Search')}</Title>}
        extra={
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => form.submit()}
          >
            {translate('Search')}
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                name="inventoryNumber"
                label={translate('Inventory Number')}
              >
                <Input placeholder={translate('Enter inventory number')} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                name="description"
                label={translate('Description')}
              >
                <Input placeholder={translate('Enter description keywords')} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                name="manufacturerName"
                label={translate('Manufacturer')}
              >
                <Input placeholder={translate('Enter manufacturer name')} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                name="unspscCode"
                label={translate('UNSPSC Code')}
              >
                <Input placeholder={translate('Enter UNSPSC code')} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                name="criticality"
                label={translate('Criticality')}
              >
                <Select allowClear placeholder={translate('Select criticality')}>
                  <Option value="HIGH">High critical</Option>
                  <Option value="MEDIUM">Medium critical</Option>
                  <Option value="LOW">Non-critical</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                name="condition"
                label={translate('Condition')}
              >
                <Select allowClear placeholder={translate('Select condition')}>
                  <Option value="A">A - New</Option>
                  <Option value="B">B - Used</Option>
                  <Option value="C">C - Requires inspection</Option>
                  <Option value="D">D - Requires repair</Option>
                  <Option value="E">E - Scrap</Option>
                </Select>
              </Form.Item>
            </Col>            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                name="belowMinimum"
                label={translate('Stock Level')}
                valuePropName="checked"
              >
                <Select allowClear placeholder={translate('Select stock level')}>
                  <Option value="belowMin">Below Minimum</Option>
                  <Option value="aboveMax">Above Maximum</Option>
                  <Option value="zeroBalance">Zero Balance</Option>
                  <Option value="negativeBalance">Negative Balance</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right', marginBottom: 16 }}>
              <Space>
                <Button icon={<SyncOutlined />} onClick={resetSearch}>
                  {translate('Reset')}
                </Button>
                <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
                  {translate('Search')}
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
        
        <Table
          columns={columns}
          dataSource={inventoryItems}
          rowKey="_id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </Card>
    </ErpLayout>
  );
}
