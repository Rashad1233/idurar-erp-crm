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
  message,
  Typography
} from 'antd';
import {
  FileTextOutlined,
  CheckOutlined,
  CloseOutlined,
  SendOutlined,
  ShoppingOutlined,
  EyeOutlined,
  DownloadOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/auth/selectors';
import { DOWNLOAD_BASE_URL } from '@/config/serverApiConfig';
import ApprovalWorkflow from '@/components/ApprovalWorkflow';
import { ErpLayout } from '@/layout';
import SimpleTable from '@/components/SimpleTable';

const { Step } = Steps;
// Removed TabPane import - using items prop instead
const { TextArea } = Input;

function PurchaseRequisitionRead() {
  const { id } = useParams();
  const navigate = useNavigate();
  const translate = useLanguage();
  const currentUser = useSelector(selectCurrentUser);
  
  const [pr, setPr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prItems, setPrItems] = useState([]);
  const [prAttachments, setPrAttachments] = useState([]);
  const [prApprovals, setPrApprovals] = useState([]);
  
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  
  const [submitLoading, setSubmitLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  
  const [form] = Form.useForm();
  
  // Load PR data
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    request.read({ entity: 'purchase-requisition', id })
      .then(response => {
        setPr(response.result);
        setPrItems(response.result.items || []);
        setPrAttachments(response.result.attachments || []);
        setPrApprovals(response.result.approvals || []);
      })
      .catch(err => {
        setError(err.message || 'Error loading purchase requisition');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);
  
  // Get current step based on PR status
  const getCurrentStep = () => {
    switch (pr?.status) {
      case 'draft':
        return 0;
      case 'pending_approval':
        return 1;
      case 'partially_approved':
        return 1;
      case 'approved':
        return 2;
      case 'rejected':
        return 3;
      default:
        return 0;
    }
  };
  
  // Handle PR submission
  const handleSubmit = () => {
    setSubmitLoading(true);
    
    request.post({ entity: `purchase-requisition/submit/${id}` })
      .then(response => {
        setPr({...pr, status: response.result.status});
        setSubmitModalVisible(false);
        // Reload PR data
        window.location.reload();
      })
      .catch(err => {
        setError(err.message || 'Error submitting purchase requisition');
      })
      .finally(() => {
        setSubmitLoading(false);
      });
  };
  
  // Handle PR approval
  const handleApprove = () => {
    const values = form.getFieldsValue();
    setApproveLoading(true);
    
    request.post({ 
      entity: `purchase-requisition/approve/${id}`,
      jsonData: { comments: values.comments }
    })
      .then(response => {
        setPr({...pr, status: response.result.status});
        setApproveModalVisible(false);
        form.resetFields();
        // Reload PR data
        window.location.reload();
      })
      .catch(err => {
        setError(err.message || 'Error approving purchase requisition');
      })
      .finally(() => {
        setApproveLoading(false);
      });
  };
  
  // Handle PR rejection
  const handleReject = () => {
    const values = form.getFieldsValue();
    setRejectLoading(true);
    
    request.post({ 
      entity: `purchase-requisition/reject/${id}`,
      jsonData: { comments: values.comments }
    })
      .then(response => {
        setPr({...pr, status: response.result.status});
        setRejectModalVisible(false);
        form.resetFields();
        // Reload PR data
        window.location.reload();
      })
      .catch(err => {
        setError(err.message || 'Error rejecting purchase requisition');
      })
      .finally(() => {
        setRejectLoading(false);
      });
  };
  
  // Determine if current user is the current approver
  const isCurrentApprover = () => {
    return pr && pr.approver === currentUser._id;
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'pending_approval':
        return 'processing';
      case 'partially_approved':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Define columns for PR items table
  const itemColumns = [
    {
      title: translate('Item Name'),
      dataIndex: 'itemName',
      key: 'itemName',
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
      title: translate('UOM'),
      dataIndex: 'uom',
      key: 'uom',
    },
    {
      title: translate('Price'),
      dataIndex: 'price',
      key: 'price',
      render: (price) => price ? `$${price.toFixed(2)}` : '-',
    },
    {
      title: translate('Total'),
      dataIndex: 'total',
      key: 'total',
      render: (total, record) => {
        if (record.price && record.quantity) {
          return `$${(record.price * record.quantity).toFixed(2)}`;
        }
        return '-';
      },
    },
  ];
  
  // Define columns for attachments table
  const attachmentColumns = [
    {
      title: translate('File Name'),
      dataIndex: 'fileName',
      key: 'fileName',
    },
    {
      title: translate('File Type'),
      dataIndex: 'fileType',
      key: 'fileType',
    },
    {
      title: translate('File Size'),
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size) => {
        if (size < 1024) {
          return `${size} B`;
        } else if (size < 1024 * 1024) {
          return `${(size / 1024).toFixed(2)} KB`;
        } else {
          return `${(size / (1024 * 1024)).toFixed(2)} MB`;
        }
      },
    },
    {
      title: translate('Uploaded By'),
      dataIndex: 'uploadedBy',
      key: 'uploadedBy',
    },
    {
      title: translate('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<DownloadOutlined />}
          onClick={() => window.open(`${DOWNLOAD_BASE_URL}/attachments/${record.filePath}`, '_blank')}
        >
          {translate('Download')}
        </Button>
      ),
    },
  ];
  
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }
  
  if (error) {
    return <Alert message={translate('Error')} description={error} type="error" />;
  }
    // Show loading state
  if (loading) {
    return (
      <ErpLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Spin size="large" tip={translate('Loading purchase requisition...')} />
        </div>
      </ErpLayout>
    );
  }

  // Show error state
  if (error || !pr) {
    return (
      <ErpLayout>
        <div style={{ padding: '24px' }}>
          <Alert
            message={translate('Error')}
            description={error || translate('Could not load purchase requisition')}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
                {translate('Go Back')}
              </Button>
            }
          />
        </div>
      </ErpLayout>
    );
  }

  return (
    <ErpLayout>
      <div className="container">
        <div className="page-header">
          <div className="page-title">
            <h1>
              {translate('Purchase Requisition')}: {pr?.number}
          </h1>
        </div>
        <div className="page-action">
          {pr?.status === 'draft' && pr?.createdBy === currentUser._id && (
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => setSubmitModalVisible(true)}
            >
              {translate('Submit for Approval')}
            </Button>
          )}
          
          {(pr?.status === 'pending_approval' || pr?.status === 'partially_approved') && isCurrentApprover() && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => setApproveModalVisible(true)}
                style={{ marginRight: 8 }}
              >
                {translate('Approve')}
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => setRejectModalVisible(true)}
              >
                {translate('Reject')}
              </Button>
            </>
          )}
          
          {pr?.status === 'approved' && (
            <Button
              type="primary"
              icon={<ShoppingOutlined />}
              onClick={() => navigate(`/rfq/create?prId=${id}`)}
            >
              {translate('Create RFQ')}
            </Button>
          )}
          
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => navigate('/purchase-requisition')}
          >
            {translate('Back')}
          </Button>
        </div>
      </div>
      
      <div className="pr-status-container" style={{ marginBottom: 24 }}>
        <Card>
          <Steps current={getCurrentStep()} size="small">
            <Step title={translate('Draft')} icon={<FileTextOutlined />} />
            <Step title={translate('Pending Approval')} icon={<EyeOutlined />} />
            <Step title={translate('Approved')} icon={<CheckOutlined />} />
            <Step 
              title={translate('Rejected')} 
              icon={<CloseOutlined />} 
              status={pr?.status === 'rejected' ? 'error' : 'wait'}
            />
          </Steps>
        </Card>
      </div>
        <Tabs 
        defaultActiveKey="details"
        items={[
          {
            key: "details",
            label: translate('Details'),
            children: (
              <>
                <Card>
                  <Descriptions title={translate('PR Information')} bordered>
                    <Descriptions.Item label={translate('PR Number')}>{pr?.number}</Descriptions.Item>
                    <Descriptions.Item label={translate('Description')}>{pr?.description}</Descriptions.Item>
                    <Descriptions.Item label={translate('Status')}>
                      <Tag color={getStatusColor(pr?.status)}>
                        {translate(pr?.status?.replace(/_/g, ' ').toUpperCase())}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label={translate('Cost Center')}>{pr?.costCenter}</Descriptions.Item>
                    <Descriptions.Item label={translate('Currency')}>{pr?.currency}</Descriptions.Item>
                    <Descriptions.Item label={translate('Total Value')}>
                      {pr?.totalValue ? `${pr?.currency} ${pr?.totalValue.toFixed(2)}` : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={translate('Created By')}>{pr?.createdBy}</Descriptions.Item>
                    <Descriptions.Item label={translate('Created Date')}>
                      {pr?.created ? new Date(pr?.created).toLocaleString() : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={translate('Required Date')}>
                      {pr?.requiredDate ? new Date(pr?.requiredDate).toLocaleDateString() : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={translate('Current Approver')}>
                      {pr?.approver || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label={translate('Comments')}>{pr?.comments || '-'}</Descriptions.Item>
                  </Descriptions>
                </Card>
                
                <Card title={translate('Items')} style={{ marginTop: 16 }}>
                  <Table 
                    dataSource={prItems} 
                    columns={itemColumns} 
                    rowKey="_id"
                    pagination={false}
                    summary={pageData => {
                      let totalValue = 0;
                      
                      pageData.forEach(({ price, quantity }) => {
                        if (price && quantity) {
                          totalValue += (price * quantity);
                        }
                      });
                      
                      return (
                        <>
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={5}><strong>{translate('Total')}</strong></Table.Summary.Cell>
                            <Table.Summary.Cell index={1}>
                              <strong>{`$${totalValue.toFixed(2)}`}</strong>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        </>
                      );
                    }}
                  />
                </Card>
              </>
            )
          },
          {
            key: "attachments",
            label: translate('Attachments'),
            children: (
              <Card>
                {prAttachments.length > 0 ? (
                  <Table 
                    dataSource={prAttachments} 
                    columns={attachmentColumns} 
                    rowKey="_id"
                    pagination={false}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: 24 }}>
                    {translate('No attachments found')}
                  </div>
                )}
              </Card>
            )
          },
          {
            key: "approvals",
            label: translate('Approval History'),
            children: (
              <Card>
                {/* New DoFA-based Approval Workflow */}
                {pr && (
                  <ApprovalWorkflow
                    documentId={id}
                    entityType="Purchase Requisition"
                    amount={pr.totalAmount || 0}
                    currentApprovals={pr.approvals || []}
                    costCenter={pr.costCenter}
                    onApprove={(approvalData) => {
                      request
                        .post({
                          entity: `purchase-requisition/approve/${id}`,
                          jsonData: approvalData
                        })
                        .then(() => {
                          message.success(translate('Purchase Requisition approved successfully'));
                          // Reload the data
                          window.location.reload();
                        })
                        .catch(err => {
                          message.error(translate('Failed to approve') + ': ' + (err.message || ''));
                        });
                    }}
                    onReject={(rejectionData) => {
                      request
                        .post({
                          entity: `purchase-requisition/reject/${id}`,
                          jsonData: rejectionData
                        })
                        .then(() => {
                          message.success(translate('Purchase Requisition rejected'));
                          // Reload the data
                          window.location.reload();
                        })
                        .catch(err => {
                          message.error(translate('Failed to reject') + ': ' + (err.message || ''));
                        });
                    }}
                  />
                )}
                
                <Divider orientation="left">{translate('Approval Timeline')}</Divider>
                
                {/* Legacy Approval History */}
                {prApprovals.length > 0 ? (
                  <Timeline>
                    {prApprovals.map((approval, index) => (
                      <Timeline.Item 
                        key={approval._id || index}
                        color={
                          approval.status === 'approved' ? 'green' :
                          approval.status === 'rejected' ? 'red' :
                          approval.status === 'pending' ? 'blue' :
                          'gray'
                        }
                      >
                        <p>
                          <strong>
                            {translate('Level')}: {approval.approvalLevel} - {approval.approver}
                          </strong>
                          <br />
                          {translate('Status')}: {translate(approval.status.toUpperCase())}
                          <br />
                          {approval.actionDate && (
                            <>
                              {translate('Date')}: {new Date(approval.actionDate).toLocaleString()}
                              <br />
                            </>
                          )}
                          {approval.comments && (
                            <>
                              {translate('Comments')}: {approval.comments}
                            </>
                          )}
                        </p>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  <div style={{ textAlign: 'center', padding: 24 }}>
                    {translate('No approval history found')}
                  </div>
                )}
              </Card>
            )
          }
        ]}
      />
      
      {/* Submit Modal */}
      <Modal
        title={translate('Submit Purchase Requisition')}
        visible={submitModalVisible}
        onOk={handleSubmit}
        onCancel={() => setSubmitModalVisible(false)}
        confirmLoading={submitLoading}
      >
        <p>{translate('Are you sure you want to submit this Purchase Requisition for approval?')}</p>
      </Modal>
      
      {/* Approve Modal */}
      <Modal
        title={translate('Approve Purchase Requisition')}
        visible={approveModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setApproveModalVisible(false)}
        confirmLoading={approveLoading}
      >
        <Form form={form} layout="vertical" onFinish={handleApprove}>
          <Form.Item 
            name="comments" 
            label={translate('Comments (Optional)')}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Reject Modal */}
      <Modal
        title={translate('Reject Purchase Requisition')}
        visible={rejectModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setRejectModalVisible(false)}
        confirmLoading={rejectLoading}
      >
        <Form form={form} layout="vertical" onFinish={handleReject}>
          <Form.Item 
            name="comments" 
            label={translate('Reason for Rejection')}
            rules={[
              { required: true, message: translate('Please provide a reason for rejection') }
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>      </Modal>
    </div>
    </ErpLayout>
  );
}

export default PurchaseRequisitionRead;
