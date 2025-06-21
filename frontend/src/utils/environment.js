// Environment utility for browser-safe environment detection
export const isDevelopment = () => {
  // Check if we're in development mode using various methods
  try {
    // First try the injected environment variable from Vite/React
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env.DEV || import.meta.env.MODE === 'development';
    }
    
    // Fallback to checking for development indicators
    const hostname = window?.location?.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
    
    // Check for common development ports
    const port = window?.location?.port;
    const isDevelopmentPort = port === '3000' || port === '3001' || port === '8080' || port === '5173';
    
    // Check if we're running with development tools
    const hasDevTools = typeof window !== 'undefined' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    
    return isLocalhost || isDevelopmentPort || hasDevTools;
  } catch (error) {
    // If all else fails, assume production for safety
    console.warn('Could not determine environment, assuming production:', error);
    return false;
  }
};

export const getEnvironment = () => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env.MODE || (import.meta.env.DEV ? 'development' : 'production');
    }
    return isDevelopment() ? 'development' : 'production';
  } catch (error) {
    return 'production';
  }
};

export const getApiBaseUrl = () => {
  try {
    // Try to get from environment variables
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL;
    }
    
    // Fallback to default based on environment
    if (isDevelopment()) {
      return 'http://localhost:8888';
    }
    
    return window?.location?.origin || 'http://localhost:8888';
  } catch (error) {
    return 'http://localhost:8888';
  }
};

export default {
  isDevelopment,
  getEnvironment,
  getApiBaseUrl
};
