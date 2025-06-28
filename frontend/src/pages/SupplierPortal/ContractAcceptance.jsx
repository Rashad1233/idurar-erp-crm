import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Typography,
  Button,
  Form,
  Input,
  Space,
  Divider,
  Row,
  Col,
  Descriptions,
  message,
  Spin,
  Alert,
  Result
} from 'antd';
import {
  CheckCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined
} from '@ant-design/icons';
import axios from 'axios';
import SupplierPortalLayout from '@/components/SupplierPortalLayout';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Configure axios for supplier portal (no authentication required)
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_SERVER || 'http://localhost:8888';

function SupplierContractAcceptance() {
  const { contractId } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();

  // Debug logging
  console.log('🔍 CONTRACT ACCEPTANCE DEBUG:');
  console.log('Current URL:', window.location.href);
  console.log('Contract ID from useParams:', contractId);
  console.log('Contract ID type:', typeof contractId);

  useEffect(() => {
    loadContractDetails();
  }, [contractId]);

  const loadContractDetails = async () => {
    try {
      setLoading(true);
      console.log('🔍 Frontend Debug Info:');
      console.log('- Contract ID from useParams():', contractId);
      console.log('- Contract ID type:', typeof contractId);
      console.log('- Window location:', window.location.href);
      console.log('- Window pathname:', window.location.pathname);
      
      if (!contractId || contractId === 'undefined') {
        setError('Invalid contract ID');
        return;
      }
      
      console.log('Loading contract details for ID:', contractId);
      
      const response = await axios.get(`/api/supplier-portal/contract-acceptance/${contractId}`);
      console.log('Contract response:', response.data);
      
      if (response.data.success) {
        setContract(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Error loading contract:', error);
      setError(error.response?.data?.message || 'Failed to load contract details');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptContract = async (values) => {
    try {
      setAccepting(true);
      
      const response = await axios.post(`/api/supplier-portal/contract-acceptance/${contractId}`, {
        supplierName: contract?.supplier?.legalName,
        supplierEmail: contract?.supplier?.contactEmail,
        acceptanceNotes: values.acceptanceNotes
      });

      if (response.data.success) {
        message.success('Contract accepted successfully!');
        setAccepted(true);
      } else {
        message.error(response.data.message || 'Failed to accept contract');
      }
    } catch (error) {
      console.error('Error accepting contract:', error);
      message.error(error.response?.data?.message || 'Failed to accept contract');
    } finally {
      setAccepting(false);
    }
  };

  const goHome = () => {
    window.location.href = '/';
  };

  if (loading) {
    return (
      <SupplierPortalLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading contract details...</div>
        </div>
      </SupplierPortalLayout>
    );
  }

  if (error) {
    return (
      <SupplierPortalLayout>
        <Result
          status="error"
          title="Contract Not Available"
          subTitle={error}
          extra={[
            <Button type="primary" key="home" onClick={goHome}>
              Go to Home
            </Button>
          ]}
        />
      </SupplierPortalLayout>
    );
  }

  if (accepted) {
    return (
      <SupplierPortalLayout>
        <Result
          status="success"
          title="Contract Accepted Successfully!"
          subTitle={`Contract ${contract?.contractNumber} has been accepted and is now active. You will receive a confirmation email shortly.`}
          extra={[
            <Button type="primary" key="home" onClick={goHome}>
              Close
            </Button>
          ]}
        />
      </SupplierPortalLayout>
    );
  }

  // Safety check for contract data
  if (!contract) {
    return (
      <SupplierPortalLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading contract details...</div>
        </div>
      </SupplierPortalLayout>
    );
  }

  return (
    <SupplierPortalLayout>
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <FileTextOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={2}>Contract Acceptance</Title>
          <Paragraph type="secondary">
            Please review the contract details below and accept to proceed with the agreement.
          </Paragraph>
        </div>

        <Divider />

        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Descriptions title="Contract Information" bordered column={2}>
              <Descriptions.Item label="Contract Number" span={1}>
                <Text strong>{contract?.contractNumber}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Contract Name" span={1}>
                {contract?.contractName}
              </Descriptions.Item>
              <Descriptions.Item label="Supplier" span={1}>
                <Space>
                  <UserOutlined />
                  {contract?.supplier?.legalName}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Total Value" span={1}>
                <Space>
                  <DollarOutlined />
                  ${contract?.totalValue?.toLocaleString() || '0'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Start Date" span={1}>
                <Space>
                  <CalendarOutlined />
                  {contract?.startDate ? new Date(contract.startDate).toLocaleDateString() : 'Not specified'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="End Date" span={1}>
                <Space>
                  <CalendarOutlined />
                  {contract?.endDate ? new Date(contract.endDate).toLocaleDateString() : 'Not specified'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Terms" span={2}>
                {contract?.paymentTerms || 'Standard terms apply'}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {contract?.description || 'No description provided'}
              </Descriptions.Item>
              {contract?.terms && (
                <Descriptions.Item label="Terms & Conditions" span={2}>
                  {contract.terms}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Col>
        </Row>

        <Divider />

        <Alert
          message="Contract Approval Confirmation"
          description="By accepting this contract, you agree to the terms and conditions outlined above. This action will activate the contract and begin the collaboration."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleAcceptContract}
        >
          <Form.Item
            name="acceptanceNotes"
            label="Acceptance Notes (Optional)"
            extra="Add any notes or comments regarding your acceptance of this contract."
          >
            <TextArea
              rows={4}
              placeholder="Enter any additional notes or comments..."
            />
          </Form.Item>

          <Form.Item style={{ textAlign: 'center', marginTop: 32 }}>
            <Space size="large">
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={accepting}
                icon={<CheckCircleOutlined />}
                style={{ minWidth: 200 }}
              >
                {accepting ? 'Accepting Contract...' : 'Accept Contract'}
              </Button>
              <Button
                size="large"
                onClick={goHome}
                style={{ minWidth: 120 }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
    </SupplierPortalLayout>
  );
}

export default SupplierContractAcceptance;
