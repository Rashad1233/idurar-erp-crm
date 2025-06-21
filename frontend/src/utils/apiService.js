import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import { message } from 'antd';

/**
 * Utility functions for API operations with consistent error handling
 */
export const api = {
  /**
   * Get data from API
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Array|Object>} - API response data
   */  get: async (endpoint) => {
    try {
      const normalizedBase = API_BASE_URL.replace(/\/+$/, '');
      const normalizedEndpoint = endpoint.replace(/^\/+/, '');
      const url = `${normalizedBase}/${normalizedEndpoint}`;
      const response = await axios.get(url);
      return response.data.result || [];
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      throw error;
    }
  },
  
  /**
   * Create new item
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Data to create
   * @returns {Promise<Object>} - Created item
   */  create: async (endpoint, data) => {
    try {
      const normalizedBase = API_BASE_URL.replace(/\/+$/, '');
      const normalizedEndpoint = endpoint.replace(/^\/+/, '');
      const url = `${normalizedBase}/${normalizedEndpoint}`;
      const response = await axios.post(url, data);
      message.success('Item created successfully');
      return response.data;
    } catch (error) {
      message.error('Error creating item');
      console.error('Creation error:', error);
      throw error;
    }
  },
  
  /**
   * Update existing item
   * @param {string} endpoint - API endpoint
   * @param {string} id - Item ID
   * @param {Object} data - Data to update
   * @returns {Promise<Object>} - Updated item
   */  update: async (endpoint, id, data) => {
    try {
      const normalizedBase = API_BASE_URL.replace(/\/+$/, ''); // e.g., http://host/api
      const normEndpoint = String(endpoint || '').replace(/^\/+/, '').replace(/\/+$/, ''); 
      const normId = String(id || '').replace(/^\/+/, '').replace(/\/+$/, '');

      let path = normalizedBase;
      if (normEndpoint) {
        path += '/' + normEndpoint;
      }
      // Ensure a slash before ID only if there's an endpoint or ID is not already a full path segment
      if (normId) {
         if (path === normalizedBase && normId.includes('/')) { // if id is 'supplier/undefined' and endpoint was empty
            path += '/' + normId;
         } else if (normEndpoint && normId) { // if endpoint and id both exist
            path += '/' + normId;
         } else if (!normEndpoint && normId) { // if endpoint is empty but id exists
             path += '/' + normId;
         }
      }
      const url = path;
      const response = await axios.patch(url, data);
      message.success('Item updated successfully');
      return response.data;
    } catch (error) {
      message.error('Error updating item');
      console.error('Update error:', error);
      throw error;
    }
  },
  
  /**
   * Delete item
   * @param {string} endpoint - API endpoint
   * @param {string} id - Item ID
   * @returns {Promise<void>}
   */  delete: async (endpoint, id) => {
    try {
      const normalizedBase = API_BASE_URL.replace(/\/+$/, ''); // e.g., http://host/api
      const normEndpoint = String(endpoint || '').replace(/^\/+/, '').replace(/\/+$/, '');
      const normId = String(id || '').replace(/^\/+/, '').replace(/\/+$/, '');

      let path = normalizedBase;
      if (normEndpoint) {
        path += '/' + normEndpoint;
      }
      // Ensure a slash before ID only if there's an endpoint or ID is not already a full path segment
      if (normId) {
         if (path === normalizedBase && normId.includes('/')) { // if id is 'supplier/undefined' and endpoint was empty
            path += '/' + normId;
         } else if (normEndpoint && normId) { // if endpoint and id both exist
            path += '/' + normId;
         } else if (!normEndpoint && normId) { // if endpoint is empty but id exists
             path += '/' + normId;
         }
      }
      const url = path;
      await axios.delete(url);
      message.success('Item deleted successfully');
    } catch (error) {
      message.error('Error deleting item');
      console.error('Delete error:', error);
      throw error;
    }
  }
};

export default api;
