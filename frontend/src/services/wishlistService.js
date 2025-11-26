import api from './api';

const wishlistService = {
  // Get user's wishlist
  getWishlist: async () => {
    try {
      const response = await api.get('/wishlist/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add item to wishlist
  addToWishlist: async (productId) => {
    try {
      const response = await api.post('/wishlist/add/', {
        product_id: productId,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Remove item from wishlist
  removeFromWishlist: async (productId) => {
    try {
      const response = await api.delete(`/wishlist/remove/${productId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Check if product is in wishlist
  isInWishlist: async (productId) => {
    try {
      const response = await api.get(`/wishlist/check/${productId}/`);
      return response.data.is_in_wishlist;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Clear entire wishlist
  clearWishlist: async () => {
    try {
      const response = await api.post('/wishlist/clear/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default wishlistService;
