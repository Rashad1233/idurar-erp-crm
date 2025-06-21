import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';

function useApiData(endpoint, refreshToggle = false) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!endpoint) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get token from localStorage
        const auth = localStorage.getItem('auth');
        let token = null;
        
        if (auth) {
          try {
            const authData = JSON.parse(auth);
            token = authData.current?.token;
          } catch (e) {
            console.warn('Error parsing auth data:', e);
          }
        }

        // Normalize the endpoint
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        const url = `${API_BASE_URL}${normalizedEndpoint}`;
        
        const config = {};
        if (token) {
          config.headers = {
            'x-auth-token': token
          };
        }

        const response = await axios.get(url, config);
        
        if (isMounted) {
          // Handle both direct data and nested data structures
          const responseData = response.data?.result || response.data?.data || response.data;
          setData(Array.isArray(responseData) ? responseData : []);
        }
      } catch (err) {
        console.error('API Error:', err);
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [endpoint, refreshToggle]);

  return { data, loading, error };
}

export default useApiData;
