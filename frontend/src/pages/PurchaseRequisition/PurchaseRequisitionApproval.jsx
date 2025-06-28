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
  Empty,
  message,
  Modal,
  Form,
  Input,
  Radio,
  Drawer,
  Descriptions,
  List,
  Space,
  App
} from 'antd';
import {
  CheckOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  InboxOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  FileProtectOutlined
} from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/auth/selectors';
import apiClient from '@/api/axiosConfig';

import { ErpLayout } from '@/layout';
import { Typography, Row, Col } from 'antd';

const { Title, Text } = Typography;

export default function PurchaseRequisitionApproval() {
  const translate = useLanguage();
  const currentUser = useSelector(selectCurrentUser);
  const { message: messageApi } = App.useApp();
  
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  
  // Rejection modal state
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedPR, setSelectedPR] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();

  // PR Details drawer state
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedPRDetail, setSelectedPRDetail] = useState(null);

  // Approval modal state
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);

  // Load pending approvals
  const loadPendingApprovals = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/procurement/purchase-requisition/pending-approvals');
      
      // Fix: Extract the data array from the response
      const approvals = response.data?.data || [];
      setPendingApprovals(approvals);
      
      // Load approval history - only approved and rejected
      const historyResponse = await apiClient.get('/procurement/purchase-requisition', {
        params: { status: 'approved,rejected' }
      });
      
      if (historyResponse.data && historyResponse.data.success) {
        // Filter out draft and submitted PRs from approval history
        const filteredHistory = (historyResponse.data.data || []).filter(
          pr => pr.status === 'approved' || pr.status === 'rejected'
        );
        setApprovalHistory(filteredHistory);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading approvals:', err);
      setError(err.message || 'Failed to load pending approvals');
      messageApi.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    loadPendingApprovals();
  }, []);

  // Handle PR approval
  const handleApprove = async (id) => {
    setSelectedPR({ id });
    setApprovalModalVisible(true);
  };

  // Handle approval submission
  const handleApproveSubmit = async (values) => {
    if (!selectedPR) return;
    
    setConfirmLoading(true);
    try {      await apiClient.put(`/procurement/purchase-requisition/${selectedPR.id}/approve`, {
        action: 'approve',
        approverId: currentUser.id,
        sendNotification: true
      });
      messageApi.success('Purchase Requisition approved successfully');
      setApprovalModalVisible(false);
      loadPendingApprovals(); // Refresh the list
    } catch (error) {
      console.error('Error approving PR:', error);
      messageApi.error('Failed to approve Purchase Requisition');
    } finally {
      setConfirmLoading(false);
    }
  };

  // Show rejection modal
  const showRejectModal = (record) => {
    setSelectedPR(record);
    setRejectModalVisible(true);
    form.resetFields();
  };

  // Handle form submission for rejection
  const handleRejectSubmit = async (values) => {
    if (!selectedPR) return;
    
    setConfirmLoading(true);
    try {      await apiClient.put(`/procurement/purchase-requisition/${selectedPR.id}/approve`, {
        action: 'reject',
        rejectionType: values.rejectionType,
        comments: values.reason, // Changed from rejectionReason to comments to match backend
        approverId: currentUser.id,
        sendNotification: true
      });
      
      if (values.rejectionType === 'permanent') {
        messageApi.success('Purchase Requisition permanently rejected');
      } else {
        messageApi.success('Purchase Requisition returned for edits');
      }
      
      setRejectModalVisible(false);
      loadPendingApprovals(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting PR:', error);
      messageApi.error('Failed to reject Purchase Requisition');
    } finally {
      setConfirmLoading(false);
    }
  };

  // Function to open drawer with PR details
  const showPRDetails = (record) => {
    setSelectedPRDetail(record);
    setDetailDrawerVisible(true);
  };



  // Table columns
  const columns = [
    {
      title: translate('PR Number'),
      dataIndex: 'prNumber',
      key: 'prNumber',
      render: (text, record) => (
        <Button type="link" onClick={() => showPRDetails(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: translate('Total Amount'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (text, record) => (
        <span>
          {text} {record.currency || 'USD'}
        </span>
      ),
    },
    {
      title: translate('Requestor'),
      dataIndex: ['requestor', 'name'],
      key: 'requestor',
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'blue';
        if (status === 'approved') color = 'green';
        if (status === 'rejected') color = 'red';
        if (status === 'draft') color = 'gray';
        
        return (
          <Tag color={color}>
            {status.toUpperCase().replace('_', ' ')}
          </Tag>
        );
      },
    },
    {
      title: translate('Submitted At'),
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: translate('Actions'),
      key: 'action',      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            icon={<EyeOutlined />} 
            size="small"
            title={translate('View Details')}
            onClick={() => showPRDetails(record)}
          />
          <Button
            type="primary"
            icon={<CheckOutlined />}
            size="small"
            title={translate('Approve')}
            onClick={() => handleApprove(record.id)}
            loading={actionInProgress}
          />
          <Button
            danger
            icon={<CloseOutlined />}
            size="small"
            title={translate('Reject')}
            onClick={() => showRejectModal(record)}
            loading={actionInProgress}
          />
        </div>
      ),
    },
  ];

  // Define columns for contract approvals
  const contractColumns = [
    {
      title: translate('Contract Number'),
      dataIndex: 'contractNumber',
      key: 'contractNumber',
      render: (text, record) => (
        <Button type="link" onClick={() => showContractDetails(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: translate('Contract Name'),
      dataIndex: 'contractName',
      key: 'contractName',
    },
    {
      title: translate('Supplier'),
      dataIndex: ['supplier', 'legalName'],
      key: 'supplier',
    },
    {
      title: translate('Total Value'),
      dataIndex: 'totalValue',
      key: 'totalValue',
      render: (text, record) => (
        <span>
          {text} {record.currency || 'USD'}
        </span>
      ),
    },
    {
      title: translate('Start Date'),
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: translate('End Date'),
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'orange';
        if (status === 'pending_approval') color = 'orange';
        return <Tag color={color}>{translate(status.replace(/_/g, ' ').toUpperCase())}</Tag>;
      },
    },
    {
      title: translate('Actions'),
      key: 'actions',
      render: (_, record) => (
        <div>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            size="small"
            onClick={() => handleContractApprove(record.id)}
            loading={actionInProgress}
            style={{ marginRight: 8 }}
          >
            {translate('Approve')}
          </Button>
          <Button
            type="primary"
            danger
            icon={<CloseOutlined />}
            size="small"
            onClick={() => handleContractReject(record)}
            loading={actionInProgress}
          >
            {translate('Reject')}
          </Button>
        </div>
      ),
    },
  ];

  // Function to show contract details (can be implemented later)
  const showContractDetails = (contract) => {
    // For now, just show a message
    message.info(`Contract details for ${contract.contractNumber} - Feature coming soon!`);
  };

  // Define columns for approval history table
  const historyColumns = [
    {
      title: translate('PR Number'),
      dataIndex: 'prNumber',
      key: 'prNumber',
      render: (text, record) => (
        <Link to={`/purchase-requisition/view/${record.id}`}>
          {text}
        </Link>
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
      title: translate('Date of Decision'),
      dataIndex: 'approvedAt',
      key: 'approvedAt',
      render: (date, record) => {
        const actionDate = date || record.rejectedAt;
        return actionDate ? new Date(actionDate).toLocaleString() : '-';
      },
    },
    {
      title: translate('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Link to={`/purchase-requisition/view/${record.id}`}>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
          >
            {translate('View')}
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <>
      {/* Main component JSX */}
      <ErpLayout>
        <div style={{ padding: '24px' }}>
          {/* Header */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <Title level={3} style={{ margin: 0 }}>
                <CheckOutlined /> Procurement Review Dashboard
              </Title>
              <Text type="secondary">
                Review and approve pending Purchase Requisitions
              </Text>
            </Col>
            <Col>
              <Space>
                <Badge count={pendingApprovals.length} offset={[10, 0]}>
                  <Button icon={<ClockCircleOutlined />}>
                    {translate('Pending PRs')}
                  </Button>
                </Badge>
              </Space>
            </Col>
          </Row>
          
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
                  ) : error ? (
                    <Alert
                      message="Error"
                      description={error}
                      type="error"
                      showIcon
                    />                  ) : pendingApprovals.length === 0 ? (
                    <Empty
                      image={<InboxOutlined style={{ fontSize: 48 }} />}
                      description={translate('No pending Purchase Requisitions found')}
                    />
                  ) : (
                    <div style={{ width: '100%', overflowX: 'auto' }}>
                      <Table
                        dataSource={pendingApprovals}
                        columns={columns}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 'max-content' }}
                        size="middle"
                      />
                    </div>
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
                  {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                      <Spin size="large" />
                    </div>                  ) : approvalHistory.length > 0 ? (
                    <div style={{ width: '100%', overflowX: 'auto' }}>
                      <Table 
                        dataSource={approvalHistory} 
                        columns={historyColumns} 
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 'max-content' }}
                        size="middle"
                      />
                    </div>
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
      </ErpLayout>

      {/* Rejection Modal */}
      <Modal
        title={
          <div>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
            {translate('Reject Purchase Requisition')}
          </div>
        }
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        footer={null}
        maskClosable={false}
      >
        <Form form={form} onFinish={handleRejectSubmit} layout="vertical">
          <p>{translate('You are about to reject PR')}: <strong>{selectedPR?.prNumber}</strong></p>
          
          <Form.Item
            name="rejectionType"
            label={translate('Rejection Type')}
            initialValue="edit"
            rules={[{ required: true, message: translate('Please select a rejection type') }]}
          >
            <Radio.Group>
              <Radio value="edit">
                <span style={{ fontWeight: 500 }}>{translate('Return for Edits')}</span>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {translate('Allow requestor to make changes and resubmit')}
                </div>
              </Radio>
              <Radio value="permanent">
                <span style={{ fontWeight: 500 }}>{translate('Permanent Rejection')}</span>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {translate('Cannot be resubmitted, requestor must create a new PR')}
                </div>
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="reason"
            label={translate('Rejection Reason')}
            rules={[
              { required: true, message: translate('Please provide a reason for rejection') },
              { min: 10, message: translate('Reason must be at least 10 characters') }
            ]}
          >
            <Input.TextArea 
              rows={4}
              placeholder={translate('Please explain why this PR is being rejected...')}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'end', gap: '8px' }}>
            <Button onClick={() => setRejectModalVisible(false)}>
              {translate('Cancel')}
            </Button>
            <Button type="primary" danger htmlType="submit" loading={confirmLoading}>
              {translate('Confirm Rejection')}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Approval Reason Modal */}
      <Modal
        title={
          <div>
            <CheckOutlined style={{ color: '#52c41a', marginRight: 8 }} />
            {translate('Approve Purchase Requisition')}
          </div>
        }
        open={approvalModalVisible}
        onCancel={() => setApprovalModalVisible(false)}
        footer={null}
        maskClosable={false}
      >        <Form onFinish={handleApproveSubmit} layout="vertical">
          <p>{translate('You are about to approve PR')}: <strong>{selectedPR?.prNumber}</strong></p>
          
          <p style={{ marginTop: 16, color: '#666' }}>
            {translate('This action will approve the Purchase Requisition and notify the requestor.')}
          </p>

          <div style={{ display: 'flex', justifyContent: 'end', gap: '8px' }}>
            <Button onClick={() => setApprovalModalVisible(false)}>
              {translate('Cancel')}
            </Button>
            <Button type="primary" htmlType="submit" loading={confirmLoading}>
              {translate('Confirm Approval')}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* PR Details Drawer */}
      <Drawer
        title={
          <div>
            <span style={{ marginRight: 8 }}>PR Details:</span> 
            {selectedPRDetail?.prNumber}
          </div>
        }
        width={600}
        placement="right"
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
        extra={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => {
                handleApprove(selectedPRDetail?.id);
                setDetailDrawerVisible(false);
              }}
              disabled={!selectedPRDetail}
            >
              Approve
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              onClick={() => {
                showRejectModal(selectedPRDetail);
                setDetailDrawerVisible(false);
              }}
              disabled={!selectedPRDetail}
            >
              Reject
            </Button>
          </div>
        }
      >
        {selectedPRDetail && (
          <>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="PR Number">{selectedPRDetail.prNumber}</Descriptions.Item>
              <Descriptions.Item label="Description">{selectedPRDetail.description}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={
                  selectedPRDetail.status === 'approved' ? 'green' :
                  selectedPRDetail.status === 'rejected' ? 'red' :
                  selectedPRDetail.status === 'draft' ? 'gray' : 'blue'
                }>
                  {selectedPRDetail.status.toUpperCase().replace('_', ' ')}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Requestor">
                {selectedPRDetail.requestor?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                {selectedPRDetail.totalAmount} {selectedPRDetail.currency}
              </Descriptions.Item>
              <Descriptions.Item label="Cost Center">{selectedPRDetail.costCenter}</Descriptions.Item>
              <Descriptions.Item label="Submitted At">
                {selectedPRDetail.submittedAt ? new Date(selectedPRDetail.submittedAt).toLocaleDateString() : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Notes">{selectedPRDetail.notes || '-'}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <h3>Items</h3>
              <List
                bordered
                dataSource={selectedPRDetail.items || []}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={`${item.quantity} x ${item.description} (${item.uom})`}
                      description={`Unit Price: ${item.unitPrice} | Total: ${item.totalPrice}`}
                    />
                    <div>
                      {item.supplierName && (
                        <div>Supplier: {item.supplierName}</div>
                      )}
                      {item.deliveryDate && (
                        <div>Delivery: {new Date(item.deliveryDate).toLocaleDateString()}</div>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </>
        )}
      </Drawer>
    </>
  );
}
