/**
 * Simple utility to test API connections for troubleshooting
 */
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';

/**
 * Tests the connection to a specific API endpoint
 * @param {string} endpoint - The API endpoint to test (without leading slash)
 * @returns {Promise<object>} - Result of the test with status and message
 */
export const testApiConnection = async (endpoint) => {
  try {
    // Setup auth headers
    const auth = storePersist.get('auth');
    const headers = {};
    
    if (auth) {
      headers['Authorization'] = `Bearer ${auth.current.token}`;
      headers['x-auth-token'] = auth.current.token;
    }
    
    console.log(`Testing connection to: ${API_BASE_URL}/${endpoint}`);
    console.log('With headers:', headers);
    
    // Try a basic GET request to test connectivity
    const startTime = Date.now();
    const response = await axios.get(`${API_BASE_URL}/${endpoint}`, { headers });
    const endTime = Date.now();
    
    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      responseTime: `${endTime - startTime}ms`,
      data: response.data
    };
  } catch (error) {
    console.error('API connection test failed:', error);
    
    return {
      success: false,
      status: error.response?.status || 'No response',
      statusText: error.response?.statusText || error.message,
      error: error.message,
      responseDetails: error.response?.data || {}
    };
  }
};

/**
 * Tests the item master API endpoint specifically
 */
export const testItemMasterConnection = async (itemId = null) => {
  const endpoint = itemId 
    ? `inventory/item-master/${itemId}` 
    : 'inventory/item-master?limit=1';
    
  return testApiConnection(endpoint);
};

/**
 * Run a self-check of important API endpoints
 */
export const runApiDiagnostics = async () => {
  console.group('🔍 API Diagnostics');
  
  try {
    // Check authentication
    const auth = storePersist.get('auth');
    console.log('Auth token present:', !!auth?.current?.token);
    
    // Test endpoints
    const endpoints = [
      'inventory/item-master?limit=1',
      'inventory?limit=1',
      'warehouse/storage-location?limit=1'
    ];
    
    const results = {};
    
    for (const endpoint of endpoints) {
      console.log(`Testing ${endpoint}...`);
      results[endpoint] = await testApiConnection(endpoint);
      console.log(`Result: ${results[endpoint].success ? '✅' : '❌'}`);
    }
    
    console.log('Diagnostics complete:', results);
    return results;
  } catch (error) {
    console.error('Diagnostics failed:', error);
    return { success: false, error: error.message };
  } finally {
    console.groupEnd();
  }
};

export default {
  testApiConnection,
  testItemMasterConnection,
  runApiDiagnostics
};
