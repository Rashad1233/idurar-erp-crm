import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Row, 
  Col, 
  Typography, 
  message, 
  Divider,
  Space
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { ErpLayout } from '@/layout';
import useLanguage from '@/locale/useLanguage';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function StorageLocationCreate() {
  const translate = useLanguage();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [warehouseCode, setWarehouseCode] = useState('');

  // Generate warehouse code from components (e.g., BRG01)
  const generateWarehouseCode = (values) => {
    const { locationCode = '', sequenceNumber = '' } = values;
    if (!locationCode || !sequenceNumber) return '';
    return `${locationCode.toUpperCase()}${sequenceNumber.padStart(2, '0')}`;
  };

  // Update warehouse code when components change
  const handleCodeComponentChange = () => {
    setTimeout(() => {
      const values = form.getFieldsValue(['locationCode', 'sequenceNumber']);
      const code = generateWarehouseCode(values);
      setWarehouseCode(code);
      form.setFieldValue('code', code);
    }, 100);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Generate final warehouse code
      const finalCode = generateWarehouseCode(values);
      const finalValues = {
        ...values,
        code: finalCode,
        fullAddress: `${values.streetAddress || ''}, ${values.city || ''}, ${values.postalCode || ''}`.replace(/^,\s*|,\s*$/g, '')
      };
      
      console.log('Creating storage location with values:', finalValues);
      
      // TODO: Replace with actual API call
      // const response = await warehouseService.createStorageLocation(finalValues);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success(`Storage location ${finalCode} - ${values.longDescription} created successfully!`);
      navigate('/warehouse/locations');
    } catch (error) {
      console.error('Error creating storage location:', error);
      message.error('Failed to create storage location');
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    navigate('/warehouse/locations');
  };

  return (
    <ErpLayout>
      <div style={{ padding: '20px' }}>
        <Card
          title={
            <Space>
              <EnvironmentOutlined />
              <Title level={3} style={{ margin: 0 }}>
                {translate('Create Storage Location')}
              </Title>
            </Space>
          }
          extra={
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={onCancel}
            >
              {translate('Back to Locations')}
            </Button>
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              locationCode: '',
              sequenceNumber: '01',
              code: '',
              longDescription: '',
              streetAddress: '',
              city: '',
              country: 'United Kingdom',
              postalCode: ''
            }}
          >
            {/* Warehouse Code Generation Section */}
            <Card size="small" title={translate('Warehouse Code Generation')} style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label={translate('Location Code')}
                    name="locationCode"
                    rules={[
                      { required: true, message: translate('Please enter location code') },
                      { max: 3, message: translate('Location code must be 3 characters or less') },
                      { pattern: /^[A-Za-z]+$/, message: translate('Location code must contain only letters') }
                    ]}
                    tooltip={translate('Enter 3-letter code like BRG for Brighton')}
                  >
                    <Input 
                      placeholder="BRG" 
                      onChange={handleCodeComponentChange}
                      style={{ textTransform: 'uppercase' }}
                      maxLength={3}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={translate('Sequence Number')}
                    name="sequenceNumber"
                    rules={[
                      { required: true, message: translate('Please enter sequence number') },
                      { pattern: /^[0-9]+$/, message: translate('Sequence number must contain only numbers') }
                    ]}
                    tooltip={translate('Enter 2-digit sequence like 01, 02, etc.')}
                  >
                    <Input 
                      placeholder="01" 
                      onChange={handleCodeComponentChange}
                      maxLength={2}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={translate('Generated Code')}
                    name="code"
                  >
                    <Input 
                      value={warehouseCode}
                      placeholder="BRG01"
                      disabled
                      style={{ 
                        backgroundColor: '#f0f0f0',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Text type="secondary">
                {translate('Example: Location Code "BRG" + Sequence "01" = "BRG01"')}
              </Text>
            </Card>

            <Divider />

            {/* Location Details Section */}
            <Card size="small" title={translate('Location Details')} style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label={translate('Long Description')}
                    name="longDescription"
                    rules={[
                      { required: true, message: translate('Please enter long description') },
                      { min: 5, message: translate('Description must be at least 5 characters') }
                    ]}
                    tooltip={translate('Enter descriptive name like "Brighton Warehouse 1"')}
                  >
                    <Input 
                      placeholder="Brighton Warehouse 1"
                      style={{ fontSize: '16px' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Divider />

            {/* Address Information Section */}
            <Card size="small" title={translate('Address Information')} style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={translate('Street Address')}
                    name="streetAddress"
                    rules={[
                      { required: true, message: translate('Please enter street address') }
                    ]}
                  >
                    <Input 
                      placeholder="Falmer village street 3"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={translate('City')}
                    name="city"
                    rules={[
                      { required: true, message: translate('Please enter city') }
                    ]}
                  >
                    <Input 
                      placeholder="Brighton"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={translate('Country')}
                    name="country"
                    rules={[
                      { required: true, message: translate('Please enter country') }
                    ]}
                  >
                    <Input 
                      placeholder="United Kingdom"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={translate('Postal Code')}
                    name="postalCode"
                    rules={[
                      { required: true, message: translate('Please enter postal code') }
                    ]}
                  >
                    <Input 
                      placeholder="NS0R51"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Action Buttons */}
            <Row justify="end" style={{ marginTop: 24 }}>
              <Space size="middle">
                <Button size="large" onClick={onCancel}>
                  {translate('Cancel')}
                </Button>
                <Button 
                  type="primary" 
                  size="large"
                  htmlType="submit" 
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  {translate('Create Storage Location')}
                </Button>
              </Space>
            </Row>
          </Form>
        </Card>
      </div>
    </ErpLayout>
  );
}
