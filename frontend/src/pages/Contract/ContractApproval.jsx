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
  FileProtectOutlined
} from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/auth/selectors';

const { TextArea } = Input;

function ContractApproval() {
  const translate = useLanguage();
  const currentUser = useSelector(selectCurrentUser);
  
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states for approval/rejection
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState('approve'); // 'approve' or 'reject'
  const [currentContract, setCurrentContract] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  
  const [form] = Form.useForm();
  
  // Load contracts that need approval
  const loadData = () => {
    setLoading(true);
    setError(null);
    
    // Fetch contracts that require current user's approval
    request.list({ 
      entity: 'contract', 
      options: {
        filter: {
          approver: currentUser._id,
          status: ['pending_approval']
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
        // Fetch contracts that were already approved/rejected by current user
        request.list({ 
          entity: 'contract', 
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
    setCurrentContract(record);
    setModalAction(action);
    setModalVisible(true);
    form.resetFields();
  };
  
  const handleModalCancel = () => {
    setModalVisible(false);
    setCurrentContract(null);
  };
  
  const handleApprovalAction = async (values) => {
    if (!currentContract) return;
    
    setActionInProgress(true);
    try {
      const action = {
        entity: 'contract',
        id: currentContract._id,
        action: modalAction,
        data: {
          comments: values.comments || '',
          approver: currentUser._id,
          approverName: `${currentUser.name}`,
          date: new Date().toISOString()
        }
      };
      
      const result = await request.create({ 
        entity: 'contract-approval',
        jsonData: action
      });
      
      if (result.success) {
        message.success(`Contract ${currentContract.number} ${modalAction === 'approve' ? 'approved' : 'rejected'} successfully`);
        setModalVisible(false);
        loadData(); // Refresh data
      } else {
        throw new Error(result.message || `Failed to ${modalAction} contract`);
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
      title: translate('Contract Number'),
      dataIndex: 'number',
      key: 'number',
      render: (text, record) => (
        <Link to={`/contract/read/${record._id}`}>{text}</Link>
      ),
    },
    {
      title: translate('Contract Name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: translate('Supplier'),
      dataIndex: 'supplier',
      key: 'supplier',
      render: (supplier) => supplier?.name || '-',
    },
    {
      title: translate('Start Date'),
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: translate('End Date'),
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: translate('Contract Value'),
      dataIndex: 'value',
      key: 'value',
      render: (value, record) => `${record.currency || 'USD'} ${value?.toFixed(2) || '0.00'}`,
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
              onClick={() => window.location.href = `/contract/read/${record._id}`}
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
      title: translate('Contract Number'),
      dataIndex: 'number',
      key: 'number',
      render: (text, record) => (
        <Link to={`/contract/read/${record._id}`}>{text}</Link>
      ),
    },
    {
      title: translate('Contract Name'),
      dataIndex: 'name',
      key: 'name',
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
          case 'active':
            color = 'green';
            break;
          case 'rejected':
            color = 'error';
            break;
          default:
            color = 'default';
        }
        return <Tag color={color}>{translate(status?.replace(/_/g, ' ')?.toUpperCase() || 'UNKNOWN')}</Tag>;
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
          onClick={() => window.location.href = `/contract/read/${record._id}`}
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
        <h1>
          <FileProtectOutlined /> {translate('Contract Approvals')}
        </h1>
      </div>
        <Tabs 
        defaultActiveKey="pending"
        items={[
          {
            key: 'pending',
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
                    description={translate('No contracts pending your approval')}
                  />
                )}
              </Card>
            ),
          },
          {
            key: 'history',
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
            ),
          },
        ]}
      />
      
      {/* Approval/Rejection Modal */}
      <Modal
        title={modalAction === 'approve' 
          ? translate('Approve Contract') 
          : translate('Reject Contract')
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
                  <strong>{translate('Contract Number')}:</strong> {currentContract?.number}
                </p>
                <p>
                  <strong>{translate('Contract Name')}:</strong> {currentContract?.name || '-'}
                </p>
                <p>
                  <strong>{translate('Supplier')}:</strong> {currentContract?.supplier?.name || '-'}
                </p>
                <p>
                  <strong>{translate('Contract Value')}:</strong> {currentContract?.currency || 'USD'} {currentContract?.value?.toFixed(2) || '0.00'}
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

export default ContractApproval;
