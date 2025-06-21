import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Tabs, 
  Alert, 
  Spin, 
  Badge,
  Empty
} from 'antd';
import {
  CheckOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  InboxOutlined
} from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/auth/selectors';

// Removed TabPane import - using items prop instead

function PurchaseRequisitionApproval() {
  const translate = useLanguage();
  const currentUser = useSelector(selectCurrentUser);
  
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load purchase requisitions that need approval
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Fetch PRs that require current user's approval
    request.list({ 
      entity: 'purchase-requisition', 
      options: {
        filter: {
          approver: currentUser._id,
          status: ['pending_approval', 'partially_approved']
        }
      }
    })
      .then(response => {
        setPendingApprovals(response.result || []);
      })
      .catch(err => {
        setError(err.message || 'Error loading pending approvals');
      })
      .finally(() => {
        setLoading(false);
      });
      
    // Fetch PRs that were already approved/rejected by current user
    request.list({ 
      entity: 'purchase-requisition', 
      options: {
        filter: {
          'approvals.approver': currentUser._id,
          'approvals.status': ['approved', 'rejected']
        }
      }
    })
      .then(response => {
        setApprovalHistory(response.result || []);
      })
      .catch(err => {
        console.error('Error loading approval history:', err);
        // Don't set error here to avoid blocking the UI
      });
  }, [currentUser._id]);
  
  // Define columns for pending approvals table
  const pendingColumns = [
    {
      title: translate('PR Number'),
      dataIndex: 'number',
      key: 'number',
      render: (text, record) => (
        <Link to={`/purchase-requisition/read/${record._id}`}>{text}</Link>
      ),
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: translate('Requester'),
      dataIndex: 'createdBy',
      key: 'createdBy',
    },
    {
      title: translate('Cost Center'),
      dataIndex: 'costCenter',
      key: 'costCenter',
    },
    {
      title: translate('Total Value'),
      dataIndex: 'totalValue',
      key: 'totalValue',
      render: (value, record) => `${record.currency || 'USD'} ${value?.toFixed(2) || '0.00'}`,
    },
    {
      title: translate('Date Submitted'),
      dataIndex: 'dateSubmitted',
      key: 'dateSubmitted',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: translate('Approval Level'),
      dataIndex: 'currentApprovalLevel',
      key: 'currentApprovalLevel',
    },
    {
      title: translate('Actions'),
      key: 'actions',      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => window.location.href = `/purchase-requisition/read/${record._id}`}
          />
          <Button
            type="primary"
            icon={<CheckOutlined />}
            size="small"
            onClick={() => window.location.href = `/purchase-requisition/read/${record._id}`}
          />
        </div>
      ),
    },
  ];
  
  // Define columns for approval history table
  const historyColumns = [
    {
      title: translate('PR Number'),
      dataIndex: 'number',
      key: 'number',
      render: (text, record) => (
        <Link to={`/purchase-requisition/read/${record._id}`}>{text}</Link>
      ),
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        switch (status) {
          case 'approved':
            color = 'success';
            break;
          case 'rejected':
            color = 'error';
            break;
          case 'partially_approved':
            color = 'warning';
            break;
          default:
            color = 'default';
        }
        return <Tag color={color}>{translate(status.replace(/_/g, ' ').toUpperCase())}</Tag>;
      },
    },
    {
      title: translate('Your Decision'),
      dataIndex: 'yourDecision',
      key: 'yourDecision',
      render: (_, record) => {
        const yourApproval = record.approvals?.find(a => a.approver === currentUser._id);
        if (!yourApproval) return '-';
        
        return (
          <Tag color={yourApproval.status === 'approved' ? 'success' : 'error'}>
            {translate(yourApproval.status.toUpperCase())}
          </Tag>
        );
      },
    },
    {
      title: translate('Date of Decision'),
      dataIndex: 'decisionDate',
      key: 'decisionDate',
      render: (_, record) => {
        const yourApproval = record.approvals?.find(a => a.approver === currentUser._id);
        if (!yourApproval || !yourApproval.actionDate) return '-';
        
        return new Date(yourApproval.actionDate).toLocaleString();
      },
    },
    {
      title: translate('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => window.location.href = `/purchase-requisition/read/${record._id}`}
        >
          {translate('View')}
        </Button>
      ),
    },
  ];
  
  if (error) {
    return <Alert message={translate('Error')} description={error} type="error" />;
  }
  
  return (
    <div className="container">
      <div className="page-header">
        <h1>{translate('Purchase Requisition Approvals')}</h1>
      </div>
        <Tabs 
        defaultActiveKey="pending"
        items={[
          {
            key: "pending",
            label: (
              <span>
                <Badge count={pendingApprovals.length} size="small">
                  <ClockCircleOutlined /> {translate('Pending My Approval')}
                </Badge>
              </span>
            ),
            children: (
              <Card>
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                    <Spin size="large" />
                  </div>
                ) : pendingApprovals.length > 0 ? (
                  <Table 
                    dataSource={pendingApprovals} 
                    columns={pendingColumns} 
                    rowKey="_id"
                  />
                ) : (
                  <Empty
                    image={<InboxOutlined style={{ fontSize: 48 }} />}
                    description={translate('No purchase requisitions pending your approval')}
                  />
                )}
              </Card>
            )
          },
          {
            key: "history",
            label: (
              <span>
                <CheckOutlined /> {translate('My Approval History')}
              </span>
            ),
            children: (
              <Card>
                {approvalHistory.length > 0 ? (
                  <Table 
                    dataSource={approvalHistory} 
                    columns={historyColumns} 
                    rowKey="_id"
                  />
                ) : (
                  <Empty
                    image={<InboxOutlined style={{ fontSize: 48 }} />}
                    description={translate('No approval history found')}
                  />
                )}
              </Card>
            )
          }
        ]}
      />
    </div>
  );
}

export default PurchaseRequisitionApproval;
