import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Card, 
  Descriptions, 
  Table, 
  Tag, 
  Alert, 
  Spin,
  Typography,
  Space,
  Divider,
  Steps,
  Modal,
  Timeline
} from 'antd';
import { 
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  FileTextOutlined,
  PrinterOutlined,
  SendOutlined,
  HistoryOutlined
} from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/auth/selectors';
import { ErpLayout } from '@/layout';

const { Title, Text } = Typography;
const { Step } = Steps;

function PurchaseRequisitionReadSimple() {
  const { id } = useParams();
  const navigate = useNavigate();
  const translate = useLanguage();
  const currentUser = useSelector(selectCurrentUser);
  
  const [pr, setPr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prItems, setPrItems] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Load PR data
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    request.read({ entity: 'purchase-requisition', id })
      .then(response => {
        setPr(response.result);
        setPrItems(response.result.items || []);
        setApprovalHistory(response.result.approvals || []);
      })
      .catch(err => {
        setError(err.message || 'Error loading purchase requisition');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

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

  // Get step number for status
  const getStatusStepNumber = (status) => {
    switch (status) {
      case 'draft': return 0;
      case 'pending_approval': return 1;
      case 'partially_approved': return 2;
      case 'approved': return 3;
      case 'rejected': return 0;
      default: return 0;
    }
  };

  // Check if current user can approve
  const canApprove = () => {
    return pr?.status === 'pending_approval' && 
           pr?.approver === currentUser._id;
  };  // Define columns for PR items table
  const itemColumns = [
    {
      title: translate('Item Name'),
      dataIndex: 'itemName',
      width: '20%',
      render: (text, record) => (
        <>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          {record.inventoryNumber && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
              <Tag color="blue">{record.inventoryNumber}</Tag>
              {record.manufacturerName && (
                <div style={{ marginTop: 4 }}>
                  <Tag color="purple">{record.manufacturerName}</Tag>
                  {record.manufacturerPartNumber && <Tag>{record.manufacturerPartNumber}</Tag>}
                </div>
              )}
            </div>
          )}
        </>
      ),
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      width: '30%',
    },
    {
      title: translate('Quantity'),
      dataIndex: 'quantity',
      width: '10%',
      align: 'right',
    },
    {
      title: translate('UOM'),
      dataIndex: 'uom',
      width: '10%',
    },
    {
      title: translate('Unit Price'),
      dataIndex: 'price',
      width: '15%',
      align: 'right',
      render: (price) => price ? `${pr?.currency} ${price.toFixed(2)}` : '-',
    },
    {
      title: translate('Total'),
      dataIndex: 'total',
      width: '15%',
      align: 'right',
      render: (_, record) => {
        if (record.price && record.quantity) {
          return `${pr?.currency} ${(record.price * record.quantity).toFixed(2)}`;
        }
        return '-';
      },
    },
  ];

  // Handle status actions
  const handleSubmit = async () => {
    setActionLoading(true);
    try {
      await request.update({
        entity: 'purchase-requisition',
        id,
        jsonData: { status: 'pending_approval' }
      });
      // Reload PR data
      window.location.reload();
    } catch (err) {
      message.error(translate('Error submitting PR'));
    } finally {
      setActionLoading(false);
    }
  };

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
      <div style={{ padding: '0 24px' }}>
        <Card 
          title={
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Space>
                <Title level={4} style={{ margin: 0 }}>
                  {translate('Purchase Requisition')}: {pr?.number}
                </Title>
                <Tag color={getStatusColor(pr?.status)}>
                  {translate(pr?.status?.replace(/_/g, ' ').toUpperCase())}
                </Tag>
              </Space>
              
              <Steps current={getStatusStepNumber(pr?.status)} size="small" style={{ marginBottom: 16 }}>
                <Step title={translate('Draft')} description={translate('Created')} />
                <Step title={translate('Pending')} description={translate('For Approval')} />
                <Step title={translate('Review')} description={translate('In Progress')} />
                <Step title={translate('Approved')} description={translate('Complete')} />
              </Steps>
            </Space>
          }
          extra={
            <Space>
              <Button onClick={() => navigate('/purchase-requisition')} icon={<ArrowLeftOutlined />}>
                {translate('Back')}
              </Button>
              {pr?.status === 'draft' && pr?.createdBy === currentUser._id && (
                <>
                  <Button 
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/purchase-requisition/update/${id}`)}
                  >
                    {translate('Edit')}
                  </Button>
                  <Button 
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSubmit}
                    loading={actionLoading}
                  >
                    {translate('Submit for Approval')}
                  </Button>
                </>
              )}
              {canApprove() && (
                <>
                  <Button 
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => setIsApproveModalVisible(true)}
                  >
                    {translate('Approve')}
                  </Button>
                  <Button 
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => setIsRejectModalVisible(true)}
                  >
                    {translate('Reject')}
                  </Button>
                </>
              )}
              <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
                {translate('Print')}
              </Button>
            </Space>
          }
        >
          <Descriptions bordered column={2}>
            <Descriptions.Item label={translate('PR Number')} span={2}>{pr?.number}</Descriptions.Item>
            <Descriptions.Item label={translate('Description')} span={2}>{pr?.description}</Descriptions.Item>
            <Descriptions.Item label={translate('Cost Center')}>{pr?.costCenter}</Descriptions.Item>
            <Descriptions.Item label={translate('Currency')}>{pr?.currency}</Descriptions.Item>
            <Descriptions.Item label={translate('Total Value')}>
              {pr?.totalValue ? `${pr?.currency} ${pr?.totalValue.toFixed(2)}` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={translate('Created By')}>
              {pr?.creator ? `${pr.creator.firstName} ${pr.creator.lastName}` : pr?.createdBy}
            </Descriptions.Item>
            <Descriptions.Item label={translate('Created Date')}>
              {pr?.created ? new Date(pr?.created).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={translate('Required Date')}>
              {pr?.requiredDate ? new Date(pr?.requiredDate).toLocaleDateString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={translate('Current Approver')}>
              {pr?.approver ? (
                <Tag color="processing">{pr.approver}</Tag>
              ) : '-'}
            </Descriptions.Item>
            {pr?.supplier && (
              <Descriptions.Item label={translate('Supplier')} span={2}>
                {pr.supplier.name} 
                {pr.supplier.email && <Text type="secondary"> ({pr.supplier.email})</Text>}
              </Descriptions.Item>
            )}
            {pr?.comments && (
              <Descriptions.Item label={translate('Comments')} span={2}>
                {pr.comments}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
        
        <Card title={translate('Items')} style={{ marginTop: 16 }}>
          <Table 
            dataSource={prItems} 
            columns={itemColumns} 
            rowKey={record => record._id || Math.random().toString()}
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
                      <strong>{`${pr?.currency} ${totalValue.toFixed(2)}`}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </>
              );
            }}
          />
        </Card>

        {approvalHistory.length > 0 && (
          <Card title={<Space><HistoryOutlined /> {translate('Approval History')}</Space>} style={{ marginTop: 16 }}>
            <Timeline mode="left">
              {approvalHistory.map((approval, index) => (
                <Timeline.Item 
                  key={index}
                  color={approval.status === 'approved' ? 'green' : approval.status === 'rejected' ? 'red' : 'blue'}
                >
                  <Text strong>
                    {translate(`Level ${approval.approvalLevel}`)} - {approval.status.toUpperCase()}
                  </Text>
                  <br />
                  <Text type="secondary">
                    {approval.approver} - {new Date(approval.date).toLocaleString()}
                  </Text>
                  {approval.comments && (
                    <p style={{ marginTop: 8 }}>{approval.comments}</p>
                  )}
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        )}
      </div>
    </ErpLayout>
  );
}

export default PurchaseRequisitionReadSimple;
