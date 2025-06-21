import { Suspense, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import { AppContextProvider } from '@/context/appContext';
import PageLoader from '@/components/PageLoader';
import AuthRouter from '@/router/AuthRouter';
import Localization from '@/locale/Localization';
import { App, ConfigProvider } from 'antd';
import { initAuthInterceptors } from '@/auth/authInterceptor';
import { lazyWithErrorHandling } from '@/utils/lazyLoadHelper';

const ErpApp = lazyWithErrorHandling(() => import('./ErpApp'));

const DefaultApp = () => (
  <Localization>
    <AppContextProvider>
      <Suspense fallback={<PageLoader />}>
        <ErpApp />
      </Suspense>
    </AppContextProvider>
  </Localization>
);

function MimiApp() {
  const { isLoggedIn } = useSelector(selectAuth);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Initialize authentication interceptors
    initAuthInterceptors();
    
    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return (
    <ConfigProvider>
      <App>
        {isLoggedIn ? <DefaultApp /> : <AuthRouter />}
        {!isOnline && (
          <div style={{ position: 'fixed', bottom: 0, width: '100%', textAlign: 'center', background: '#ff4d4f', color: 'white', padding: '8px' }}>
            You are currently offline
          </div>
        )}
      </App>
    </ConfigProvider>
  );
}

export default MimiApp;
