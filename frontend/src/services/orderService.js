import api from './api';

const orderService = {
  // Get user's orders
  getOrders: async () => {
    try {
      const response = await api.get('/orders/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single order
  getOrder: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create order from cart
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders/', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    try {
      const response = await api.post(`/orders/${orderId}/cancel/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Track order
  trackOrder: async (trackingNumber) => {
    try {
      const response = await api.get(`/orders/track/${trackingNumber}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get order status history
  getOrderHistory: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/history/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default orderService;
