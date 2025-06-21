import apiClient from '@/api/axiosConfig';

// Helper function to handle common API error scenarios
const handleApiError = (error, operation, entityType) => {
  // Log the error for debugging
  console.error(`${entityType} Service Error (${operation}):`, error);
  
  // Return a standardized error object
  const errorMessage = error.response?.data?.message || error.message || `Error ${operation} ${entityType.toLowerCase()}`;
  
  return {
    success: false,
    error: errorMessage,
    statusCode: error.response?.status || 500,
    details: error.response?.data || null
  };
};

// Warehouse API Service
const warehouseService = {  // Storage Locations
  getStorageLocations: async () => {
    try {
      // First try the simple route for better reliability
      try {
        console.log('🔍 Trying simple storage locations route first...');
        const simpleResponse = await apiClient.get('simple-storage-locations');
        console.log('✅ Simple storage locations route worked!');
        return {
          success: true,
          data: simpleResponse.data.data,
          count: simpleResponse.data.count
        };
      } catch (simpleError) {
        console.warn('⚠️ Simple storage locations route failed, falling back to original route', simpleError);
        
        // Fall back to original route
        const response = await apiClient.get('warehouse/storage-location');
        return {
          success: true,
          data: response.data.data,
          count: response.data.count
        };
      }
    } catch (error) {
      return handleApiError(error, 'fetching', 'Storage Location');
    }
  },
  getStorageLocation: async (id) => {
    try {
      // First try the simple route for better reliability
      try {
        console.log(`🔍 Trying simple storage location detail route for ID: ${id}`);
        const simpleResponse = await apiClient.get(`simple-storage-location/${id}`);
        console.log('✅ Simple storage location detail route worked!');
        return {
          success: true,
          data: simpleResponse.data.data
        };
      } catch (simpleError) {
        console.warn('⚠️ Simple storage location detail route failed, falling back to original route', simpleError);
        
        // Fall back to original route
        const response = await apiClient.get(`warehouse/storage-location/${id}`);
        return {
          success: true,
          data: response.data.data
        };
      }
    } catch (error) {
      return handleApiError(error, 'fetching', 'Storage Location');
    }
  },

  createStorageLocation: async (data) => {
    try {
      const response = await apiClient.post('warehouse/storage-location', data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return handleApiError(error, 'creating', 'Storage Location');
    }
  },

  updateStorageLocation: async (id, data) => {
    try {
      const response = await apiClient.put(`warehouse/storage-location/${id}`, data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return handleApiError(error, 'updating', 'Storage Location');
    }
  },

  deleteStorageLocation: async (id) => {
    try {
      const response = await apiClient.delete(`warehouse/storage-location/${id}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return handleApiError(error, 'deleting', 'Storage Location');
    }
  },  // Bin Locations
  getBinLocations: async (storageLocationId) => {
    try {
      // First try the simple route for better reliability
      try {
        console.log('🔍 Trying simple bin locations route first...');
        let url = 'simple-bin-locations';
        if (storageLocationId) {
          url += `?storageLocationId=${storageLocationId}`;
        }
        const simpleResponse = await apiClient.get(url);
        console.log('✅ Simple bin locations route worked!');
        return {
          success: true,
          data: simpleResponse.data.data,
          count: simpleResponse.data.count
        };
      } catch (simpleError) {
        console.warn('⚠️ Simple bin locations route failed, falling back to original route', simpleError);
        
        // Fall back to original route
        let url = 'warehouse/bin-location';
        if (storageLocationId) {
          url += `?storageLocationId=${storageLocationId}`;
        }
        const response = await apiClient.get(url);
        return {
          success: true,
          data: response.data.data,
          count: response.data.count
        };
      }
    } catch (error) {
      return handleApiError(error, 'fetching', 'Bin Location');
    }
  },

  getBinLocation: async (id) => {
    try {
      const response = await apiClient.get(`warehouse/bin-location/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return handleApiError(error, 'fetching', 'Bin Location');
    }
  },

  createBinLocation: async (data) => {
    try {
      const response = await apiClient.post('warehouse/bin-location', data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return handleApiError(error, 'creating', 'Bin Location');
    }
  },

  updateBinLocation: async (id, data) => {
    try {
      const response = await apiClient.put(`warehouse/bin-location/${id}`, data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return handleApiError(error, 'updating', 'Bin Location');
    }
  },

  deleteBinLocation: async (id) => {
    try {
      const response = await apiClient.delete(`warehouse/bin-location/${id}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return handleApiError(error, 'deleting', 'Bin Location');
    }
  },
  getBinsByStorageLocation: async (storageLocationId) => {
    try {
      const response = await apiClient.get(`warehouse/storage-location/${storageLocationId}/bins`);
      return {
        success: true,
        data: response.data.data,
        count: response.data.count
      };
    } catch (error) {
      console.error('Error fetching bins by storage location:', error);
      return {
        success: false,
        data: [],
        count: 0,
        message: error.response?.data?.message || 'Failed to fetch bin locations'
      };    }
  }
};

export default warehouseService;
