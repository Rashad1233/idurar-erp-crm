import React, { useState } from 'react';
import { Button, Card, Space, Typography, Spin, message, Tooltip, Row, Col } from 'antd';
import { 
  RobotOutlined, 
  FileTextOutlined, 
  ReloadOutlined, 
  BulbOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';

const { Text, Title } = Typography;

const ItemDescriptionGenerator = ({ 
  form, 
  manufacturer, 
  partNumber, 
  category, 
  subCategory, 
  unspscCode, 
  unspscTitle,
  specifications 
}) => {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerateDescriptions = async () => {
    // Validate required fields
    if (!manufacturer && !partNumber && !category) {
      message.warning('Please fill in at least manufacturer, part number, or category before generating descriptions');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/unspsc/generate-descriptions`, {
        manufacturer: manufacturer || form.getFieldValue('manufacturerName'),
        partNumber: partNumber || form.getFieldValue('manufacturerPartNumber'),
        category: category || form.getFieldValue('equipmentCategory'),
        subCategory: subCategory || form.getFieldValue('equipmentSubCategory'),
        unspscCode: unspscCode,
        unspscTitle: unspscTitle,
        specifications: specifications || form.getFieldValue('longDescription')
      });

      if (response.data && response.data.success) {
        const descriptions = response.data.descriptions;
        
        // Set form values
        form.setFieldsValue({
          shortDescription: descriptions.shortDescription,
          longDescription: descriptions.longDescription,
          standardDescription: descriptions.standardDescription
        });
        
        setGenerated(true);
        message.success('Descriptions generated successfully!');
      } else {
        message.error(response.data?.message || 'Failed to generate descriptions');
      }
    } catch (error) {
      console.error('Error generating descriptions:', error);
      message.error('Error generating descriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleClearDescriptions = () => {
    form.setFieldsValue({
      shortDescription: '',
      longDescription: '',
      standardDescription: ''
    });
    setGenerated(false);
    message.info('Descriptions cleared');
  };

  return (
    <Card 
      size="small" 
      style={{ 
        backgroundColor: '#f6ffed', 
        border: '1px solid #b7eb8f',
        marginBottom: '16px' 
      }}
    >
      <Row gutter={[16, 8]} align="middle">
        <Col flex="auto">
          <Space direction="vertical" size={2}>
            <Title level={5} style={{ margin: 0, color: '#389e0d' }}>
              <BulbOutlined style={{ marginRight: '8px' }} />
              Smart Description Generator
            </Title>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Automatically generate professional item descriptions based on item details
            </Text>
          </Space>
        </Col>
        <Col>
          <Space>
            <Tooltip title="Generate descriptions using AI based on item details">
              <Button
                type="primary"
                icon={<RobotOutlined />}
                loading={loading}
                onClick={handleGenerateDescriptions}
                size="small"
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                {loading ? 'Generating...' : 'Generate'}
              </Button>
            </Tooltip>
            {generated && (
              <Tooltip title="Clear generated descriptions">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleClearDescriptions}
                  size="small"
                >
                  Clear
                </Button>
              </Tooltip>
            )}
          </Space>
        </Col>
      </Row>
      
      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '16px 0',
          borderTop: '1px solid #b7eb8f',
          marginTop: '12px'
        }}>
          <Spin />
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
            Analyzing item details and generating descriptions...
          </div>
        </div>
      )}
      
      {generated && !loading && (
        <div style={{ 
          marginTop: '12px',
          padding: '8px',
          backgroundColor: '#f0f9ff',
          border: '1px solid #91d5ff',
          borderRadius: '4px'
        }}>
          <Text style={{ fontSize: '12px', color: '#1890ff' }}>
            ✅ Descriptions have been generated and filled in the form fields below
          </Text>
        </div>
      )}
    </Card>
  );
};

export default ItemDescriptionGenerator;
