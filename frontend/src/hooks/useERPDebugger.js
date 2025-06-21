// React Hook for ERP Debugger Integration
import React, { useEffect, useRef } from 'react';
import { isDevelopment } from '../utils/environment.js';

// Import the debugger
let erpDebugger;
if (typeof window !== 'undefined') {
  // Load debugger dynamically to avoid SSR issues
  import('../utils/debugger.js').then(module => {
    erpDebugger = module.default;
  });
}

export const useERPDebugger = () => {
  const debuggerRef = useRef(null);

  useEffect(() => {
    // Debugger is disabled - no initialization needed
    return;
  }, []);

  const logInventoryAction = (action, data) => {
    debuggerRef.current?.logInventoryAction(action, data);
    console.log(`[INVENTORY] ${action}:`, data);
  };

  const logDeleteAttempt = (itemId) => {
    debuggerRef.current?.logDeleteAttempt(itemId);
    console.log(`[DELETE] Attempting to delete item:`, itemId);
  };

  const logDeleteSuccess = (itemId) => {
    debuggerRef.current?.logDeleteSuccess(itemId);
    console.log(`[DELETE] Successfully deleted item:`, itemId);
  };

  const logDeleteError = (itemId, error) => {
    debuggerRef.current?.logDeleteError(itemId, error);
    console.error(`[DELETE] Failed to delete item ${itemId}:`, error);
  };

  const logAPICall = (method, url, data, response) => {
    const logData = { method, url, data, response, timestamp: new Date() };
    debuggerRef.current?.addLog('api', [`📡 API CALL: ${method} ${url}`, logData]);
    console.log(`[API] ${method} ${url}:`, logData);
  };

  const showDebugger = () => {
    debuggerRef.current?.showDebugger();
  };

  const hideDebugger = () => {
    debuggerRef.current?.hideDebugger();
  };

  return {
    logInventoryAction,
    logDeleteAttempt,
    logDeleteSuccess,
    logDeleteError,
    logAPICall,
    showDebugger,
    hideDebugger,
    erpDebugger: debuggerRef.current
  };
};

// Higher-order component for automatic debugging
export const withDebugger = (WrappedComponent) => {
  return function DebuggedComponent(props) {
    const erpDebugger = useERPDebugger();
    
    // Using React.createElement instead of JSX to avoid JSX syntax in .js file
    return React.createElement(WrappedComponent, { ...props, erpDebugger });
  };
};

export default useERPDebugger;
