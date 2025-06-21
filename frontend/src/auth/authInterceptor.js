/**
 * Authentication Interceptor
 * This file sets up axios interceptors to handle authentication-related tasks:
 * 1. Add authentication headers to outgoing requests
 * 2. Handle 401 (Unauthorized) responses by redirecting to login
 */

import axios from 'axios';
import storePersist from '@/redux/storePersist';

/**
 * Initialize the authentication interceptors
 */
export const initAuthInterceptors = () => {
  // Set up request interceptor to add authentication token to all requests
  axios.interceptors.request.use(
    (config) => {
      // Get auth data from local storage
      const auth = storePersist.get('auth');
      
      if (auth && auth.current && auth.current.token) {
        // Add token to both header formats for maximum compatibility
        config.headers['Authorization'] = `Bearer ${auth.current.token}`;
        config.headers['x-auth-token'] = auth.current.token;
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );
    // Set up response interceptor to handle unauthorized responses
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle 401 Unauthorized errors
      if (error.response && error.response.status === 401) {
        // Clear authentication data
        storePersist.remove('auth');
        
        // Only redirect if we're not already on a login-related page
        const currentPath = window.location.pathname;
        const isAuthPage = ['/login', '/forgetpassword', '/resetpassword'].some(path => 
          currentPath.includes(path)
        );
        
        if (!isAuthPage) {
          console.log('Session expired. Redirecting to login...');
          window.location.href = '/login';
        }
      }
      
      return Promise.reject(error);
    }
  );
};
