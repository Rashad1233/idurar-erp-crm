import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Badge
} from 'antd';
import {
  PlusOutlined,
  DownOutlined,
  FileSearchOutlined,  ShopOutlined,
  MailOutlined,
  FileProtectOutlined,
  ShoppingCartOutlined,
  EditOutlined,
  EyeOutlined,
  CheckOutlined,
  SearchOutlined
} from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import SearchItem from '@/components/SearchItem';
import dayjs from 'dayjs';

function PurchaseOrder() {
  const translate = useLanguage();
  
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load Purchase Orders
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetch('http://localhost:8888/api/procurement/purchase-order', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setPurchaseOrders(data.result || []);
        } else {
          throw new Error(data.message || 'Failed to fetch Purchase Orders');
        }
      })
      .catch(err => {
        setError(err.message || 'Error loading Purchase Orders');
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
      case 'submitted':
        return 'processing';
      case 'approved':
        return 'warning';
      case 'issued':
        return 'success';
      case 'received':
        return 'cyan'; 
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const filteredPOs = purchaseOrders.filter(po => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (po.poNumber && po.poNumber.toLowerCase().includes(query)) ||
      (po.supplier?.name && po.supplier.name.toLowerCase().includes(query)) ||
      (po.status && po.status.toLowerCase().includes(query)) ||
      (po.department && po.department.toLowerCase().includes(query)) ||
      (po.createdBy && po.createdBy.toLowerCase().includes(query))
    );
  });
    const getActions = (record) => {
    const actions = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: <Link to={`/purchase-order/read/${record._id || record.id}`}>{translate('View Details')}</Link>
      }
    ];

    if (record.status === 'draft') {
      actions.push({
        key: 'edit',
        icon: <EditOutlined />,
        label: <Link to={`/purchase-order/update/${record._id || record.id}`}>{translate('Edit')}</Link>
      });
      actions.push({
        key: 'submit',
        icon: <FileProtectOutlined />,
        label: (
          <span
            onClick={async (e) => {
              e.preventDefault();
              if (window.confirm(translate('Are you sure you want to submit this Purchase Order for approval?'))) {
                try {
                  // Use fetch directly to avoid /create suffix
                  const response = await fetch('http://localhost:8888/api/procurement/purchase-order/submit', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ id: record._id || record.id })
                  });
                  const data = await response.json();
                  if (data.success) {
                    window.location.reload();
                  } else {
                    alert(data.message || translate('Failed to submit Purchase Order'));
                  }
                } catch (err) {
                  alert(err.message || translate('An error occurred'));
                }
              }
            }}
            style={{ cursor: 'pointer', color: '#1677ff' }}
          >
            {translate('Submit for Approval')}
          </span>
        )
      });
    }

    if (record.status === 'approved') {
      actions.push({
        key: 'issue',
        icon: <ShopOutlined />,
        label: <Link to={`/purchase-order/issue/${record._id || record.id}`}>{translate('Issue to Supplier')}</Link>
      });
    }

    if (record.status === 'issued') {
      actions.push({
        key: 'receive',
        icon: <ShoppingCartOutlined />,
        label: <Link to={`/purchase-order/receive/${record._id || record.id}`}>{translate('Receive Goods')}</Link>
      });
    }

    return actions;
  };
  
  const columns = [
    {
      title: translate('PO Number'),
      dataIndex: 'poNumber',
      key: 'poNumber',
      sorter: (a, b) => (a.poNumber || '').localeCompare(b.poNumber || ''),
      render: (text, record) => (
        <Link to={`/purchase-order/read/${record._id || record.id}`}>
          {text || '-'}
        </Link>
      ),
    },
    {
      title: translate('Supplier'),
      dataIndex: ['supplier', 'legalName'],
      key: 'supplier',
      sorter: (a, b) => (a.supplier?.legalName || '').localeCompare(b.supplier?.legalName || ''),
      render: (text, record) => text || record.supplier?.legalName || record.supplier?.name || record.supplierId || 'Not Assigned',
    },
    {
      title: translate('Date'),
      dataIndex: 'date',
      key: 'date',      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD') : '-',
    },
    {
      title: translate('Amount'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (text) => text ? `$${parseFloat(text).toFixed(2)}` : '-',
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {translate(status?.toUpperCase() || 'DRAFT')}
        </Tag>
      ),
    },
    {
      title: translate('Department'),
      dataIndex: 'department',
      key: 'department',
      render: (text) => text || '-',
    },
    {
      title: translate('Actions'),
      key: 'actions',      render: (_, record) => (
        <Dropdown menu={{ items: getActions(record) }} trigger={['click']}>
          <Button size="small" onClick={(e) => e.preventDefault()}>
            {translate('Actions')} <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];
  
  if (error) {
    return <Alert message={error} type="error" />;
  }
  
  return (
    <div className="purchase-order-list">
      <Card 
        title={
          <Space>
            <ShoppingCartOutlined />
            <span>{translate('Purchase Orders')}</span>
          </Space>
        }
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => window.location.href = '/purchase-order/create'}
            >
              {translate('Create New')}
            </Button>
            <Button 
              type="default" 
              icon={<CheckOutlined />} 
              onClick={() => window.location.href = '/purchase-order/approval'}
            >
              {translate('Approvals')}
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input 
            placeholder={translate('Search purchase orders...')}
            onChange={(e) => handleSearch(e.target.value)}
            prefix={<SearchOutlined />}
          />
          
          <Spin spinning={loading}>
            <Table 
              columns={columns} 
              dataSource={filteredPOs.map(po => ({ ...po, key: po._id || po.id }))} 
              pagination={{ pageSize: 10 }}
              bordered
            />
          </Spin>
        </Space>
      </Card>
    </div>
  );
}

export default PurchaseOrder;
