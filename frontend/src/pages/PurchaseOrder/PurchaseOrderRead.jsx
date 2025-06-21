import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Card, 
  Descriptions, 
  Table, 
  Tag, 
  Steps, 
  Modal, 
  Form,
  Input,
  Alert,
  Divider,
  Timeline,
  Spin,
  Tabs,
  Space,
  Typography,
  message
} from 'antd';
import {
  FileTextOutlined,
  CheckOutlined,
  CloseOutlined,
  SendOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
  DownloadOutlined,
  PrinterOutlined,
  FileProtectOutlined
} from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/auth/selectors';
import { DOWNLOAD_BASE_URL } from '@/config/serverApiConfig';
import moment from 'moment';

const { Step } = Steps;
// Removed TabPane import - using items prop instead
const { TextArea } = Input;
const { Title } = Typography;

function PurchaseOrderRead() {
  const { id } = useParams();
  const navigate = useNavigate();
  const translate = useLanguage();
  const currentUser = useSelector(selectCurrentUser);
  
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [poItems, setPoItems] = useState([]);
  const [poAttachments, setPoAttachments] = useState([]);
  const [poApprovals, setPoApprovals] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modal states
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [approvalForm] = Form.useForm();
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectForm] = Form.useForm();
  
  // Load Purchase Order data
  useEffect(() => {
    const loadPOData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get PO details
        const poResponse = await request.read({ entity: 'purchase-order', id });
        if (poResponse.success && poResponse.result) {
          setPurchaseOrder(poResponse.result);
          
          // Extract items
          if (poResponse.result.items && Array.isArray(poResponse.result.items)) {
            setPoItems(poResponse.result.items);
          }
          
          // Extract attachments
          if (poResponse.result.attachments && Array.isArray(poResponse.result.attachments)) {
            setPoAttachments(poResponse.result.attachments);
          }
          
          // Load approval history
          try {
            const approvalResponse = await request.filter({ 
              entity: 'poapproval',
              filter: { po: id }
            });
            
            if (approvalResponse.success && approvalResponse.result) {
              setPoApprovals(approvalResponse.result);
            }
          } catch (approvalErr) {
            console.error('Error loading approval history:', approvalErr);
          }
        } else {
          setError('Failed to load purchase order details');
        }
      } catch (err) {
        setError(err.message || 'Error loading purchase order details');
      } finally {
        setLoading(false);
      }
    };
    
    loadPOData();
  }, [id]);
  
  // Handle PO submission for approval
  const handleSubmitPO = async () => {
    setActionLoading(true);
    
    try {
      const response = await request.create({
        entity: 'purchase-order/submit',
        jsonData: { id }
      });
      
      if (response.success) {
        message.success(translate('Purchase Order submitted for approval'));
        // Refresh PO data
        const poResponse = await request.read({ entity: 'purchase-order', id });
        if (poResponse.success && poResponse.result) {
          setPurchaseOrder(poResponse.result);
        }
      } else {
        message.error(response.message || translate('Failed to submit Purchase Order'));
      }
    } catch (err) {
      message.error(err.message || translate('An error occurred'));
      console.error('Error submitting PO:', err);
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle PO approval
  const handleApprovePO = async (values) => {
    setActionLoading(true);
    
    try {
      const response = await request.create({
        entity: 'purchase-order/approve',
        jsonData: { 
          id,
          comments: values.comments 
        }
      });
      
      if (response.success) {
        message.success(translate('Purchase Order approved successfully'));
        setApprovalModalVisible(false);
        approvalForm.resetFields();
        
        // Refresh PO data
        const poResponse = await request.read({ entity: 'purchase-order', id });
        if (poResponse.success && poResponse.result) {
          setPurchaseOrder(poResponse.result);
          
          // Refresh approval history
          try {
            const approvalResponse = await request.filter({ 
              entity: 'poapproval',
              filter: { po: id }
            });
            
            if (approvalResponse.success && approvalResponse.result) {
              setPoApprovals(approvalResponse.result);
            }
          } catch (approvalErr) {
            console.error('Error loading approval history:', approvalErr);
          }
        }
      } else {
        message.error(response.message || translate('Failed to approve Purchase Order'));
      }
    } catch (err) {
      message.error(err.message || translate('An error occurred'));
      console.error('Error approving PO:', err);
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle PO rejection
  const handleRejectPO = async (values) => {
    setActionLoading(true);
    
    try {
      // Note: You would need to implement a reject endpoint in your backend
      const response = await request.create({
        entity: 'purchase-order/reject',
        jsonData: { 
          id,
          reason: values.reason 
        }
      });
      
      if (response.success) {
        message.success(translate('Purchase Order rejected'));
        setRejectModalVisible(false);
        rejectForm.resetFields();
        
        // Refresh PO data
        const poResponse = await request.read({ entity: 'purchase-order', id });
        if (poResponse.success && poResponse.result) {
          setPurchaseOrder(poResponse.result);
          
          // Refresh approval history
          try {
            const approvalResponse = await request.filter({ 
              entity: 'poapproval',
              filter: { po: id }
            });
            
            if (approvalResponse.success && approvalResponse.result) {
              setPoApprovals(approvalResponse.result);
            }
          } catch (approvalErr) {
            console.error('Error loading approval history:', approvalErr);
          }
        }
      } else {
        message.error(response.message || translate('Failed to reject Purchase Order'));
      }
    } catch (err) {
      message.error(err.message || translate('An error occurred'));
      console.error('Error rejecting PO:', err);
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle PO issuance to supplier
  const handleIssuePO = async () => {
    setActionLoading(true);
    
    try {
      const response = await request.create({
        entity: 'purchase-order/issue',
        jsonData: { id }
      });
      
      if (response.success) {
        message.success(translate('Purchase Order issued to supplier'));
        // Refresh PO data
        const poResponse = await request.read({ entity: 'purchase-order', id });
        if (poResponse.success && poResponse.result) {
          setPurchaseOrder(poResponse.result);
        }
      } else {
        message.error(response.message || translate('Failed to issue Purchase Order'));
      }
    } catch (err) {
      message.error(err.message || translate('An error occurred'));
      console.error('Error issuing PO:', err);
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle goods receipt
  const handleReceiveGoods = () => {
    // Navigate to the goods receipt form
    navigate(`/purchase-order/receive/${id}`);
  };
  
  // Helper function to get status tag color
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
  
  // Get status step number
  const getStatusStepNumber = (status) => {
    switch (status) {
      case 'draft':
        return 0;
      case 'submitted':
        return 1;
      case 'approved':
        return 2;
      case 'issued':
        return 3;
      case 'received':
        return 4;
      default:
        return 0;
    }
  };
  
  // Item columns for the table
  const itemColumns = [
    {
      title: translate('Item'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: translate('Quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: translate('Unit'),
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: translate('Unit Price'),
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${parseFloat(price).toFixed(2)}`,
    },
    {
      title: translate('Total'),
      key: 'total',
      render: (_, record) => {
        const quantity = parseFloat(record.quantity) || 0;
        const price = parseFloat(record.price) || 0;
        const total = quantity * price;
        return `$${total.toFixed(2)}`;
      },
    }
  ];
  
  // Attachment columns
  const attachmentColumns = [
    {
      title: translate('File Name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: translate('Type'),
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: translate('Size'),
      dataIndex: 'size',
      key: 'size',
      render: (text) => {
        const size = Number(text);
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
      }
    },
    {
      title: translate('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<DownloadOutlined />}
          href={`${DOWNLOAD_BASE_URL}${record.path}`}
          target="_blank"
        >
          {translate('Download')}
        </Button>
      ),
    }
  ];

  // Approval history columns
  const approvalColumns = [
    {
      title: translate('Date'),
      dataIndex: 'date',
      key: 'date',
      render: (text) => text ? moment(text).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: translate('User'),
      dataIndex: 'user',
      key: 'user',
      render: (_, record) => record.user?.name || record.userName || '-',
    },
    {
      title: translate('Action'),
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: translate('Comments'),
      dataIndex: 'comments',
      key: 'comments',
    }
  ];

  // Calculate PO total amount
  const calculateTotal = () => {
    return poItems.reduce((total, item) => {
      const itemTotal = (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0);
      return total + itemTotal;
    }, 0);
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (error) {
    return <Alert message={error} type="error" />;
  }

  if (!purchaseOrder) {
    return <Alert message={translate('Purchase Order not found')} type="warning" />;
  }

  return (
    <div className="purchase-order-read-page">
      <Card 
        title={
          <Space>
            <ShoppingCartOutlined />
            <span>{translate('Purchase Order')} - {purchaseOrder.poNumber}</span>
          </Space>
        }
        extra={
          <Space>
            <Button 
              onClick={() => navigate('/purchase-order')}
            >
              {translate('Back to List')}
            </Button>
            
            {purchaseOrder.status === 'draft' && (
              <Button 
                type="primary"
                onClick={handleSubmitPO}
                loading={actionLoading}
                icon={<FileProtectOutlined />}
              >
                {translate('Submit for Approval')}
              </Button>
            )}
            
            {purchaseOrder.status === 'submitted' && currentUser?.role === 'admin' && (
              <Space>
                <Button 
                  type="primary"
                  onClick={() => setApprovalModalVisible(true)}
                  loading={actionLoading}
                  icon={<CheckOutlined />}
                >
                  {translate('Approve')}
                </Button>
                <Button 
                  danger
                  onClick={() => setRejectModalVisible(true)}
                  loading={actionLoading}
                  icon={<CloseOutlined />}
                >
                  {translate('Reject')}
                </Button>
              </Space>
            )}
            
            {purchaseOrder.status === 'approved' && (
              <Button 
                type="primary"
                onClick={handleIssuePO}
                loading={actionLoading}
                icon={<SendOutlined />}
              >
                {translate('Issue to Supplier')}
              </Button>
            )}
            
            {purchaseOrder.status === 'issued' && (
              <Button 
                type="primary"
                onClick={handleReceiveGoods}
                loading={actionLoading}
                icon={<ShoppingCartOutlined />}
              >
                {translate('Receive Goods')}
              </Button>
            )}
            
            <Button 
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
            >
              {translate('Print')}
            </Button>
          </Space>
        }
      >
        <Steps current={getStatusStepNumber(purchaseOrder.status)} className="po-status-steps">
          <Step title={translate('Draft')} description={translate('Created')} />
          <Step title={translate('Submitted')} description={translate('For Approval')} />
          <Step title={translate('Approved')} description={translate('Ready to Issue')} />
          <Step title={translate('Issued')} description={translate('To Supplier')} />
          <Step title={translate('Received')} description={translate('Complete')} />
        </Steps>
        
        <Divider />
        
        <Descriptions bordered column={2} className="po-details">
          <Descriptions.Item label={translate('PO Number')}>
            {purchaseOrder.poNumber || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('Status')}>
            <Tag color={getStatusColor(purchaseOrder.status)}>
              {translate(purchaseOrder.status?.toUpperCase() || 'DRAFT')}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label={translate('Supplier')}>
            {purchaseOrder.supplier?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('Customer Reference')}>
            {purchaseOrder.customerRef || '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label={translate('Date')}>
            {purchaseOrder.date ? moment(purchaseOrder.date).format('YYYY-MM-DD') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('Expected Delivery')}>
            {purchaseOrder.expectedDeliveryDate ? moment(purchaseOrder.expectedDeliveryDate).format('YYYY-MM-DD') : '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label={translate('Department')}>
            {purchaseOrder.department || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={translate('RFQ Reference')}>
            {purchaseOrder.rfq || '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label={translate('Notes')} span={2}>
            {purchaseOrder.notes || '-'}
          </Descriptions.Item>
        </Descriptions>
        
        <Divider />
          <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: "1",
              label: translate('Items'),
              children: (
                <Table 
                  columns={itemColumns} 
                  dataSource={poItems.map(item => ({ ...item, key: item._id || item.id }))}
                  pagination={false}
                  bordered
                  summary={() => (
                    <Table.Summary fixed>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={5} align="right">
                          <strong>{translate('Total')}:</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <strong>${calculateTotal().toFixed(2)}</strong>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  )}
                />
              )
            },
            {
              key: "2",
              label: translate('Approval History'),
              children: (
                poApprovals.length > 0 ? (
                  <Table 
                    columns={approvalColumns} 
                    dataSource={poApprovals.map(approval => ({ ...approval, key: approval._id || approval.id }))}
                    pagination={false}
                    bordered
                  />
                ) : (
                  <Alert message={translate('No approval history available')} type="info" />
                )
              )
            },
            {
              key: "3",
              label: translate('Attachments'),
              children: (
                poAttachments.length > 0 ? (
                  <Table 
                    columns={attachmentColumns} 
                    dataSource={poAttachments.map(attachment => ({ ...attachment, key: attachment._id || attachment.id }))}
                    pagination={false}
                    bordered
                  />
                ) : (
                  <Alert message={translate('No attachments available')} type="info" />
                )
              )
            },
            {
              key: "4",
              label: translate('Supplier Details'),
              children: (
                purchaseOrder.supplier ? (
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label={translate('Supplier Name')}>
                      {purchaseOrder.supplier.name || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={translate('Contact Person')}>
                      {purchaseOrder.supplier.contactPerson || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={translate('Email')}>
                      {purchaseOrder.supplier.email || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={translate('Phone')}>
                      {purchaseOrder.supplier.phone || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={translate('Address')}>
                      {purchaseOrder.supplier.address || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Alert message={translate('No supplier details available')} type="info" />
                )
              )
            }
          ]}
        />
      </Card>
      
      {/* Approval Confirmation Modal */}
      <Modal
        title={translate('Approve Purchase Order')}
        visible={approvalModalVisible}
        confirmLoading={actionLoading}
        onCancel={() => setApprovalModalVisible(false)}
        footer={null}
      >
        <Form
          form={approvalForm}
          layout="vertical"
          onFinish={handleApprovePO}
        >
          <Form.Item
            name="comments"
            label={translate('Comments')}
          >
            <TextArea rows={4} placeholder={translate('Optional comments')} />
          </Form.Item>
          
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setApprovalModalVisible(false)}>
                {translate('Cancel')}
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={actionLoading}
                icon={<CheckOutlined />}
              >
                {translate('Approve')}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
      
      {/* Rejection Modal */}
      <Modal
        title={translate('Reject Purchase Order')}
        visible={rejectModalVisible}
        confirmLoading={actionLoading}
        onCancel={() => setRejectModalVisible(false)}
        footer={null}
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={handleRejectPO}
        >
          <Form.Item
            name="reason"
            label={translate('Rejection Reason')}
            rules={[{ required: true, message: translate('Please provide a reason for rejection') }]}
          >
            <TextArea rows={4} placeholder={translate('Reason for rejection')} />
          </Form.Item>
          
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setRejectModalVisible(false)}>
                {translate('Cancel')}
              </Button>
              <Button 
                danger 
                htmlType="submit" 
                loading={actionLoading}
                icon={<CloseOutlined />}
              >
                {translate('Reject')}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default PurchaseOrderRead;
