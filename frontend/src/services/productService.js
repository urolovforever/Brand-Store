import api from './api';

const productService = {
  // Get all products with filters and pagination
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/products/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single product by slug
  getProduct: async (slug) => {
    try {
      const response = await api.get(`/products/${slug}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get featured products
  getFeaturedProducts: async () => {
    try {
      const response = await api.get('/products/featured/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get new arrivals
  getNewArrivals: async () => {
    try {
      const response = await api.get('/products/', { params: { is_new: true } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get products on sale
  getSaleProducts: async () => {
    try {
      const response = await api.get('/products/', { params: { on_sale: true } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all categories
  getCategories: async () => {
    try {
      const response = await api.get('/categories/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get category by slug
  getCategory: async (slug) => {
    try {
      const response = await api.get(`/categories/${slug}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get product reviews
  getReviews: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}/reviews/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create product review
  createReview: async (productId, reviewData) => {
    try {
      const response = await api.post(`/products/${productId}/reviews/`, reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get available colors
  getColors: async () => {
    try {
      const response = await api.get('/colors/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get available sizes
  getSizes: async () => {
    try {
      const response = await api.get('/sizes/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default productService;
