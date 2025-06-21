import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Switch, 
  Button, 
  Divider, 
  Card, 
  message, 
  Tooltip, 
  Row, 
  Col,
  Typography,
  Space,
  InputNumber
} from 'antd';
import { InfoCircleOutlined, SaveOutlined, ClearOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import UnspscSimpleInput from '@/components/UnspscSimpleInput/UnspscSimpleInput';
import UnspscItemMasterIntegration from '@/components/UnspscEnhancedSearch/UnspscItemMasterIntegration';
import useLanguage from '@/locale/useLanguage';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function EnhancedItemMasterForm({ onSuccess, onCancel }) {
  const translate = useLanguage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isStockItem, setIsStockItem] = useState(false);
  const [isPlannedStock, setIsPlannedStock] = useState(false);
  const [unspscCodeInfo, setUnspscCodeInfo] = useState(null);

  const uomOptions = [
    { value: 'EA', label: 'Each (EA)' },
    { value: 'BOX', label: 'Box (BOX)' },
    { value: 'PC', label: 'Piece (PC)' },
    { value: 'KG', label: 'Kilogram (KG)' },
    { value: 'LTR', label: 'Liter (LTR)' },
    { value: 'M', label: 'Meter (M)' },
    { value: 'CM', label: 'Centimeter (CM)' },
    { value: 'MM', label: 'Millimeter (MM)' },
    { value: 'SQM', label: 'Square Meter (SQM)' },
    { value: 'SET', label: 'Set (SET)' },
    { value: 'ROLL', label: 'Roll (ROLL)' },
    { value: 'PK', label: 'Pack (PK)' },
  ];

  const equipmentCategoryOptions = [
    { value: 'MECHANICAL', label: 'Mechanical' },
    { value: 'ELECTRICAL', label: 'Electrical' },
    { value: 'ELECTRONIC', label: 'Electronic' },
    { value: 'CONSUMABLE', label: 'Consumable' },
    { value: 'TOOLS', label: 'Tools' },
    { value: 'SAFETY', label: 'Safety Equipment' },
    { value: 'OFFICE', label: 'Office Supplies' },
    { value: 'IT', label: 'IT Equipment' },
    { value: 'OTHER', label: 'Other' },
  ];

  const criticalityOptions = [
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
    { value: 'NO', label: 'Not Critical' },
  ];

  // Handle UNSPSC code selection
  const handleUnspscCodeSelected = (codeInfo) => {
    console.log('UNSPSC code selected:', codeInfo);
    setUnspscCodeInfo(codeInfo);
    form.setFieldsValue({ 
      unspscCode: codeInfo.code,
      unspscCodeId: codeInfo.id
    });
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Transform data for backend
      const formData = {
        ...values,
        stockItem: isStockItem ? 'Y' : 'N',
        plannedStock: isPlannedStock ? 'Y' : 'N',
      };

      console.log('Submitting item master data:', formData);
      
      // Submit to backend
      const response = await axios.post('/api/item', formData);
      
      if (response.data.success) {
        message.success('Item Master created successfully!');
        form.resetFields();
        if (onSuccess) onSuccess(response.data.data);
      } else {
        message.error(response.data.message || 'Failed to create Item Master');
      }
    } catch (error) {
      console.error('Error creating item master:', error);
      message.error(error.response?.data?.message || 'An error occurred while creating the item');
    } finally {
      setLoading(false);
    }
  };

  // Handle stock item toggle
  const handleStockItemChange = (checked) => {
    setIsStockItem(checked);
    // Reset planned stock if stock item is turned off
    if (!checked) {
      setIsPlannedStock(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setIsStockItem(false);
    setIsPlannedStock(false);
    setUnspscCodeInfo(null);
  };

  return (
    <Card title={<Title level={4}>{translate('Create New Item Master')}</Title>}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          criticality: 'NO',
          serialNumber: 'N',
        }}
      >
        <Divider orientation="left">{translate('Basic Information')}</Divider>
        
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              name="itemNumber"
              label={translate('Item Number')}
              tooltip={translate('Will be auto-generated if left empty')}
            >
              <Input disabled placeholder={translate('Auto-generated')} />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              name="uom"
              label={translate('Unit of Measure')}
              rules={[{ required: true, message: translate('Please select a unit of measure') }]}
            >
              <Select placeholder={translate('Select unit of measure')}>
                {uomOptions.map(option => (
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          name="shortDescription"
          label={translate('Short Description')}
          rules={[
            { required: true, message: translate('Please enter a short description') },
            { max: 100, message: translate('Description cannot exceed 100 characters') }
          ]}
        >
          <Input placeholder={translate('NOUN, MODIFIER: size, class, material')} />
        </Form.Item>
        
        <Form.Item
          name="longDescription"
          label={translate('Long Description')}
        >
          <TextArea rows={3} placeholder={translate('Detailed description of the item')} />
        </Form.Item>
        
        <Form.Item
          name="standardDescription"
          label={translate('Standard Description')}
          tooltip={translate('A standardized description format for reporting')}
        >
          <Input placeholder={translate('Standard/formalized description')} />
        </Form.Item>
        
        <Divider orientation="left">{translate('Classification')}</Divider>
        
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              name="equipmentCategory"
              label={translate('Equipment Category')}
              rules={[{ required: isStockItem, message: translate('Required for stock items') }]}
            >
              <Select placeholder={translate('Select category')}>
                {equipmentCategoryOptions.map(option => (
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              name="equipmentSubCategory"
              label={translate('Equipment Sub-Category')}
            >
              <Input placeholder={translate('Sub-category')} />
            </Form.Item>
          </Col>
        </Row>
          <Divider orientation="left">{translate('UNSPSC Classification')}</Divider>
          <Card size="small" style={{ backgroundColor: '#fafafa', marginBottom: '16px' }}>
          <Title level={5} style={{ marginBottom: '12px' }}>
            {translate('UNSPSC Code Search & Favorites')}
          </Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: '12px' }}>
            {translate('Search for UNSPSC codes or select from your favorites for quick classification')}
          </Text>
          <UnspscItemMasterIntegration 
            onSelect={handleUnspscCodeSelected}
            value={form.getFieldValue('unspscCode')}
            placeholder={translate('Search for UNSPSC codes (e.g., iPhone, Water Bottles, Laptop...)')}
          />
        </Card>
        
        <Card size="small" style={{ backgroundColor: '#fafafa', marginBottom: '16px' }}>
          <Title level={5} style={{ marginBottom: '12px' }}>
            {translate('Manual UNSPSC Input')}
          </Title>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={
                  <Space>
                    {translate('Enter UNSPSC code directly')}
                    <Tooltip title={translate('United Nations Standard Products and Services Code - 8-digit hierarchical classification')}>
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                style={{ marginBottom: 0 }}
              >
                <UnspscSimpleInput
                  onCodeSelected={handleUnspscCodeSelected}
                  initialCode={form.getFieldValue('unspscCode')}
                />
              </Form.Item>
              
              <Form.Item
                name="unspscCode"
                hidden
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                name="unspscCodeId"
                hidden
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Card>
        
        {unspscCodeInfo && (
          <div style={{ marginBottom: 16, backgroundColor: '#f5f5f5', padding: 8, borderRadius: 4 }}>
            <Text strong>{translate('Selected UNSPSC Classification')}:</Text>
            <br />
            <Text>{`${unspscCodeInfo.code} - ${unspscCodeInfo.title || 'N/A'}`}</Text>
          </div>
        )}
        
        <Divider orientation="left">{translate('Manufacturer Information')}</Divider>
        
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              name="manufacturerName"
              label={translate('Manufacturer Name')}
              rules={[{ required: true, message: translate('Please enter manufacturer name') }]}
            >
              <Input placeholder={translate('Manufacturer name')} />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              name="manufacturerPartNumber"
              label={translate('Manufacturer Part Number')}
              rules={[{ required: true, message: translate('Please enter part number') }]}
            >
              <Input placeholder={translate('Part number')} />
            </Form.Item>
          </Col>
        </Row>
        
        <Divider orientation="left">{translate('Additional Information')}</Divider>
        
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="serialNumber"
              label={translate('Serial Number Required')}
              valuePropName="checked"
            >
              <Select>
                <Option value="Y">{translate('Yes')}</Option>
                <Option value="N">{translate('No')}</Option>
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="criticality"
              label={translate('Criticality')}
            >
              <Select>
                {criticalityOptions.map(option => (
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="equipmentTag"
              label={translate('Equipment Tag')}
            >
              <Input placeholder={translate('Equipment tag if applicable')} />
            </Form.Item>
          </Col>
        </Row>
        
        <Divider orientation="left">{translate('Inventory Control')}</Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={translate('Stock Item')}
              tooltip={translate('Is this item stocked in inventory?')}
            >
              <Switch
                checkedChildren="Yes"
                unCheckedChildren="No"
                checked={isStockItem}
                onChange={handleStockItemChange}
              />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              label={translate('Planned Stock')}
              tooltip={translate('Is inventory level planning required?')}
            >
              <Switch
                checkedChildren="Yes"
                unCheckedChildren="No"
                checked={isPlannedStock}
                onChange={setIsPlannedStock}
                disabled={!isStockItem}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<SaveOutlined />}
            >
              {translate('Create Item')}
            </Button>
            <Button 
              onClick={handleReset}
              icon={<ClearOutlined />}
            >
              {translate('Reset')}
            </Button>
            {onCancel && (
              <Button onClick={onCancel}>
                {translate('Cancel')}
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
