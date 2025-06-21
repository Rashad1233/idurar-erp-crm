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
import { InboxOutlined } from '@ant-design/icons';
import { ErpLayout } from '@/layout';
import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import warehouseService from '@/services/warehouseService';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function BinLocationCreate() {
  const translate = useLanguage();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [storageLocations, setStorageLocations] = useState([]);
  const [loadingStorageLocations, setLoadingStorageLocations] = useState(false);

  useEffect(() => {
    fetchStorageLocations();
  }, []);  const fetchStorageLocations = async () => {
    setLoadingStorageLocations(true);
    try {      
      const response = await warehouseService.getStorageLocations();
      if (response.success && response.data) {
        setStorageLocations(response.data);
      } else {
        message.error('Failed to fetch storage locations');
        console.error('Invalid response:', response);
      }
    } catch (error) {
      console.error('Error fetching storage locations:', error);
      message.error('Failed to fetch storage locations');
    } finally {
      setLoadingStorageLocations(false);
    }
  };  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await warehouseService.createBinLocation(values);
      if (result.success) {
        message.success('Bin location created successfully');
        navigate('/warehouse');
      } else {
        message.error(result.error || 'Failed to create bin location');
        console.error('API Error:', result);
      }
    } catch (error) {
      console.error('Error creating bin location:', error);
      message.error('Failed to create bin location');
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
                  <InboxOutlined /> Create Bin Location
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
                      name="storageLocationId"
                      label="Storage Location"
                      rules={[
                        {
                          required: true,
                          message: 'Please select a storage location',
                        },
                      ]}
                    >
                      <Select
                        placeholder="Select storage location"
                        loading={loadingStorageLocations}
                        showSearch
                        optionFilterProp="children"
                      >
                        {storageLocations.map((location) => (
                          <Option key={location.id} value={location.id}>
                            {location.code} - {location.description}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="binCode"
                      label="Bin Code"
                      rules={[
                        {
                          required: true,
                          message: 'Please enter a bin code',
                        },
                        {
                          max: 10,
                          message: 'Bin code cannot be longer than 10 characters',
                        },
                      ]}
                    >
                      <Input placeholder="e.g., A01, B02, C03" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Form.Item
                      name="description"
                      label="Description"
                    >
                      <TextArea 
                        placeholder="Enter bin description" 
                        autoSize={{ minRows: 2, maxRows: 4 }}
                      />
                    </Form.Item>
                  </Col>
                </Row>                <Row>
                  <Col span={24} style={{ textAlign: 'right' }}>
                    <Button onClick={() => navigate('/warehouse/locations')} style={{ marginRight: 8 }}>
                      Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Create Bin Location
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
