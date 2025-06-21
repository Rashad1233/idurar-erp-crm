import React, { useEffect, useState } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  Tag, 
  Button, 
  Spin, 
  Tabs,
  Space,
  Tooltip,
  Progress
} from 'antd';
import { 
  FileTextOutlined, 
  ShoppingOutlined, 
  FileSearchOutlined, 
  FileProtectOutlined,
  BellOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs';

import procurementService from '@/services/procurementService';

// Removed TabPane import - using items prop instead

export default function ProcurementDashboard() {
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [prData, setPrData] = useState([]);
  const [rfqData, setRfqData] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  
  // Stats
  const [stats, setStats] = useState({
    totalPRs: 0,
    pendingPRs: 0,
    approvedPRs: 0,
    totalRFQs: 0,
    pendingRFQs: 0,
    completedRFQs: 0,
    pendingApprovalCount: 0
  });
  
  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch all PRs
      const prResult = await procurementService.getPurchaseRequisitions();
      if (prResult.success) {
        setPrData(prResult.data || []);
        
        // Calculate PR stats
        const totalPRs = prResult.data?.length || 0;
        const pendingPRs = prResult.data?.filter(pr => ['draft', 'submitted', 'partially_approved'].includes(pr.status))?.length || 0;
        const approvedPRs = prResult.data?.filter(pr => pr.status === 'approved')?.length || 0;
        
        setStats(prev => ({
          ...prev,
          totalPRs,
          pendingPRs,
          approvedPRs
        }));
      }
      
      // Fetch all RFQs
      const rfqResult = await procurementService.getRFQs();
      if (rfqResult.success) {
        setRfqData(rfqResult.data || []);
        
        // Calculate RFQ stats
        const totalRFQs = rfqResult.data?.length || 0;
        const pendingRFQs = rfqResult.data?.filter(rfq => ['draft', 'sent', 'in_progress'].includes(rfq.status))?.length || 0;
        const completedRFQs = rfqResult.data?.filter(rfq => rfq.status === 'completed')?.length || 0;
        
        setStats(prev => ({
          ...prev,
          totalRFQs,
          pendingRFQs,
          completedRFQs
        }));
      }
      
      // Fetch pending approvals
      const approvalResult = await procurementService.getPendingApprovals();
      if (approvalResult.success) {
        setPendingApprovals(approvalResult.data || []);
        setStats(prev => ({
          ...prev,
          pendingApprovalCount: approvalResult.data?.length || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  // Render PR status tag
  const renderPRStatus = (status) => {
    const statusConfig = {
      draft: { color: 'default', text: 'Draft' },
      submitted: { color: 'processing', text: 'Submitted' },
      partially_approved: { color: 'warning', text: 'Partially Approved' },
      approved: { color: 'success', text: 'Approved' },
      rejected: { color: 'error', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    
    return <Tag color={config.color}>{config.text}</Tag>;
  };
  
  // Render RFQ status tag
  const renderRFQStatus = (status) => {
    const statusConfig = {
      draft: { color: 'default', text: 'Draft' },
      sent: { color: 'processing', text: 'Sent' },
      in_progress: { color: 'warning', text: 'In Progress' },
      completed: { color: 'success', text: 'Completed' },
      cancelled: { color: 'error', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    
    return <Tag color={config.color}>{config.text}</Tag>;
  };
  
  // PR columns
  const prColumns = [
    {
      title: 'PR Number',
      dataIndex: 'prNumber',
      key: 'prNumber',
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => history.push(`/procurement/purchase-requisition/${record.id}`)}
        >
          {text}
        </Button>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: renderPRStatus
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => dayjs(text).format('YYYY-MM-DD')
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (text, record) => (
        <span>
          {record.currency || 'USD'} {text.toFixed(2)}
        </span>
      )
    }
  ];
  
  // RFQ columns
  const rfqColumns = [
    {
      title: 'RFQ Number',
      dataIndex: 'rfqNumber',
      key: 'rfqNumber',
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => history.push(`/procurement/rfq/${record.id}`)}
        >
          {text}
        </Button>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: renderRFQStatus
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => dayjs(text).format('YYYY-MM-DD')
    },
    {
      title: 'Response Deadline',
      dataIndex: 'responseDeadline',
      key: 'responseDeadline',
      render: (text) => dayjs(text).format('YYYY-MM-DD')
    }
  ];
  
  // Approval columns
  const approvalColumns = [
    {
      title: 'PR Number',
      dataIndex: 'prNumber',
      key: 'prNumber',
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => history.push(`/procurement/purchase-requisition/${record.id}`)}
        >
          {text}
        </Button>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Requestor',
      dataIndex: ['requestor', 'name'],
      key: 'requestor',
      render: (text, record) => record.requestor?.name || '-'
    },
    {
      title: 'Submitted At',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (text) => dayjs(text).format('YYYY-MM-DD')
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (text, record) => (
        <span>
          {record.currency || 'USD'} {text.toFixed(2)}
        </span>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            onClick={() => history.push(`/procurement/purchase-requisition/${record.id}/approve`)}
          >
            Review
          </Button>
        </Space>
      )
    }
  ];
  
  return (
    <Spin spinning={isLoading}>
      <div className="procurement-dashboard">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card>
              <h2>Procurement Dashboard</h2>
              <p>Overview of all procurement activities including Purchase Requisitions and RFQs</p>
            </Card>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Purchase Requisitions"
                value={stats.totalPRs}
                prefix={<FileTextOutlined />}
                suffix={
                  <Tooltip title="View all PRs">
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => history.push('/procurement/purchase-requisition')}
                    >
                      View All
                    </Button>
                  </Tooltip>
                }
              />
              <Progress 
                percent={stats.totalPRs > 0 ? Math.round((stats.approvedPRs / stats.totalPRs) * 100) : 0} 
                size="small" 
                status="active" 
              />
              <Row gutter={8} style={{ marginTop: 8 }}>
                <Col span={12}>
                  <Statistic 
                    title="Pending" 
                    value={stats.pendingPRs} 
                    valueStyle={{ fontSize: '16px', color: '#faad14' }} 
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="Approved" 
                    value={stats.approvedPRs} 
                    valueStyle={{ fontSize: '16px', color: '#52c41a' }} 
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          
          <Col span={8}>
            <Card>
              <Statistic
                title="Requests for Quotation"
                value={stats.totalRFQs}
                prefix={<ShoppingOutlined />}
                suffix={
                  <Tooltip title="View all RFQs">
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => history.push('/procurement/rfq')}
                    >
                      View All
                    </Button>
                  </Tooltip>
                }
              />
              <Progress 
                percent={stats.totalRFQs > 0 ? Math.round((stats.completedRFQs / stats.totalRFQs) * 100) : 0} 
                size="small" 
                status="active" 
              />
              <Row gutter={8} style={{ marginTop: 8 }}>
                <Col span={12}>
                  <Statistic 
                    title="Pending" 
                    value={stats.pendingRFQs} 
                    valueStyle={{ fontSize: '16px', color: '#faad14' }} 
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="Completed" 
                    value={stats.completedRFQs} 
                    valueStyle={{ fontSize: '16px', color: '#52c41a' }} 
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          
          <Col span={8}>
            <Card>
              <Statistic
                title="Pending Approvals"
                value={stats.pendingApprovalCount}
                prefix={<BellOutlined />}
                valueStyle={{ color: stats.pendingApprovalCount > 0 ? '#faad14' : '#52c41a' }}
              />
              <div style={{ marginTop: 16 }}>
                {stats.pendingApprovalCount > 0 ? (
                  <Button 
                    type="primary" 
                    onClick={() => history.push('/procurement/approvals')}
                  >
                    Review Pending Approvals
                  </Button>
                ) : (
                  <Tag color="success">No pending approvals</Tag>
                )}
              </div>
            </Card>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card>              <Tabs 
                defaultActiveKey="1"
                items={[
                  {
                    key: "1",
                    label: (
                      <span>
                        <FileTextOutlined />
                        Recent Purchase Requisitions
                      </span>
                    ),
                    children: (
                      <>
                        <Table
                          columns={prColumns}
                          dataSource={prData.slice(0, 5)} // Show only latest 5
                          rowKey="id"
                          pagination={false}
                        />
                        
                        <div style={{ marginTop: 16, textAlign: 'center' }}>
                          <Button 
                            type="primary" 
                            onClick={() => history.push('/procurement/purchase-requisition')}
                          >
                            View All Purchase Requisitions
                          </Button>
                        </div>
                      </>
                    )
                  },
                  {
                    key: "2",
                    label: (
                      <span>
                        <FileSearchOutlined />
                        Recent RFQs
                      </span>
                    ),
                    children: (
                      <>
                        <Table
                          columns={rfqColumns}
                          dataSource={rfqData.slice(0, 5)} // Show only latest 5
                          rowKey="id"
                          pagination={false}
                        />
                        
                        <div style={{ marginTop: 16, textAlign: 'center' }}>
                          <Button 
                            type="primary" 
                            onClick={() => history.push('/procurement/rfq')}
                          >
                            View All RFQs
                          </Button>
                        </div>
                      </>
                    )
                  },
                  {
                    key: "3",
                    label: (
                      <span>
                        <FileProtectOutlined />
                        Pending Approvals
                      </span>
                    ),
                    children: (
                      pendingApprovals.length > 0 ? (
                        <Table
                          columns={approvalColumns}
                          dataSource={pendingApprovals}
                          rowKey="id"
                          pagination={false}
                        />
                      ) : (
                        <div style={{ padding: 24, textAlign: 'center' }}>
                          <InboxOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                          <p>No pending approvals</p>
                        </div>
                      )
                    )
                  }
                ]}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
}
