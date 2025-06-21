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

  if (auth && auth.current && auth.current.token) {
    // Ensure the token is included in both header formats for compatibility
    axios.defaults.headers.common['Authorization'] = `Bearer ${auth.current.token}`;
    axios.defaults.headers.common['x-auth-token'] = auth.current.token;
  } else {
    console.error('No authentication token found. User must be logged in to perform this action.');
    throw new Error('Authentication required');
  }
}

const inventoryItemsService = {
  // Fetch inventory items with optional search/filter parameters
  getInventoryItems: async (options = {}) => {
    try {
      includeToken();
      let query = '?';
      
      // Support for search parameters
      const searchParams = [
        'inventoryNumber', 'description', 'manufacturerName', 'unspscCode',
        'criticality', 'condition', 'warehouse', 'belowMinimum',
        'itemNumber', 'shortDescription'
      ];
      
      // Build query string from allowed parameters
      for (const key of searchParams) {
        if (options[key]) {
          query += `${key}=${encodeURIComponent(options[key])}&`;
        }
      }
      
      // Add pagination params if provided
      if (options.page) query += `page=${options.page}&`;
      if (options.limit) query += `limit=${options.limit}&`;
      
      // Remove trailing &
      query = query.endsWith('&') ? query.slice(0, -1) : query;
      
      const response = await axios.get('/inventory' + (query !== '?' ? query : ''));
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      return errorHandler(error);
    }
  },
    // Search inventory items by keywords (for autocomplete)
  searchInventoryItems: async (keyword) => {
    try {
      includeToken();
      const query = `?keyword=${encodeURIComponent(keyword)}`;
      const response = await axios.get(`/inventory/search${query}`);
      return response.data;
    } catch (error) {
      console.error('Error searching inventory items:', error);
      return errorHandler(error);
    }
  },
  
  // Advanced search for inventory items
  advancedSearchInventoryItems: async (searchParams = {}) => {
    try {
      includeToken();
      
      // Build query string from search parameters
      let queryParams = new URLSearchParams();
      
      // Add all search parameters to query
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await axios.get(`/inventory/advanced-search${query}`);
      return response.data;
    } catch (error) {
      console.error('Error performing advanced search for inventory items:', error);
      return errorHandler(error);
    }
  },
  
  // Get detailed information about a specific inventory item
  getInventoryItemDetail: async (id) => {
    try {
      includeToken();
      const response = await axios.get(`/inventory/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory item detail:', error);
      return errorHandler(error);
    }
  },

  // Get all inventory items for selection modal
  getAllInventoryItems: async (options = {}) => {
    try {
      includeToken();
      const { page = 1, limit = 50 } = options;
      const query = `?page=${page}&limit=${limit}`;
      const response = await axios.get(`/inventory/all-items${query}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all inventory items:', error);
      return errorHandler(error);
    }
  },
};

export default inventoryItemsService;
