import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, Button, Space, Checkbox, Divider, Row, Col, Typography, Alert, App } from 'antd';
import { SaveOutlined, ReloadOutlined, ArrowLeftOutlined, ShopOutlined } from '@ant-design/icons';
import apiClient from '../api/axiosConfig';
import unspscService from '../services/unspscService';
import UnspscItemMasterIntegration from '../components/UnspscEnhancedSearch/UnspscItemMasterIntegration';
import UnspscSimpleInput from '../components/UnspscSimpleInput/UnspscSimpleInput';
import './CreateItemMasterForm.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

const initialState = {
  itemNumber: '',
  shortDescription: '',
  longDescription: '',
  standardDescription: '',
  manufacturerName: '',
  manufacturerPartNumber: '',
  equipmentCategory: '',
  equipmentSubCategory: '',
  unspscCodeId: '',
  unspscCode: '',
  uom: '',
  equipmentTag: '',
  serialNumber: 'N',
  criticality: 'NO',
  stockItem: 'N',
  plannedStock: 'N',
};

export default function CreateItemMasterForm({ onSuccess }) {
  const navigate = useNavigate();
  const { message } = App.useApp(); // Use App context for message API
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedUnspsc, setSelectedUnspsc] = useState({
    code: '',
    id: '',
    description: ''  });
  
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
    { value: 'HIGH', label: 'High Criticality' },
    { value: 'CRITICAL', label: 'Critical' }
  ];
    useEffect(() => {
    // Generate random item number and set initial form values
    const generatedItemNumber = generateItemNumber();
    form.setFieldsValue({
      itemNumber: generatedItemNumber,
      stockItem: false,
      plannedStock: false,
      serialNumber: 'N',
      criticality: 'NO'
    });
  }, []);
    const generateItemNumber = () => {
    // Generate a random alphanumeric prefix (2 letters)
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const prefix = 
      letters.charAt(Math.floor(Math.random() * letters.length)) + 
      letters.charAt(Math.floor(Math.random() * letters.length));
    
    // Generate a random 6-digit number
    const randomNumber = Math.floor(Math.random() * 900000) + 100000;
    
    // Format: XX-123456
    return `${prefix}-${randomNumber}`;
  };
  // Get the UUID for a UNSPSC code
  const getUnspscUuidByCode = async (code) => {
    if (!code) return null;
    
    // Clean up the code - remove any slashes if present
    const cleanedCode = code.replace(/\//g, '');
    
    // Validate that we have an 8-digit code
    if (!/^\d{8}$/.test(cleanedCode)) {
      console.error('Invalid UNSPSC code format:', code);
      return null;
    }
    
    try {
      console.log('Fetching UNSPSC UUID for code:', cleanedCode);
      
      // First, try to get the existing code
      const response = await apiClient.get(`/unspsc/code/${cleanedCode}`);
      if (response.data && response.data.id) {
        console.log('Found existing UNSPSC code in database:', cleanedCode, response.data.id);
        return response.data.id;
      }
      
      // If the code doesn't exist, try to create it using the direct endpoint
      console.log('UNSPSC code not found, attempting to create via direct endpoint:', cleanedCode);
      const createResponse = await apiClient.post('/unspsc/direct', { input: cleanedCode });
      
      if (createResponse.data?.success && createResponse.data?.data?.id) {
        console.log('Successfully created UNSPSC code:', cleanedCode, createResponse.data.data.id);
        return createResponse.data.data.id;
      }
      
      console.warn('Failed to get or create UNSPSC code:', cleanedCode);
      return null;
    } catch (error) {
      console.error('Error getting UNSPSC UUID by code:', error);
      // Try the direct endpoint as a fallback
      try {
        const createResponse = await apiClient.post('/unspsc/direct', { input: cleanedCode });
        if (createResponse.data?.success && createResponse.data?.data?.id) {
          console.log('Successfully created UNSPSC code on fallback:', cleanedCode);
          return createResponse.data.data.id;
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
      return null;
    }
  };
  const handleSearchResultSelect = async (result) => {
    try {
      console.log('Enhanced UNSPSC search result selected:', result);
      
      // Update the selected UNSPSC state
      setSelectedUnspsc({
        code: result.code,
        id: result.id || '',
        description: result.title || result.explanation || ''
      });
      
      // Update form field
      form.setFieldValue('unspscCode', result.code);
      
    } catch (error) {
      console.error('Error handling search result selection:', error);
    }
  };
    const handleUnspscChange = async (code, data) => {
    console.log('UnspscSimpleInput onChange:', code, data);
    
    if (data && data.id) {
      // We have the full data with ID
      console.log('Using data with ID from component:', data.id);
      setSelectedUnspsc({
        code: code,
        id: data.id,
        description: data.title || data.description || ''
      });
    } else if (code) {
      // Try to get the ID for the code
      console.log('Getting UUID for code:', code);
      let unspscId = await getUnspscUuidByCode(code);
      
      if (unspscId) {
        console.log('Retrieved ID for code:', unspscId);
        setSelectedUnspsc({
          code: code,
          id: unspscId,
          description: ''
        });
      } else {
        console.warn('Failed to get ID for code, will try to create it during submission');
        setSelectedUnspsc({
          code: code,
          id: '',
          description: ''
        });
      }
    } else {
      // Clear the UNSPSC data if code is empty
      setSelectedUnspsc({
        code: '',
        id: '',
        description: ''
      });
    }
  };  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      // Prepare form data
      const formData = {
        ...values,
        // Convert boolean values to Y/N format for backend
        stockItem: values.stockItem ? 'Y' : 'N',
        plannedStock: values.plannedStock ? 'Y' : 'N',
        // Include UNSPSC data - let backend handle ID lookup
        unspscCode: selectedUnspsc.code,
        // Don't send unspscCodeId - let backend look it up to avoid foreign key errors
      };

      // If standardDescription is empty, use shortDescription
      if (!formData.standardDescription) {
        formData.standardDescription = formData.shortDescription;
      }
      
      // Set default values for required fields if they're empty
      if (!formData.manufacturerName) {
        formData.manufacturerName = 'N/A';
      }
      
      if (!formData.manufacturerPartNumber) {
        formData.manufacturerPartNumber = 'N/A';
      }
      
      // Ensure equipmentCategory is set (it's required)
      if (!formData.equipmentCategory) {
        formData.equipmentCategory = 'OTHER';
      }
      
      // Call API to create item master
      console.log('Submitting form data:', formData);
      const response = await apiClient.post('/inventory/item-master', formData);      if (response.data.success) {
        setSuccess(true);
        
        // Use App context message API instead of static calls
        message.success({
          content: 'Item master record created successfully!',
          duration: 4.5,
        });
        
        // Callback to parent component
        if (onSuccess) {
          onSuccess(response.data.data);
        }
          // Redirect to item master list page
        setTimeout(() => {
          navigate('/item-master');
        }, 1000);
        
      } else {
        message.error({
          content: response.data.message || 'Failed to create item master record.',
          duration: 4.5,
        });
      }
    } catch (error) {
      console.error('Error creating item master:', error);
      let errorMessage = 'Error creating item master record. Please try again.';
      
      if (error.response) {
        console.error('Server error response:', error.response.data);
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 400) {
          errorMessage = 'Bad request: Please check the form for missing required fields.';
        } else if (error.response.status === 401) {
          errorMessage = 'Unauthorized: Please log in again.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error: Please try again later.';        }      }      
      message.error({
        content: errorMessage,
        duration: 4.5,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const newItemNumber = generateItemNumber();
    form.resetFields();
    form.setFieldsValue({
      itemNumber: newItemNumber,
      stockItem: false,
      plannedStock: false,
      serialNumber: 'N',
      criticality: 'NO'
    });
    setSelectedUnspsc({
      code: '',
      id: '',
      description: ''
    });
  };

  const handleGoBack = () => {
    navigate('/item-master');
  };
    return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card>
        <div style={{ marginBottom: '24px' }}>
          <Space align="center" style={{ marginBottom: '16px' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={handleGoBack}>
              Back to Item Master List
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              <ShopOutlined style={{ marginRight: '8px' }} />
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
            description="Item master record created successfully! Redirecting..."
            type="success"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            stockItem: false,
            plannedStock: false,
            serialNumber: 'N',
            criticality: 'NO'
          }}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Item Number"
                name="itemNumber"
                tooltip="Auto-generated unique identifier for the item"
              >
                <Input disabled prefix="ID:" placeholder="Auto-generated" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Unit of Measure"
                name="uom"
                rules={[{ required: true, message: 'Please select unit of measure' }]}
                tooltip="Standard unit for measuring this item"
              >
                <Select placeholder="Select UOM" showSearch>
                  {unitsOfMeasure.map(uom => (
                    <Select.Option key={uom.value} value={uom.value}>
                      {uom.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Item Description</Divider>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Short Description"
                name="shortDescription"
                rules={[
                  { required: true, message: 'Please enter short description' },
                  { max: 44, message: 'Maximum 44 characters allowed' }
                ]}
                tooltip="NOUN, MODIFIER: size, class, material (max 44 chars)"
              >
                <Input 
                  placeholder="NOUN, MODIFIER: size, class, material" 
                  showCount 
                  maxLength={44}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Equipment Category"
                name="equipmentCategory"
                tooltip="Primary category for this equipment type"
              >
                <Select placeholder="Select Category" showSearch>
                  {equipmentCategories.map(cat => (
                    <Select.Option key={cat.value} value={cat.value}>
                      {cat.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label="Long Description"
                name="longDescription"
                tooltip="Detailed description of the item including specifications"
              >
                <TextArea 
                  rows={3} 
                  placeholder="Detailed description of the item including specifications"
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">UNSPSC Classification</Divider>          <Card size="small" style={{ backgroundColor: '#fafafa', marginBottom: '16px' }}>
            <Title level={4} style={{ marginBottom: '16px' }}>UNSPSC Code Search & Favorites</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
              Search for UNSPSC codes or select from your favorites for quick classification
            </Text>
            <UnspscItemMasterIntegration 
              onSelect={handleSearchResultSelect}
              value={selectedUnspsc.code}
              placeholder="Search for UNSPSC codes (e.g., iPhone, Water Bottles, Laptop...)"
            />
          </Card>

          <Card size="small" style={{ backgroundColor: '#fafafa', marginBottom: '16px' }}>
            <Title level={4} style={{ marginBottom: '16px' }}>Manual UNSPSC Input</Title>
            <Form.Item
              label="Enter UNSPSC code directly"
              tooltip="Enter 8-digit code (e.g., 40141607) or path format (e.g., 40/14/16/07)"
            >
              <UnspscSimpleInput 
                value={selectedUnspsc.code}
                onChange={handleUnspscChange}
                placeholder="Enter code (e.g., 40141607) or path (e.g., 40/14/16/07)"
              />
            </Form.Item>
          </Card>

          {selectedUnspsc.code && (
            <Alert
              message={`Selected UNSPSC Code: ${selectedUnspsc.code}`}
              description={selectedUnspsc.description}
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          <Divider orientation="left">Manufacturer Information</Divider>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Manufacturer Name"
                name="manufacturerName"
                tooltip="Name of the item manufacturer"
              >
                <Input placeholder="Enter manufacturer name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Manufacturer Part Number"
                name="manufacturerPartNumber"
                tooltip="Manufacturer's part number for this item"
              >
                <Input placeholder="Enter manufacturer part number" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Item Properties</Divider>

          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Criticality"
                name="criticality"
                tooltip="Criticality level for maintenance and procurement planning"
              >
                <Select placeholder="Select Criticality">
                  {criticalityLevels.map(level => (
                    <Select.Option key={level.value} value={level.value}>
                      {level.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Equipment Sub-Category"
                name="equipmentSubCategory"
                tooltip="More specific categorization within the equipment category"
              >
                <Input placeholder="Enter sub-category" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Equipment Tag"
                name="equipmentTag"
                tooltip="Specific equipment tag or identifier"
              >
                <Input placeholder="Enter equipment tag" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Stock Management</Divider>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Card size="small" style={{ backgroundColor: '#f6f6f6' }}>
                <Space direction="vertical" size="middle">
                  <Form.Item
                    name="stockItem"
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <Checkbox>
                      <Space direction="vertical" size={0}>
                        <Text strong>Stock Item</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          This item is managed in inventory with stock levels
                        </Text>
                      </Space>
                    </Checkbox>
                  </Form.Item>

                  <Form.Item
                    name="plannedStock"
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <Checkbox>
                      <Space direction="vertical" size={0}>
                        <Text strong>Planned Stock</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Enable minimum/maximum stock level management
                        </Text>
                      </Space>
                    </Checkbox>
                  </Form.Item>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Standard Description"
                name="standardDescription"
                tooltip="Standardized description for reporting and classification"
              >
                <TextArea 
                  rows={4} 
                  placeholder="Will default to short description if not provided"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
            <Space size="large">
              <Button
                type="default"
                icon={<ReloadOutlined />}
                onClick={handleReset}
                disabled={loading}
                size="large"
              >
                Reset Form
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                size="large"
                style={{ minWidth: '160px' }}
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
