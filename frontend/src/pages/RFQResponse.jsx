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
  InputNumber,
  Input,
  DatePicker,
  Alert,
  message
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShoppingOutlined,
  DollarOutlined,
  CalendarOutlined,
  SaveOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const RFQResponse = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const autoSubmit = searchParams.get('submit'); // If submit=true in URL
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rfqData, setRfqData] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRFQInfo();
  }, [token]);

  const fetchRFQInfo = async () => {
    try {
      const response = await axios.get(`http://localhost:8888/api/supplier/rfq/response/${token}`);
      if (response.data.success) {
        setRfqData(response.data.data);
        
        // Pre-populate form with RFQ line items
        const lineItems = response.data.data.lineItems.map(item => ({
          rfqLineItemId: item.id,
          description: item.description,
          quantity: item.quantity,
          uom: item.uom,
          unitPrice: null,
          leadTime: null,
          comments: ''
        }));
        
        form.setFieldsValue({
          lineItems: lineItems,
          currency: 'USD',
          validUntil: moment().add(30, 'days'),
          deliveryTerms: 'FOB Destination',
          paymentTerms: 'Net 30'
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching RFQ info:', error);
      setError('Invalid or expired RFQ response link');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      // Calculate total amount
      const totalAmount = values.lineItems.reduce((sum, item) => 
        sum + (parseFloat(item.unitPrice || 0) * parseFloat(item.quantity || 0)), 0);

      const response = await axios.post(`http://localhost:8888/api/supplier/rfq/response/${token}`, {
        ...values,
        validUntil: values.validUntil.toISOString(),
        totalAmount: totalAmount
      });
      
      if (response.data.success) {
        setResult({
          success: true,
          message: response.data.message,
          rfqNumber: response.data.data.rfqNumber,
          totalAmount: totalAmount,
          currency: values.currency
        });
      } else {
        setResult({
          success: false,
          message: response.data.message
        });
      }
    } catch (error) {
      console.error('Error submitting RFQ response:', error);
      setResult({
        success: false,
        message: 'Failed to submit your quotation. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    setSubmitting(true);
    try {
      const response = await axios.post(`http://localhost:8888/api/supplier/rfq/response/${token}`, {
        action: 'decline',
        reason: 'Unable to provide quotation at this time'
      });
      
      if (response.data.success) {
        setResult({
          success: true,
          declined: true,
          message: response.data.message,
          rfqNumber: response.data.data.rfqNumber
        });
      } else {
        setResult({
          success: false,
          message: response.data.message
        });
      }
    } catch (error) {
      console.error('Error declining RFQ:', error);
      setResult({
        success: false,
        message: 'Failed to process your response. Please try again.'
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
    maxWidth: '1200px',
    width: '100%'
  };

  // Loading state
  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <Spin size="large" />
          <p style={{ marginTop: '20px', fontSize: '16px' }}>Loading RFQ details...</p>
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
            title="Invalid RFQ Link"
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
    if (result.success && result.declined) {
      return (
        <div style={containerStyle}>
          <Card style={cardStyle}>
            <Result
              status="info"
              title="RFQ Declined"
              subTitle={result.message}
              icon={<CloseCircleOutlined style={{ color: '#1890ff' }} />}
              extra={[
                <div key="info" style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Title level={4}>RFQ {result.rfqNumber}</Title>
                  <Paragraph>
                    Thank you for your response. We understand that you are unable to provide 
                    a quotation at this time. We appreciate your honesty and look forward to 
                    future opportunities to work together.
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
    } else if (result.success) {
      return (
        <div style={containerStyle}>
          <Card style={cardStyle}>
            <Result
              status="success"
              title="Quotation Submitted Successfully!"
              subTitle={result.message}
              icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              extra={[
                <div key="info" style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Title level={4}>RFQ {result.rfqNumber}</Title>
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
                      <DollarOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
                      <div>
                        <Text strong>Total Quote</Text>
                        <br />
                        <Text style={{ fontSize: '18px', color: '#52c41a' }}>
                          {result.currency} {result.totalAmount?.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </Text>
                      </div>
                    </div>
                    <div style={{ 
                      padding: '16px', 
                      background: '#f0f8ff', 
                      borderRadius: '8px', 
                      textAlign: 'center' 
                    }}>
                      <CheckCircleOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
                      <div>
                        <Text strong>Status</Text>
                        <br />
                        <Text style={{ fontSize: '16px', color: '#1890ff' }}>
                          Under Review
                        </Text>
                      </div>
                    </div>
                  </div>
                  <Paragraph style={{ marginTop: '16px' }}>
                    Our procurement team will review your quotation and contact you with the next steps. 
                    You should receive a response within 3-5 business days.
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
              title="Submission Failed"
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

  // Main RFQ Response Form
  const lineItemColumns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '25%'
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
      title: 'Unit Price *',
      key: 'unitPrice',
      width: '15%',
      render: (_, __, index) => (
        <Form.Item
          name={['lineItems', index, 'unitPrice']}
          rules={[{ required: true, message: 'Required' }]}
          style={{ margin: 0 }}
        >
          <InputNumber
            min={0}
            precision={2}
            style={{ width: '100%' }}
            placeholder="0.00"
          />
        </Form.Item>
      )
    },
    {
      title: 'Lead Time (days) *',
      key: 'leadTime',
      width: '15%',
      render: (_, __, index) => (
        <Form.Item
          name={['lineItems', index, 'leadTime']}
          rules={[{ required: true, message: 'Required' }]}
          style={{ margin: 0 }}
        >
          <InputNumber
            min={1}
            style={{ width: '100%' }}
            placeholder="Days"
          />
        </Form.Item>
      )
    },
    {
      title: 'Comments',
      key: 'comments',
      width: '25%',
      render: (_, __, index) => (
        <Form.Item
          name={['lineItems', index, 'comments']}
          style={{ margin: 0 }}
        >
          <Input placeholder="Optional comments" />
        </Form.Item>
      )
    }
  ];

  return (
    <div style={containerStyle}>
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', color: 'white' }}>
          <div style={{ marginBottom: '20px' }}>
            <ShoppingOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          </div>
          <Title level={1} style={{ color: 'white', marginBottom: '8px', fontWeight: 300 }}>
            Request for Quotation
          </Title>
          <Text style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Please provide your quotation for the items below
          </Text>
        </div>

        {/* Main Card */}
        <Card style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Title level={2} style={{ color: '#1890ff', marginBottom: '16px' }}>
              RFQ {rfqData?.rfqNumber}
            </Title>
            <Paragraph>
              We would like to request a quotation for the following items. Please review the requirements 
              and provide your best pricing and delivery terms.
            </Paragraph>
          </div>

          <Divider />

          {/* RFQ Details */}
          <div style={{ marginBottom: '30px' }}>
            <Title level={3}>RFQ Details</Title>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="RFQ Number" span={1}>
                <strong>{rfqData?.rfqNumber}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Supplier" span={1}>
                {rfqData?.supplierName}
              </Descriptions.Item>
              <Descriptions.Item label="Submission Deadline" span={1}>
                <CalendarOutlined style={{ marginRight: '8px', color: '#fa8c16' }} />
                {rfqData?.submissionDeadline ? 
                  moment(rfqData.submissionDeadline).format('MMMM DD, YYYY') : 
                  'Not specified'
                }
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={1}>
                <span style={{ 
                  padding: '4px 12px', 
                  borderRadius: '4px', 
                  backgroundColor: '#faad14', 
                  color: 'white', 
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  AWAITING YOUR QUOTATION
                </span>
              </Descriptions.Item>
              {rfqData?.description && (
                <Descriptions.Item label="Description" span={2}>
                  {rfqData.description}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>

          <Divider />

          {/* Quotation Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Title level={3}>Line Items</Title>
            <Table
              dataSource={rfqData?.lineItems || []}
              columns={lineItemColumns}
              pagination={false}
              rowKey="id"
              scroll={{ x: 800 }}
              style={{ marginBottom: '30px' }}
            />

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '20px',
              marginBottom: '30px'
            }}>
              <Form.Item
                name="currency"
                label="Currency"
                rules={[{ required: true, message: 'Please specify currency' }]}
              >
                <Input placeholder="USD" />
              </Form.Item>

              <Form.Item
                name="validUntil"
                label="Quote Valid Until"
                rules={[{ required: true, message: 'Please specify validity period' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={current => current && current < moment().startOf('day')}
                />
              </Form.Item>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px',
              marginBottom: '30px'
            }}>
              <Form.Item
                name="deliveryTerms"
                label="Delivery Terms"
                rules={[{ required: true, message: 'Please specify delivery terms' }]}
              >
                <TextArea rows={3} placeholder="e.g., FOB Destination, EXW, etc." />
              </Form.Item>

              <Form.Item
                name="paymentTerms"
                label="Payment Terms"
                rules={[{ required: true, message: 'Please specify payment terms' }]}
              >
                <TextArea rows={3} placeholder="e.g., Net 30, 2/10 Net 30, etc." />
              </Form.Item>
            </div>

            <Form.Item
              name="comments"
              label="Additional Comments"
            >
              <TextArea rows={4} placeholder="Any additional information or special terms..." />
            </Form.Item>

            <Divider />

            {/* Action Buttons */}
            <div style={{ textAlign: 'center', margin: '40px 0' }}>
              <Title level={4}>Please choose your response:</Title>
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
                  icon={<SaveOutlined />}
                  onClick={() => form.submit()}
                  loading={submitting}
                  style={{ 
                    height: '50px',
                    padding: '0 30px',
                    fontSize: '16px',
                    fontWeight: '500',
                    borderRadius: '8px',
                    minWidth: '200px',
                    background: '#52c41a',
                    borderColor: '#52c41a'
                  }}
                >
                  Submit Quotation
                </Button>
                <Button
                  size="large"
                  icon={<CloseCircleOutlined />}
                  onClick={handleDecline}
                  loading={submitting}
                  danger
                  style={{ 
                    height: '50px',
                    padding: '0 30px',
                    fontSize: '16px',
                    fontWeight: '500',
                    borderRadius: '8px',
                    minWidth: '200px'
                  }}
                >
                  Decline to Quote
                </Button>
              </div>
            </div>
          </Form>

          <Divider />

          {/* Footer Info */}
          <div style={{ marginTop: '30px' }}>
            <Alert
              message="Important Information"
              description="Please ensure all required fields are completed before submitting your quotation. Your quote will be reviewed by our procurement team, and you will be notified of the outcome."
              type="info"
              showIcon
              icon={<QuestionCircleOutlined />}
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
    </div>
  );
};

export default RFQResponse;