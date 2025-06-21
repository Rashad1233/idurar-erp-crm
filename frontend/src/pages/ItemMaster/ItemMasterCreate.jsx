import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  Switch, 
  Row, 
  Col, 
  Divider, 
  notification,
  Spin,
  Typography,
  Space,
  Alert,
  Tooltip,
  Modal,
  Result
} from 'antd';
import { 
  RobotOutlined, 
  SaveOutlined, 
  ReloadOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import apiClient from '@/api/axiosConfig';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Custom styles for AI suggestions
const aiSuggestionStyles = `
  .ai-suggestion-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .suggestion-item:hover {
    border-color: #1890ff !important;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
    transform: translateY(-1px);
  }
  
  .suggestion-item:active {
    transform: translateY(0px);
  }
  
  .ai-suggestions-container .ant-card-head {
    background: linear-gradient(90deg, #f0f9ff, #ffffff);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = aiSuggestionStyles;
  document.head.appendChild(styleSheet);
}

export default function ItemMasterCreate() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [showAiMenu, setShowAiMenu] = useState(false);  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdItemInfo, setCreatedItemInfo] = useState(null);
  const [redirectCountdown, setRedirectCountdown] = useState(10);
  const [unspscBreakdown, setUnspscBreakdown] = useState(null);
  const [unspscAnalyzing, setUnspscAnalyzing] = useState(false);

  // Handle description changes in the form field
  const handleDescriptionChange = (value) => {
    console.log('Description changed:', value);
    // Hide AI menu when user types
    setShowAiMenu(false);    setAiSuggestions(null);
  };

  // Generate complete item data using AI - now creates suggestions instead of auto-applying
  const generateCompleteItemData = async (shortDescription, manufacturer = '', category = '') => {
    // Get the current value from form field if not provided
    if (!shortDescription) {
      shortDescription = form.getFieldValue('shortDescription');
    }
    
    if (!shortDescription || shortDescription.length < 3) {
      notification.warning({
        message: 'Description Too Short',
        description: 'Please enter at least 3 characters for AI generation.'
      });
      return;
    }

    setAiGenerating(true);
    console.log('🤖 Generating AI suggestions for:', shortDescription);
    
    try {
      const response = await apiClient.post('/ai/generate-complete-item', {
        shortDescription,
        manufacturer: manufacturer || form.getFieldValue('manufacturerName') || '',
        category: category || form.getFieldValue('equipmentCategory') || '',
        additionalInfo: form.getFieldValue('additionalInfo') || ''
      });

      console.log('🤖 AI Response:', response.data);      if (response.data.success) {
        const aiData = response.data.data;
        setAiSuggestions(aiData);
        setShowAiMenu(true);
        
        notification.success({
          message: '🤖 AI Suggestions Ready',
          description: 'Review the suggestions and choose which ones to apply.',
          duration: 4
        });
      }
    } catch (error) {
      console.error('AI generation error:', error);
      notification.error({
        message: 'AI Generation Failed',
        description: error.response?.data?.message || 'Could not generate item data'
      });
    } finally {
      setAiGenerating(false);
    }
  };  // Apply specific AI suggestions
  const applyAiSuggestion = (field, value) => {
    // Handle field mapping for special cases
    let targetField = field;
    if (field === 'unitOfMeasure') {
      targetField = 'uom'; // Map to correct form field
    }
    
    form.setFieldValue(targetField, value);
    
    // Special handling for UNSPSC code to also set the description
    if (field === 'unspscCode' && aiSuggestions?.unspscTitle) {
      form.setFieldValue('unspscTitle', aiSuggestions.unspscTitle);
    }
    
    notification.success({
      message: 'Applied',
      description: `Applied AI suggestion for ${field}`,
      duration: 2
    });
  };
  // Apply all AI suggestions
  const applyAllAiSuggestions = () => {
    if (!aiSuggestions) return;    // Only apply fields that have actual values (not undefined, null, or empty string)
    const fieldsToApply = {};
    const fieldMapping = {
      shortDescription: 'shortDescription',
      longDescription: 'longDescription',
      standardDescription: 'standardDescription',
      technicalDescription: 'technicalDescription',
      manufacturerName: 'manufacturerName',
      manufacturerPartNumber: 'manufacturerPartNumber',
      equipmentCategory: 'equipmentCategory',
      equipmentSubCategory: 'equipmentSubCategory',
      unitOfMeasure: 'uom', // Map to correct field name
      unspscCode: 'unspscCode',
      unspscTitle: 'unspscTitle',
      stockItem: 'stockItem',
      plannedStock: 'plannedStock',
      criticality: 'criticality',
      serialNumber: 'serialNumber',
      estimatedPrice: 'estimatedPrice',
      supplierName: 'supplierName'
    };
    
    // Count how many fields will be applied
    let appliedCount = 0;
      Object.entries(fieldMapping).forEach(([aiField, formField]) => {
      const value = aiSuggestions[aiField];
      
      // Special handling for shortDescription to ensure it doesn't exceed character limit
      let processedValue = value;
      if (aiField === 'shortDescription' && typeof value === 'string' && value.length > 44) {
        processedValue = value.substring(0, 44).trim();
        console.log(`🤖 Truncating short description: "${value}" → "${processedValue}"`);
      }
      
      if (processedValue !== undefined && processedValue !== null && processedValue !== '' && processedValue !== 'TBD') {
        fieldsToApply[formField] = processedValue;
        appliedCount++;
        console.log(`🤖 Will apply ${aiField} → ${formField}:`, processedValue);
      } else {
        console.log(`🤖 Skipping ${aiField} (${formField}):`, value, 'processed:', processedValue);
      }
    });
      console.log('🤖 Applying AI fields:', fieldsToApply);
    console.log('🤖 Available AI suggestions:', aiSuggestions);
    console.log('🤖 Short description debug:', {
      aiGenerated: aiSuggestions.shortDescription,
      willBeApplied: fieldsToApply.shortDescription,
      currentFormValue: form.getFieldValue('shortDescription')
    });
    
    if (appliedCount > 0) {
      form.setFieldsValue(fieldsToApply);
      
      // Log what actually got set
      setTimeout(() => {
        console.log('🤖 After applying - form value:', form.getFieldValue('shortDescription'));
      }, 100);      notification.success({
        message: '✅ All Suggestions Applied',
        description: `Applied ${appliedCount} AI suggestions to the form.`,
        duration: 3
      });
    } else {
      notification.warning({
        message: 'No Data to Apply',
        description: 'No valid AI suggestions found to apply.',
        duration: 3
      });
    }
    
    setShowAiMenu(false);
  };  // Regenerate all AI data
  const regenerateAI = async () => {
    const shortDesc = form.getFieldValue('shortDescription');
    const manufacturer = form.getFieldValue('manufacturerName');
    const category = form.getFieldValue('equipmentCategory');
    
    if (shortDesc) {
      await generateCompleteItemData(shortDesc, manufacturer, category);
    }
  };// Submit form
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log('🔍 Form submission - original values:', values);
      
      // Map frontend field names to backend expected names
      const mappedValues = {
        ...values,
        uom: values.unitOfMeasure, // Map unitOfMeasure to uom
      };
      
      // Remove the original field to avoid confusion
      delete mappedValues.unitOfMeasure;
      
      console.log('🔍 Form submission - mapped values:', mappedValues);
      console.log('🔍 UOM value check:', {
        original: values.unitOfMeasure,
        mapped: mappedValues.uom,
        exists: !!mappedValues.uom
      });
        const response = await apiClient.post('/item', mappedValues);
      
      console.log('🔍 API Response:', response.data);
        if (response.data.success) {
        const createdItem = response.data.data; // Backend returns data in 'data' field
        
        // Store created item info for the success modal
        setCreatedItemInfo({
          itemNumber: createdItem.itemNumber,
          shortDescription: values.shortDescription,
          id: createdItem.id,
          status: createdItem.status
        });
        
        // Show success modal instead of notification
        setShowSuccessModal(true);
        
        // Reset form
        form.resetFields();
        setShowAiMenu(false);
        setAiSuggestions(null);
      }} catch (error) {
      console.error('Item creation error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      notification.error({
        message: 'Creation Failed',
        description: error.response?.data?.message || error.message || 'Could not create item'
      });
    } finally {
      setLoading(false);
    }
  };

  // Analyze UNSPSC code and provide breakdown
  const analyzeUNSPSCCode = async (unspscCode) => {
    if (!unspscCode || unspscCode.length !== 8) {
      setUnspscBreakdown(null);
      return;
    }

    setUnspscAnalyzing(true);
    try {
      const response = await apiClient.post('/ai/analyze-unspsc', {
        unspscCode: unspscCode
      });

      if (response.data.success) {
        const breakdown = response.data.data;
        setUnspscBreakdown(breakdown);
        
        // Show validation message
        if (breakdown.isValid) {
          notification.success({
            message: '✅ Valid UNSPSC Code',
            description: `${breakdown.segment} - ${breakdown.family}`,
            duration: 3
          });
        } else {
          notification.warning({
            message: '⚠️ UNSPSC Code Issues',
            description: breakdown.message || 'Code may not be in our database',
            duration: 4
          });
        }
      }
    } catch (error) {
      console.error('UNSPSC analysis error:', error);
      setUnspscBreakdown(null);
      notification.error({
        message: 'UNSPSC Analysis Failed',
        description: 'Could not analyze the UNSPSC code'
      });
    } finally {
      setUnspscAnalyzing(false);
    }
  };

  // Validate UNSPSC code as user types
  const handleUNSPSCChange = (e) => {
    const value = e.target.value;
    form.setFieldValue('unspscCode', value);
    
    // Only analyze if we have 8 digits
    if (value && value.length === 8 && /^\d{8}$/.test(value)) {
      analyzeUNSPSCCode(value);
    } else {
      setUnspscBreakdown(null);
    }
  };

  // Auto-redirect countdown when success modal is shown
  useEffect(() => {
    let timer;
    if (showSuccessModal && redirectCountdown > 0) {
      timer = setTimeout(() => {
        setRedirectCountdown(prev => prev - 1);
      }, 1000);
    } else if (showSuccessModal && redirectCountdown === 0) {
      // Auto-redirect to Item Master
      navigate('/item-master');
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSuccessModal, redirectCountdown, navigate]);

  // Reset countdown when modal opens
  useEffect(() => {
    if (showSuccessModal) {
      setRedirectCountdown(10);
    }
  }, [showSuccessModal]);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card>        <div style={{ marginBottom: '24px' }}>
          <Title level={2}>
            <RobotOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
            AI-Powered Item Master Creation
          </Title>
          <Text type="secondary">
            Enter a short description in the AI Control Panel below and click "Generate All Fields" to automatically create comprehensive item details.
          </Text>
        </div><Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          {/* AI Generation Control Panel */}
          <Card 
            title={
              <Space>
                <RobotOutlined style={{ color: '#1890ff' }} />
                AI Generation Control Panel
              </Space>
            }
            size="small" 
            style={{ marginBottom: '16px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}            extra={
              <Space>
                {aiSuggestions && (
                  <Text type="success">
                    <CheckCircleOutlined /> AI Suggestions Available
                  </Text>
                )}
                {aiGenerating && <Spin size="small" />}
              </Space>
            }
          >
            <Row gutter={16} align="middle">              <Col span={12}>
                <Form.Item
                  label="Short Description"
                  name="shortDescription"
                  rules={[
                    { required: true, message: 'Please input the item description!' },
                    { max: 44, message: 'Description cannot exceed 44 characters!' }
                  ]}
                  style={{ marginBottom: '8px' }}
                >
                  <Input
                    placeholder="Enter item description (e.g., laser printer, steel bolt, etc.)"
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    showCount
                    maxLength={44}
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div style={{ paddingTop: '30px' }}>
                  <Space size="middle">
                    <Button 
                      type="primary"
                      size="large"                      onClick={() => {
                        const desc = form.getFieldValue('shortDescription');
                        console.log('Generate AI clicked, description:', desc);
                        if (desc && desc.length >= 3) {
                          generateCompleteItemData(desc);
                        } else {
                          notification.warning({
                            message: 'Description Required',
                            description: 'Please enter at least 3 characters in the description field.'
                          });
                        }
                      }}
                      loading={aiGenerating}
                      icon={<RobotOutlined />}
                      style={{ minWidth: '140px' }}
                    >
                      {aiGenerating ? 'Generating...' : 'Generate All Fields'}
                    </Button>                    <Button 
                      onClick={regenerateAI} 
                      loading={aiGenerating}
                      disabled={!form.getFieldValue('shortDescription')}
                      icon={<ReloadOutlined />}
                    >
                      Regenerate
                    </Button>
                      <Button 
                      onClick={() => {
                        form.resetFields();
                        setShowAiMenu(false);
                        setAiSuggestions(null);
                      }}
                      icon={<ReloadOutlined />}
                    >
                      Clear All
                    </Button>
                  </Space>
                </div>
              </Col>
            </Row>
              {aiGenerating && (
              <Alert
                message="🤖 AI is working..."
                description="Generating item suggestions. Please wait..."
                type="info"
                showIcon
                style={{ marginTop: '16px' }}
              />
            )}
              {showAiMenu && aiSuggestions && (              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Space>
                      <RobotOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                      <Text strong style={{ fontSize: '16px' }}>AI Suggestions</Text>
                    </Space>
                    <Space>
                      <Button 
                        type="primary" 
                        onClick={applyAllAiSuggestions}
                        icon={<CheckCircleOutlined />}
                        style={{ 
                          background: 'linear-gradient(45deg, #1890ff, #52c41a)',
                          border: 'none',
                          borderRadius: '8px'
                        }}
                      >
                        Apply All
                      </Button>
                      <Button 
                        onClick={() => setShowAiMenu(false)}
                        style={{ borderRadius: '8px' }}
                      >
                        Close
                      </Button>
                    </Space>
                  </div>
                }
                className="ai-suggestions-container"
                style={{ 
                  marginTop: '16px', 
                  border: '2px solid #1890ff',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(24, 144, 255, 0.12)'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <Alert
                  message="Review and Apply AI Suggestions"
                  description="Click on any section below to apply individual suggestions, or use 'Apply All' to accept everything."
                  type="info"
                  showIcon
                  style={{ 
                    marginBottom: '24px',
                    borderRadius: '8px',
                    backgroundColor: '#f6ffed',
                    border: '1px solid #b7eb8f'
                  }}                />                {/* Short Description Section */}
                {aiSuggestions.shortDescription && (
                  <Card
                    size="small"
                    title={
                      <Space>
                        <BulbOutlined style={{ color: '#52c41a' }} />
                        <Text strong>Improved Short Description</Text>
                      </Space>
                    }
                    style={{ 
                      marginBottom: '16px',
                      borderRadius: '8px',
                      backgroundColor: '#f6ffed',
                      border: '1px solid #b7eb8f'
                    }}
                    hoverable
                    extra={
                      <Button 
                        size="small" 
                        type="primary"
                        onClick={() => applyAiSuggestion('shortDescription', aiSuggestions.shortDescription)}
                      >
                        Apply Improvement
                      </Button>
                    }
                  >
                    <Alert
                      message="AI has improved your short description"
                      description={
                        <div>
                          <Text strong>Your version: </Text>
                          <Text code>{form.getFieldValue('shortDescription')}</Text>
                          <br />
                          <Text strong>AI improved: </Text>
                          <Text code style={{ color: '#52c41a' }}>{aiSuggestions.shortDescription}</Text>
                        </div>
                      }
                      type="info"
                      showIcon
                      style={{ backgroundColor: 'white' }}
                    />
                  </Card>
                )}
                
                {/* Descriptions Section */}
                <Card
                  size="small"
                  title={
                    <Space>
                      <BulbOutlined style={{ color: '#52c41a' }} />
                      <Text strong>Descriptions</Text>
                    </Space>
                  }
                  style={{ 
                    marginBottom: '16px',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  className="ai-suggestion-card"
                  hoverable
                  extra={
                    <Button 
                      size="small" 
                      type="link"
                      onClick={() => {
                        applyAiSuggestion('longDescription', aiSuggestions.longDescription);
                        applyAiSuggestion('standardDescription', aiSuggestions.standardDescription);
                      }}
                    >
                      Apply Section
                    </Button>
                  }
                >
                  <Row gutter={[16, 12]}>
                    <Col span={12}>
                      <div 
                        onClick={() => applyAiSuggestion('longDescription', aiSuggestions.longDescription)}
                        style={{ 
                          padding: '12px',
                          backgroundColor: 'white',
                          border: '1px solid #d9d9d9',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        className="suggestion-item"
                      >
                        <Text strong style={{ color: '#1890ff' }}>Long Description</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '13px' }}>
                          {aiSuggestions.longDescription}
                        </Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div 
                        onClick={() => applyAiSuggestion('standardDescription', aiSuggestions.standardDescription)}
                        style={{ 
                          padding: '12px',
                          backgroundColor: 'white',
                          border: '1px solid #d9d9d9',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        className="suggestion-item"
                      >
                        <Text strong style={{ color: '#1890ff' }}>Standard Description</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '13px' }}>
                          {aiSuggestions.standardDescription}
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </Card>

                {/* Technical Details Section */}
                <Card
                  size="small"
                  title={
                    <Space>
                      <RobotOutlined style={{ color: '#722ed1' }} />
                      <Text strong>Technical Details</Text>
                    </Space>
                  }
                  style={{ 
                    marginBottom: '16px',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa',
                    cursor: 'pointer'
                  }}
                  hoverable
                  extra={
                    <Button 
                      size="small" 
                      type="link"
                      onClick={() => applyAiSuggestion('technicalDescription', aiSuggestions.technicalDescription)}
                    >
                      Apply Section
                    </Button>
                  }
                >
                  <div 
                    onClick={() => applyAiSuggestion('technicalDescription', aiSuggestions.technicalDescription)}
                    style={{ 
                      padding: '12px',
                      backgroundColor: 'white',
                      border: '1px solid #d9d9d9',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    className="suggestion-item"
                  >
                    <Text strong style={{ color: '#722ed1' }}>Technical Description</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      {aiSuggestions.technicalDescription}
                    </Text>
                  </div>
                </Card>

                {/* Manufacturer & Classification Section */}
                <Card
                  size="small"
                  title={
                    <Space>
                      <RobotOutlined style={{ color: '#fa8c16' }} />
                      <Text strong>Manufacturer & Classification</Text>
                    </Space>
                  }
                  style={{ 
                    marginBottom: '16px',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                  }}
                  hoverable
                  extra={
                    <Button 
                      size="small" 
                      type="link"
                      onClick={() => {
                        applyAiSuggestion('manufacturerName', aiSuggestions.manufacturerName);
                        applyAiSuggestion('equipmentCategory', aiSuggestions.equipmentCategory);
                      }}
                    >
                      Apply Section
                    </Button>
                  }
                >
                  <Row gutter={[16, 12]}>
                    <Col span={12}>
                      <div 
                        onClick={() => applyAiSuggestion('manufacturerName', aiSuggestions.manufacturerName)}
                        style={{ 
                          padding: '12px',
                          backgroundColor: 'white',
                          border: '1px solid #d9d9d9',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        className="suggestion-item"
                      >
                        <Text strong style={{ color: '#fa8c16' }}>Manufacturer</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '13px' }}>
                          {aiSuggestions.manufacturerName}
                        </Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div 
                        onClick={() => applyAiSuggestion('equipmentCategory', aiSuggestions.equipmentCategory)}
                        style={{ 
                          padding: '12px',
                          backgroundColor: 'white',
                          border: '1px solid #d9d9d9',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        className="suggestion-item"
                      >
                        <Text strong style={{ color: '#fa8c16' }}>Category</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '13px' }}>
                          {aiSuggestions.equipmentCategory}
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </Card>                {/* UNSPSC & Standards Section */}
                <Card
                  size="small"
                  title={
                    <Space>
                      <RobotOutlined style={{ color: '#13c2c2' }} />
                      <Text strong>UNSPSC & Standards</Text>
                    </Space>
                  }
                  style={{ 
                    marginBottom: '16px',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                  }}
                  hoverable
                  extra={
                    <Button 
                      size="small" 
                      type="link"
                      onClick={() => {
                        applyAiSuggestion('unspscCode', aiSuggestions.unspscCode);
                        applyAiSuggestion('unspscTitle', aiSuggestions.unspscTitle);
                      }}
                    >
                      Apply Section
                    </Button>
                  }
                >
                  <div 
                    onClick={() => applyAiSuggestion('unspscCode', aiSuggestions.unspscCode)}
                    style={{ 
                      padding: '12px',
                      backgroundColor: 'white',
                      border: '1px solid #d9d9d9',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    className="suggestion-item"
                  >
                    <Text strong style={{ color: '#13c2c2' }}>UNSPSC Code</Text>
                    <br />
                    <Text style={{ fontSize: '14px', fontWeight: '500' }}>
                      {aiSuggestions.unspscCode}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {aiSuggestions.unspscTitle || 'UNSPSC Classification'}
                    </Text>
                  </div>
                </Card>

                {/* Additional Details Section */}
                {(aiSuggestions.equipmentSubCategory || aiSuggestions.unitOfMeasure || aiSuggestions.manufacturerPartNumber) && (
                  <Card
                    size="small"
                    title={
                      <Space>
                        <RobotOutlined style={{ color: '#eb2f96' }} />
                        <Text strong>Additional Details</Text>
                      </Space>
                    }
                    style={{ 
                      marginBottom: '16px',
                      borderRadius: '8px',
                      backgroundColor: '#fafafa'
                    }}
                    hoverable
                    extra={
                      <Button 
                        size="small" 
                        type="link"
                        onClick={() => {
                          if (aiSuggestions.equipmentSubCategory) applyAiSuggestion('equipmentSubCategory', aiSuggestions.equipmentSubCategory);
                          if (aiSuggestions.unitOfMeasure) applyAiSuggestion('unitOfMeasure', aiSuggestions.unitOfMeasure);
                          if (aiSuggestions.manufacturerPartNumber) applyAiSuggestion('manufacturerPartNumber', aiSuggestions.manufacturerPartNumber);
                        }}
                      >
                        Apply Section
                      </Button>
                    }
                  >
                    <Row gutter={[16, 12]}>
                      {aiSuggestions.equipmentSubCategory && (
                        <Col span={8}>
                          <div 
                            onClick={() => applyAiSuggestion('equipmentSubCategory', aiSuggestions.equipmentSubCategory)}
                            style={{ 
                              padding: '12px',
                              backgroundColor: 'white',
                              border: '1px solid #d9d9d9',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            className="suggestion-item"
                          >
                            <Text strong style={{ color: '#eb2f96' }}>Subcategory</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              {aiSuggestions.equipmentSubCategory}
                            </Text>
                          </div>
                        </Col>
                      )}
                      {aiSuggestions.unitOfMeasure && (
                        <Col span={8}>
                          <div 
                            onClick={() => applyAiSuggestion('unitOfMeasure', aiSuggestions.unitOfMeasure)}
                            style={{ 
                              padding: '12px',
                              backgroundColor: 'white',
                              border: '1px solid #d9d9d9',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            className="suggestion-item"
                          >
                            <Text strong style={{ color: '#eb2f96' }}>Unit of Measure</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              {aiSuggestions.unitOfMeasure}
                            </Text>
                          </div>
                        </Col>
                      )}
                      {aiSuggestions.manufacturerPartNumber && (
                        <Col span={8}>
                          <div 
                            onClick={() => applyAiSuggestion('manufacturerPartNumber', aiSuggestions.manufacturerPartNumber)}
                            style={{ 
                              padding: '12px',
                              backgroundColor: 'white',
                              border: '1px solid #d9d9d9',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            className="suggestion-item"
                          >
                            <Text strong style={{ color: '#eb2f96' }}>Part Number</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              {aiSuggestions.manufacturerPartNumber}
                            </Text>
                          </div>
                        </Col>
                      )}
                    </Row>
                  </Card>
                )}

                {/* Business Rules Section */}
                {(aiSuggestions.criticality || aiSuggestions.stockItem !== undefined || aiSuggestions.serialNumber || aiSuggestions.estimatedPrice) && (
                  <Card
                    size="small"
                    title={
                      <Space>
                        <RobotOutlined style={{ color: '#f5222d' }} />
                        <Text strong>Business Rules</Text>
                      </Space>
                    }
                    style={{ 
                      marginBottom: '16px',
                      borderRadius: '8px',
                      backgroundColor: '#fafafa'
                    }}
                    hoverable
                    extra={
                      <Button 
                        size="small" 
                        type="link"
                        onClick={() => {
                          if (aiSuggestions.criticality) applyAiSuggestion('criticality', aiSuggestions.criticality);
                          if (aiSuggestions.stockItem !== undefined) applyAiSuggestion('stockItem', aiSuggestions.stockItem);
                          if (aiSuggestions.serialNumber) applyAiSuggestion('serialNumber', aiSuggestions.serialNumber);
                          if (aiSuggestions.estimatedPrice) applyAiSuggestion('estimatedPrice', aiSuggestions.estimatedPrice);
                        }}
                      >
                        Apply Section
                      </Button>
                    }
                  >
                    <Row gutter={[16, 12]}>
                      {aiSuggestions.criticality && (
                        <Col span={12}>
                          <div 
                            onClick={() => applyAiSuggestion('criticality', aiSuggestions.criticality)}
                            style={{ 
                              padding: '12px',
                              backgroundColor: 'white',
                              border: '1px solid #d9d9d9',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            className="suggestion-item"
                          >
                            <Text strong style={{ color: '#f5222d' }}>Criticality</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              {aiSuggestions.criticality}
                            </Text>
                          </div>
                        </Col>
                      )}
                      {aiSuggestions.stockItem !== undefined && (
                        <Col span={12}>
                          <div 
                            onClick={() => applyAiSuggestion('stockItem', aiSuggestions.stockItem)}
                            style={{ 
                              padding: '12px',
                              backgroundColor: 'white',
                              border: '1px solid #d9d9d9',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            className="suggestion-item"
                          >
                            <Text strong style={{ color: '#f5222d' }}>Stock Item</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              {aiSuggestions.stockItem ? 'Yes' : 'No'}
                            </Text>
                          </div>
                        </Col>
                      )}
                      {aiSuggestions.serialNumber && (
                        <Col span={12}>
                          <div 
                            onClick={() => applyAiSuggestion('serialNumber', aiSuggestions.serialNumber)}
                            style={{ 
                              padding: '12px',
                              backgroundColor: 'white',
                              border: '1px solid #d9d9d9',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            className="suggestion-item"
                          >
                            <Text strong style={{ color: '#f5222d' }}>Serial Number</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              {aiSuggestions.serialNumber}
                            </Text>
                          </div>
                        </Col>
                      )}
                      {aiSuggestions.estimatedPrice && aiSuggestions.estimatedPrice !== 'TBD' && (
                        <Col span={12}>
                          <div 
                            onClick={() => applyAiSuggestion('estimatedPrice', aiSuggestions.estimatedPrice)}
                            style={{ 
                              padding: '12px',
                              backgroundColor: 'white',
                              border: '1px solid #d9d9d9',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            className="suggestion-item"
                          >
                            <Text strong style={{ color: '#f5222d' }}>Estimated Price</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              {aiSuggestions.estimatedPrice}
                            </Text>
                          </div>
                        </Col>
                      )}
                    </Row>
                  </Card>
                )}
              </Card>
            )}
          </Card>
          {/* Primary Description Section */}
          <Card 
            title={
              <Space>
                <BulbOutlined style={{ color: '#52c41a' }} />
                Primary Information
              </Space>
            }
            size="small" 
            style={{ marginBottom: '16px' }}
          >            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Long Description" name="longDescription">
                  <TextArea 
                    rows={3} 
                    placeholder="AI will generate detailed description"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Standard Description" name="standardDescription">
                  <TextArea 
                    rows={3} 
                    placeholder="AI will generate NOUN, MODIFIER format"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Technical Description" name="technicalDescription">
                  <TextArea 
                    rows={3} 
                    placeholder="AI will generate technical specs or enter manually"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Manufacturer Information */}
          <Card            title={
              <Space>
                Manufacturer Information
              </Space>
            }
            size="small" 
            style={{ marginBottom: '16px' }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Manufacturer Name" name="manufacturerName">
                  <Input placeholder="AI will suggest manufacturer" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Manufacturer Part Number" name="manufacturerPartNumber">
                  <Input placeholder="AI will suggest part number format" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Classification & Coding */}
          <Card            title={
              <Space>
                Classification & Coding
              </Space>
            }
            size="small" 
            style={{ marginBottom: '16px' }}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Equipment Category" name="equipmentCategory">
                  <Select placeholder="AI will categorize">
                    <Option value="mechanical">Mechanical</Option>
                    <Option value="electrical">Electrical</Option>
                    <Option value="electronic">Electronic</Option>
                    <Option value="consumable">Consumable</Option>
                    <Option value="safety">Safety</Option>
                    <Option value="tools">Tools</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Equipment Sub-Category" name="equipmentSubCategory">
                  <Input placeholder="AI will suggest subcategory" />
                </Form.Item>
              </Col>              <Col span={8}>
                <Form.Item 
                  label="Unit of Measure" 
                  name="unitOfMeasure"
                  rules={[
                    { required: true, message: 'Please select a unit of measure!' }
                  ]}
                >
                  <Select placeholder="Select or AI will suggest UOM">
                    <Option value="EA">Each (EA)</Option>
                    <Option value="PC">Piece (PC)</Option>
                    <Option value="BOX">Box (BOX)</Option>
                    <Option value="KG">Kilogram (KG)</Option>
                    <Option value="LTR">Liter (LTR)</Option>
                    <Option value="M">Meter (M)</Option>
                    <Option value="CM">Centimeter (CM)</Option>
                    <Option value="SET">Set (SET)</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>            <Row gutter={16}>              <Col span={8}>
                <Form.Item 
                  label={
                    <Space>
                      UNSPSC Code
                      <Tooltip title="Enter 8-digit UNSPSC code for AI validation and breakdown">
                        <RobotOutlined style={{ color: '#1890ff' }} />
                      </Tooltip>
                    </Space>
                  } 
                  name="unspscCode"
                >
                  <Input 
                    placeholder="Enter 8-digit UNSPSC code" 
                    onChange={handleUNSPSCChange}
                    maxLength={8}
                    showCount
                    size="large"
                    suffix={unspscAnalyzing ? <Spin size="small" /> : null}
                  />
                </Form.Item>
              </Col>              <Col span={8}>
                <Form.Item 
                  label="UNSPSC Description"
                  name="unspscTitle"
                  help="Description is for reference only - not saved to database"
                >
                  <Input 
                    placeholder="AI will generate UNSPSC description" 
                    disabled 
                    style={{ 
                      color: '#666',
                      backgroundColor: '#f5f5f5',
                      borderColor: '#d9d9d9'
                    }} 
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Criticality" name="criticality">
                  <Select placeholder="AI will assess criticality">
                    <Option value="critical">Critical</Option>
                    <Option value="important">Important</Option>
                    <Option value="normal">Normal</Option>
                    <Option value="low">Low</Option>
                  </Select>
                </Form.Item>
              </Col>            </Row>
          </Card>

          {/* UNSPSC Breakdown Display */}
          {unspscBreakdown && (
            <Card 
              title={
                <Space>
                  <RobotOutlined style={{ color: '#52c41a' }} />
                  <Text strong>UNSPSC Code Analysis</Text>
                  {unspscBreakdown.isValid ? (
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  ) : (
                    <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                  )}
                </Space>
              }
              size="small" 
              style={{ 
                marginBottom: '16px',
                borderColor: unspscBreakdown.isValid ? '#52c41a' : '#faad14'
              }}
            >
              <Row gutter={[16, 12]}>
                <Col span={6}>
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#f6ffed', 
                    border: '1px solid #b7eb8f',
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    <Text strong style={{ color: '#389e0d', display: 'block' }}>Segment</Text>
                    <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>{unspscBreakdown.breakdown.segment.code}</Text>
                    <Text style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {unspscBreakdown.breakdown.segment.name}
                    </Text>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#e6f7ff', 
                    border: '1px solid #91d5ff',
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    <Text strong style={{ color: '#1890ff', display: 'block' }}>Family</Text>
                    <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>{unspscBreakdown.breakdown.family.code}</Text>
                    <Text style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {unspscBreakdown.breakdown.family.name}
                    </Text>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#fff2e8', 
                    border: '1px solid #ffd591',
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    <Text strong style={{ color: '#fa8c16', display: 'block' }}>Commodity</Text>
                    <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>{unspscBreakdown.breakdown.commodity.code}</Text>
                    <Text style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {unspscBreakdown.breakdown.commodity.name}
                    </Text>
                  </div>
                </Col>
                <Col span={6}>
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#f9f0ff', 
                    border: '1px solid #d3adf7',
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    <Text strong style={{ color: '#722ed1', display: 'block' }}>Class</Text>
                    <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>{unspscBreakdown.breakdown.businessFunction.code}</Text>
                    <Text style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {unspscBreakdown.breakdown.businessFunction.name}
                    </Text>
                  </div>
                </Col>
              </Row>
              
              {unspscBreakdown.analysis && (
                <Alert
                  style={{ marginTop: '16px' }}
                  message="AI Analysis"
                  description={unspscBreakdown.analysis}
                  type={unspscBreakdown.isValid ? "success" : "warning"}
                  showIcon
                  closable
                />
              )}
            </Card>
          )}

          {/* Stock Configuration */}
          <Card 
            title="Stock Configuration" 
            size="small" 
            style={{ marginBottom: '16px' }}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Stock Item" name="stockItem" valuePropName="checked">
                  <Switch 
                    checkedChildren="Yes" 
                    unCheckedChildren="No" 
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Planned Stock" name="plannedStock" valuePropName="checked">
                  <Switch 
                    checkedChildren="Yes" 
                    unCheckedChildren="No" 
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Equipment Tag" name="equipmentTag">
                  <Input placeholder="Optional equipment tag" />
                </Form.Item>
              </Col>
            </Row>
          </Card>          {/* AI-Generated Technical Specifications Display */}
          {aiSuggestions?.technicalSpecs && (
            <Card 
              title={
                <Space>
                  <RobotOutlined style={{ color: '#1890ff' }} />
                  AI-Generated Technical Specifications
                </Space>
              }
              size="small" 
              style={{ marginBottom: '16px', backgroundColor: '#f6ffed' }}
            >
              <Row gutter={16}>
                <Col span={6}>
                  <Text strong>Material:</Text><br />
                  <Text type="secondary">{aiSuggestions.technicalSpecs.material}</Text>
                </Col>
                <Col span={6}>
                  <Text strong>Dimensions:</Text><br />
                  <Text type="secondary">{aiSuggestions.technicalSpecs.dimensions}</Text>
                </Col>
                <Col span={6}>
                  <Text strong>Weight:</Text><br />
                  <Text type="secondary">{aiSuggestions.technicalSpecs.weight}</Text>
                </Col>
                <Col span={6}>
                  <Text strong>Est. Price:</Text><br />
                  <Text type="secondary">{aiSuggestions.estimatedPrice}</Text>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: '12px' }}>
                <Col span={24}>
                  <Text strong>Operating Conditions:</Text><br />
                  <Text type="secondary">{aiSuggestions.technicalSpecs.operatingConditions}</Text>
                </Col>
              </Row>
            </Card>
          )}

          {/* Action Buttons */}
          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <Space size="large">              <Button 
                onClick={() => {
                  form.resetFields();
                  setShowAiMenu(false);
                  setAiSuggestions(null);
                }}
                size="large"
              >
                Reset Form
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
                size="large"
                disabled={!form.getFieldValue('shortDescription')}
              >
                Create Item Master
              </Button>
            </Space>          </div>        </Form>
      </Card>

      {/* Success Modal */}
      <Modal
        title={null}
        open={showSuccessModal}
        onCancel={() => setShowSuccessModal(false)}        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#666', fontSize: '14px' }}>
              Auto-redirecting to Item Master in {redirectCountdown}s...
            </div>
            <div>
              <Button onClick={() => {
                setShowSuccessModal(false);
                // Form is already reset
              }} style={{ marginRight: '8px' }}>
                Create Another Item
              </Button>
              <Button type="primary" onClick={() => {
                setShowSuccessModal(false);
                navigate('/item-master');
              }}>
                Back to Item Master
              </Button>
            </div>
          </div>
        }
        width={600}
        centered
      >
        <Result
          status="success"
          icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          title={
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a', marginBottom: '8px' }}>
                Item Created Successfully!
              </div>
              <div style={{ fontSize: '18px', color: '#1890ff', marginBottom: '16px' }}>
                <ClockCircleOutlined style={{ marginRight: '8px' }} />
                Sent for Approval
              </div>
            </div>
          }
          subTitle={
            <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
              {createdItemInfo && (
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Item Details:</strong>
                  </div>
                  <div style={{ backgroundColor: '#f6ffed', padding: '16px', borderRadius: '6px', border: '1px solid #b7eb8f' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Item Number:</strong> <span style={{ color: '#1890ff' }}>{createdItemInfo.itemNumber}</span>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Description:</strong> {createdItemInfo.shortDescription}
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Status:</strong> <span style={{ color: '#fa8c16' }}>Pending Review</span>
                    </div>
                    <div>
                      <strong>Item ID:</strong> <code style={{ backgroundColor: '#fff', padding: '2px 6px', borderRadius: '3px' }}>{createdItemInfo.id}</code>
                    </div>
                  </div>
                  <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#e6f7ff', borderRadius: '6px', border: '1px solid #91d5ff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <FileTextOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                      <strong>What happens next?</strong>
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      • Your item has been submitted for review<br/>
                      • A reviewer will approve or reject the item<br/>
                      • You'll be notified of the decision<br/>
                      • Once approved, the item will be available in the system
                    </div>
                  </div>
                </div>
              )}
            </div>
          }
        />
      </Modal>
    </div>
  );
}
