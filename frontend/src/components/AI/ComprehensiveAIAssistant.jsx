import React, { useState } from 'react';
import { 
  Card, Button, Input, Space, Typography, Spin, message, 
  Row, Col, Tabs, Modal, Divider, Tag, Tooltip, Alert
} from 'antd';
import { 
  RobotOutlined, BulbOutlined, MailOutlined, 
  CopyOutlined, ThunderboltOutlined, CheckOutlined,
  SettingOutlined, SendOutlined, StarOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import './ComprehensiveAIAssistant.css';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

const ComprehensiveAIAssistant = ({ onDataGenerated, formValues = {} }) => {
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [emailData, setEmailData] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [inputDescription, setInputDescription] = useState('');

  const handleGenerateComprehensive = async () => {
    if (!inputDescription || inputDescription.trim() === '') {
      message.warning('Please enter an item description first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/generate-comprehensive-details`, {
        itemDescription: inputDescription,
        additionalInfo: {
          manufacturer: formValues.manufacturerName,
          category: formValues.equipmentCategory,
          specifications: formValues.longDescription
        }
      });

      if (response.data && response.data.success) {
        setGeneratedData(response.data.data);
        message.success('Generated comprehensive item details!');
      } else {
        message.error(response.data?.message || 'Failed to generate details');
      }
    } catch (error) {
      console.error('Error generating comprehensive details:', error);
      message.error('Error generating comprehensive details');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToForm = (field, value) => {
    if (onDataGenerated) {
      onDataGenerated({ [field]: value });
    }
    message.success(`Applied ${field} to form!`);
  };  const handleApplyAll = () => {
    if (!generatedData || !onDataGenerated) return;

    const dataToApply = {
      shortDescription: generatedData.shortDescription,
      longDescription: generatedData.longDescription,
      standardDescription: generatedData.standardDescription,
      equipmentCategory: generatedData.equipmentCategory,
      equipmentSubCategory: generatedData.equipmentSubCategory,
      manufacturerName: generatedData.manufacturerSuggestions?.[0] || formValues.manufacturerName,
      manufacturerPartNumber: generatedData.manufacturerPartNumber,
      uom: generatedData.recommendedUOM,
      criticality: generatedData.criticalityLevel,
      // Add UNSPSC code application
      suggestedUnspsc: generatedData.unspscSuggestion,
      unspscCode: generatedData.unspscSuggestion?.code
    };

    onDataGenerated(dataToApply);
    message.success('Applied all generated data to form!');
  };

  const handleSearchUnspsc = () => {
    if (generatedData?.unspscSuggestion) {
      if (onDataGenerated) {
        onDataGenerated({ 
          suggestedUnspsc: generatedData.unspscSuggestion,
          unspscCode: generatedData.unspscSuggestion.code 
        });
      }
      message.success('Applied suggested UNSPSC code!');
    }
  };
  const handleGenerateEmail = async () => {
    setEmailLoading(true);
    try {
      const itemData = {
        shortDescription: generatedData?.shortDescription || formValues.shortDescription || inputDescription,
        longDescription: generatedData?.longDescription || formValues.longDescription,
        unspscCode: generatedData?.unspscSuggestion?.code || formValues.unspscCode,
        manufacturerName: generatedData?.manufacturerSuggestions?.[0] || formValues.manufacturerName
      };

      const response = await axios.post(`${API_BASE_URL}/ai/generate-supplier-email`, {
        itemData,
        requestDetails: {
          quantity: 'TBD',
          urgency: 'Standard',
          specialRequirements: 'None'
        }
      });

      if (response.data && response.data.success) {
        setEmailData(response.data.data);
        setEmailModalVisible(true);
      } else {
        // Try to use the procurement email from comprehensive data if API fails
        if (generatedData?.procurementEmail) {
          setEmailData({
            subject: generatedData.procurementEmail.subject,
            body: generatedData.procurementEmail.body,
            attachmentRequests: ['Technical Datasheet', 'Product Catalog', 'Compliance Certificates']
          });
          setEmailModalVisible(true);
        } else {
          message.error(response.data?.message || 'Failed to generate email');
        }
      }
    } catch (error) {
      console.error('Error generating email:', error);
      // Fallback to comprehensive data email if available
      if (generatedData?.procurementEmail) {
        setEmailData({
          subject: generatedData.procurementEmail.subject,
          body: generatedData.procurementEmail.body,
          attachmentRequests: ['Technical Datasheet', 'Product Catalog', 'Compliance Certificates']
        });
        setEmailModalVisible(true);
        message.success('Using pre-generated email template');
      } else {
        message.error('Error generating supplier email');
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard!');
  };

  const renderGeneratedData = () => {
    if (!generatedData) return null;

    const tabItems = [
      {
        key: 'descriptions',
        label: 'Descriptions',
        children: (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>Short Description (44 chars max):</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <Input 
                  value={generatedData.shortDescription} 
                  readOnly 
                  style={{ flex: 1 }}
                />
                <Button 
                  icon={<CheckOutlined />} 
                  onClick={() => handleApplyToForm('shortDescription', generatedData.shortDescription)}
                  type="primary"
                  size="small"
                >
                  Apply
                </Button>
                <Button 
                  icon={<CopyOutlined />} 
                  onClick={() => copyToClipboard(generatedData.shortDescription)}
                  size="small"
                />
              </div>
            </div>

            <div>
              <Text strong>Long Description:</Text>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px' }}>
                <TextArea 
                  value={generatedData.longDescription} 
                  readOnly 
                  rows={3}
                  style={{ flex: 1 }}
                />
                <Space direction="vertical">
                  <Button 
                    icon={<CheckOutlined />} 
                    onClick={() => handleApplyToForm('longDescription', generatedData.longDescription)}
                    type="primary"
                    size="small"
                  >
                    Apply
                  </Button>
                  <Button 
                    icon={<CopyOutlined />} 
                    onClick={() => copyToClipboard(generatedData.longDescription)}
                    size="small"
                  />
                </Space>
              </div>
            </div>

            <div>
              <Text strong>Standard Description:</Text>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px' }}>
                <TextArea 
                  value={generatedData.standardDescription} 
                  readOnly 
                  rows={2}
                  style={{ flex: 1 }}
                />
                <Space direction="vertical">
                  <Button 
                    icon={<CheckOutlined />} 
                    onClick={() => handleApplyToForm('standardDescription', generatedData.standardDescription)}
                    type="primary"
                    size="small"
                  >
                    Apply
                  </Button>
                  <Button 
                    icon={<CopyOutlined />} 
                    onClick={() => copyToClipboard(generatedData.standardDescription)}
                    size="small"
                  />
                </Space>
              </div>
            </div>
          </Space>
        ),
      },
      {
        key: 'classification',
        label: 'Classification',
        children: (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>Suggested UNSPSC Code:</Text>
              <div style={{ marginTop: '8px' }}>
                <Space>
                  <Tag color="blue" style={{ fontSize: '14px' }}>
                    {generatedData.unspscSuggestion?.code}
                  </Tag>
                  <Text>{generatedData.unspscSuggestion?.title}</Text>
                  <Tag color="green">
                    {Math.round((generatedData.unspscSuggestion?.confidence || 0) * 100)}% confidence
                  </Tag>
                </Space>
                <div style={{ marginTop: '8px' }}>
                  <Text type="secondary">{generatedData.unspscSuggestion?.justification}</Text>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <Button 
                    icon={<CheckOutlined />} 
                    onClick={handleSearchUnspsc}
                    type="primary"
                    size="small"
                  >
                    Use This Code
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Text strong>Equipment Category:</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <Input 
                  value={generatedData.equipmentCategory} 
                  readOnly 
                  style={{ flex: 1 }}
                />
                <Button 
                  icon={<CheckOutlined />} 
                  onClick={() => handleApplyToForm('equipmentCategory', generatedData.equipmentCategory)}
                  type="primary"
                  size="small"
                >
                  Apply
                </Button>
              </div>
            </div>

            <div>
              <Text strong>Equipment Sub-Category:</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <Input 
                  value={generatedData.equipmentSubCategory} 
                  readOnly 
                  style={{ flex: 1 }}
                />
                <Button 
                  icon={<CheckOutlined />} 
                  onClick={() => handleApplyToForm('equipmentSubCategory', generatedData.equipmentSubCategory)}
                  type="primary"
                  size="small"
                >
                  Apply
                </Button>
              </div>
            </div>
          </Space>
        ),
      },      {
        key: 'manufacturers',
        label: 'Manufacturers',
        children: (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>Suggested Manufacturers:</Text>
              <div style={{ marginTop: '8px' }}>
                <Space wrap>
                  {generatedData.manufacturerSuggestions?.map((manufacturer, index) => (
                    <Tag 
                      key={index} 
                      color="blue" 
                      style={{ cursor: 'pointer', fontSize: '12px' }}
                      onClick={() => handleApplyToForm('manufacturerName', manufacturer)}
                    >
                      {manufacturer} <CheckOutlined style={{ marginLeft: '4px' }} />
                    </Tag>
                  ))}
                </Space>
              </div>
            </div>
            
            {generatedData.manufacturerPartNumber && (
              <div>
                <Text strong>Typical Manufacturer Part Number:</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <Input 
                    value={generatedData.manufacturerPartNumber} 
                    readOnly 
                    style={{ flex: 1 }}
                  />
                  <Button 
                    icon={<CheckOutlined />} 
                    onClick={() => handleApplyToForm('manufacturerPartNumber', generatedData.manufacturerPartNumber)}
                    type="primary"
                    size="small"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </Space>
        ),
      },      {
        key: 'specifications',
        label: 'Specifications',
        children: (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Row gutter={16}>
              <Col span={12}>
                {generatedData.recommendedUOM && (
                  <div>
                    <Text strong>Recommended UOM:</Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <Input 
                        value={generatedData.recommendedUOM} 
                        readOnly 
                        style={{ flex: 1 }}
                      />
                      <Button 
                        icon={<CheckOutlined />} 
                        onClick={() => handleApplyToForm('uom', generatedData.recommendedUOM)}
                        type="primary"
                        size="small"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                )}
              </Col>
              <Col span={12}>
                {generatedData.criticalityLevel && (
                  <div>
                    <Text strong>Criticality Level:</Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <Input 
                        value={generatedData.criticalityLevel} 
                        readOnly 
                        style={{ flex: 1 }}
                      />
                      <Button 
                        icon={<CheckOutlined />} 
                        onClick={() => handleApplyToForm('criticality', generatedData.criticalityLevel)}
                        type="primary"
                        size="small"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                )}
              </Col>
            </Row>

            {generatedData.manufacturerPartNumber && (
              <div>
                <Text strong>Suggested Manufacturer Part Number:</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <Input 
                    value={generatedData.manufacturerPartNumber} 
                    readOnly 
                    style={{ flex: 1 }}
                  />
                  <Button 
                    icon={<CheckOutlined />} 
                    onClick={() => handleApplyToForm('manufacturerPartNumber', generatedData.manufacturerPartNumber)}
                    type="primary"
                    size="small"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </Space>
        ),
      },
    ];

    return (
      <Card 
        title={
          <Space>
            <BulbOutlined style={{ color: '#52c41a' }} />
            <Text strong>Generated Item Details</Text>
          </Space>
        }        extra={
          <Button 
            type="primary" 
            icon={<ThunderboltOutlined />}
            onClick={handleApplyAll}
            size="small"
          >
            Apply All
          </Button>
        }
        style={{ marginTop: '16px' }}
      >
        <Tabs items={tabItems} size="small" />
      </Card>
    );
  };

  const renderEmailModal = () => {
    if (!emailData) return null;

    return (
      <Modal        title={
          <Space>
            <MailOutlined />
            <Text>Procurement Email Template</Text>
          </Space>
        }
        open={emailModalVisible}
        onCancel={() => setEmailModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setEmailModalVisible(false)}>
            Close
          </Button>,
          <Button 
            key="copy" 
            icon={<CopyOutlined />}
            onClick={() => copyToClipboard(`Subject: ${emailData.subject}\n\n${emailData.body}`)}
          >
            Copy Email
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Subject:</Text>
            <Input value={emailData.subject} readOnly style={{ marginTop: '4px' }} />
          </div>
          
          <div>
            <Text strong>Email Body:</Text>
            <TextArea 
              value={emailData.body} 
              readOnly 
              rows={12} 
              style={{ marginTop: '4px' }}
            />
          </div>

          {emailData.attachmentRequests && emailData.attachmentRequests.length > 0 && (
            <div>
              <Text strong>Suggested Attachments to Request:</Text>
              <div style={{ marginTop: '4px' }}>
                <Space wrap>
                  {emailData.attachmentRequests.map((attachment, index) => (
                    <Tag key={index} color="orange">{attachment}</Tag>
                  ))}
                </Space>
              </div>
            </div>
          )}
        </Space>
      </Modal>
    );
  };

  return (
    <div className="comprehensive-ai-assistant">
      <Card 
        title={
          <Space>
            <RobotOutlined style={{ color: '#1890ff' }} />
            <Text strong>Smart AI Assistant</Text>
          </Space>
        }
        size="small"
        style={{ backgroundColor: '#fafafa' }}
      >        <Alert
          message="AI-Powered Item Master Assistant"
          description="Describe your item and get comprehensive details including descriptions, UNSPSC codes, manufacturer suggestions, and procurement emails."
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />

        <Row gutter={[16, 16]}>
          <Col span={18}>
            <TextArea
              placeholder="Describe the item you want to create (e.g., 'Office laser printer for document printing')"
              value={inputDescription}
              onChange={(e) => setInputDescription(e.target.value)}
              rows={2}
              showCount
              maxLength={200}
            />
          </Col>
          <Col span={6}>            <Button
              type="primary"
              icon={<StarOutlined />}
              onClick={handleGenerateComprehensive}
              loading={loading}
              size="large"
              style={{ width: '100%', height: '60px' }}
            >
              Generate All Details
            </Button>
          </Col>
        </Row>

        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '10px' }}>Generating comprehensive item details...</div>
          </div>
        )}

        {renderGeneratedData()}
        {renderEmailModal()}
      </Card>
    </div>
  );
};

export default ComprehensiveAIAssistant;
