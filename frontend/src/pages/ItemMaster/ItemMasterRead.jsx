import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Tag, Divider, Spin, message, Space, Typography } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import { ErpLayout } from '@/layout';

const { Title } = Typography;

export default function ItemMasterRead() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/item/${id}`);
        
        if (response.data && response.data.success) {
          setItem(response.data.result);
        } else {
          setError(response.data?.message || 'Failed to fetch item details');
        }
      } catch (err) {
        console.error('Error fetching item:', err);
        setError(err.response?.data?.message || 'An error occurred while fetching the item');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/item/${id}`);
      if (response.data && response.data.success) {
        message.success('Item deleted successfully');
        navigate('/item-master');
      } else {
        message.error(response.data?.message || 'Failed to delete item');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      message.error(err.response?.data?.message || 'An error occurred while deleting the item');
    }
  };

  const renderStatus = (status) => {
    const colorMap = {
      'DRAFT': 'orange',
      'PENDING_REVIEW': 'blue',
      'APPROVED': 'green',
      'REJECTED': 'red'
    };
    return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
  };

  const renderYesNo = (value) => {
    return value === 'Y' ? (
      <Tag color="green">Yes</Tag>
    ) : (
      <Tag color="default">No</Tag>
    );
  };

  if (loading) {
    return (
      <ErpLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Spin size="large" tip="Loading item details..." />
        </div>
      </ErpLayout>
    );
  }

  if (error || !item) {
    return (
      <ErpLayout>
        <div style={{ padding: '24px' }}>
          <Title level={4} type="danger">Error: {error || 'Item not found'}</Title>
          <Button type="primary" onClick={() => navigate('/item-master')}>
            <ArrowLeftOutlined /> Back to Item List
          </Button>
        </div>
      </ErpLayout>
    );
  }

  return (
    <ErpLayout>
      <div style={{ padding: '24px' }}>      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Button type="primary" onClick={() => navigate('/item-master')}>
              <ArrowLeftOutlined /> Back to Item List
            </Button>
            <Title level={4} style={{ margin: 0 }}>Item Details: {item.itemNumber}</Title>
          </Space>
          <Space>
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={() => navigate(`/item-master/update/${id}`)}
            >
              Edit
            </Button>
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this item?')) {
                  handleDelete();
                }
              }}
            >
              Delete
            </Button>
          </Space>
        </div>

        <Card title="Item Information" bordered={false}>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Item Number">{item.itemNumber}</Descriptions.Item>
            <Descriptions.Item label="Short Description">{item.shortDescription}</Descriptions.Item>
            <Descriptions.Item label="Long Description" span={2}>{item.longDescription || '-'}</Descriptions.Item>
            <Descriptions.Item label="Standard Description" span={2}>{item.standardDescription || '-'}</Descriptions.Item>
            <Descriptions.Item label="Equipment Category">{item.equipmentCategory || '-'}</Descriptions.Item>            <Descriptions.Item label="Equipment Sub-Category">{item.equipmentSubCategory || '-'}</Descriptions.Item>
            <Descriptions.Item label="UNSPSC Code">
              {item.unspscCode ? (
                <Button 
                  type="link" 
                  onClick={() => navigate(`/unspsc-enhanced-search?code=${item.unspscCode}`)}
                  style={{ padding: 0 }}
                >
                  {item.unspscCode}
                </Button>
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Unit of Measure">{item.uom || '-'}</Descriptions.Item>
            <Descriptions.Item label="Manufacturer Name">{item.manufacturerName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Manufacturer Part Number">{item.manufacturerPartNumber || '-'}</Descriptions.Item>
            <Descriptions.Item label="Stock Item">{renderYesNo(item.stockItem)}</Descriptions.Item>
            <Descriptions.Item label="Planned Stock">{renderYesNo(item.plannedStock)}</Descriptions.Item>
            <Descriptions.Item label="Criticality">{item.criticality || '-'}</Descriptions.Item>
            <Descriptions.Item label="Status">{renderStatus(item.status)}</Descriptions.Item>
            <Descriptions.Item label="Equipment Tag">{item.equipmentTag || '-'}</Descriptions.Item>
            <Descriptions.Item label="Serial Number">{item.serialNumber || '-'}</Descriptions.Item>
            <Descriptions.Item label="Contract Number">{item.contractNumber || '-'}</Descriptions.Item>
            <Descriptions.Item label="Supplier Name">{item.supplierName || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Divider />

        <Card title="Audit Information" bordered={false}>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Created At">{new Date(item.createdAt).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Updated At">{new Date(item.updatedAt).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Created By ID">{item.createdById || '-'}</Descriptions.Item>
            <Descriptions.Item label="Updated By ID">{item.updatedById || '-'}</Descriptions.Item>
            <Descriptions.Item label="Reviewed By ID">{item.reviewedById || '-'}</Descriptions.Item>
            <Descriptions.Item label="Approved By ID">{item.approvedById || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </ErpLayout>
  );
}
