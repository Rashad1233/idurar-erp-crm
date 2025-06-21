import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, Button, Space, Checkbox, Divider, Row, Col, Typography, Alert, App, Tooltip } from 'antd';
import { SaveOutlined, ReloadOutlined, ArrowLeftOutlined, ShopOutlined, InfoCircleOutlined } from '@ant-design/icons';
import apiClient from '../api/axiosConfig';
import UnspscItemMasterIntegration from '../components/UnspscEnhancedSearch/UnspscItemMasterIntegration';
import ItemDescriptionGenerator from '../components/ItemDescriptionGenerator/ItemDescriptionGenerator';
import ComprehensiveAIAssistant from '../components/AI/ComprehensiveAIAssistant';
import './FixedItemMasterForm.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function FixedItemMasterForm() {
  const navigate = useNavigate();
  const { message, notification } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [selectedUnspsc, setSelectedUnspsc] = React.useState(null);
  
  // Units of measure common in ERP systems
  const unitsOfMeasure = [
    { value: 'EA', label: 'Each (EA)' },
    { value: 'PCS', label: 'Pieces (PCS)' },
    { value: 'KG', label: 'Kilogram (KG)' },
    { value: 'G', label: 'Gram (G)' },
    { value: 'L', label: 'Liter (L)' },
    { value: 'ML', label: 'Milliliter (ML)' },
    { value: 'M', label: 'Meter (M)' },
    { value: 'CM', label: 'Centimeter (CM)' },
    { value: 'MM', label: 'Millimeter (MM)' },
    { value: 'BOX', label: 'Box (BOX)' },
    { value: 'CTN', label: 'Carton (CTN)' },
    { value: 'DZ', label: 'Dozen (DZ)' },
    { value: 'PR', label: 'Pair (PR)' },
    { value: 'SET', label: 'Set (SET)' }
  ];

  const equipmentCategories = [
    { value: 'VALVE', label: 'Valves' },
    { value: 'PUMP', label: 'Pumps' },
    { value: 'MOTOR', label: 'Motors' },
    { value: 'ELECTRICAL', label: 'Electrical Equipment' },
    { value: 'INSTRUMENTATION', label: 'Instrumentation' },
    { value: 'PIPING', label: 'Piping & Fittings' },
    { value: 'HARDWARE', label: 'Hardware' },
    { value: 'CONSUMABLE', label: 'Consumables' },
    { value: 'SAFETY', label: 'Safety Equipment' },
    { value: 'TOOLS', label: 'Tools & Equipment' },
    { value: 'OTHER', label: 'Other' }
  ];

  const criticalityLevels = [
    { value: 'NO', label: 'Not Critical' },
    { value: 'LOW', label: 'Low Criticality' },
    { value: 'MEDIUM', label: 'Medium Criticality' },
    { value: 'HIGH', label: 'High Criticality' }
  ];
  
  const subCategories = {
    VALVE: [
      { value: 'GATE', label: 'Gate Valve' },
      { value: 'BALL', label: 'Ball Valve' },
      { value: 'GLOBE', label: 'Globe Valve' },
      { value: 'BUTTERFLY', label: 'Butterfly Valve' },
      { value: 'CHECK', label: 'Check Valve' }
    ],
    PUMP: [
      { value: 'CENTRIFUGAL', label: 'Centrifugal Pump' },
      { value: 'POSITIVE', label: 'Positive Displacement' },
      { value: 'SUBMERSIBLE', label: 'Submersible Pump' }
    ],
    MOTOR: [
      { value: 'AC', label: 'AC Motor' },
      { value: 'DC', label: 'DC Motor' },
      { value: 'SERVO', label: 'Servo Motor' }
    ],
    ELECTRICAL: [
      { value: 'CABLE', label: 'Cables & Wires' },
      { value: 'CONNECTOR', label: 'Connectors' },
      { value: 'SWITCH', label: 'Switches' }
    ],
    OTHER: [
      { value: 'MISC', label: 'Miscellaneous' }
    ]
  };
  
  // Generate a random item number
  React.useEffect(() => {
    generateAndSetItemNumber();
  }, []);
  
  const generateAndSetItemNumber = () => {
    // Generate random prefix (2 letters)
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const prefix = 
      letters.charAt(Math.floor(Math.random() * letters.length)) + 
      letters.charAt(Math.floor(Math.random() * letters.length));
    
    // Generate 6-digit number
    const number = Math.floor(100000 + Math.random() * 900000);
    const itemNumber = `${prefix}-${number}`;
    
    form.setFieldValue('itemNumber', itemNumber);
  };
    // Handle UNSPSC code selection from enhanced search
  const handleUnspscChange = (result) => {
    console.log('Enhanced UNSPSC search result selected:', result);
    setSelectedUnspsc({
      code: result.code,
      id: result.id || null,
      title: result.title || result.fullTitle || '',
      description: result.explanation || '',
      segment: result.segment,
      family: result.family,
      class: result.class,
      commodity: result.commodity
    });
    form.setFieldValue('unspscCode', result.code);  };
  
  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
        // Prepare data for API
      const itemData = {
        ...values,
        // Convert checkbox values to Y/N format for the database
        stockItem: values.stockItem ? 'Y' : 'N',
        plannedStock: values.plannedStock ? 'Y' : 'N',
        // Handle UNSPSC data properly - use the selected UNSPSC or the form value
        unspscCodeId: selectedUnspsc?.id || null,
        unspscCode: selectedUnspsc?.code || values.unspscCode || '',
        // Make sure we have all required fields
        standardDescription: values.standardDescription || values.shortDescription      
      };
      
      console.log('Submitting item data:', itemData);
      console.log('Selected UNSPSC state:', selectedUnspsc);
      
      // Try the new register-item-master endpoint first (should always work)
      console.log('Trying register-item-master endpoint...');
      try {
        const registerResponse = await apiClient.post('register-item-master', itemData);
        if (registerResponse?.data?.success) {
          setSuccess(true);
          message.success('Item master created successfully with register route!');
          
          // Redirect after delay
          setTimeout(() => {
            navigate('/item-master');
          }, 2000);
          return;
        }
      } catch (registerError) {
        console.error('Register endpoint failed:', registerError);
      }
        
      // Use our ULTRA simple endpoint as fallback
      console.log('Trying ultra-simple endpoint...');
      const response = await apiClient.post('ultra-simple-item-create', itemData);
      
      // Try backup endpoints if needed (shouldn't be necessary)
      if (!response?.data?.success) {
        console.log('Ultra simple failed, trying super simple endpoint...');
        try {
          const superResponse = await apiClient.post('super-simple-item-create', itemData);
          if (superResponse?.data?.success) {
            return superResponse;
          }
        } catch (superError) {
          console.error('Super simple endpoint failed:', superError);
        }
        
        try {
          console.log('Trying direct endpoint...');
          const directResponse = await apiClient.post('direct-item-create', itemData);
          if (directResponse?.data?.success) {
            return directResponse;
          }
        } catch (directError) {
          console.error('Direct endpoint failed:', directError);
        }
      }
      
      if (response?.data?.success) {
        setSuccess(true);
        message.success('Item master created successfully!');
        
        // Redirect after delay
        setTimeout(() => {
          navigate('/item-master');
        }, 2000);
      } else {
        throw new Error(response?.data?.message || 'Failed to create item master');
      }
    } catch (error) {
      console.error('Error creating item master:', error);
      notification.error({
        message: 'Failed to Create Item Master',
        description: error.message || 'An unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle reset
  const handleReset = () => {
    form.resetFields();
    generateAndSetItemNumber();
    setSelectedUnspsc(null);
  };

  // Handle AI-generated data
  const handleAIDataGenerated = (aiData) => {
    console.log('AI generated data:', aiData);
    
    // Apply all the AI-generated data to the form
    const fieldsToUpdate = {};
    
    if (aiData.shortDescription) {
      fieldsToUpdate.shortDescription = aiData.shortDescription;
    }
    
    if (aiData.longDescription) {
      fieldsToUpdate.longDescription = aiData.longDescription;
    }
    
    if (aiData.standardDescription) {
      fieldsToUpdate.standardDescription = aiData.standardDescription;
    }
    
    if (aiData.equipmentCategory) {
      fieldsToUpdate.equipmentCategory = aiData.equipmentCategory;
    }
    
    if (aiData.equipmentSubCategory) {
      fieldsToUpdate.equipmentSubCategory = aiData.equipmentSubCategory;
    }
    
    if (aiData.manufacturerName) {
      fieldsToUpdate.manufacturerName = aiData.manufacturerName;    }
    
    if (aiData.manufacturerPartNumber) {
      fieldsToUpdate.manufacturerPartNumber = aiData.manufacturerPartNumber;
    }
    
    if (aiData.criticality) {
      fieldsToUpdate.criticality = aiData.criticality;
    }
    
    if (aiData.uom) {
      fieldsToUpdate.uom = aiData.uom;
    }
    
    // Handle UNSPSC suggestion
    if (aiData.suggestedUnspsc) {
      setSelectedUnspsc({
        code: aiData.suggestedUnspsc.code,
        id: null,
        title: aiData.suggestedUnspsc.title,
        description: aiData.suggestedUnspsc.justification,
        confidence: aiData.suggestedUnspsc.confidence
      });
      fieldsToUpdate.unspscCode = aiData.suggestedUnspsc.code;
    }
    
    // Apply all fields to the form
    form.setFieldsValue(fieldsToUpdate);
    
    // Show success message
    message.success('AI-generated data applied to form successfully!');
    
    console.log('Applied AI data to form:', fieldsToUpdate);
  };

  return (
    <div className="item-master-form-container">
      <Card bordered={false} className="item-master-card">
        <div className="form-header">
          <Space align="center">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/item-master')}
            >
              Back to List
            </Button>
            <Title level={3} style={{ margin: 0 }}>
              <ShopOutlined style={{ marginRight: 8 }} />
              Create New Item Master Record
            </Title>
          </Space>
          <Text type="secondary">
            Create a new item master record with UNSPSC classification and detailed specifications
          </Text>
        </div>

        {success && (
          <Alert
            message="Success"
            description="Item master record created successfully! Redirecting to item master list..."
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            stockItem: false,
            plannedStock: false,
            criticality: 'NO',
            uom: 'EA'
          }}
          className="item-master-form"
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <Tooltip title="Unique identifier for this item">
                    <Space>
                      Item Number
                      <InfoCircleOutlined />
                    </Space>
                  </Tooltip>
                }
                name="itemNumber"
              >
                <Input readOnly placeholder="Auto-generated" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <Tooltip title="Standard unit used to measure this item">
                    <Space>
                      Unit of Measure
                      <InfoCircleOutlined />
                    </Space>
                  </Tooltip>
                }
                name="uom"
                rules={[{ required: true, message: 'Please select unit of measure' }]}
              >
                <Select 
                  placeholder="Select UOM" 
                  showSearch 
                  filterOption={(input, option) =>
                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  options={unitsOfMeasure}
                />
              </Form.Item>
            </Col>
          </Row>          <Divider orientation="left">Item Description</Divider>

          {/* AI Assistant for comprehensive item generation */}          <ComprehensiveAIAssistant 
            onDataGenerated={handleAIDataGenerated}
            formValues={{
              shortDescription: form.getFieldValue('shortDescription'),
              longDescription: form.getFieldValue('longDescription'),
              standardDescription: form.getFieldValue('standardDescription'),
              manufacturerName: form.getFieldValue('manufacturerName'),
              manufacturerPartNumber: form.getFieldValue('manufacturerPartNumber'),
              equipmentCategory: form.getFieldValue('equipmentCategory'),
              equipmentSubCategory: form.getFieldValue('equipmentSubCategory'),
              criticality: form.getFieldValue('criticality'),
              uom: form.getFieldValue('uom'),
              unspscCode: selectedUnspsc?.code
            }}
          />

          <ItemDescriptionGenerator
            form={form}
            manufacturer={form.getFieldValue('manufacturerName')}
            partNumber={form.getFieldValue('manufacturerPartNumber')}
            category={form.getFieldValue('equipmentCategory')}
            subCategory={form.getFieldValue('equipmentSubCategory')}
            unspscCode={selectedUnspsc?.code}
            unspscTitle={selectedUnspsc?.title}
          />

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <Tooltip title="Short description following NOUN, MODIFIER format">
                    <Space>
                      Short Description
                      <InfoCircleOutlined />
                    </Space>
                  </Tooltip>
                }
                name="shortDescription"
                rules={[
                  { required: true, message: 'Please enter a short description' },
                  { max: 100, message: 'Maximum 100 characters allowed' }
                ]}
              >
                <Input 
                  placeholder="NOUN, MODIFIER: size, class, material" 
                  maxLength={100}
                  showCount
                />
              </Form.Item>
                <Form.Item
                label={
                  <Tooltip title="Detailed item specifications">
                    <Space>
                      Long Description
                      <InfoCircleOutlined />
                    </Space>
                  </Tooltip>
                }
                name="longDescription"
              >
                <TextArea
                  rows={4}
                  placeholder="Detailed description of the item including specifications"
                  maxLength={500}
                  showCount
                />
              </Form.Item>
              
              <Form.Item
                label={
                  <Tooltip title="Standard technical description for procurement">
                    <Space>
                      Standard Description
                      <InfoCircleOutlined />
                    </Space>
                  </Tooltip>
                }
                name="standardDescription"
              >
                <TextArea
                  rows={3}
                  placeholder="Standard technical description for procurement and documentation"
                  maxLength={300}
                  showCount
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>              <Form.Item
                label={
                  <Tooltip title="Primary category for this item">
                    <Space>
                      Equipment Category
                      <InfoCircleOutlined />
                    </Space>
                  </Tooltip>
                }
                name="equipmentCategory"
                rules={[{ required: true, message: 'Please select a category' }]}
              >
                <Select
                  placeholder="Select Category"
                  options={equipmentCategories}
                  onChange={() => {
                    // Reset sub-category when primary category changes
                    form.setFieldValue('equipmentSubCategory', undefined);
                  }}
                />
              </Form.Item>
                <Form.Item
                label={
                  <Tooltip title="Equipment sub-category based on primary category">
                    <Space>
                      Equipment Sub-Category
                      <InfoCircleOutlined />
                    </Space>
                  </Tooltip>
                }
                name="equipmentSubCategory"
                dependencies={['equipmentCategory']}
              >
                {({ getFieldValue }) => (
                  <Select
                    placeholder="Select Sub-Category"
                    options={subCategories[getFieldValue('equipmentCategory')] || []}
                    disabled={!getFieldValue('equipmentCategory')}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
            <Divider orientation="left">UNSPSC Classification</Divider>
            <Card size="small" style={{ backgroundColor: '#fafafa', marginBottom: '16px' }}>
            <Title level={4} style={{ marginBottom: '16px' }}>UNSPSC Code Search & Favorites</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
              Search for UNSPSC codes or select from your favorites for quick classification
            </Text>
            <UnspscItemMasterIntegration 
              onSelect={handleUnspscChange}
              value={selectedUnspsc?.code}
              placeholder="Search for UNSPSC codes (e.g., iPhone, Water Bottles, Laptop...)"
            />
          </Card>
          
          <Form.Item name="unspscCode" hidden>
            <Input />
          </Form.Item>
          
          {selectedUnspsc && selectedUnspsc.title && (
            <Alert
              message={`Selected: ${selectedUnspsc.code} - ${selectedUnspsc.title}`}
              description={selectedUnspsc.description || 'No additional description available'}
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          
          <Divider orientation="left">Additional Information</Divider>
          
          <Row gutter={24}>            <Col xs={24} md={12}>
              <Form.Item
                label="Manufacturer Name"
                name="manufacturerName"
              >
                <Input placeholder="Enter manufacturer name" />
              </Form.Item>
                <Form.Item
                label="Manufacturer Part Number"
                name="manufacturerPartNumber"
              >
                <Input placeholder="Enter manufacturer part number" />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                label="Criticality"
                name="criticality"
              >
                <Select
                  placeholder="Select Criticality"
                  options={criticalityLevels}
                />
              </Form.Item>
              
              <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
                <Form.Item
                  name="stockItem"
                  valuePropName="checked"
                >
                  <Checkbox>
                    <Space>
                      <span>Stock Item</span>
                      <Tooltip title="Track this item in inventory">
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Space>
                  </Checkbox>
                </Form.Item>
                  <Form.Item
                  name="plannedStock"
                  valuePropName="checked"
                >
                  <Checkbox>
                    <Space>
                      <span>Planned Stock</span>
                      <Tooltip title="Enable minimum and maximum inventory level planning">
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Space>
                  </Checkbox>
                </Form.Item>
              </Space>
            </Col>
          </Row>
          
          <Divider />
          
          <Form.Item className="form-actions">
            <Space size="middle">
              <Button
                type="default"
                icon={<ReloadOutlined />}
                onClick={handleReset}
                disabled={loading}
              >
                Reset Form
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={loading}
                htmlType="submit"
              >
                {loading ? 'Creating...' : 'Create Item Master'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
