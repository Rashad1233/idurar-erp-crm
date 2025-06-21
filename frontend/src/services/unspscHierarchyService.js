import apiClient from '@/api/axiosConfig';

// Service for interacting with user-specific UNSPSC hierarchy
const unspscHierarchyService = {
  // Get user's UNSPSC hierarchy entries by level (SEGMENT, FAMILY, CLASS, COMMODITY)
  getByLevel: async (level) => {
    try {
      console.log(`Fetching user UNSPSC hierarchy by level: ${level}`);
      const response = await apiClient.get(`/unspsc-hierarchy/by-level/${level}`);
      console.log(`UNSPSC hierarchy response for ${level}:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching UNSPSC hierarchy by level:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch UNSPSC hierarchy',
        error: error.message
      };
    }
  },
  
  // Fallback method to get global UNSPSC codes if hierarchy API fails
  getGlobalByLevel: async (level) => {
    try {
      console.log(`Fetching global UNSPSC codes by level: ${level}`);
      const response = await apiClient.get(`/unspsc/level/${level.toUpperCase()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching global UNSPSC codes:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch global UNSPSC codes',
        error: error.message
      };
    }
  },
  
  // Get user's UNSPSC hierarchy children based on parent code and level
  getChildren: async (parentCode, level) => {
    try {
      const response = await apiClient.get(`/unspsc-hierarchy/children/${parentCode}/${level}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching UNSPSC hierarchy children:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch UNSPSC hierarchy children'
      };
    }
  },
    // Add or update a UNSPSC code to user's hierarchy
  save: async (unspscData) => {
    try {
      console.log('Saving UNSPSC hierarchy entry:', unspscData);
      const response = await apiClient.post('/unspsc-hierarchy', unspscData);
      console.log('Save response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error saving UNSPSC hierarchy entry:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save UNSPSC hierarchy entry',
        error: error.message
      };
    }
  },
  
  // Delete a UNSPSC code from user's hierarchy
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/unspsc-hierarchy/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting UNSPSC hierarchy entry:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete UNSPSC hierarchy entry'
      };
    }
  },
  
  // Clear user's hierarchy entries for a specific level or all levels
  clear: async (level = 'ALL') => {
    try {
      const response = await apiClient.delete(`/unspsc-hierarchy/clear/${level}`);
      return response.data;
    } catch (error) {
      console.error('Error clearing UNSPSC hierarchy:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to clear UNSPSC hierarchy'
      };
    }
  }
};

export default unspscHierarchyService;
