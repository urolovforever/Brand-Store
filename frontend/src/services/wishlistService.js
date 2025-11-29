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
      const response = await api.post('/wishlist/', {
        product_id: productId,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Remove item from wishlist by product ID
  removeFromWishlist: async (wishlistItemId) => {
    try {
      const response = await api.delete(`/wishlist/${wishlistItemId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Toggle product in wishlist
  toggleWishlist: async (productId) => {
    try {
      const response = await api.post('/wishlist/toggle/', {
        product_id: productId,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Clear entire wishlist
  clearWishlist: async () => {
    try {
      const response = await api.delete('/wishlist/clear/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default wishlistService;
