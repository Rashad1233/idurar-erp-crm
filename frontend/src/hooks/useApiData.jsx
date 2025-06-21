import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import { App } from 'antd';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';

const useApiData = (endpoint, refreshTrigger = false) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { current } = useSelector(selectAuth);
  const { message } = App.useApp();
    useEffect(() => {
    setLoading(true);
    setError(null);
    
    const fetchData = async () => {
      try {
        // Skip fetch if endpoint is undefined
        if (!endpoint) {
          console.warn('No endpoint provided to useApiData');
          setLoading(false);
          return;
        }
        
        const token = current?.token; // Get token from Redux auth state
        const normalizedBase = API_BASE_URL.replace(/\/+$/, '');
        const normalizedEndpoint = endpoint.replace(/^\/+/, '');
        const url = `${normalizedBase}/${normalizedEndpoint}`;
          const response = await axios.get(url, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });

        // Backend returns data in response.data.data, not response.data.result
        if (response.data && response.data.success && response.data.data) {
          setData(response.data.data);
        } else if (response.data && Array.isArray(response.data)) {
          // Fallback for direct array responses
          setData(response.data);
        } else {
          setData([]);
          console.warn('No data found in response:', response.data);
        }      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err);
        if (err.response?.status === 401) {
          message.error('Please login again');
        } else if (err.response?.status === 404) {
          message.error('Resource not found');
        } else {
          message.error('Failed to load data');
        }
      } finally {
        setLoading(false);
      }
    };

    if (endpoint) {
      fetchData();
    }
  }, [endpoint, refreshTrigger, current?.token]);

  return { data, loading, error };
};

export default useApiData;
