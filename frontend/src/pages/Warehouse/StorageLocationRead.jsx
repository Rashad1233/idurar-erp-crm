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
import { HomeOutlined, EditOutlined } from '@ant-design/icons';
import { ErpLayout } from '@/layout';
import useLanguage from '@/locale/useLanguage';
import warehouseService from '@/services/warehouseService';
import { useNavigate, useParams } from 'react-router-dom';

const { Title } = Typography;

export default function StorageLocationRead() {
  const translate = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchStorageLocation();
    }
  }, [id]);

  const fetchStorageLocation = async () => {
    setLoading(true);
    try {
      const response = await warehouseService.getStorageLocation(id);
      if (response.success) {
        setLocation(response.data);
      } else {
        message.error(response.error || 'Failed to fetch storage location');
        navigate('/warehouse');
      }
    } catch (error) {
      console.error('Error fetching storage location:', error);
      message.error('Failed to fetch storage location data');
      navigate('/warehouse');
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (location) => {
    if (!location) return 'No address available';
    
    const parts = [];
    if (location.street && location.street.trim() !== '') parts.push(location.street);
    if (location.city && location.city.trim() !== '') parts.push(location.city);
    if (location.postalCode && location.postalCode.trim() !== '') parts.push(location.postalCode);
    if (location.country && location.country.trim() !== '') parts.push(location.country);
    
    return parts.length > 0 ? parts.join(', ') : 'No address available';
  };

  const handleEdit = () => {
    navigate(`/warehouse/location/edit/${id}`);
  };

  const handleDelete = async () => {
    try {
      const result = await warehouseService.deleteStorageLocation(id);
      if (result.success) {
        message.success('Storage location deleted successfully');
        navigate('/warehouse');
      } else {
        message.error(result.error || 'Failed to delete storage location');
      }
    } catch (error) {
      console.error('Error deleting storage location:', error);
      message.error('Failed to delete storage location');
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
                  <HomeOutlined /> Storage Location Details
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
              ) : location ? (
                <>
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="ID">{location.id}</Descriptions.Item>
                    <Descriptions.Item label="Code">{location.code}</Descriptions.Item>
                    <Descriptions.Item label="Description">{location.description}</Descriptions.Item>
                    <Descriptions.Item label="Address">{formatAddress(location)}</Descriptions.Item>
                    <Descriptions.Item label="Status">{location.isActive ? 'Active' : 'Inactive'}</Descriptions.Item>
                    <Descriptions.Item label="Created">{new Date(location.createdAt).toLocaleString()}</Descriptions.Item>
                    <Descriptions.Item label="Last Updated">{new Date(location.updatedAt).toLocaleString()}</Descriptions.Item>
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
                          if (window.confirm('Are you sure you want to delete this storage location?')) {
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
                <div>Storage location not found</div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </ErpLayout>
  );
}
