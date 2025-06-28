import { Layout } from 'antd';
import AppRouter from '@/router/AppRouter';

export default function SupplierPortalApp() {
  const { Content } = Layout;

  return (
    <Layout>
      <Content
        style={{
          margin: '40px auto 30px',
          overflow: 'initial',
          width: '100%',
          padding: '0 50px',
          maxWidth: 800
        }}
      >
        <AppRouter />
      </Content>
    </Layout>
  );
}
