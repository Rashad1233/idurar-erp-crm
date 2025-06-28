import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Table, 
  Tag, 
  Space, 
  Dropdown, 
  Card,
  Input,
  Spin,
  Alert,
  Badge,
  Tooltip
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
  SearchOutlined,
  CheckOutlined
} from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import SearchItem from '@/components/SearchItem';

function RFQ() {
  const translate = useLanguage();
  const navigate = useNavigate();
  
  const [rfqs, setRFQs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load RFQs
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    request
      .get({ entity: 'procurement/rfq' })
      .then((response) => {
        if (response.success) {
          console.log('RFQ list response:', response);
          setRFQs(response.result || response.data || []);
        } else {
          throw new Error(response.message || 'Failed to fetch RFQs');
        }
      })
      .catch((err) => {
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
      case 'approved_by_supplier':
        return 'success';
      default:
        return 'default';
    }
  };
  
  const getRFQActions = (record) => {
    const items = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: translate('View Details'),
        onClick: () => navigate(`/rfq/read/${record.id || record._id}`)
      }
    ];

    if (record.status === 'draft') {
      items.push({
        key: 'edit',
        icon: <EditOutlined />,
        label: translate('Edit'),
        onClick: () => navigate(`/rfq/update/${record.id || record._id}`)
      });
      
      items.push({
        key: 'send',
        icon: <MailOutlined />,
        label: translate('Send to Suppliers'),
        onClick: () => navigate(`/rfq/send/${record.id || record._id}`)
      });
    }

    if (record.status === 'quoted' || record.status === 'closed') {
      items.push({
        key: 'compare',
        icon: <CalculatorOutlined />,
        label: translate('Compare Quotes'),
        onClick: () => navigate(`/rfq/comparison/${record.id || record._id}`)
      });
    }

    if (record.status === 'sent' || record.status === 'in_progress') {
      items.push({
        key: 'supplier-approval',
        icon: <CheckOutlined />,
        label: translate('Supplier Approval'),
        onClick: () => navigate(`/rfq/supplier-approval/${record.id || record._id}`)
      });
    }

    if (record.status === 'closed') {
      items.push({
        key: 'createpo',
        icon: <ShoppingCartOutlined />,
        label: translate('Create PO'),
        onClick: () => navigate(`/purchase-order/create?rfqId=${record.id || record._id}`)
      });
    }

    return items;
  };
    const columns = [
    {
      title: translate('RFQ Number'),
      dataIndex: 'rfqNumber',
      key: 'rfqNumber',
      render: (text, record) => {
        // Handle both number and rfqNumber fields to ensure compatibility
        const displayNumber = text || record.number || 'N/A';
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
      dataIndex: 'responseDeadline',
      key: 'responseDeadline',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: translate('Suppliers'),
      key: 'suppliers',
      render: (_, record) => {
        const supplierCount = record.suppliers?.length || 0;
        const quotedCount = record.suppliers?.filter(s => s.status === 'quoted')?.length || 0;
        const supplierNames = record.suppliers?.map(s => s.supplier?.legalName || s.supplier?.tradeName || 'Unknown').join(', ');

        return (
          <Space direction="vertical" size="small">
            <Badge count={quotedCount} style={{ backgroundColor: '#52c41a' }}>
              <Tag color="blue">
                <ShopOutlined /> {supplierCount}
              </Tag>
            </Badge>
        <Tooltip title={supplierNames}>
          <div style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {supplierNames}
          </div>
        </Tooltip>
          </Space>
        );
      },
    },
    {
      title: translate('Related PR'),
      dataIndex: 'purchaseRequisitionId',
      key: 'purchaseRequisitionId',
      render: (_, record) => record.purchaseRequisition ? (
        <Link to={`/purchase-requisition/read/${record.purchaseRequisition.id}`}>
          {record.purchaseRequisition.prNumber || record.purchaseRequisition.id}
        </Link>
      ) : '-',
    },
    {
      title: translate('Created Date'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: translate('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Dropdown menu={{ items: getRFQActions(record) }} trigger={['click']}>
          <Button>
            {translate('Actions')} <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },  ];
  
  // Filter RFQs based on search query  
  const filteredRFQs = searchQuery
    ? rfqs.filter((rfq) => 
        (rfq.rfqNumber && rfq.rfqNumber?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (rfq.number && rfq.number?.toLowerCase().includes(searchQuery.toLowerCase())) ||
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
