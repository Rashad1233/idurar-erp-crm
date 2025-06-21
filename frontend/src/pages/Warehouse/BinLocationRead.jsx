import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  message, 
  Divider,
  Descriptions,
  Button,
  Spin
} from 'antd';
import { InboxOutlined, EditOutlined } from '@ant-design/icons';
import { ErpLayout } from '@/layout';
import useLanguage from '@/locale/useLanguage';
import warehouseService from '@/services/warehouseService';
import { useNavigate, useParams } from 'react-router-dom';

const { Title } = Typography;

export default function BinLocationRead() {
  const translate = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const [binLocation, setBinLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBinLocation();
    }
  }, [id]);

  const fetchBinLocation = async () => {
    setLoading(true);
    try {
      const response = await warehouseService.getBinLocation(id);
      if (response.success) {
        setBinLocation(response.data);
      } else {
        message.error(response.error || 'Failed to fetch bin location');
        navigate('/warehouse');
      }
    } catch (error) {
      console.error('Error fetching bin location:', error);
      message.error('Failed to fetch bin location data');
      navigate('/warehouse');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/warehouse/bin/edit/${id}`);
  };

  const handleDelete = async () => {
    try {
      const result = await warehouseService.deleteBinLocation(id);
      if (result.success) {
        message.success('Bin location deleted successfully');
        navigate('/warehouse');
      } else {
        message.error(result.error || 'Failed to delete bin location');
      }
    } catch (error) {
      console.error('Error deleting bin location:', error);
      message.error('Failed to delete bin location');
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
                  <InboxOutlined /> Bin Location Details
                </Title>
              }
              extra={
                <Button 
                  type="primary" 
                  icon={<EditOutlined />} 
                  onClick={handleEdit}
                >
                  Edit
                </Button>
              }
            >
              {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <Spin size="large" />
                </div>
              ) : binLocation ? (
                <>
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="ID">{binLocation.id}</Descriptions.Item>
                    <Descriptions.Item label="Bin Code">{binLocation.binCode}</Descriptions.Item>
                    <Descriptions.Item label="Description">{binLocation.description || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Storage Location">
                      {binLocation.storageLocationCode 
                        ? `${binLocation.storageLocationCode} - ${binLocation.storageLocationDescription || ''}` 
                        : 'Unknown'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">{binLocation.isActive ? 'Active' : 'Inactive'}</Descriptions.Item>
                    <Descriptions.Item label="Created">{new Date(binLocation.createdAt).toLocaleString()}</Descriptions.Item>
                    <Descriptions.Item label="Last Updated">{new Date(binLocation.updatedAt).toLocaleString()}</Descriptions.Item>
                  </Descriptions>

                  <Divider />

                  <Row>
                    <Col span={24} style={{ textAlign: 'right' }}>
                      <Button onClick={() => navigate('/warehouse')} style={{ marginRight: 8 }}>
                        Back
                      </Button>
                      <Button type="primary" onClick={handleEdit} style={{ marginRight: 8 }}>
                        Edit
                      </Button>
                      <Button 
                        danger 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this bin location?')) {
                            handleDelete();
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </Col>
                  </Row>
                </>
              ) : (
                <div>Bin location not found</div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </ErpLayout>
  );
}
