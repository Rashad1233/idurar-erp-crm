import React, { useState, useEffect } from 'react';
import { Spin, Alert, Button, Descriptions, PageHeader, Card, Space, Typography, Row, Col, Divider, message } from 'antd';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import { ErpLayout } from '@/layout';

/**
 * A simplified version of the ReadItem component that doesn't rely on Redux
 * and directly fetches data from the API
 */
const SimpleReadItem = ({ 
  id, 
  entity,
  labels = [], 
  apiUrl = null,
  additionalFields = []
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const url = apiUrl || `${API_BASE_URL}/${entity}/${id}`;
        const response = await axios.get(url);
        
        if (response.data && response.data.result) {
          setData(response.data.result);
        } else {
          setError('Invalid data format received from server');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch item details');
        message.error('Error loading data: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    } else {
      setError('No item ID provided');
      setLoading(false);
    }
  }, [id, entity, apiUrl]);

  if (loading) {
    return (
      <ErpLayout>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" tip="Loading item details..." />
        </div>
      </ErpLayout>
    );
  }

  if (error) {
    return (
      <ErpLayout>
        <div style={{ padding: '24px' }}>
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
          />
          <div style={{ marginTop: '16px' }}>
            <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
              Go Back
            </Button>
          </div>
        </div>
      </ErpLayout>
    );
  }

  if (!data) {
    return (
      <ErpLayout>
        <div style={{ padding: '24px' }}>
          <Alert
            message="Item not found"
            description="The requested item could not be found."
            type="warning"
            showIcon
          />
          <div style={{ marginTop: '16px' }}>
            <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
              Go Back
            </Button>
          </div>
        </div>
      </ErpLayout>
    );
  }

  // Extract entity name for display
  const entityName = entity.charAt(0).toUpperCase() + entity.slice(1);

  // Dynamically generate item description pairs
  const generateItemDescriptions = () => {
    const fields = [];
    
    // Add all specified fields
    for (const [key, label] of Object.entries(labels)) {
      if (data[key] !== undefined && data[key] !== null) {
        fields.push({
          key,
          label,
          value: data[key]
        });
      }
    }
    
    // Add additional fields
    for (const field of additionalFields) {
      if (data[field.key] !== undefined && data[field.key] !== null) {
        fields.push({
          key: field.key,
          label: field.label,
          value: field.render ? field.render(data[field.key], data) : data[field.key]
        });
      }
    }
    
    return fields;
  };

  return (
    <ErpLayout>
      <div style={{ padding: '0 24px' }}>
        <PageHeader
          onBack={() => navigate(-1)}
          title={`${entityName} Details`}
          subTitle={`ID: ${id}`}
          extra={[
            <Link key="edit" to={`/${entity}/update/${id}`}>
              <Button type="primary" icon={<EditOutlined />}>
                Edit
              </Button>
            </Link>
          ]}
        />
        <Card>
          <Descriptions bordered column={2}>
            {generateItemDescriptions().map((field) => (
              <Descriptions.Item key={field.key} label={field.label}>
                {field.value}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Card>
      </div>
    </ErpLayout>
  );
};

export default SimpleReadItem;
