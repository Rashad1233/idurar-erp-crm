import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Steps, Button, Modal, Form, Input, Select, Alert, Typography, Card, Tag, Timeline } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, UserOutlined } from '@ant-design/icons';
import { selectCurrentUser } from '@/redux/auth/selectors';
import { getRequiredApprovalLevels, isUserAuthorizedForLevel, getNextApprovalLevel } from '@/config/dofaConfig';
import useLanguage from '@/locale/useLanguage';

const { Step } = Steps;
const { Text, Title } = Typography;

const ApprovalWorkflow = ({ 
  documentId, 
  entityType, 
  amount, 
  currentApprovals = [], 
  onApprove, 
  onReject, 
  costCenter,
  disabled = false 
}) => {
  const translate = useLanguage();
  const currentUser = useSelector(selectCurrentUser);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [action, setAction] = useState(null); // 'approve' or 'reject'
  const [form] = Form.useForm();
  
  // Get required approval levels based on amount
  const requiredApprovalLevels = getRequiredApprovalLevels(amount);
  
  // Determine the current approval status
  const nextApprovalLevel = getNextApprovalLevel(currentApprovals);
  const isFullyApproved = !nextApprovalLevel;
  const isRejected = currentApprovals.some(approval => approval.status === 'rejected');
  
  // Check if current user can approve
  const canApprove = !disabled && !isFullyApproved && !isRejected && 
                    nextApprovalLevel && 
                    isUserAuthorizedForLevel(currentUser._id, nextApprovalLevel);
  
  // Format currency for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };
  
  // Handle approve/reject button click
  const handleActionClick = (actionType) => {
    setAction(actionType);
    setIsModalVisible(true);
  };
  
  // Handle modal confirmation
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (action === 'approve') {
        onApprove({
          documentId,
          level: nextApprovalLevel,
          comments: values.comments,
          approvedBy: currentUser._id,
          approvedAt: new Date().toISOString()
        });
      } else if (action === 'reject') {
        onReject({
          documentId,
          level: nextApprovalLevel,
          rejectionReason: values.comments,
          rejectedBy: currentUser._id,
          rejectedAt: new Date().toISOString()
        });
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };
  
  // Handle modal cancel
  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };
  
  return (
    <Card title={translate('Approval Workflow')} style={{ marginBottom: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <Text strong>{translate('Document Type')}:</Text> {translate(entityType)}
        <br />
        <Text strong>{translate('Amount')}:</Text> {formatCurrency(amount)}
        {costCenter && (
          <>
            <br />
            <Text strong>{translate('Cost Center')}:</Text> {costCenter}
          </>
        )}
      </div>
      
      {isRejected ? (
        <Alert
          message={translate('Document Rejected')}
          description={
            <div>
              <p>{translate('This document has been rejected and cannot be processed further.')}</p>
              {currentApprovals.find(a => a.status === 'rejected')?.rejectionReason && (
                <p>
                  <Text strong>{translate('Reason')}:</Text> {currentApprovals.find(a => a.status === 'rejected').rejectionReason}
                </p>
              )}
            </div>
          }
          type="error"
          showIcon
        />
      ) : isFullyApproved ? (
        <Alert
          message={translate('Fully Approved')}
          description={translate('This document has been fully approved and is ready for processing.')}
          type="success"
          showIcon
        />
      ) : (
        <>
          <Steps current={nextApprovalLevel - 1} direction="vertical">
            {requiredApprovalLevels.map((level, index) => {
              const approval = currentApprovals.find(a => a.level === level.level);
              let status = "wait";
              if (approval) {
                status = approval.status === 'approved' ? 'finish' : 'error';
              } else if (index === nextApprovalLevel - 1) {
                status = 'process';
              }
              
              return (
                <Step
                  key={level.level}
                  title={`${translate('Level')} ${level.level}: ${level.description}`}
                  description={
                    approval ? (
                      <div>
                        {approval.status === 'approved' ? (
                          <>
                            <Tag color="green">{translate('Approved')}</Tag>
                            <div>{translate('By')}: {approval.approvedBy}</div>
                            <div>{translate('Date')}: {new Date(approval.approvedAt).toLocaleString()}</div>
                            {approval.comments && <div>{translate('Comments')}: {approval.comments}</div>}
                          </>
                        ) : (
                          <>
                            <Tag color="red">{translate('Rejected')}</Tag>
                            <div>{translate('By')}: {approval.rejectedBy}</div>
                            <div>{translate('Date')}: {new Date(approval.rejectedAt).toLocaleString()}</div>
                            {approval.rejectionReason && <div>{translate('Reason')}: {approval.rejectionReason}</div>}
                          </>
                        )}
                      </div>
                    ) : (
                      <div>{translate('Pending Approval')}</div>
                    )
                  }
                  status={status}
                  icon={
                    approval ? (
                      approval.status === 'approved' ? <CheckCircleOutlined /> : <CloseCircleOutlined />
                    ) : (
                      index === nextApprovalLevel - 1 ? <ClockCircleOutlined /> : <UserOutlined />
                    )
                  }
                />
              );
            })}
          </Steps>
          
          {canApprove && (
            <div style={{ marginTop: 16 }}>
              <Button 
                type="primary" 
                onClick={() => handleActionClick('approve')}
                style={{ marginRight: 8 }}
              >
                {translate('Approve')}
              </Button>
              <Button 
                danger 
                onClick={() => handleActionClick('reject')}
              >
                {translate('Reject')}
              </Button>
            </div>
          )}
        </>
      )}
      
      {/* Approval/Rejection Modal */}
      <Modal
        title={action === 'approve' ? translate('Approve Document') : translate('Reject Document')}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={action === 'approve' ? translate('Approve') : translate('Reject')}
        okButtonProps={{ danger: action === 'reject' }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="comments"
            label={action === 'approve' ? translate('Comments (Optional)') : translate('Rejection Reason')}
            rules={[
              { 
                required: action === 'reject',
                message: translate('Please provide a reason for rejection') 
              }
            ]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ApprovalWorkflow;
