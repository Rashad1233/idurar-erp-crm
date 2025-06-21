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
  Select,
  Spin
} from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { ErpLayout } from '@/layout';
import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import warehouseService from '@/services/warehouseService';
import { useNavigate, useParams } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function StorageLocationEdit() {
  const translate = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
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
  ]);

  useEffect(() => {
    if (id) {
      fetchStorageLocation();
    }
  }, [id]);
  const fetchStorageLocation = async () => {
    setFetchingData(true);
    try {
      // Get the specific storage location by ID
      const response = await warehouseService.getStorageLocation(id);
      if (response.success && response.data) {
        // Populate the form with the existing values
        form.setFieldsValue({
          code: response.data.code,
          description: response.data.description,
          street: response.data.street,
          city: response.data.city,
          postalCode: response.data.postalCode,
          country: response.data.country
        });
      } else {
        message.error('Storage location not found');
        navigate('/warehouse');
      }
    } catch (error) {
      console.error('Error fetching storage location data:', error);
      message.error('Failed to fetch storage location data');
    } finally {
      setFetchingData(false);
    }
  };  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await warehouseService.updateStorageLocation(id, values);
      if (result.success) {
        message.success('Storage location updated successfully');
        navigate('/warehouse');
      } else {
        message.error(result.error || 'Failed to update storage location');
        console.error('API Error:', result);
      }
    } catch (error) {
      console.error('Error updating storage location:', error);
      message.error('Failed to update storage location');
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
                  <HomeOutlined /> Edit Storage Location
                </Title>
              }
            >
              {fetchingData ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <Spin size="large" />
                </div>
              ) : (
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
                      <Button onClick={() => navigate('/warehouse/locations')} style={{ marginRight: 8 }}>
                        Cancel
                      </Button>
                      <Button type="primary" htmlType="submit" loading={loading}>
                        Update Storage Location
                      </Button>
                    </Col>
                  </Row>
                </Form>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </ErpLayout>
  );
}
