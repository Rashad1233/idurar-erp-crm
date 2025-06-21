import './style/app.css';

import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { App as AntdApp } from 'antd';
import store from '@/redux/store';
import PageLoader from '@/components/PageLoader';
import { setNotificationApi } from '@/request/errorHandler';
import { lazyWithErrorHandling } from '@/utils/lazyLoadHelper';

const MimiApp = lazyWithErrorHandling(() => import('./apps/MimiApp'));

// Notification Provider Component
function NotificationProvider({ children }) {
  const { notification, message } = AntdApp.useApp();
  
  React.useEffect(() => {
    // Set the notification API for use in the errorHandler
    setNotificationApi(notification);
    
    // Make message API globally available for components
    window.antdMessageApi = message;
    
    return () => {
      // Clean up on unmount
      setNotificationApi(null);
      window.antdMessageApi = null;
    };
  }, [notification, message]);
  
  return children;
}

export default function RootApp() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <AntdApp>
          <NotificationProvider>
            <Suspense fallback={<PageLoader />}>
              <MimiApp />
            </Suspense>
          </NotificationProvider>
        </AntdApp>
      </Provider>
    </BrowserRouter>
  );
}
