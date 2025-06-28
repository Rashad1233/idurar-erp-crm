import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Alert,
  Spin,
  message,
  Typography,
  Descriptions,
  List,
  Space,
  Tag,
  Modal,
  Radio,
  App
} from 'antd';
import { 
  CheckOutlined, 
  CloseOutlined, 
  ExclamationCircleOutlined,
  FileTextOutlined 
} from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { confirm } = Modal;

function RFQSupplierApproval() {
  const { id, supplierId } = useParams();
  const navigate = useNavigate();
  const translate = useLanguage();
  const [form] = Form.useForm();
  const { message: messageApi } = App.useApp();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [rfq, setRFQ] = useState(null);
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [approvalDecision, setApprovalDecision] = useState('approve');
  
  // Load RFQ data
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    console.log('Loading RFQ with ID:', id, 'and supplier ID:', supplierId);
    request.read({ entity: 'rfq', id })
      .then(response => {
        console.log('RFQ API response:', response);
        if (response.success) {
          const rfqData = response.result || response.data;
          console.log('RFQ Data:', rfqData);
          setRFQ(rfqData);
          
          // Find the specific supplier based on supplierId parameter
          console.log('RFQ suppliers:', rfqData.suppliers);
          if (rfqData.suppliers && rfqData.suppliers.length > 0) {
            const supplier = rfqData.suppliers.find(s => 
              s.supplierId === supplierId || s.id === supplierId
            );
            console.log('Found supplier:', supplier);
            if (supplier) {
              setCurrentSupplier(supplier);
            } else {
              // Fallback to first supplier if specific one not found
              console.log('Using first supplier as fallback');
              setCurrentSupplier(rfqData.suppliers[0]);
            }
          }
        } else {
          setError('Failed to load RFQ details');
        }
      })
      .catch(err => {
        console.error('Error loading RFQ data:', err);
        console.error('Error details:', err.response?.data);
        setError(err.message || 'Error loading RFQ data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, supplierId]);
  
  const handleApproval = (values) => {
    const isApprove = approvalDecision === 'approve';
    
    confirm({
      title: isApprove ? 'Approve RFQ?' : 'Reject RFQ?',
      icon: <ExclamationCircleOutlined />,
      content: isApprove 
        ? 'Are you sure you want to approve this RFQ? This action will notify the procurement team.'
        : 'Are you sure you want to reject this RFQ? This action will notify the procurement team.',
      okText: isApprove ? 'Approve' : 'Reject',
      cancelText: 'Cancel',
      okType: isApprove ? 'primary' : 'danger',
      onOk() {
        submitApproval(values, isApprove);
      },
    });
  };
  
  const submitApproval = (values, isApprove) => {
    setSubmitting(true);
    setError(null);
    
    const requestData = {
      supplierId: supplierId || currentSupplier?.supplierId || currentSupplier?.id,
      comments: values.comments,
      decision: isApprove ? 'approve' : 'reject'
    };
    
    console.log('Submitting approval with data:', requestData);
    console.log('Current supplier:', currentSupplier);
    console.log('URL supplierId:', supplierId);
    
    const endpoint = isApprove ? 'supplier-approve' : 'supplier-reject';
    
    request.post({
      entity: `procurement/rfq/${id}/${endpoint}`,
      jsonData: requestData
    })
      .then(response => {
        const action = isApprove ? 'approved' : 'rejected';
        messageApi.success(`RFQ ${action} successfully`);
        
        // Reload RFQ data to show updated status
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      })
      .catch(err => {
        console.error('Error submitting approval:', err);
        setError(err.message || `Error ${isApprove ? 'approving' : 'rejecting'} RFQ`);
        messageApi.error(`Failed to ${isApprove ? 'approve' : 'reject'} RFQ`);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'sent':
        return 'processing';
      case 'in_progress':
        return 'warning';
      case 'approved_by_supplier':
        return 'success';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }
  
  if (!rfq) {
    return (
      <div className="container">
        <Alert
          message="RFQ Not Found"
          description="The requested RFQ could not be found."
          type="error"
          showIcon
        />
      </div>
    );
  }
  
  const isAlreadyApproved = currentSupplier?.status === 'approved';
  const isAlreadyRejected = currentSupplier?.status === 'rejected';
  const hasResponded = isAlreadyApproved || isAlreadyRejected;
  
  return (
    <div className="container">
      <div className="page-header">
        <Title level={2}>
          <FileTextOutlined /> Supplier RFQ Approval
        </Title>
      </div>
      
      {error && (
        <Alert 
          message="Error" 
          description={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: 16 }}
        />
      )}
      
      {hasResponded && (
        <Alert
          message={`RFQ ${isAlreadyApproved ? 'Approved' : 'Rejected'}`}
          description={`You have already ${isAlreadyApproved ? 'approved' : 'rejected'} this RFQ.`}
          type={isAlreadyApproved ? 'success' : 'warning'}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Card title="RFQ Details" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="RFQ Number">
            {rfq.rfqNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(rfq.status)}>
              {rfq.status?.replace(/_/g, ' ')?.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            {rfq.description}
          </Descriptions.Item>
          <Descriptions.Item label="Response Deadline">
            {rfq.responseDeadline ? new Date(rfq.responseDeadline).toLocaleDateString() : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Created Date">
            {rfq.createdAt ? new Date(rfq.createdAt).toLocaleDateString() : 'N/A'}
          </Descriptions.Item>
          {rfq.notes && (
            <Descriptions.Item label="Notes" span={2}>
              {rfq.notes}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
      
      {rfq.items && rfq.items.length > 0 && (
        <Card title="RFQ Items" style={{ marginBottom: 16 }}>
          <List
            dataSource={rfq.items}
            renderItem={(item, index) => (
              <List.Item>
                <List.Item.Meta
                  title={`Item ${index + 1}: ${item.description || 'N/A'}`}
                  description={
                    <Space direction="vertical" size="small">
                      <Text>Quantity: {item.quantity || 'N/A'}</Text>
                      <Text>UOM: {item.uom || 'N/A'}</Text>
                      {item.specifications && <Text>Specifications: {item.specifications}</Text>}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}
      
      {!hasResponded && (
        <Card title="Supplier Response" style={{ marginBottom: 16 }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleApproval}
          >
            <Form.Item
              label="Decision"
              style={{ marginBottom: 16 }}
            >
              <Radio.Group 
                value={approvalDecision} 
                onChange={(e) => setApprovalDecision(e.target.value)}
                size="large"
              >
                <Radio.Button value="approve" style={{ color: 'green' }}>
                  <CheckOutlined /> Approve RFQ
                </Radio.Button>
                <Radio.Button value="reject" style={{ color: 'red' }}>
                  <CloseOutlined /> Reject RFQ
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
            
            <Form.Item
              name="comments"
              label="Comments"
              rules={[
                { required: true, message: 'Please provide comments for your decision' }
              ]}
            >
              <TextArea 
                rows={4} 
                placeholder={`Please provide comments about your ${approvalDecision === 'approve' ? 'approval' : 'rejection'}...`}
              />
            </Form.Item>
            
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Space>
                <Button onClick={() => navigate('/rfq')}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={submitting}
                  icon={approvalDecision === 'approve' ? <CheckOutlined /> : <CloseOutlined />}
                  style={{
                    backgroundColor: approvalDecision === 'approve' ? '#52c41a' : '#ff4d4f',
                    borderColor: approvalDecision === 'approve' ? '#52c41a' : '#ff4d4f'
                  }}
                >
                  {approvalDecision === 'approve' ? 'Approve RFQ' : 'Reject RFQ'}
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      )}
      
      {currentSupplier && (
        <Card title="Your Response Status" size="small">
          <Descriptions size="small">
            <Descriptions.Item label="Supplier">
              {currentSupplier.supplierName}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={currentSupplier.status === 'approved' ? 'success' : 
                         currentSupplier.status === 'rejected' ? 'error' : 'default'}>
                {currentSupplier.status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            {currentSupplier.respondedAt && (
              <Descriptions.Item label="Response Date">
                {new Date(currentSupplier.respondedAt).toLocaleDateString()}
              </Descriptions.Item>
            )}
            {currentSupplier.notes && (
              <Descriptions.Item label="Comments" span={2}>
                {currentSupplier.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}
    </div>
  );
}

export default RFQSupplierApproval;
