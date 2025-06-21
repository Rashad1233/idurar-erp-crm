import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Button, Space, message, Modal, Row, Col, Typography } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  DatabaseOutlined,
  InboxOutlined 
} from '@ant-design/icons';
import ErpLayout from '@/layout/ErpLayout';
import warehouseService from '@/services/warehouseService';
import useLanguage from '@/locale/useLanguage';

const { Title, Text } = Typography;

export default function WarehouseLocations() {
  const translate = useLanguage();
  const navigate = useNavigate();
  
  const [storageLocations, setStorageLocations] = useState([]);
  const [binLocations, setBinLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStorageLocations();
    fetchBinLocations();
  }, []);

  // Fetch storage locations
  const fetchStorageLocations = () => {
    setLoading(true);
    warehouseService.getStorageLocations()
      .then((response) => {
        if (response.success) {
          setStorageLocations(response.data || []);
        } else {
          message.error(translate('Failed to fetch storage locations'));
          console.error('API Error:', response);
        }
      })
      .catch((error) => {
        message.error(translate('Failed to fetch storage locations'));
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
    // Fetch bin locations
  const fetchBinLocations = async () => {
    setLoading(true);
    try {
      const response = await warehouseService.getBinLocations();
      if (response.success && Array.isArray(response.data)) {
        setBinLocations(response.data);
      } else {
        message.error(translate('Failed to fetch bin locations'));
        console.error('API Error:', response);
        setBinLocations([]);
      }
    } catch (error) {
      message.error(translate('Failed to fetch bin locations'));
      console.error('Error fetching bin locations:', error);
      setBinLocations([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete storage location
  const handleDeleteStorageLocation = (id) => {
    Modal.confirm({
      title: translate('Delete Storage Location'),
      content: translate('Are you sure you want to delete this storage location?'),
      okText: translate('Delete'),
      okType: 'danger',
      cancelText: translate('Cancel'),
      onOk: async () => {
        try {
          const result = await warehouseService.deleteStorageLocation(id);
          if (result.success) {
            message.success(translate('Storage location deleted successfully'));
            fetchStorageLocations();
          } else {
            message.error(result.error || translate('Failed to delete storage location'));
            console.error('API Error:', result);
          }
        } catch (error) {
          console.error('Error deleting storage location:', error);
          message.error(translate('Failed to delete storage location'));
        }
      }
    });
  };

  // Delete bin location
  const handleDeleteBinLocation = (id) => {
    Modal.confirm({
      title: translate('Delete Bin Location'),
      content: translate('Are you sure you want to delete this bin location?'),
      okText: translate('Delete'),
      okType: 'danger',
      cancelText: translate('Cancel'),
      onOk: async () => {
        try {
          const result = await warehouseService.deleteBinLocation(id);
          if (result.success) {
            message.success(translate('Bin location deleted successfully'));
            fetchBinLocations();
          } else {
            message.error(result.error || translate('Failed to delete bin location'));
            console.error('API Error:', result);
          }
        } catch (error) {
          console.error('Error deleting bin location:', error);
          message.error(translate('Failed to delete bin location'));
        }
      }
    });
  };

  // Column definitions for storage locations
  const storageLocationColumns = [
    {
      title: translate('Code'),
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: translate('City'),
      dataIndex: 'city',
      key: 'city'
    },
    {
      title: translate('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => navigate(`/warehouse/location/edit/${record.id}`)}
          >
            {translate('Edit')}
          </Button>
          <Button 
            type="primary" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteStorageLocation(record.id)}
          >
            {translate('Delete')}
          </Button>
        </Space>
      )
    }
  ];

  // Column definitions for bin locations
  const binLocationColumns = [
    {
      title: translate('Bin Code'),
      dataIndex: 'binCode',
      key: 'binCode'
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: translate('Storage Location'),
      dataIndex: ['storageLocation', 'code'],
      key: 'storageLocation'
    },
    {
      title: translate('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => navigate(`/warehouse/bin/edit/${record.id}`)}
          >
            {translate('Edit')}
          </Button>
          <Button 
            type="primary" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteBinLocation(record.id)}
          >
            {translate('Delete')}
          </Button>
        </Space>
      )
    }
  ];

  return (
    <ErpLayout>
      <div className="site-card-wrapper">
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Title level={2}>{translate('Warehouse Management')}</Title>
            <Text type="secondary">{translate('Manage storage locations and bin locations')}</Text>
          </Col>
          
          {/* Storage Locations */}
          <Col span={24}>
            <Card 
              title={<Space><DatabaseOutlined /> {translate('Storage Locations')}</Space>}
              extra={                <Space>                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => navigate('/warehouse/location/create')}
                  >
                    {translate('Add Storage Location')}
                  </Button>
                  <Button
                    type="default"
                    icon={<InboxOutlined />}
                    onClick={() => navigate('/warehouse/bin/create')}
                    disabled={storageLocations.length === 0}
                  >
                    {translate('Add Bin Location')}
                  </Button>
                </Space>
              }
            >
              <Table 
                columns={storageLocationColumns} 
                dataSource={storageLocations}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </Col>
          
          {/* Bin Locations */}
          <Col span={24}>
            <Card 
              title={<Space><InboxOutlined /> {translate('Bin Locations')}</Space>}              extra={
                <Space>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => navigate('/warehouse/bin/create')}
                    disabled={storageLocations.length === 0}
                  >
                    {translate('Add Bin Location')}
                  </Button>
                  <Button
                    type="default"
                    icon={<DatabaseOutlined />}                    onClick={() => navigate('/warehouse/location/create')}
                  >
                    {translate('Add Storage Location')}
                  </Button>
                </Space>
              }
            >
              <Table 
                columns={binLocationColumns} 
                dataSource={binLocations}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </ErpLayout>
  );
}
