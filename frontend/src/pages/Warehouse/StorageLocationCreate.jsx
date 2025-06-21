import React, { useState, useEffect } from 'react';
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
  Select
} from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { ErpLayout } from '@/layout';
import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import warehouseService from '@/services/warehouseService';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function StorageLocationCreate() {
  const translate = useLanguage();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([
    { name: 'United States', code: 'US' },
    { name: 'Canada', code: 'CA' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'Germany', code: 'DE' },
    { name: 'France', code: 'FR' },
    { name: 'Japan', code: 'JP' },
    { name: 'Australia', code: 'AU' },
    { name: 'China', code: 'CN' },
    { name: 'India', code: 'IN' },
    { name: 'Brazil', code: 'BR' },
  ]);  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await warehouseService.createStorageLocation(values);
      if (result.success) {
        message.success('Storage location created successfully');
        navigate('/warehouse/locations');
      } else {
        message.error(result.error || 'Failed to create storage location');
        console.error('API Error:', result);
      }
    } catch (error) {
      console.error('Error creating storage location:', error);
      message.error('Failed to create storage location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErpLayout>
      <div className="site-card-wrapper">
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card 
              title={
                <Title level={2} className="card-title">
                  <HomeOutlined /> Create Storage Location
                </Title>
              }
            >
              <Form
                layout="vertical"
                form={form}
                onFinish={onFinish}
                autoComplete="off"
              >
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item
                      name="code"
                      label="Storage Location Code"
                      rules={[
                        {
                          required: true,
                          message: 'Please enter a storage location code',
                        },
                        {
                          max: 10,
                          message: 'Code cannot be longer than 10 characters',
                        },
                      ]}
                    >
                      <Input placeholder="e.g., WH01, NY01" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="description"
                      label="Description"
                      rules={[
                        {
                          required: true,
                          message: 'Please enter a description',
                        },
                      ]}
                    >
                      <Input placeholder="e.g., Main Warehouse, New York Storage" />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider orientation="left">Address Information</Divider>

                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Form.Item
                      name="street"
                      label="Street Address"
                    >
                      <TextArea 
                        placeholder="Enter street address" 
                        autoSize={{ minRows: 2, maxRows: 4 }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Form.Item
                      name="city"
                      label="City"
                    >
                      <Input placeholder="Enter city" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="postalCode"
                      label="Postal Code"
                    >
                      <Input placeholder="Enter postal code" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="country"
                      label="Country"
                    >
                      <Select
                        placeholder="Select country"
                        showSearch
                        optionFilterProp="children"
                      >
                        {countries.map((country) => (
                          <Option key={country.code} value={country.name}>
                            {country.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row>
                  <Col span={24} style={{ textAlign: 'right' }}>
                    <Button onClick={() => navigate('/warehouse')} style={{ marginRight: 8 }}>
                      Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Create Storage Location
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </ErpLayout>
  );
}
