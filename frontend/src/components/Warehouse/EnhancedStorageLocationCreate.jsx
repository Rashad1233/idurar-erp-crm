import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Row, Col, message, Space, Typography, Divider, Alert, Modal, Result } from 'antd';
import { EnvironmentOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const EnhancedStorageLocationCreate = () => {  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);  const [generatedCode, setGeneratedCode] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [createdLocation, setCreatedLocation] = useState(null);
  const [countdown, setCountdown] = useState(10);
  const navigate = useNavigate();

  // Auto-generate storage location code when city or sequence changes
  const generateStorageLocationCode = (cityCode, sequenceNumber) => {
    if (cityCode && sequenceNumber) {
      const code = `${cityCode.toUpperCase().substring(0, 3)}${sequenceNumber.toString().padStart(2, '0')}`;
      setGeneratedCode(code);
      return code;
    }
    return '';
  };

  const handleCityCodeChange = (e) => {
    const cityCode = e.target.value;
    const sequenceNumber = form.getFieldValue('sequenceNumber');
    const code = generateStorageLocationCode(cityCode, sequenceNumber);
    form.setFieldValue('storageLocationCode', code);
  };

  const handleSequenceNumberChange = (e) => {
    const sequenceNumber = e.target.value;
    const cityCode = form.getFieldValue('cityCode');
    const code = generateStorageLocationCode(cityCode, sequenceNumber);
    form.setFieldValue('storageLocationCode', code);
  };
  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log('Creating storage location:', values);
      
      // Prepare the data for storage location creation
      const storageLocationData = {
        code: generatedCode,
        description: `${values.longDescription}`,
        street: values.address,
        city: values.cityName,
        postalCode: values.postalCode,
        country: values.country || 'Unknown',
        isActive: true
      };
      
      // API call to create storage location
      const response = await fetch('/api/storage-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storageLocationData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();      if (result.success) {
        // Store created location data
        setCreatedLocation({
          code: generatedCode,
          description: values.description,
          address: values.address,
          postalCode: values.postalCode,
          street: values.street
        });
          // Show success modal and reset countdown
        setCountdown(10);
        setSuccessModalVisible(true);
        
        form.resetFields();
        setGeneratedCode('');
        
        // Auto-redirect after 10 seconds
        setTimeout(() => {
          setSuccessModalVisible(false);
          navigate('/warehouse', { 
            state: { 
              activeTab: 'storageLocations',
              message: `Storage Location "${generatedCode}" was created successfully.`
            } 
          });
        }, 10000);
        
      } else {
        throw new Error(result.message || 'Failed to create storage location');
      }
    } catch (error) {
      console.error('Error creating storage location:', error);
      message.error(`Failed to create storage location: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer effect for success modal
  useEffect(() => {
    let timer;
    if (successModalVisible && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Redirect when countdown reaches 0
            navigate('/warehouse', { state: { activeTab: 'locations' } });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [successModalVisible, countdown, navigate]);

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <div style={{ marginBottom: '24px' }}>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/warehouse')}
            >
              Back to Warehouse
            </Button>
          </Space>
          <Title level={2} style={{ margin: '16px 0' }}>
            <EnvironmentOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
            Create Storage Location
          </Title>
        </div>

        <Alert
          message="Storage Location Code Format"
          description="The first 3 letters represent the city (e.g., BRG for Brighton, LON for London), followed by a 2-digit sequence number (e.g., 01, 02)."
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          {/* Storage Location Code Generation */}
          <Card title="Storage Location Code" type="inner" style={{ marginBottom: '24px' }}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="City Code"
                  name="cityCode"
                  rules={[
                    { required: true, message: 'Please enter city code' },
                    { min: 3, max: 3, message: 'City code must be exactly 3 characters' },
                    { pattern: /^[A-Za-z]+$/, message: 'City code must contain only letters' }
                  ]}
                >
                  <Input
                    placeholder="BRG"
                    onChange={handleCityCodeChange}
                    style={{ textTransform: 'uppercase' }}
                    maxLength={3}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Sequence Number"
                  name="sequenceNumber"
                  rules={[
                    { required: true, message: 'Please enter sequence number' },
                    { pattern: /^[0-9]+$/, message: 'Sequence number must contain only digits' }
                  ]}
                >
                  <Input
                    placeholder="01"
                    onChange={handleSequenceNumberChange}
                    maxLength={2}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Generated Code"
                  name="storageLocationCode"
                >
                  <Input
                    value={generatedCode}
                    disabled
                    placeholder="BRG01"
                    style={{ 
                      backgroundColor: '#f6ffed', 
                      borderColor: '#b7eb8f',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Text type="secondary">
              Example: BRG01 (Brighton Warehouse 1), LON02 (London Warehouse 2)
            </Text>
          </Card>

          {/* Basic Information */}
          <Card title="Basic Information" type="inner" style={{ marginBottom: '24px' }}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Long Description"
                  name="longDescription"
                  rules={[{ required: true, message: 'Please enter long description' }]}
                >
                  <Input
                    placeholder="Brighton Warehouse 1"
                    maxLength={100}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Address Information */}
          <Card title="Address Information" type="inner" style={{ marginBottom: '24px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Country"
                  name="country"
                  rules={[{ required: true, message: 'Please enter country' }]}
                >
                  <Input placeholder="United Kingdom" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="City"
                  name="city"
                  rules={[{ required: true, message: 'Please enter city' }]}
                >
                  <Input placeholder="Brighton" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Postal Code"
                  name="postalCode"
                  rules={[{ required: true, message: 'Please enter postal code' }]}
                >
                  <Input placeholder="NS0R51" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Street Address"
                  name="streetAddress"
                  rules={[{ required: true, message: 'Please enter street address' }]}
                >
                  <Input placeholder="Falmer village street 3" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Additional Information */}
          <Card title="Additional Information" type="inner" style={{ marginBottom: '24px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Contact Person"
                  name="contactPerson"
                >
                  <Input placeholder="Storage Manager Name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Phone Number"
                  name="phoneNumber"
                >
                  <Input placeholder="+44 1234 567890" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Notes"
                  name="notes"
                >
                  <Input.TextArea 
                    rows={3}
                    placeholder="Additional notes about this storage location..."
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Form.Item>
            <Space size="middle">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                size="large"
              >
                Create Storage Location
              </Button>
              <Button
                onClick={() => form.resetFields()}
                size="large"
              >
                Reset Form
              </Button>
            </Space>
          </Form.Item>        </Form>
      </Card>

      {/* Success Modal */}
      <Modal
        open={successModalVisible}
        footer={null}
        closable={false}
        centered
        width={500}
      >
        <Result
          status="success"
          title="Storage Location Created Successfully!"
          subTitle={
            createdLocation ? (
              <div>
                <p><strong>Code:</strong> {createdLocation.code}</p>
                <p><strong>Description:</strong> {createdLocation.description}</p>
                <p><strong>Address:</strong> {createdLocation.address}</p>
                <p style={{ marginTop: 16, color: '#666' }}>
                  Redirecting to warehouse storage locations in {countdown} seconds...
                </p>
              </div>
            ) : null
          }
          extra={[
            <Button 
              type="primary" 
              key="go-now"
              onClick={() => {
                setSuccessModalVisible(false);
                navigate('/warehouse', { 
                  state: { 
                    activeTab: 'storageLocations',
                    message: `Storage Location "${createdLocation?.code}" was created successfully.`
                  } 
                });
              }}
            >
              Go to Warehouse Now
            </Button>
          ]}
        />
      </Modal>
    </div>
  );
};

export default EnhancedStorageLocationCreate;
