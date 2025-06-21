import { ErpContextProvider } from '@/context/erp';

import { Layout } from 'antd';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

const { Content } = Layout;

export default function ErpLayout({ children }) {
  const location = useLocation();
  
  // Use wider layout for item master and other data-heavy pages
  const isWideLayout = location.pathname.includes('/item-master') || 
                      location.pathname.includes('/item/') ||
                      location.pathname.includes('/inventory') ||
                      location.pathname.includes('/warehouse');
  return (
    <ErpContextProvider>
      <Content
        className={`whiteBox shadow layoutPadding ${isWideLayout ? 'wide-layout' : ''}`}
        style={{
          margin: isWideLayout ? '20px 20px' : '30px auto',
          width: '100%',
          maxWidth: isWideLayout ? '95%' : '1100px',
          minHeight: '600px',
          padding: isWideLayout ? '15px' : '24px',
        }}
      >
        {children}
      </Content>
    </ErpContextProvider>
  );
}
