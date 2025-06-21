import axios from 'axios';
import { API_BASE_URL } from '../config/serverApiConfig';
import storePersist from '@/redux/storePersist';

// Create axios instance with baseURL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    try {
      const auth = storePersist.get('auth');
      console.log('Auth from store:', auth?.current ? 'exists' : 'not found');
      
      if (auth?.current?.token) {
        config.headers['Authorization'] = `Bearer ${auth.current.token}`;
        config.headers['x-auth-token'] = auth.current.token;
        console.log('Added auth token to request');
      } else {
        console.warn('No auth token found in store');
        
        // Check if we're on a protected route but not authenticated
        if (config.url.includes('/unspsc-hierarchy/') && !auth?.current?.token) {
          console.warn('Attempting to access protected UNSPSC hierarchy route without authentication');
        }
      }
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      storePersist.remove('auth');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
