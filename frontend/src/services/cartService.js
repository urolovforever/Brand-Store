import api from './api';

const cartService = {
  // Get user's cart
  getCart: async () => {
    try {
      const response = await api.get('/cart/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1, colorId = null, sizeId = null) => {
    try {
      const response = await api.post('/cart/add_item/', {
        product_id: productId,
        quantity,
        color_id: colorId,
        size_id: sizeId,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    try {
      const response = await api.patch(`/cart/update_item/`, {
        item_id: itemId,
        quantity,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Remove item from cart
  removeFromCart: async (itemId) => {
    try {
      const response = await api.delete(`/cart/remove_item/`, {
        data: { item_id: itemId },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      const response = await api.post('/cart/clear/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Apply promo code
  applyPromoCode: async (code) => {
    try {
      const response = await api.post('/cart/apply_promo/', { code });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Remove promo code
  removePromoCode: async () => {
    try {
      const response = await api.post('/cart/remove_promo/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default cartService;
