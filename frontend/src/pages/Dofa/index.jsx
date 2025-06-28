import React from 'react';
import { Card, Typography, Row, Col, Badge } from 'antd';
import { 
  FileProtectOutlined, 
  TeamOutlined, 
  ShoppingOutlined, 
  DollarOutlined,
  SettingOutlined,
  MailOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const DofaManagement = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Contracts Review',
      description: 'Review and approve/reject contracts submitted for DoFA approval',
      icon: <FileProtectOutlined style={{ fontSize: '48px', color: '#1890ff' }} />,
      path: '/dofa/contracts/review',
      badge: 3 // Example pending count
    },
    {
      title: 'Suppliers Review',
      description: 'Review and manage supplier approvals and compliance',
      icon: <TeamOutlined style={{ fontSize: '48px', color: '#52c41a' }} />,
      path: '/dofa/suppliers/review',
      badge: 1
    },
    {
      title: 'RFQ Review Center',
      description: 'Manage RFQ processes, review responses, and send invitations to suppliers',
      icon: <ShoppingOutlined style={{ fontSize: '48px', color: '#722ed1' }} />,
      path: '/dofa/rfq/review',
      badge: 5
    },
    {
      title: 'Purchase Order Approvals',
      description: 'Review and approve purchase orders, manage approval workflows',
      icon: <DollarOutlined style={{ fontSize: '48px', color: '#fa8c16' }} />,
      path: '/dofa/po/approvals',
      badge: 8
    },
    {
      title: 'Approval Workflows',
      description: 'Configure approval chains, thresholds, and delegation rules',
      icon: <SettingOutlined style={{ fontSize: '48px', color: '#13c2c2' }} />,
      path: '/dofa/workflows/manage'
    },
    {
      title: 'Email Templates',
      description: 'Customize approval emails, notifications, and communication templates',
      icon: <MailOutlined style={{ fontSize: '48px', color: '#eb2f96' }} />,
      path: '/dofa/email/templates'
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>DoFA Management</Title>
      <Paragraph>
        Department of Foreign Affairs management system for contract and supplier approvals.
      </Paragraph>
      
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        {modules.map((module, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <Badge count={module.badge} size="default" offset={[-10, 10]}>
              <Card
                hoverable
                style={{ 
                  textAlign: 'center', 
                  height: '100%',
                  border: module.badge ? '2px solid #ff4d4f' : '1px solid #d9d9d9',
                  boxShadow: module.badge ? '0 4px 12px rgba(255, 77, 79, 0.15)' : undefined
                }}
                onClick={() => navigate(module.path)}
              >
                <div style={{ marginBottom: '16px' }}>
                  {module.icon}
                </div>
                <Title level={4}>{module.title}</Title>
                <Paragraph style={{ marginBottom: 0 }}>{module.description}</Paragraph>
                {module.badge && (
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '4px 8px', 
                    background: '#fff2f0', 
                    borderRadius: '4px',
                    color: '#cf1322',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {module.badge} items pending your review
                  </div>
                )}
              </Card>
            </Badge>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default DofaManagement;
