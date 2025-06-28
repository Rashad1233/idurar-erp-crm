import React, { useState, useEffect } from 'react';
import { Tabs, Button, Row, Col, Card, Typography, message } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { 
  PlusOutlined, 
  HomeOutlined, 
  InboxOutlined, 
  SwapOutlined
} from '@ant-design/icons';
import SimpleCrudModule from '@/modules/SimpleCrudModule';

const { Title } = Typography;

function Warehouse() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('locations');
  
  // Handle navigation state for tab switching and success messages
  useEffect(() => {
    if (location.state) {
      const { activeTab: targetTab, message: successMessage } = location.state;
      
      // Set the active tab if specified
      if (targetTab === 'storageLocations') {
        setActiveTab('locations');
      } else if (targetTab === 'bins') {
        setActiveTab('bins');
      }
      
      // Show success message if provided
      if (successMessage) {
        message.success(successMessage);
      }
      
      // Clear the state to prevent re-showing the message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  const entity = 'warehouse';
    const searchConfig = {
    displayLabels: ['code', 'description'],
    searchFields: 'code,description',
    outputValue: 'id',
  };

  const entityDisplayLabels = ['code', 'description'];
  const storageLocationColumns = [
    {
      title: 'Code',
      dataIndex: 'code',
      render: (text) => text || '-'
    },
    {
      title: 'Description',
      dataIndex: 'description',
      render: (text) => text || '-'
    },
    {
      title: 'Location',
      render: (_, record) => {
        // First try the formatted address field
        if (record.formattedAddress && record.formattedAddress !== 'No address provided') {
          return record.formattedAddress;
        }
        
        // Fall back to manually combining address fields
        const parts = [];
        if (record.street && record.street.trim() !== '') parts.push(record.street);
        if (record.city && record.city.trim() !== '') parts.push(record.city);
        if (record.country && record.country.trim() !== '') parts.push(record.country);
        
        return parts.length > 0 ? parts.join(', ') : 'No address available';
      }
    },
  ];
  const binColumns = [
    {
      title: 'Bin Code',
      dataIndex: 'binCode',
      render: (text) => text || '-'
    },
    {
      title: 'Storage Location',
      render: (_, record) => {
        if (record.storageLocationCode && record.storageLocationDescription) {
          return `${record.storageLocationCode} - ${record.storageLocationDescription}`;
        } else if (record.storageLocationCode) {
          return record.storageLocationCode;
        } else if (record.storageLocationDescription) {
          return record.storageLocationDescription;
        }
        return 'Unknown location';
      }
    },
    {
      title: 'Description',
      dataIndex: 'description',
      render: (text) => text || '-'
    },
  ];
  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Title level={2}>Warehouse Management</Title>            <Row gutter={[16, 16]}>
              <Col>
                <Link to="/warehouse/location/create">
                  <Button type="primary" icon={<HomeOutlined />}>
                    Create Storage Location
                  </Button>
                </Link>
              </Col>
              <Col>
                <Link to="/warehouse/bin/create">
                  <Button type="primary" icon={<InboxOutlined />}>
                    Create Bin Location
                  </Button>
                </Link>
              </Col>
              <Col>
                <Link to="/warehouse/transaction">
                  <Button type="primary" icon={<SwapOutlined />}>
                    Transactions
                  </Button>
                </Link>
              </Col>
      </Row>
          </Card>
        </Col>
      </Row>        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ marginTop: '20px' }}
          items={[
            {
              key: 'locations',
              label: 'Storage Locations',
              children: (                <SimpleCrudModule
                  entity="simple-storage-locations"
                  originalEntity="warehouse/storage-location"
                  dataTableColumns={storageLocationColumns}
                  searchConfig={searchConfig}
                  entityDisplayLabels={entityDisplayLabels}
                />
              )
            },            {
              key: 'bins',
              label: 'Bins',
              children: (                <SimpleCrudModule
                  entity="simple-bin-locations"
                  originalEntity="warehouse/bin-location"
                  dataTableColumns={binColumns}
                  searchConfig={{
                    displayLabels: ['binCode', 'storageLocation'],
                    searchFields: 'binCode,storageLocation',
                    outputValue: '_id',
                  }}
                  entityDisplayLabels={['binCode']}
                />
              )
            }
          ]}
        />
    </div>
  );
}

export default Warehouse;
