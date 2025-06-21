import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Switch,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Alert,
  Divider,
  InputNumber,
  message,
  Steps,
  Tag,
  Tooltip
} from 'antd';
import { 
  SaveOutlined, 
  ArrowLeftOutlined, 
  ToolOutlined,
  BarcodeOutlined,
  TagsOutlined,
  CheckCircleOutlined,
  RobotOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ErpLayout } from '@/layout';
import useLanguage from '@/locale/useLanguage';
import apiClient from '@/api/axiosConfig';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

export default function EnhancedItemMasterCreate() {
  const translate = useLanguage();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [interimNumber, setInterimNumber] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    generateInterimNumber();
  }, []);

  // Generate interim item number
  const generateInterimNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const interim = `TEMP-${timestamp.toString().slice(-6)}-${random.toString().padStart(3, '0')}`;
    setInterimNumber(interim);
    form.setFieldsValue({ itemNumber: interim });
  };

  // Equipment categories with subcategories
  const equipmentCategories = {
    'VALVE': ['GATE', 'GLOBE', 'BALL', 'BUTTERFLY', 'CHECK', 'RELIEF', 'CONTROL'],
    'PUMP': ['CENTRIFUGAL', 'POSITIVE_DISPLACEMENT', 'SUBMERSIBLE', 'VACUUM'],
    'MOTOR': ['AC', 'DC', 'SERVO', 'STEPPER', 'HYDRAULIC', 'PNEUMATIC'],
    'GASKET': ['SPIRAL_WOUND', 'FLAT', 'O_RING', 'CUSTOM'],
    'BEARING': ['BALL', 'ROLLER', 'THRUST', 'SLEEVE'],
    'SEAL': ['MECHANICAL', 'LIP', 'GLAND_PACKING'],
    'FILTER': ['AIR', 'OIL', 'FUEL', 'HYDRAULIC'],
    'COUPLING': ['FLEXIBLE', 'RIGID', 'FLUID'],
    'INSTRUMENTATION': ['PRESSURE', 'TEMPERATURE', 'FLOW', 'LEVEL'],
    'ELECTRICAL': ['CABLE', 'SWITCH', 'RELAY', 'TRANSFORMER'],
    'CONSUMABLE': ['LUBRICANT', 'CHEMICAL', 'CLEANING'],
    'SAFETY': ['PPE', 'EMERGENCY', 'SIGNAGE'],
    'OTHER': ['MISCELLANEOUS']
  };

  // UOM options
  const uomOptions = [
    { value: 'EA', label: 'Each (EA)' },
    { value: 'BOX', label: 'Box (BOX)' },
    { value: 'PC', label: 'Piece (PC)' },
    { value: 'SET', label: 'Set (SET)' },
    { value: 'KG', label: 'Kilogram (KG)' },
    { value: 'LTR', label: 'Liter (LTR)' },
    { value: 'M', label: 'Meter (M)' },
    { value: 'M2', label: 'Square Meter (M²)' },
    { value: 'M3', label: 'Cubic Meter (M³)' },
    { value: 'ROLL', label: 'Roll (ROLL)' },
    { value: 'PACK', label: 'Pack (PACK)' }
  ];

  // Handle category change to update subcategories
  const handleCategoryChange = (category) => {
    form.setFieldsValue({ equipmentSubCategory: undefined });
    generateStandardDescription();
  };

  // Generate standard description (NOUN, MODIFIER format)
  const generateStandardDescription = () => {
    const values = form.getFieldsValue();
    const { equipmentCategory, equipmentSubCategory, shortDescription } = values;
    
    if (equipmentCategory && shortDescription) {
      // Extract key specifications from short description
      const specs = extractSpecifications(shortDescription);
      let standard = `${equipmentCategory}`;
      
      if (equipmentSubCategory) {
        standard += `, ${equipmentSubCategory}`;
      }
      
      if (specs.length > 0) {
        standard += `: ${specs.join(', ')}`;
      }
      
      form.setFieldsValue({ standardDescription: standard });
    }
  };

  // Extract specifications from description
  const extractSpecifications = (description) => {
    const specs = [];
    const desc = description.toUpperCase();
    
    // Size patterns
    const sizePattern = /(\d+(?:\.\d+)?)\s*(IN|MM|CM|M)\b/g;
    let match;
    while ((match = sizePattern.exec(desc)) !== null) {
      specs.push(`${match[1]}${match[2]}`);
    }
    
    // Class patterns
    const classPattern = /CLASS\s+(\d+)/g;
    while ((match = classPattern.exec(desc)) !== null) {
      specs.push(`CLASS ${match[1]}`);
    }
    
    // Material patterns
    const materials = ['STAINLESS STEEL', 'CARBON STEEL', 'BRASS', 'BRONZE', 'ALUMINUM', 'PLASTIC'];
    materials.forEach(material => {
      if (desc.includes(material)) {
        specs.push(material);
      }
    });
    
    return specs;
  };

  // AI-powered description enhancement
  const enhanceDescriptionWithAI = async () => {
    const values = form.getFieldsValue();
    const { shortDescription, equipmentCategory, manufacturerName } = values;
    
    if (!shortDescription) {
      message.warning('Please enter a short description first');
      return;
    }
    
    setAiGenerating(true);
    try {
      const response = await apiClient.post('/ai/enhance-item-description', {
        description: shortDescription,
        category: equipmentCategory,
        manufacturer: manufacturerName
      });
      
      if (response.data.success) {
        const enhanced = response.data.data;
        form.setFieldsValue({
          longDescription: enhanced.longDescription,
          standardDescription: enhanced.standardDescription,
          unspscCode: enhanced.suggestedUnspscCode
        });
        message.success('Description enhanced with AI');
      }
    } catch (error) {
      console.error('AI enhancement error:', error);
      message.error('AI enhancement failed');
    } finally {
      setAiGenerating(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Determine stock code based on stock settings
      let stockCode = 'NS3'; // Non-stock
      if (values.plannedStock) {
        stockCode = 'ST2'; // Planned stock
      } else if (values.stockItem) {
        stockCode = 'ST1'; // Stock item
      }
      
      const submitData = {
        ...values,
        stockCode,
        status: 'PENDING_REVIEW', // Submit for review
        itemNumber: interimNumber
      };
      
      const response = await apiClient.post('/item', submitData);
      
      if (response.data.success) {
        message.success('Item Master created successfully and submitted for review');
        navigate('/item-master');
      } else {
        message.error(response.data.message || 'Failed to create item');
      }
    } catch (error) {
      console.error('Submit error:', error);
      message.error('Failed to create item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Form validation rules
  const validationRules = {
    shortDescription: [
      { required: true, message: 'Short description is required' },
      { max: 44, message: 'Description cannot exceed 44 characters' }
    ],
    manufacturerName: [
      { required: true, message: 'Manufacturer name is required' }
    ],
    manufacturerPartNumber: [
      { required: true, message: 'Manufacturer part number is required' }
    ],
    equipmentCategory: [
      { required: true, message: 'Equipment category is required' }
    ],
    uom: [
      { required: true, message: 'Unit of measure is required' }
    ],
    criticality: [
      { required: true, message: 'Criticality level is required' }
    ]
  };

  return (
    <ErpLayout>
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/item-master')}
              >
                Back to Item Master
              </Button>
              <Title level={3} style={{ margin: 0 }}>
                <ToolOutlined /> Create New Item Master
              </Title>
            </Space>
          </Col>
          <Col>
            <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
              <BarcodeOutlined /> Interim: {interimNumber}
            </Tag>
          </Col>
        </Row>

        {/* Process Steps */}
        <Card style={{ marginBottom: 24 }}>
          <Steps current={0} size="small">
            <Steps.Step title="Create Item" description="Fill item details" />
            <Steps.Step title="Quality Review" description="Reviewer approval" />
            <Steps.Step title="Number Assignment" description="Final item number" />
            <Steps.Step title="Inventory Setup" description="Min/Max levels" />
          </Steps>
        </Card>

        {/* Main Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            itemNumber: interimNumber,
            uom: 'EA',
            criticality: 'MEDIUM',
            stockItem: false,
            plannedStock: false,
            serialNumber: 'N'
          }}
          onValuesChange={generateStandardDescription}
        >
          <Row gutter={24}>
            {/* Left Column */}
            <Col span={12}>
              {/* Basic Information */}
              <Card title="Basic Information" style={{ marginBottom: 16 }}>
                <Form.Item
                  label="Item Number (Interim)"
                  name="itemNumber"
                >
                  <Input disabled prefix={<BarcodeOutlined />} />
                </Form.Item>

                <Form.Item
                  label="Item Short Description"
                  name="shortDescription"
                  rules={validationRules.shortDescription}
                  extra="Max 44 characters. Use NOUN, MODIFIER: specifications format"
                >
                  <Input.Group compact>
                    <Input
                      style={{ width: 'calc(100% - 40px)' }}
                      placeholder="e.g., GASKET: SPIRAL WOUND, 2IN"
                      showCount
                      maxLength={44}
                    />
                    <Tooltip title="Enhance with AI">
                      <Button
                        icon={<RobotOutlined />}
                        loading={aiGenerating}
                        onClick={enhanceDescriptionWithAI}
                      />
                    </Tooltip>
                  </Input.Group>
                </Form.Item>

                <Form.Item
                  label="Standard Description (Auto-generated)"
                  name="standardDescription"
                  extra="NOUN, MODIFIER: specifications format"
                >
                  <TextArea rows={2} placeholder="Auto-generated based on category and description" />
                </Form.Item>

                <Form.Item
                  label="Long Description"
                  name="longDescription"
                >
                  <TextArea rows={3} placeholder="Detailed technical description" />
                </Form.Item>
              </Card>

              {/* Manufacturer Information */}
              <Card title="Manufacturer Information" style={{ marginBottom: 16 }}>
                <Form.Item
                  label="Manufacturer Name"
                  name="manufacturerName"
                  rules={validationRules.manufacturerName}
                >
                  <Input placeholder="e.g., KLINGER, GALPERTY" />
                </Form.Item>

                <Form.Item
                  label="Manufacturer Part Number (MPN)"
                  name="manufacturerPartNumber"
                  rules={validationRules.manufacturerPartNumber}
                >
                  <Input placeholder="e.g., 2SPWDN01, GV111222" />
                </Form.Item>
              </Card>
            </Col>

            {/* Right Column */}
            <Col span={12}>
              {/* Classification */}
              <Card title="Equipment Classification" style={{ marginBottom: 16 }}>
                <Form.Item
                  label="Equipment Category"
                  name="equipmentCategory"
                  rules={validationRules.equipmentCategory}
                >
                  <Select
                    placeholder="Select equipment category"
                    onChange={handleCategoryChange}
                    showSearch
                  >
                    {Object.keys(equipmentCategories).map(category => (
                      <Option key={category} value={category}>
                        {category}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Equipment Sub-Category"
                  name="equipmentSubCategory"
                >
                  <Select
                    placeholder="Select sub-category"
                    showSearch
                    disabled={!form.getFieldValue('equipmentCategory')}
                  >
                    {form.getFieldValue('equipmentCategory') &&
                      equipmentCategories[form.getFieldValue('equipmentCategory')]?.map(sub => (
                        <Option key={sub} value={sub}>
                          {sub.replace(/_/g, ' ')}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="UNSPSC Code"
                  name="unspscCode"
                  extra="8-digit classification code"
                >
                  <Input placeholder="e.g., 40141700" maxLength={8} />
                </Form.Item>
              </Card>

              {/* Technical Specifications */}
              <Card title="Technical Specifications" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Unit of Measure (UOM)"
                      name="uom"
                      rules={validationRules.uom}
                    >
                      <Select>
                        {uomOptions.map(option => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Serial Number Required"
                      name="serialNumber"
                    >
                      <Select>
                        <Option value="Y">Yes</Option>
                        <Option value="N">No</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Equipment Tag"
                  name="equipmentTag"
                >
                  <Input placeholder="e.g., PUMP01, 987654" />
                </Form.Item>

                <Form.Item
                  label="Criticality"
                  name="criticality"
                  rules={validationRules.criticality}
                >
                  <Select>
                    <Option value="HIGH">
                      <Tag color="red">HIGH</Tag> - Critical to operations
                    </Option>
                    <Option value="MEDIUM">
                      <Tag color="orange">MEDIUM</Tag> - Important but not critical
                    </Option>
                    <Option value="LOW">
                      <Tag color="blue">LOW</Tag> - Routine maintenance
                    </Option>
                    <Option value="NO">
                      <Tag color="default">NO</Tag> - Non-critical
                    </Option>
                  </Select>
                </Form.Item>
              </Card>
            </Col>
          </Row>

          {/* Stock Management */}
          <Card title="Stock Management Configuration" style={{ marginBottom: 24 }}>
            <Alert
              message="Stock Configuration"
              description="Configure how this item will be managed in inventory. This affects procurement and storage requirements."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Row gutter={24}>
              <Col span={8}>
                <Card size="small" title="Stock Item">
                  <Form.Item name="stockItem" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Text type="secondary">
                    Keep in stock for critical requirements or long lead times (ST1)
                  </Text>
                </Card>
              </Col>
              
              <Col span={8}>
                <Card size="small" title="Planned Stock">
                  <Form.Item name="plannedStock" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Text type="secondary">
                    Requires minimum/maximum stock levels setup (ST2)
                  </Text>
                </Card>
              </Col>
              
              <Col span={8}>
                <Card size="small" title="Non-Stock">
                  <div style={{ textAlign: 'center', padding: '8px' }}>
                    <Text type="secondary">
                      Default: Direct orders without stocking (NS3)
                    </Text>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Conditional Min/Max fields for planned stock */}
            {form.getFieldValue('plannedStock') && (
              <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 6 }}>
                <Title level={5}>
                  <InfoCircleOutlined /> Planned Stock Levels
                </Title>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Minimum Stock Level"
                      name="minimumLevel"
                      rules={[{ required: true, message: 'Required for planned stock' }]}
                    >
                      <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        placeholder="Minimum quantity to maintain"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Maximum Stock Level"
                      name="maximumLevel"
                      rules={[{ required: true, message: 'Required for planned stock' }]}
                    >
                      <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        placeholder="Maximum quantity to stock"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            )}
          </Card>

          {/* Contract Information */}
          <Card title="Contract & Supplier Information (Optional)" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Contract Number"
                  name="contractNumber"
                >
                  <Input placeholder="e.g., 123456" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Supplier Name"
                  name="supplierName"
                >
                  <Input placeholder="e.g., RSL" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Submit Section */}
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Alert
                  message="Review Process"
                  description="After submission, this item will be sent to the reviewer for quality check. Once approved, a permanent item number will be assigned based on equipment category and sub-category."
                  type="warning"
                  showIcon
                />
              </Col>
              <Col>
                <Space>
                  <Button onClick={() => navigate('/item-master')}>
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<CheckCircleOutlined />}
                    loading={loading}
                    size="large"
                  >
                    Submit for Review
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Form>
      </div>
    </ErpLayout>
  );
}
