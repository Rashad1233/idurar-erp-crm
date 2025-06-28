import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button, Card, Result, Spin, Typography, Alert, Space, Divider, Descriptions } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ExclamationCircleOutlined,
  FileProtectOutlined,
  DollarOutlined,
  CalendarOutlined,
  ShopOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Paragraph, Text } = Typography;

const ContractAcceptance = () => {
  const { contractId } = useParams();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [contract, setContract] = useState(null);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  useEffect(() => {
    fetchContractInfo();
  }, [contractId]);

  useEffect(() => {
    // Auto-submit if action is provided in URL
    if (action && contract && !submitted) {
      handleSubmit(action);
    }
  }, [action, contract, submitted]);

  const fetchContractInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8888/api/supplier/contract/acceptance/${contractId}`);
      
      if (response.data.success) {
        setContract(response.data.data);
      } else {
        setError(response.data.message || 'Invalid or expired contract link');
      }
    } catch (error) {
      console.error('Error fetching contract info:', error);
      setError('Failed to load contract details. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (decision) => {
    try {
      setSubmitting(true);
      const response = await axios.post(`http://localhost:8888/api/supplier/contract/acceptance/${contractId}`, {
        decision: decision
      });

      if (response.data.success) {
        setSubmitResult({
          success: true,
          decision: decision,
          message: response.data.message
        });
      } else {
        setSubmitResult({
          success: false,
          message: response.data.message || 'Failed to process your response'
        });
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      setSubmitResult({
        success: false,
        message: 'Failed to process your response. Please try again.'
      });
    } finally {
      setSubmitting(false);
      setSubmitted(true);
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
    maxWidth: '800px',
    width: '100%'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <Spin size="large" />
          <p style={{ marginTop: '20px', fontSize: '16px' }}>Loading contract details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <Card style={cardStyle}>
          <Result
            status="error"
            title="Invalid Contract Link"
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

  if (submitted && submitResult) {
    return (
      <div style={containerStyle}>
        <Card style={cardStyle}>
          <Result
            status={submitResult.success ? "success" : "error"}
            title={
              submitResult.success 
                ? (submitResult.decision === 'accept' ? 'Contract Accepted!' : 'Contract Declined')
                : 'Error Processing Response'
            }
            subTitle={submitResult.message}
            extra={
              <Space>
                <Button type="primary" onClick={() => window.close()}>
                  Close
                </Button>
                {submitResult.success && submitResult.decision === 'accept' && (
                  <Button onClick={() => window.location.reload()}>
                    View Details
                  </Button>
                )}
              </Space>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ width: '100%', maxWidth: '800px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', color: 'white' }}>
          <div style={{ marginBottom: '20px' }}>
            <FileProtectOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          </div>
          <Title level={1} style={{ color: 'white', marginBottom: '8px', fontWeight: 300 }}>
            Contract Acceptance
          </Title>
          <Text style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Please review and respond to the contract terms
          </Text>
        </div>

        {/* Main Card */}
        <Card style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Title level={2} style={{ color: '#1890ff', marginBottom: '16px' }}>
              Contract Review Required
            </Title>
            <Paragraph>
              We have prepared a contract for your review and acceptance. Please review the contract details below.
            </Paragraph>
          </div>

          <Divider />

          {/* Contract Details */}
          <div style={{ marginBottom: '30px' }}>
            <Title level={3}>Contract Details</Title>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Contract Number" span={1}>
                <strong>{contract?.contractNumber}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Supplier" span={1}>
                <ShopOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                {contract?.supplierName}
              </Descriptions.Item>
              <Descriptions.Item label="Contract Value" span={1}>
                <DollarOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                {contract?.totalValue ? `$${parseFloat(contract.totalValue).toLocaleString()}` : 'To be determined'}
              </Descriptions.Item>
              <Descriptions.Item label="Start Date" span={1}>
                <CalendarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                {contract?.startDate ? new Date(contract.startDate).toLocaleDateString() : 'To be determined'}
              </Descriptions.Item>
              <Descriptions.Item label="End Date" span={1}>
                <CalendarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                {contract?.endDate ? new Date(contract.endDate).toLocaleDateString() : 'To be determined'}
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
                  AWAITING YOUR ACCEPTANCE
                </span>
              </Descriptions.Item>
            </Descriptions>
          </div>

          <Divider />

          {/* Benefits Section */}
          <div style={{ marginBottom: '30px' }}>
            <Title level={4}>By accepting this contract, you will:</Title>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '16px', 
              marginTop: '16px' 
            }}>
              <div style={{ 
                padding: '16px', 
                background: '#f0f8ff', 
                borderRadius: '8px', 
                borderLeft: '4px solid #1890ff' 
              }}>
                <strong style={{ color: '#1890ff' }}>Activate Partnership</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
                  Begin our official business collaboration
                </p>
              </div>
              <div style={{ 
                padding: '16px', 
                background: '#f6ffed', 
                borderRadius: '8px', 
                borderLeft: '4px solid #52c41a' 
              }}>
                <strong style={{ color: '#52c41a' }}>Secure Terms</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
                  Lock in agreed pricing and conditions
                </p>
              </div>
              <div style={{ 
                padding: '16px', 
                background: '#fff7e6', 
                borderRadius: '8px', 
                borderLeft: '4px solid #fa8c16' 
              }}>
                <strong style={{ color: '#fa8c16' }}>Access Portal</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
                  Use our supplier portal systems
                </p>
              </div>
            </div>
          </div>

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
                icon={<CheckCircleOutlined />}
                onClick={() => handleSubmit('accept')}
                loading={submitting}
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
                Accept Contract
              </Button>
              <Button
                size="large"
                icon={<CloseCircleOutlined />}
                onClick={() => handleSubmit('decline')}
                loading={submitting}
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
                Decline Contract
              </Button>
            </div>
          </div>

          <Divider />

          {/* Footer Info */}
          <div style={{ marginTop: '30px' }}>
            <Alert
              message="Important Information"
              description="This contract link will remain active for 30 days. If you have any questions about the contract terms, please contact our procurement team before accepting."
              type="info"
              showIcon
              icon={<ExclamationCircleOutlined />}
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

export default ContractAcceptance;