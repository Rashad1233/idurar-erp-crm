import React, { useState, useEffect } from 'react';
import { Card, Button, Result, Spin, message, Typography, Space, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ShopOutlined } from '@ant-design/icons';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const { Title, Paragraph, Text } = Typography;

const SupplierAcceptance = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action'); // 'accept' or 'decline'
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [supplier, setSupplier] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSupplierInfo();
  }, [token]);

  useEffect(() => {
    if (action && supplier && !result) {
      handleAction(action);
    }
  }, [action, supplier, result]);

  const fetchSupplierInfo = async () => {
    try {
      const response = await axios.get(`/api/supplier/acceptance/${token}`);
      if (response.data.success) {
        setSupplier(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching supplier info:', error);
      setError('Invalid or expired acceptance link');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionType) => {
    setSubmitting(true);
    try {
      const response = await axios.post(`/api/supplier/acceptance/${token}`, {
        action: actionType
      });
      
      if (response.data.success) {
        setResult({
          success: true,
          action: actionType,
          message: response.data.message,
          supplierName: response.data.data.supplierName
        });
      } else {
        setResult({
          success: false,
          message: response.data.message
        });
      }
    } catch (error) {
      console.error('Error processing action:', error);
      setResult({
        success: false,
        message: 'Failed to process your response. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <Card style={{ textAlign: 'center', minWidth: 300 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Loading supplier information...</Text>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <Result
          status="error"
          title="Invalid Link"
          subTitle={error}
          extra={
            <Text type="secondary">
              This link may have expired or already been used. Please contact our procurement team if you need assistance.
            </Text>
          }
        />
      </div>
    );
  }

  if (result) {
    if (result.success && result.action === 'accept') {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          backgroundColor: '#f5f5f5'
        }}>
          <Result
            status="success"
            title="Welcome to Our Supplier Network!"
            subTitle={result.message}
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            extra={[
              <div key="info" style={{ textAlign: 'center', marginBottom: 16 }}>
                <Title level={4}>{result.supplierName}</Title>
                <Paragraph>
                  You are now an active supplier in our network. You'll receive information about:
                </Paragraph>
                <ul style={{ textAlign: 'left', display: 'inline-block' }}>
                  <li>Request for Quotations (RFQs)</li>
                  <li>Procurement opportunities</li>
                  <li>Contract management</li>
                  <li>Payment processing</li>
                </ul>
              </div>,
              <Text key="contact" type="secondary">
                Our procurement team will contact you soon with next steps.
              </Text>
            ]}
          />
        </div>
      );
    } else if (result.success && result.action === 'decline') {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          backgroundColor: '#f5f5f5'
        }}>
          <Result
            status="info"
            title="Thank You for Your Response"
            subTitle={result.message}
            icon={<CloseCircleOutlined style={{ color: '#1890ff' }} />}
            extra={
              <Paragraph>
                We respect your decision. If you change your mind in the future, 
                please feel free to reach out to our procurement team.
              </Paragraph>
            }
          />
        </div>
      );
    } else {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          backgroundColor: '#f5f5f5'
        }}>
          <Result
            status="error"
            title="Something Went Wrong"
            subTitle={result.message}
            extra={
              <Text type="secondary">
                Please try again or contact our procurement team for assistance.
              </Text>
            }
          />
        </div>
      );
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Card 
        style={{ 
          maxWidth: 600, 
          width: '90%',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <ShopOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={2}>Supplier Network Invitation</Title>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Paragraph>
            <Text strong>Dear Supplier,</Text>
          </Paragraph>
          <Paragraph>
            We are pleased to inform you that <Text strong>{supplier?.supplierName}</Text> has been 
            approved to join our supplier network.
          </Paragraph>
          <Paragraph>
            To complete the registration process, please choose one of the options below:
          </Paragraph>
        </div>

        <Divider />

        <div style={{ marginBottom: 24 }}>
          <Title level={4}>What happens if you accept?</Title>
          <ul>
            <li>You'll gain access to our supplier portal</li>
            <li>You'll be able to participate in RFQs and submit quotes</li>
            <li>Access procurement opportunities and manage contracts</li>
            <li>Receive timely payments as per agreed terms</li>
          </ul>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Space size="large">
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              loading={submitting}
              onClick={() => handleAction('accept')}
              style={{ 
                backgroundColor: '#52c41a', 
                borderColor: '#52c41a',
                minWidth: 150
              }}
            >
              Accept Invitation
            </Button>
            <Button
              size="large"
              icon={<CloseCircleOutlined />}
              loading={submitting}
              onClick={() => handleAction('decline')}
              style={{ 
                minWidth: 150
              }}
            >
              Decline Invitation
            </Button>
          </Space>
        </div>

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            This link will expire in 7 days. If you have any questions, please contact us at procurement@company.com
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default SupplierAcceptance;