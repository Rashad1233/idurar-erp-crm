import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import errorHandler from '@/request/errorHandler';
import successHandler from '@/request/successHandler';
import storePersist from '@/redux/storePersist';

// Include auth token in requests
function includeToken() {
  axios.defaults.baseURL = API_BASE_URL;
  axios.defaults.withCredentials = true;
  const auth = storePersist.get('auth');

  if (auth) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${auth.current.token}`;
    axios.defaults.headers.common['x-auth-token'] = auth.current.token;
  }
}

const reorderRequestService = {
  // Scan inventory for items below minimum level
  scanInventoryItems: async (warehouseId) => {
    try {
      includeToken();
      const response = await axios.post('inventory/reorder-request/scan', { warehouseId });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  // Create reorder request
  createReorderRequest: async (requestData) => {
    try {
      includeToken();
      const response = await axios.post('inventory/reorder-request', requestData);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  // Submit reorder request for approval
  submitReorderRequest: async (id, requestData) => {
    try {
      includeToken();
      const response = await axios.put(`inventory/reorder-request/${id}/submit`, requestData);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  // Approve reorder request
  approveReorderRequest: async (id, approvalData) => {
    try {
      includeToken();
      const response = await axios.put(`inventory/reorder-request/${id}/approve`, approvalData);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  // Get reorder requests
  getReorderRequests: async (options = {}) => {
    try {
      includeToken();
      let query = '?';
      for (var key in options) {
        query += key + '=' + options[key] + '&';
      }
      query = query.slice(0, -1);
      
      const response = await axios.get('inventory/reorder-request' + (Object.keys(options).length ? query : ''));
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  // Get reorder request by ID
  getReorderRequest: async (id) => {
    try {
      includeToken();
      const response = await axios.get(`inventory/reorder-request/${id}`);
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  // Cancel reorder request
  cancelReorderRequest: async (id, reason) => {
    try {
      includeToken();
      const response = await axios.put(`inventory/reorder-request/${id}/cancel`, { reason });
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
      });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  }
};

export default reorderRequestService;
