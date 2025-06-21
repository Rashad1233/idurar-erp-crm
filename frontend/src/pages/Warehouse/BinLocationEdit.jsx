import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, message, Select, Row, Col, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import ErpLayout from '@/layout/ErpLayout';
import warehouseService from '@/services/warehouseService';
import useLanguage from '@/locale/useLanguage';

const { Title } = Typography;

export default function BinLocationEdit() {
  const translate = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [storageLocations, setStorageLocations] = useState([]);
  const [loadingStorageLocations, setLoadingStorageLocations] = useState(false);

  useEffect(() => {
    fetchStorageLocations();
    if (id) {
      fetchBinLocation();
    }
  }, [id]);

  const fetchStorageLocations = async () => {
    setLoadingStorageLocations(true);
    try {
      const response = await warehouseService.getStorageLocations();
      if (response.success) {
        setStorageLocations(response.data || []);
      } else {
        message.error('Failed to fetch storage locations');
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching storage locations:', error);
      message.error('Failed to fetch storage locations');
    } finally {
      setLoadingStorageLocations(false);
    }
  };

  const fetchBinLocation = async () => {
    setFetchingData(true);
    try {
      const response = await warehouseService.getBinLocation(id);
      if (response.success) {
        const binLocation = response.data;
        form.setFieldsValue({
          storageLocationId: binLocation.storageLocationId,
          binCode: binLocation.binCode,
          description: binLocation.description
        });      } else {
        message.error('Failed to fetch bin location data');
        console.error('API Error:', response);
        navigate('/warehouse');
      }    } catch (error) {
      console.error('Error fetching bin location data:', error);
      message.error('Failed to fetch bin location data');
      navigate('/warehouse');
    } finally {
      setFetchingData(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await warehouseService.updateBinLocation(id, values);      if (response.success) {
        message.success('Bin location updated successfully');
        navigate('/warehouse');
      } else {
        message.error(response.error || 'Failed to update bin location');
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error updating bin location:', error);
      message.error('Failed to update bin location');
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
                  <HomeOutlined /> {translate('Edit Bin Location')}
                </Title>
              }
              loading={fetchingData}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="storageLocationId"
                      label={translate('Storage Location')}
                      rules={[{ required: true, message: translate('Please select a storage location') }]}
                    >
                      <Select
                        loading={loadingStorageLocations}
                        placeholder={translate('Select a storage location')}
                      >
                        {storageLocations.map(location => (
                          <Select.Option key={location.id} value={location.id}>
                            {location.code} - {location.description}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="binCode"
                      label={translate('Bin Code')}
                      rules={[{ required: true, message: translate('Please enter the bin code') }]}
                    >
                      <Input placeholder={translate('Enter bin code')} />
                    </Form.Item>
                  </Col>
                  
                  <Col span={24}>
                    <Form.Item
                      name="description"
                      label={translate('Description')}
                    >
                      <Input.TextArea rows={4} placeholder={translate('Enter description')} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    {translate('Update Bin Location')}
                  </Button>                  <Button 
                    style={{ marginLeft: 8 }} 
                    onClick={() => navigate('/warehouse')}
                  >
                    {translate('Cancel')}
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </ErpLayout>
  );
}
