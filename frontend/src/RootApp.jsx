import './style/app.css';

import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { App as AntdApp } from 'antd';
import store from '@/redux/store';
import PageLoader from '@/components/PageLoader';
import { setNotificationApi } from '@/request/errorHandler';
import { lazyWithErrorHandling } from '@/utils/lazyLoadHelper';

const MimiApp = lazyWithErrorHandling(() => import('./apps/MimiApp'));
const SupplierAcceptance = lazyWithErrorHandling(() => import('./pages/SupplierAcceptance'));
const ContractAcceptance = lazyWithErrorHandling(() => import('./pages/ContractAcceptance'));
const RFQResponse = lazyWithErrorHandling(() => import('./pages/RFQResponse'));
const PurchaseOrderApproval = lazyWithErrorHandling(() => import('./pages/PurchaseOrderApproval'));

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
            <Routes>
              {/* Standalone supplier acceptance route - no ERP layout */}
              <Route 
                path="/supplier-acceptance/:token" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <SupplierAcceptance />
                  </Suspense>
                } 
              />
              
              {/* Standalone contract acceptance route - no ERP layout */}
              <Route 
                path="/contract-acceptance/:contractId" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ContractAcceptance />
                  </Suspense>
                } 
              />
              
              {/* Standalone RFQ response route - no ERP layout */}
              <Route 
                path="/rfq-response/:token" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <RFQResponse />
                  </Suspense>
                } 
              />
              
              {/* Standalone purchase order approval route - no ERP layout */}
              <Route 
                path="/po-approval/:token" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <PurchaseOrderApproval />
                  </Suspense>
                } 
              />
              
              {/* All other routes go through the main ERP app */}
              <Route 
                path="/*" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <MimiApp />
                  </Suspense>
                } 
              />
            </Routes>
          </NotificationProvider>
        </AntdApp>
      </Provider>
    </BrowserRouter>
  );
}
