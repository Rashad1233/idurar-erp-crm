import React from 'react';
import { Layout, Typography, Space } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

function SupplierPortalLayout({ children }) {
  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Header style={{ 
        backgroundColor: '#fff', 
        padding: '0 24px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)' 
      }}>
        <Space align="center" style={{ height: '100%' }}>
          <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            Supplier Portal
          </Title>
        </Space>
      </Header>
      
      <Content style={{ padding: '24px', flex: 1 }}>
        {children}
      </Content>
      
      <Footer style={{ 
        textAlign: 'center', 
        backgroundColor: '#fff',
        borderTop: '1px solid #d9d9d9'
      }}>
        <Typography.Text type="secondary">
          Supplier Portal © 2025 - Secure Contract Management
        </Typography.Text>
      </Footer>
    </Layout>
  );
}

export default SupplierPortalLayout;