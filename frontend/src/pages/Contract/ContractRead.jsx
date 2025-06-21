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
  Row,
  Col,
  message,
  Tooltip,
  List,
  Avatar
} from 'antd';
import {
  FileProtectOutlined,
  CheckOutlined,
  CloseOutlined,
  SendOutlined,
  ShopOutlined,
  EyeOutlined,
  DownloadOutlined,
  PrinterOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  HistoryOutlined,
  UserOutlined,
  EditOutlined,
  FileOutlined,
  CalendarOutlined,
  DollarOutlined
} from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/auth/selectors';
import { DOWNLOAD_BASE_URL } from '@/config/serverApiConfig';
import moment from 'moment';
import { generate as uniqueId } from 'shortid';

const { Step } = Steps;
const { TextArea } = Input;
const { Title, Text } = Typography;

function ContractRead() {
  const { id } = useParams();
  const navigate = useNavigate();
  const translate = useLanguage();
  const currentUser = useSelector(selectCurrentUser);
  
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [terminateModalVisible, setTerminateModalVisible] = useState(false);
  const [renewModalVisible, setRenewModalVisible] = useState(false);
  const [renewForm] = Form.useForm();
  const [terminateForm] = Form.useForm();
  const [actionInProgress, setActionInProgress] = useState(false);
  
  // Load contract data
  useEffect(() => {
    const fetchContractData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await request.read({ entity: 'contract', id });
        setContract(response.result);
      } catch (err) {
        setError(err.message || 'Error loading contract details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContractData();
  }, [id]);
  
  // Handle contract termination
  const handleTerminateContract = async (values) => {
    setActionInProgress(true);
    
    try {
      const response = await request.update({
        entity: 'contract',
        id,
        jsonData: {
          status: 'terminated',
          terminationReason: values.reason,
          terminationDate: new Date().toISOString(),
          terminatedBy: currentUser._id,
        }
      });
      
      if (response.success) {
        message.success(translate('Contract terminated successfully'));
        setTerminateModalVisible(false);
        
        // Refresh contract data
        const updatedContract = await request.read({ entity: 'contract', id });
        setContract(updatedContract.result);
      } else {
        throw new Error(response.message || 'Failed to terminate contract');
      }
    } catch (err) {
      message.error(err.message || 'Error terminating contract');
    } finally {
      setActionInProgress(false);
    }
  };
  
  // Handle contract renewal
  const handleRenewContract = async (values) => {
    setActionInProgress(true);
    
    try {
      const response = await request.update({
        entity: 'contract',
        id,
        jsonData: {
          endDate: values.newEndDate.toISOString(),
          renewalHistory: [
            ...(contract.renewalHistory || []),
            {
              renewedBy: currentUser._id,
              renewedByName: `${currentUser.name}`,
              renewedOn: new Date().toISOString(),
              originalEndDate: contract.endDate,
              newEndDate: values.newEndDate.toISOString(),
              notes: values.notes
            }
          ]
        }
      });
      
      if (response.success) {
        message.success(translate('Contract renewed successfully'));
        setRenewModalVisible(false);
        
        // Refresh contract data
        const updatedContract = await request.read({ entity: 'contract', id });
        setContract(updatedContract.result);
      } else {
        throw new Error(response.message || 'Failed to renew contract');
      }
    } catch (err) {
      message.error(err.message || 'Error renewing contract');
    } finally {
      setActionInProgress(false);
    }
  };
  
  // Generate contract status tag
  const getStatusTag = (status) => {
    let color = 'default';
    
    switch (status) {
      case 'active':
        color = 'green';
        break;
      case 'draft':
        color = 'blue';
        break;
      case 'expired':
        color = 'red';
        break;
      case 'pending_approval':
        color = 'gold';
        break;
      case 'terminated':
        color = 'volcano';
        break;
      default:
        color = 'default';
    }
    
    return <Tag color={color}>{translate(status?.replace(/_/g, ' ')?.toUpperCase() || 'UNKNOWN')}</Tag>;
  };
  
  // Determine if current user can perform actions
  const canPerformActions = () => {
    if (!contract || !currentUser) return false;
    
    // Admin users or contract creators can perform actions
    return currentUser.role === 'admin' || contract.createdBy === currentUser._id;
  };
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }
  
  if (error) {
    return <Alert message={translate('Error')} description={error} type="error" />;
  }
  
  if (!contract) {
    return <Alert message={translate('Not Found')} description={translate('Contract not found')} type="warning" />;
  }
  
  return (
    <div className="contract-read">
      <div className="page-header">
        <div className="page-header-title">
          <Space align="center">
            <FileProtectOutlined style={{ fontSize: '24px' }} />
            <Title level={3} style={{ marginBottom: 0 }}>
              {contract.number || ''} - {contract.name || ''}
            </Title>
            {getStatusTag(contract.status)}
          </Space>
        </div>
        <div className="page-header-actions">
          <Space>
            <Button 
              icon={<FileTextOutlined />} 
              onClick={() => window.open(`${DOWNLOAD_BASE_URL}/contract/preview/${id}`, '_blank')}
            >
              {translate('Preview')}
            </Button>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={() => window.open(`${DOWNLOAD_BASE_URL}/contract/pdf/${id}`, '_blank')}
            >
              {translate('Download PDF')}
            </Button>
            <Button 
              icon={<PrinterOutlined />} 
              onClick={() => window.open(`${DOWNLOAD_BASE_URL}/contract/print/${id}`, '_blank')}
            >
              {translate('Print')}
            </Button>
            {canPerformActions() && contract.status === 'active' && (
              <Button 
                danger 
                icon={<CloseOutlined />} 
                onClick={() => setTerminateModalVisible(true)}
              >
                {translate('Terminate')}
              </Button>
            )}
            {canPerformActions() && contract.status === 'active' && (
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={() => setRenewModalVisible(true)}
              >
                {translate('Renew')}
              </Button>
            )}
          </Space>
        </div>
      </div>
      
      <Divider />
        <Tabs 
        defaultActiveKey="details"
        items={[
          {
            key: 'details',
            label: (
              <span>
                <FileTextOutlined /> {translate('Details')}
              </span>
            ),
            children: (
              <>
                <Row gutter={[16, 16]}>
                  <Col span={16}>
                    <Card title={translate('Contract Information')}>
                      <Descriptions bordered column={2}>
                        <Descriptions.Item label={translate('Contract Number')}>
                          {contract.number || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label={translate('Contract Name')}>
                          {contract.name || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label={translate('Supplier')}>
                          <Space>
                            <ShopOutlined />
                            {contract.supplier?.name || '-'}
                          </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label={translate('Contract Type')}>
                          {translate(contract.contractType?.replace(/_/g, ' ')?.toUpperCase() || '-')}
                        </Descriptions.Item>
                        <Descriptions.Item label={translate('Start Date')}>
                          <CalendarOutlined /> {contract.startDate ? moment(contract.startDate).format('YYYY-MM-DD') : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label={translate('End Date')}>
                          <CalendarOutlined /> {contract.endDate ? moment(contract.endDate).format('YYYY-MM-DD') : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label={translate('Contract Value')} span={2}>
                          <DollarOutlined /> {contract.currency || 'USD'} {contract.value?.toFixed(2) || '0.00'}
                        </Descriptions.Item>
                        <Descriptions.Item label={translate('Payment Terms')}>
                          {translate(contract.paymentTerms?.replace(/_/g, ' ')?.toUpperCase() || '-')}
                        </Descriptions.Item>
                        <Descriptions.Item label={translate('Billing Frequency')}>
                          {translate(contract.billingFrequency?.replace(/_/g, ' ')?.toUpperCase() || '-')}
                        </Descriptions.Item>
                        <Descriptions.Item label={translate('Created By')} span={2}>
                          <UserOutlined /> {contract.createdByName || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label={translate('Created On')} span={2}>
                          {contract.createdAt ? moment(contract.createdAt).format('YYYY-MM-DD HH:mm') : '-'}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                  
                  <Col span={8}>
                    <Card title={translate('Contract Status')} style={{ marginBottom: '16px' }}>
                      <div style={{ textAlign: 'center', padding: '16px' }}>
                        {getStatusTag(contract.status)}
                        <div style={{ marginTop: '16px' }}>
                          <Text strong>{translate('Current Status')}</Text>
                        </div>
                      </div>
                      {contract.status === 'terminated' && (
                        <div style={{ marginTop: '16px' }}>
                          <Alert
                            message={translate('Contract Terminated')}
                            description={
                              <>
                                <p><strong>{translate('Reason')}:</strong> {contract.terminationReason || '-'}</p>
                                <p><strong>{translate('Date')}:</strong> {contract.terminationDate ? moment(contract.terminationDate).format('YYYY-MM-DD') : '-'}</p>
                              </>
                            }
                            type="error"
                            showIcon
                          />
                        </div>
                      )}
                    </Card>
                    
                    <Card title={translate('Related Documents')} style={{ marginBottom: '16px' }}>
                      {contract.attachments && contract.attachments.length > 0 ? (
                        <List
                          itemLayout="horizontal"
                          dataSource={contract.attachments}
                          renderItem={(item) => (
                            <List.Item
                              actions={[
                                <Tooltip title={translate('Download')}>
                                  <Button 
                                    type="text" 
                                    icon={<DownloadOutlined />} 
                                    onClick={() => window.open(`${DOWNLOAD_BASE_URL}/attachments/${item.path}`, '_blank')}
                                  />
                                </Tooltip>
                              ]}
                            >
                              <List.Item.Meta
                                avatar={<Avatar icon={<FileOutlined />} />}
                                title={item.name || 'Document'}
                                description={item.type || 'File'}
                              />
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Empty description={translate('No attachments found')} />
                      )}
                    </Card>
                  </Col>
                </Row>
                
                <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                  <Col span={24}>
                    <Card title={translate('Terms & Conditions')}>
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {contract.terms || translate('No terms and conditions specified')}
                      </div>
                    </Card>
                  </Col>
                </Row>
                
                <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                  <Col span={24}>
                    <Card title={translate('Notes')}>
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {contract.notes || translate('No additional notes')}
                      </div>
                    </Card>
                  </Col>
                </Row>
              </>
            ),
          },
          {
            key: 'history',
            label: (
              <span>
                <HistoryOutlined /> {translate('History')}
              </span>
            ),
            children: (
              <Card title={translate('Contract History')}>
                <Timeline mode="left">
                  {/* Creation */}
                  <Timeline.Item 
                    dot={<FileProtectOutlined style={{ fontSize: '16px' }} />}
                  >
                    <p><strong>{translate('Contract Created')}</strong></p>
                    <p>{translate('Created by')}: {contract.createdByName || '-'}</p>
                    <p>{translate('Date')}: {contract.createdAt ? moment(contract.createdAt).format('YYYY-MM-DD HH:mm') : '-'}</p>
                  </Timeline.Item>
                  
                  {/* Approval history if any */}
                  {contract.approvals && contract.approvals.map((approval, index) => (
                    <Timeline.Item 
                      key={index}
                      color={approval.status === 'approved' ? 'green' : 'red'}
                      dot={approval.status === 'approved' ? <CheckOutlined style={{ fontSize: '16px' }} /> : <CloseOutlined style={{ fontSize: '16px' }} />}
                    >
                      <p><strong>{translate(approval.status === 'approved' ? 'Contract Approved' : 'Contract Rejected')}</strong></p>
                      <p>{translate('By')}: {approval.approverName || '-'}</p>
                      <p>{translate('Date')}: {approval.actionDate ? moment(approval.actionDate).format('YYYY-MM-DD HH:mm') : '-'}</p>
                      {approval.comments && <p>{translate('Comments')}: {approval.comments}</p>}
                    </Timeline.Item>
                  ))}
                  
                  {/* Renewal history if any */}
                  {contract.renewalHistory && contract.renewalHistory.map((renewal, index) => (
                    <Timeline.Item 
                      key={index}
                      color="blue"
                      dot={<CalendarOutlined style={{ fontSize: '16px' }} />}
                    >
                      <p><strong>{translate('Contract Renewed')}</strong></p>
                      <p>{translate('By')}: {renewal.renewedByName || '-'}</p>
                      <p>{translate('Date')}: {renewal.renewedOn ? moment(renewal.renewedOn).format('YYYY-MM-DD HH:mm') : '-'}</p>
                      <p>{translate('Original End Date')}: {renewal.originalEndDate ? moment(renewal.originalEndDate).format('YYYY-MM-DD') : '-'}</p>
                      <p>{translate('New End Date')}: {renewal.newEndDate ? moment(renewal.newEndDate).format('YYYY-MM-DD') : '-'}</p>
                      {renewal.notes && <p>{translate('Notes')}: {renewal.notes}</p>}
                    </Timeline.Item>
                  ))}
                  
                  {/* Termination if applicable */}
                  {contract.status === 'terminated' && (
                    <Timeline.Item 
                      color="red"
                      dot={<CloseOutlined style={{ fontSize: '16px' }} />}
                    >
                      <p><strong>{translate('Contract Terminated')}</strong></p>
                      <p>{translate('By')}: {contract.terminatedByName || '-'}</p>
                      <p>{translate('Date')}: {contract.terminationDate ? moment(contract.terminationDate).format('YYYY-MM-DD HH:mm') : '-'}</p>
                      <p>{translate('Reason')}: {contract.terminationReason || '-'}</p>
                    </Timeline.Item>
                  )}
                </Timeline>
              </Card>
            ),
          },
        ]}
      />
      
      {/* Termination Modal */}
      <Modal
        title={translate('Terminate Contract')}
        visible={terminateModalVisible}
        onCancel={() => setTerminateModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Alert
          message={translate('Warning')}
          description={translate('Terminating a contract is irreversible. Please confirm you want to proceed.')}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form 
          form={terminateForm}
          layout="vertical"
          onFinish={handleTerminateContract}
        >
          <Form.Item
            name="reason"
            label={translate('Termination Reason')}
            rules={[{ required: true, message: translate('Please provide a termination reason') }]}
          >
            <TextArea rows={4} placeholder={translate('Explain why this contract is being terminated')} />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setTerminateModalVisible(false)}>
                {translate('Cancel')}
              </Button>
              <Button 
                type="primary"
                danger
                htmlType="submit"
                loading={actionInProgress}
                icon={<CloseOutlined />}
              >
                {translate('Terminate Contract')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Renewal Modal */}
      <Modal
        title={translate('Renew Contract')}
        visible={renewModalVisible}
        onCancel={() => setRenewModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form 
          form={renewForm}
          layout="vertical"
          onFinish={handleRenewContract}
        >
          <Alert
            message={
              <div>
                <p>
                  <strong>{translate('Current End Date')}:</strong> {contract.endDate ? moment(contract.endDate).format('YYYY-MM-DD') : '-'}
                </p>
              </div>
            }
            type="info"
            style={{ marginBottom: 16 }}
          />
          
          <Form.Item
            name="newEndDate"
            label={translate('New End Date')}
            rules={[
              { required: true, message: translate('Please select a new end date') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || moment(value).isAfter(moment(contract.endDate))) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(translate('New end date must be after current end date')));
                },
              }),
            ]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD" 
              disabledDate={(current) => current && current < moment(contract.endDate).endOf('day')}
            />
          </Form.Item>
          
          <Form.Item
            name="notes"
            label={translate('Renewal Notes')}
          >
            <TextArea rows={3} placeholder={translate('Notes about this contract renewal')} />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setRenewModalVisible(false)}>
                {translate('Cancel')}
              </Button>
              <Button 
                type="primary"
                htmlType="submit"
                loading={actionInProgress}
                icon={<CheckOutlined />}
              >
                {translate('Renew Contract')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ContractRead;
