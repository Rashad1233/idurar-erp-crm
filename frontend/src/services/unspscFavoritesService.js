import apiClient from '@/api/axiosConfig';
import errorHandler from '@/request/errorHandler';

const unspscFavoritesService = {
  // Get all favorites for the current user
  getFavorites: async () => {
    try {
      const response = await apiClient.get('unspsc-favorites');
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },

  // Save a new favorite
  saveFavorite: async (favoriteData) => {
    try {
      const response = await apiClient.post('unspsc-favorites', favoriteData);
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },

  // Get a specific favorite
  getFavorite: async (id) => {
    try {
      const response = await apiClient.get(`unspsc-favorites/${id}`);
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },

  // Update a favorite
  updateFavorite: async (id, data) => {
    try {
      const response = await apiClient.put(`unspsc-favorites/${id}`, data);
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  },

  // Delete a favorite
  deleteFavorite: async (id) => {
    try {
      const response = await apiClient.delete(`unspsc-favorites/${id}`);
      return response.data;
    } catch (error) {
      return errorHandler(error);
    }
  }
};

export default unspscFavoritesService;
