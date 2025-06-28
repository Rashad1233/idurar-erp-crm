import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Card,
  Button,
  Result,
  Spin,
  Typography,
  Space,
  Divider,
  Descriptions,
  Table,
  Form,
  Input,
  Alert,
  Tag,
  Modal
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
  ShopOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const PurchaseOrderApproval = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action'); // 'approve' or 'reject'
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [poData, setPoData] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState('approve');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPOInfo();
  }, [token]);

  useEffect(() => {
    // Auto-submit if action is provided in URL
    if (action && poData && !result) {
      showApprovalModal(action);
    }
  }, [action, poData, result]);

  const fetchPOInfo = async () => {
    try {
      const response = await axios.get(`http://localhost:8888/api/supplier/po/approval/${token}`);
      if (response.data.success) {
        setPoData(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching PO info:', error);
      setError('Invalid or expired approval link');
    } finally {
      setLoading(false);
    }
  };

  const showApprovalModal = (actionType) => {
    setModalAction(actionType);
    setModalVisible(true);
    form.resetFields();
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const response = await axios.post(`http://localhost:8888/api/supplier/po/approval/${token}`, {
        action: modalAction,
        comments: values.comments || '',
        approverInfo: {
          name: values.approverName || '',
          title: values.approverTitle || ''
        }
      });
      
      if (response.data.success) {
        setResult({
          success: true,
          action: modalAction,
          message: response.data.message,
          poNumber: response.data.data.poNumber,
          totalAmount: response.data.data.totalAmount,
          currency: response.data.data.currency
        });
        setModalVisible(false);
      } else {
        setResult({
          success: false,
          message: response.data.message
        });
      }
    } catch (error) {
      console.error('Error submitting approval:', error);
      setResult({
        success: false,
        message: 'Failed to process your approval. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  };

  const cardStyle = {
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    border: 'none',
    maxWidth: '1000px',
    width: '100%'
  };

  // Loading state
  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <Spin size="large" />
          <p style={{ marginTop: '20px', fontSize: '16px' }}>Loading purchase order details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={containerStyle}>
        <Card style={cardStyle}>
          <Result
            status="error"
            title="Invalid Approval Link"
            subTitle={error}
            extra={
              <Button type="primary" onClick={() => window.close()}>
                Close
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  // Result state (after submission)
  if (result) {
    if (result.success && result.action === 'approve') {
      return (
        <div style={containerStyle}>
          <Card style={cardStyle}>
            <Result
              status="success"
              title="Purchase Order Approved!"
              subTitle={result.message}
              icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              extra={[
                <div key="info" style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Title level={4}>PO {result.poNumber}</Title>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '16px', 
                    marginTop: '16px' 
                  }}>
                    <div style={{ 
                      padding: '16px', 
                      background: '#f6ffed', 
                      borderRadius: '8px', 
                      textAlign: 'center' 
                    }}>
                      <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
                      <div>
                        <Text strong>Status</Text>
                        <br />
                        <Text style={{ fontSize: '16px', color: '#52c41a' }}>
                          Approved
                        </Text>
                      </div>
                    </div>
                    <div style={{ 
                      padding: '16px', 
                      background: '#f0f8ff', 
                      borderRadius: '8px', 
                      textAlign: 'center' 
                    }}>
                      <DollarOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
                      <div>
                        <Text strong>Total Amount</Text>
                        <br />
                        <Text style={{ fontSize: '18px', color: '#1890ff' }}>
                          {result.currency} {result.totalAmount?.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </Text>
                      </div>
                    </div>
                  </div>
                  <Paragraph style={{ marginTop: '16px' }}>
                    The purchase order has been approved and will proceed to the next stage in the procurement process. 
                    The procurement team will be notified of your approval.
                  </Paragraph>
                </div>,
                <Button key="close" type="primary" onClick={() => window.close()}>
                  Close
                </Button>
              ]}
            />
          </Card>
        </div>
      );
    } else if (result.success && result.action === 'reject') {
      return (
        <div style={containerStyle}>
          <Card style={cardStyle}>
            <Result
              status="warning"
              title="Purchase Order Rejected"
              subTitle={result.message}
              icon={<CloseCircleOutlined style={{ color: '#fa8c16' }} />}
              extra={[
                <div key="info" style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Title level={4}>PO {result.poNumber}</Title>
                  <Paragraph>
                    The purchase order has been rejected and sent back for revision. 
                    The procurement team will be notified and will take appropriate action.
                  </Paragraph>
                </div>,
                <Button key="close" type="primary" onClick={() => window.close()}>
                  Close
                </Button>
              ]}
            />
          </Card>
        </div>
      );
    } else {
      return (
        <div style={containerStyle}>
          <Card style={cardStyle}>
            <Result
              status="error"
              title="Approval Failed"
              subTitle={result.message}
              extra={[
                <Button key="retry" type="primary" onClick={() => setResult(null)}>
                  Try Again
                </Button>,
                <Button key="close" onClick={() => window.close()}>
                  Close
                </Button>
              ]}
            />
          </Card>
        </div>
      );
    }
  }

  // Line items columns for the table
  const lineItemColumns = [
    {
      title: 'Item Description',
      dataIndex: 'description',
      key: 'description',
      width: '40%'
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '10%'
    },
    {
      title: 'UoM',
      dataIndex: 'uom',
      key: 'uom',
      width: '10%'
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: '15%',
      render: (value, record) => `${poData?.currency || 'USD'} ${parseFloat(value || 0).toFixed(2)}`
    },
    {
      title: 'Total',
      key: 'total',
      width: '15%',
      render: (_, record) => {
        const total = (parseFloat(record.quantity || 0) * parseFloat(record.unitPrice || 0));
        return `${poData?.currency || 'USD'} ${total.toFixed(2)}`;
      }
    },
    {
      title: 'Delivery Date',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      width: '10%',
      render: (date) => date ? moment(date).format('MM/DD/YYYY') : '-'
    }
  ];

  // Main Purchase Order Approval Form
  return (
    <div style={containerStyle}>
      <div style={{ width: '100%', maxWidth: '1000px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', color: 'white' }}>
          <div style={{ marginBottom: '20px' }}>
            <FileTextOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          </div>
          <Title level={1} style={{ color: 'white', marginBottom: '8px', fontWeight: 300 }}>
            Purchase Order Approval
          </Title>
          <Text style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Please review and approve or reject the purchase order
          </Text>
        </div>

        {/* Main Card */}
        <Card style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Title level={2} style={{ color: '#1890ff', marginBottom: '16px' }}>
              Purchase Order Approval Required
            </Title>
            <Paragraph>
              A purchase order requires your approval. Please review the details below and take appropriate action.
            </Paragraph>
          </div>

          <Divider />

          {/* PO Details */}
          <div style={{ marginBottom: '30px' }}>
            <Title level={3}>Purchase Order Details</Title>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="PO Number" span={1}>
                <strong>{poData?.poNumber}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Current Status" span={1}>
                <Tag color="processing">Pending Approval</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Supplier" span={1}>
                <ShopOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                {poData?.supplierName}
              </Descriptions.Item>
              <Descriptions.Item label="Requested By" span={1}>
                <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                {poData?.requestedBy}
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount" span={1}>
                <DollarOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                  {poData?.currency || 'USD'} {parseFloat(poData?.totalAmount || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Request Date" span={1}>
                <CalendarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                {poData?.requestDate ? moment(poData.requestDate).format('MMMM DD, YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Required By" span={1}>
                <CalendarOutlined style={{ marginRight: '8px', color: '#fa8c16' }} />
                {poData?.requiredBy ? moment(poData.requiredBy).format('MMMM DD, YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Approval Level" span={1}>
                Level {poData?.currentApprovalLevel || 1} of {poData?.totalApprovalLevels || 1}
              </Descriptions.Item>
              {poData?.description && (
                <Descriptions.Item label="Description" span={2}>
                  {poData.description}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>

          <Divider />

          {/* Line Items */}
          <div style={{ marginBottom: '30px' }}>
            <Title level={3}>Line Items</Title>
            <Table
              dataSource={poData?.lineItems || []}
              columns={lineItemColumns}
              pagination={false}
              rowKey="id"
              scroll={{ x: 800 }}
              summary={(pageData) => {
                const total = pageData.reduce((sum, record) => {
                  return sum + (parseFloat(record.quantity || 0) * parseFloat(record.unitPrice || 0));
                }, 0);
                
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4}>
                        <Text strong>Total Amount:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                          {poData?.currency || 'USD'} {total.toFixed(2)}
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} />
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </div>

          <Divider />

          {/* Business Justification */}
          {poData?.businessJustification && (
            <>
              <div style={{ marginBottom: '30px' }}>
                <Title level={4}>Business Justification</Title>
                <div style={{ 
                  padding: '16px', 
                  background: '#fafafa', 
                  borderRadius: '8px',
                  borderLeft: '4px solid #1890ff'
                }}>
                  <Text>{poData.businessJustification}</Text>
                </div>
              </div>
              <Divider />
            </>
          )}

          {/* Action Buttons */}
          <div style={{ textAlign: 'center', margin: '40px 0' }}>
            <Title level={4}>Please choose your action:</Title>
            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              justifyContent: 'center', 
              marginTop: '24px',
              flexWrap: 'wrap'
            }}>
              <Button
                type="primary"
                size="large"
                icon={<CheckCircleOutlined />}
                onClick={() => showApprovalModal('approve')}
                style={{ 
                  height: '50px',
                  padding: '0 30px',
                  fontSize: '16px',
                  fontWeight: '500',
                  borderRadius: '8px',
                  minWidth: '180px',
                  background: '#52c41a',
                  borderColor: '#52c41a'
                }}
              >
                Approve Purchase Order
              </Button>
              <Button
                size="large"
                icon={<CloseCircleOutlined />}
                onClick={() => showApprovalModal('reject')}
                danger
                style={{ 
                  height: '50px',
                  padding: '0 30px',
                  fontSize: '16px',
                  fontWeight: '500',
                  borderRadius: '8px',
                  minWidth: '180px'
                }}
              >
                Reject Purchase Order
              </Button>
            </div>
          </div>

          <Divider />

          {/* Footer Info */}
          <div style={{ marginTop: '30px' }}>
            <Alert
              message="Important Information"
              description="Your approval or rejection will be recorded with a timestamp and your comments. This action cannot be undone, so please review all details carefully before proceeding."
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
            />
          </div>
        </Card>

        {/* Contact Info */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
            Need help? Contact us at procurement@company.com
          </Text>
        </div>
      </div>

      {/* Approval/Rejection Modal */}
      <Modal
        title={modalAction === 'approve' ? 'Approve Purchase Order' : 'Reject Purchase Order'}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        destroyOnClose
      >
        <Form 
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Alert
            message={
              <div>
                <p><strong>PO Number:</strong> {poData?.poNumber}</p>
                <p><strong>Total Amount:</strong> {poData?.currency || 'USD'} {parseFloat(poData?.totalAmount || 0).toFixed(2)}</p>
                <p><strong>Supplier:</strong> {poData?.supplierName}</p>
              </div>
            }
            type={modalAction === 'approve' ? 'info' : 'warning'}
            style={{ marginBottom: 16 }}
          />

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px',
            marginBottom: '16px'
          }}>
            <Form.Item
              name="approverName"
              label="Your Name"
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input placeholder="Full Name" />
            </Form.Item>

            <Form.Item
              name="approverTitle"
              label="Your Title"
              rules={[{ required: true, message: 'Please enter your title' }]}
            >
              <Input placeholder="Job Title" />
            </Form.Item>
          </div>
          
          <Form.Item
            name="comments"
            label="Comments"
            rules={[
              { 
                required: modalAction === 'reject', 
                message: 'Please provide a reason for rejection' 
              }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder={
                modalAction === 'approve'
                  ? 'Optional comments for this approval'
                  : 'Please specify the reason for rejection and any required changes'
              }
            />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleModalCancel}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={submitting}
                icon={modalAction === 'approve' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                style={modalAction === 'approve' ? {
                  background: '#52c41a',
                  borderColor: '#52c41a'
                } : {}}
                danger={modalAction === 'reject'}
              >
                {modalAction === 'approve' ? 'Approve' : 'Reject'} Purchase Order
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PurchaseOrderApproval;