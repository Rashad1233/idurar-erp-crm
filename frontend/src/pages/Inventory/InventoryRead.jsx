import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, message, Spin, Tag, Space, Statistic, Row, Col } from 'antd';
import { EditOutlined, ArrowLeftOutlined, ShoppingCartOutlined } from '@ant-design/icons';

import { ErpLayout } from '@/layout';
import useLanguage from '@/locale/useLanguage';
import inventoryService from '@/services/inventoryService';

export default function InventoryRead() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState({});
  const navigate = useNavigate();
  const translate = useLanguage();

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getInventoryItem(id);
      if (response.success) {
        setInventoryData(response.data);
      } else {
        message.error(response.message || 'Failed to load inventory data');
        navigate('/inventory');
      }
    } catch (error) {
      message.error('Error loading inventory data');
      console.error(error);
      navigate('/inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const getConditionTag = (condition) => {
    const conditionMap = {
      'A': { color: 'green', text: 'A - Excellent' },
      'B': { color: 'blue', text: 'B - Good' },
      'C': { color: 'orange', text: 'C - Fair' },
      'D': { color: 'red', text: 'D - Poor' },
      'E': { color: 'volcano', text: 'E - Critical' },
    };
    const config = conditionMap[condition] || { color: 'default', text: condition };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getStockLevelTag = () => {
    const { physicalBalance, minimumLevel, maximumLevel } = inventoryData;
    if (physicalBalance <= minimumLevel) {
      return <Tag color="red">Low Stock</Tag>;
    } else if (physicalBalance >= maximumLevel) {
      return <Tag color="orange">Overstock</Tag>;
    } else {
      return <Tag color="green">Normal Stock</Tag>;
    }
  };

  const calculateReorderQuantity = () => {
    const { physicalBalance, minimumLevel, maximumLevel } = inventoryData;
    if (physicalBalance <= minimumLevel) {
      return maximumLevel - physicalBalance;
    }
    return 0;
  };

  if (loading) {
    return (
      <ErpLayout>
        <Card>
          <Spin size="large" style={{ display: 'block', textAlign: 'center', padding: '50px' }} />
        </Card>
      </ErpLayout>
    );
  }

  return (
    <ErpLayout>
      <Card
        title={`${translate('Inventory Details')} - ${inventoryData.inventoryNumber}`}
        extra={
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/inventory')}
            >
              {translate('Back to List')}
            </Button>
            <Button 
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/inventory/${id}/update`)}
            >
              {translate('Edit')}
            </Button>
            {inventoryData.physicalBalance <= inventoryData.minimumLevel && (
              <Button 
                type="default"
                icon={<ShoppingCartOutlined />}
                style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f', color: 'white' }}
                onClick={() => navigate('/inventory/reorder')}
              >
                {translate('Create Reorder Request')}
              </Button>
            )}
          </Space>
        }
      >
        {/* Key Statistics */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Statistic
              title={translate('Physical Balance')}
              value={inventoryData.physicalBalance || 0}
              suffix={inventoryData.itemMaster?.unitOfMeasure || 'EA'}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={translate('Unit Price')}
              value={inventoryData.unitPrice || 0}
              prefix="$"
              precision={2}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={translate('Total Value')}
              value={inventoryData.linePrice || 0}
              prefix="$"
              precision={2}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={translate('Reorder Quantity')}
              value={calculateReorderQuantity()}
              suffix={inventoryData.itemMaster?.unitOfMeasure || 'EA'}
            />
          </Col>
        </Row>

        {/* Basic Information */}
        <Card title={translate('Basic Information')} style={{ marginBottom: 16 }}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label={translate('Inventory Number')}>
              {inventoryData.inventoryNumber}
            </Descriptions.Item>
            <Descriptions.Item label={translate('Item Number')}>
              {inventoryData.itemMaster?.itemNumber}
            </Descriptions.Item>
            <Descriptions.Item label={translate('Description')} span={2}>
              {inventoryData.itemMaster?.shortDescription}
            </Descriptions.Item>
            <Descriptions.Item label={translate('Condition')}>
              {getConditionTag(inventoryData.condition)}
            </Descriptions.Item>
            <Descriptions.Item label={translate('Stock Status')}>
              {getStockLevelTag()}
            </Descriptions.Item>
            <Descriptions.Item label={translate('Criticality')}>
              {inventoryData.itemMaster?.criticality || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={translate('Last Updated By')}>
              {inventoryData.lastUpdatedBy?.name || '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Item Master Information */}
        <Card title={translate('Item Master Information')} style={{ marginBottom: 16 }}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label={translate('Manufacturer')}>
              {inventoryData.itemMaster?.manufacturerName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={translate('Manufacturer Part Number')}>
              {inventoryData.itemMaster?.manufacturerPartNumber || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={translate('Equipment Category')}>
              {inventoryData.itemMaster?.equipmentCategory || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={translate('UNSPSC Code')}>
              {inventoryData.itemMaster?.unspscCode || '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Stock Levels */}
        <Card title={translate('Stock Levels')} style={{ marginBottom: 16 }}>
          <Descriptions column={3} bordered>
            <Descriptions.Item label={translate('Current Stock')}>
              <strong>{inventoryData.physicalBalance || 0}</strong> {inventoryData.itemMaster?.unitOfMeasure || 'EA'}
            </Descriptions.Item>
            <Descriptions.Item label={translate('Minimum Level (ROP)')}>
              {inventoryData.minimumLevel || 0} {inventoryData.itemMaster?.unitOfMeasure || 'EA'}
            </Descriptions.Item>
            <Descriptions.Item label={translate('Maximum Level')}>
              {inventoryData.maximumLevel || 0} {inventoryData.itemMaster?.unitOfMeasure || 'EA'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Timestamps */}
        <Card title={translate('Audit Information')}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label={translate('Created At')}>
              {inventoryData.createdAt ? new Date(inventoryData.createdAt).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={translate('Updated At')}>
              {inventoryData.updatedAt ? new Date(inventoryData.updatedAt).toLocaleString() : '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Card>
    </ErpLayout>
  );
}
