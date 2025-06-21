// Update the frontend service to use the simple inventory routes
const { apiRequest } = require('../request');

const inventoryService = {
  // Get all inventory items with optional filtering
  getInventoryItems: async (options = {}) => {
    try {
      // Try the simple inventory route first
      const response = await apiRequest.get('/simple-inventory');
      console.log('Using simple inventory route');
      return response.data;
    } catch (error) {
      console.error('Simple inventory route failed, falling back to original route');
      try {
        // Fall back to original route if simple route fails
        const response = await apiRequest.get('/inventory', { params: options });
        return response.data;
      } catch (error) {
        console.error('All inventory routes failed');
        throw error;
      }
    }
  },

  // Get a single inventory item by ID
  getInventoryItem: async (id) => {
    try {
      // Try simple route first
      const response = await apiRequest.get(`/simple-inventory/${id}`);
      console.log('Using simple inventory detail route');
      return response.data;
    } catch (error) {
      console.error('Simple inventory detail route failed, falling back to original route');
      try {
        // Fall back to original route
        const response = await apiRequest.get(`/inventory/${id}`);
        return response.data;
      } catch (error) {
        console.error('All inventory detail routes failed');
        throw error;
      }
    }
  }
};
