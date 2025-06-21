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
  Tooltip, 
  Badge,
  Empty,
  Modal,
  Form,
  Input,
  Space,
  message
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  InboxOutlined,
  DollarOutlined,
  FileTextOutlined
} from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/auth/selectors';

// Removed TabPane import - using items prop instead
const { TextArea } = Input;

function PurchaseOrderApproval() {
  const translate = useLanguage();
  const currentUser = useSelector(selectCurrentUser);
  
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states for approval/rejection
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState('approve'); // 'approve' or 'reject'
  const [currentPO, setCurrentPO] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  
  const [form] = Form.useForm();
  
  // Load purchase orders that need approval
  const loadData = () => {
    setLoading(true);
    setError(null);
    
    // Fetch POs that require current user's approval
    request.list({ 
      entity: 'purchase-order', 
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
        // Continue with fetching history regardless of previous request success
        // Fetch POs that were already approved/rejected by current user
        request.list({ 
          entity: 'purchase-order', 
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
          })
          .finally(() => {
            setLoading(false);
          });
      });
  };
  
  useEffect(() => {
    loadData();
  }, [currentUser._id]);
  
  // Handle approval action
  const showApprovalModal = (record, action) => {
    setCurrentPO(record);
    setModalAction(action);
    setModalVisible(true);
    form.resetFields();
  };
  
  const handleModalCancel = () => {
    setModalVisible(false);
    setCurrentPO(null);
  };
  
  const handleApprovalAction = async (values) => {
    if (!currentPO) return;
    
    setActionInProgress(true);
    try {
      const action = {
        entity: 'purchase-order',
        id: currentPO._id,
        action: modalAction,
        data: {
          comments: values.comments || '',
          approver: currentUser._id,
          approverName: `${currentUser.name}`,
          date: new Date().toISOString()
        }
      };
      
      const result = await request.create({ 
        entity: 'purchase-order-approval',
        jsonData: action
      });
      
      if (result.success) {
        message.success(`Purchase Order ${currentPO.number} ${modalAction === 'approve' ? 'approved' : 'rejected'} successfully`);
        setModalVisible(false);
        loadData(); // Refresh data
      } else {
        throw new Error(result.message || `Failed to ${modalAction} purchase order`);
      }
    } catch (err) {
      message.error(err.message || `Error processing ${modalAction} action`);
    } finally {
      setActionInProgress(false);
    }
  };
  
  // Define columns for pending approvals table
  const pendingColumns = [
    {
      title: translate('PO Number'),
      dataIndex: 'number',
      key: 'number',
      render: (text, record) => (
        <Link to={`/purchase-order/read/${record._id}`}>{text}</Link>
      ),
    },
    {
      title: translate('Supplier'),
      dataIndex: 'supplier',
      key: 'supplier',
      render: (supplier) => supplier?.name || '-',
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: translate('Total Value'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (value, record) => `${record.currency || 'USD'} ${value?.toFixed(2) || '0.00'}`,
    },
    {
      title: translate('Date Submitted'),
      dataIndex: 'date',
      key: 'date',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: translate('Approval Level'),
      dataIndex: 'currentApprovalLevel',
      key: 'currentApprovalLevel',
      render: (_, record) => {
        const approvalLevel = record.approvalWorkflow?.currentLevel || 1;
        const totalLevels = record.approvalWorkflow?.totalLevels || 1;
        return `${approvalLevel} of ${totalLevels}`;
      },
    },
    {
      title: translate('Actions'),
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Tooltip title={translate('View Details')}>
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => window.location.href = `/purchase-order/read/${record._id}`}
            />
          </Tooltip>
          <Tooltip title={translate('Approve')}>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              size="small"
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              onClick={() => showApprovalModal(record, 'approve')}
            />
          </Tooltip>
          <Tooltip title={translate('Reject')}>
            <Button
              type="primary"
              danger
              icon={<CloseOutlined />}
              size="small"
              onClick={() => showApprovalModal(record, 'reject')}
            />
          </Tooltip>
        </div>
      ),
    },
  ];
  
  // Define columns for approval history table
  const historyColumns = [
    {
      title: translate('PO Number'),
      dataIndex: 'number',
      key: 'number',
      render: (text, record) => (
        <Link to={`/purchase-order/read/${record._id}`}>{text}</Link>
      ),
    },
    {
      title: translate('Supplier'),
      dataIndex: 'supplier',
      key: 'supplier',
      render: (supplier) => supplier?.name || '-',
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
          onClick={() => window.location.href = `/purchase-order/read/${record._id}`}
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
        <h1>{translate('Purchase Order Approvals')}</h1>
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
                    description={translate('No purchase orders pending your approval')}
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
      
      {/* Approval/Rejection Modal */}
      <Modal
        title={modalAction === 'approve' 
          ? translate('Approve Purchase Order') 
          : translate('Reject Purchase Order')
        }
        visible={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        destroyOnClose
      >
        <Form 
          form={form}
          layout="vertical"
          onFinish={handleApprovalAction}
        >
          <Alert
            message={
              <div>
                <p>
                  <strong>{translate('PO Number')}:</strong> {currentPO?.number}
                </p>
                <p>
                  <strong>{translate('Supplier')}:</strong> {currentPO?.supplier?.name || '-'}
                </p>
                <p>
                  <strong>{translate('Total Amount')}:</strong> {currentPO?.currency || 'USD'} {currentPO?.totalAmount?.toFixed(2) || '0.00'}
                </p>
              </div>
            }
            type={modalAction === 'approve' ? 'info' : 'warning'}
            style={{ marginBottom: 16 }}
          />
          
          <Form.Item
            name="comments"
            label={translate('Comments')}
            rules={[
              { 
                required: modalAction === 'reject', 
                message: translate('Please provide a reason for rejection') 
              }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder={
                modalAction === 'approve'
                  ? translate('Optional comments for this approval')
                  : translate('Please specify the reason for rejection')
              }
            />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleModalCancel}>
                {translate('Cancel')}
              </Button>
              <Button 
                type="primary"
                htmlType="submit"
                loading={actionInProgress}
                style={
                  modalAction === 'approve' 
                    ? { backgroundColor: '#52c41a', borderColor: '#52c41a' } 
                    : {}
                }
                danger={modalAction === 'reject'}
                icon={modalAction === 'approve' ? <CheckOutlined /> : <CloseOutlined />}
              >
                {translate(modalAction === 'approve' ? 'Approve' : 'Reject')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default PurchaseOrderApproval;
