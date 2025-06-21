import React, { useEffect } from 'react';
import { App as AntdApp } from 'antd';
import { setNotificationApi } from '@/request/errorHandler';
import ErpCrmApp from '@/apps/ErpApp';

/**
 * Root App component that provides the Ant Design App context
 * and sets up the notification API for use in the errorHandler
 */
export default function RootApp() {
  return (
    <AntdApp>
      <NotificationProvider>
        <ErpCrmApp />
      </NotificationProvider>
    </AntdApp>
  );
}

/**
 * Component that sets up the notification API
 */
function NotificationProvider({ children }) {
  const { notification } = AntdApp.useApp();
  
  useEffect(() => {
    // Set the notification API for use in the errorHandler
    setNotificationApi(notification);
    
    return () => {
      // Clean up on unmount
      setNotificationApi(null);
    };
  }, [notification]);
  
  return children;
}
