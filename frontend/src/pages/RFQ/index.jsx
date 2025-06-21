import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Button, 
  Table, 
  Tag, 
  Space, 
  Dropdown, 
  Menu,
  Card,
  Input,
  Spin,
  Alert,
  Badge
} from 'antd';
import {
  PlusOutlined,
  DownOutlined,  FileSearchOutlined,
  ShopOutlined,
  MailOutlined,
  CalculatorOutlined,
  ShoppingCartOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined
} from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import SearchItem from '@/components/SearchItem';

function RFQ() {
  const translate = useLanguage();
  
  const [rfqs, setRFQs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load RFQs
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    request.list({ entity: 'rfq' })
      .then(response => {
        setRFQs(response.result || []);
      })
      .catch(err => {
        setError(err.message || 'Error loading RFQs');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  
  const handleSearch = (value) => {
    setSearchQuery(value);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'sent':
        return 'processing';
      case 'quoted':
        return 'warning';
      case 'closed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'po_created':
        return 'cyan';
      default:
        return 'default';
    }
  };
  
  const getRFQActions = (record) => (
    <Menu>      <Menu.Item key="view" icon={<EyeOutlined />}>
        <Link to={`/rfq/read/${record.id || record._id}`}>{translate('View Details')}</Link>
      </Menu.Item>
      
      {record.status === 'draft' && (
        <Menu.Item key="edit" icon={<EditOutlined />}>
          <Link to={`/rfq/update/${record.id || record._id}`}>{translate('Edit')}</Link>
        </Menu.Item>
      )}
      
      {record.status === 'draft' && (
        <Menu.Item key="send" icon={<MailOutlined />}>
          <Link to={`/rfq/send/${record.id || record._id}`}>{translate('Send to Suppliers')}</Link>
        </Menu.Item>
      )}
      
      {(record.status === 'quoted' || record.status === 'closed') && (
        <Menu.Item key="compare" icon={<CalculatorOutlined />}>
          <Link to={`/rfq/comparison/${record.id || record._id}`}>{translate('Compare Quotes')}</Link>
        </Menu.Item>
      )}
        {record.status === 'closed' && (
        <Menu.Item key="createpo" icon={<ShoppingCartOutlined />}>
          <Link to={`/purchase-order/create?rfqId=${record.id || record._id}`}>{translate('Create PO')}</Link>
        </Menu.Item>
      )}
    </Menu>
  );
    const columns = [
    {
      title: translate('RFQ Number'),
      dataIndex: 'number',
      key: 'number',      render: (text, record) => {
        // Handle both number and rfqNumber fields to ensure compatibility
        const displayNumber = text || record.rfqNumber || 'N/A';
        return <Link to={`/rfq/read/${record.id || record._id}`}>{displayNumber}</Link>;
      },
    },    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
      render: (description) => description || '-',
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {translate(status.replace(/_/g, ' ').toUpperCase())}
        </Tag>
      ),
    },
    {
      title: translate('Bid Closing Date'),
      dataIndex: 'bidClosingDate',
      key: 'bidClosingDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: translate('Suppliers'),
      key: 'suppliers',
      render: (_, record) => {
        const supplierCount = record.suppliers?.length || 0;
        const quotedCount = record.suppliers?.filter(s => s.status === 'quoted')?.length || 0;
        
        return (
          <Space>
            <Badge count={quotedCount} style={{ backgroundColor: '#52c41a' }}>
              <Tag color="blue">
                <ShopOutlined /> {supplierCount}
              </Tag>
            </Badge>
          </Space>
        );
      },
    },
    {
      title: translate('Related PR'),
      dataIndex: 'prId',
      key: 'prId',
      render: (prId, record) => prId ? (
        <Link to={`/purchase-requisition/read/${prId}`}>
          {record.prNumber || prId}
        </Link>
      ) : '-',
    },
    {
      title: translate('Created Date'),
      dataIndex: 'created',
      key: 'created',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: translate('Actions'),      key: 'actions',
      render: (_, record) => (
        <Dropdown menu={{items: getRFQActions(record)}} trigger={['click']}>
          <Button>
            {translate('Actions')} <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },  ];
  
  // Filter RFQs based on search query  
  const filteredRFQs = searchQuery
    ? rfqs.filter((rfq) => 
        (rfq.number && rfq.number?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (rfq.rfqNumber && rfq.rfqNumber?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        rfq.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rfqs;
  
  if (error) {
    return <Alert message={translate('Error')} description={error} type="error" showIcon />;
  }
  
  return (
    <div className="container">
      <div className="page-header">
        <div className="page-title">
          <h1>{translate('Request for Quotations')}</h1>
        </div>
        <div className="page-action">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => window.location.href = '/rfq/create'}
          >
            {translate('Create New')}
          </Button>
        </div>
      </div>      
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder={translate('Search RFQs...')}
            onChange={(e) => handleSearch(e.target.value)}
            prefix={<SearchOutlined />}
          />
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Spin size="large" />
          </div>
        ) : (          <Table 
            dataSource={filteredRFQs} 
            columns={columns} 
            rowKey={record => record.id || record._id}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
          />
        )}
      </Card>
    </div>
  );
}

export default RFQ;
