import { Space, Layout, Divider, Typography } from 'antd';
import useLanguage from '@/locale/useLanguage';
import { useSelector } from 'react-redux';
import MimiAppLogo from '@/components/MimiAppLogo';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function SideContent() {
  const translate = useLanguage();

  return (
    <Content
      style={{
        padding: '150px 30px 30px',
        width: '100%',
        maxWidth: '450px',
        margin: '0 auto',
      }}
      className="sideContent"
    >
      <div style={{ width: '100%' }}>        <div style={{ margin: '0 0 40px', display: 'block' }}>
          <MimiAppLogo />
        </div>        <Title level={1} style={{ fontSize: 28 }}>
          MimiApp ERP / CRM
        </Title>
        <Text>
          Business Management Application
        </Text>

        <div className="space20"></div>
      </div>
    </Content>
  );
}
