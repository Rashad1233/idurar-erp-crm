import apiClient from '../api/axiosConfig';
import errorHandler from '../request/errorHandler';
import successHandler from '../request/successHandler';

const unspscService = {
  // Get all UNSPSC codes
  getAllCodes: async () => {
    try {
      const response = await apiClient.get('unspsc');
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },

  // Get UNSPSC codes by level (SEGMENT, FAMILY, CLASS, COMMODITY)
  getCodesByLevel: async (level) => {
    try {
      const response = await apiClient.get(`unspsc/level/${level.toUpperCase()}`);
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  // Get UNSPSC family codes for a specific segment
  getFamiliesBySegment: async (segment) => {
    try {
      const response = await apiClient.get(`unspsc/families/${segment}`);
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  // Get all segments
  getSegments: async () => {
    try {
      const response = await apiClient.get(`unspsc/level/SEGMENT`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching segments:', error);
      return {
        success: false,
        message: 'Failed to fetch segments',
        error: error.message
      };
    }
  },
  
  // Search UNSPSC codes (uses external service)
  searchCodes: async (query) => {
    try {
      const response = await apiClient.get(`unspsc-external/search/${query}`);
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  // Search UNSPSC codes using AI (DeepSeek)
  searchCodesWithAI: async (description) => {
    try {
      // Use the configured apiClient which has the base URL set
      const response = await apiClient.post('deepseek/search', { description });
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  // Get UNSPSC info by code
  getUnspscByCode: async (code) => {
    try {
      if (!code || !/^\d{8}$/.test(code)) {
        return { success: false, message: 'Invalid UNSPSC code format' };
      }
      
      const response = await apiClient.get(`unspsc/code/${code}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching UNSPSC by code:', error);
      return {
        success: false,
        message: 'Failed to fetch UNSPSC code information',
        error: error.message
      };
    }
  },
  
  // Get user's favorite UNSPSC codes
  getFavorites: async () => {
    try {
      const response = await apiClient.get('unspsc/favorites');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return {
        success: false,
        message: 'Failed to fetch favorites',
        error: error.message
      };
    }
  },
  
  // Add a code to favorites
  addToFavorites: async (unspscId) => {
    try {
      const response = await apiClient.post('unspsc/favorites', { unspscId });
      return successHandler(response, 'Added to favorites');
    } catch (error) {
      return errorHandler(error);
    }
  },
  
  // Remove a code from favorites
  removeFromFavorites: async (unspscId) => {
    try {
      const response = await apiClient.delete(`unspsc/favorites/${unspscId}`);
      return successHandler(response, 'Removed from favorites');
    } catch (error) {
      return errorHandler(error);
    }
  }
};

export default unspscService;
