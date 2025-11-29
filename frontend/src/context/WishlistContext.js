import React, { createContext, useState, useContext, useEffect } from 'react';
import { wishlistService } from '../services';
import { authService } from '../services';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load wishlist from backend when user is authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      loadWishlist();
    }
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const data = await wishlistService.getWishlist();
      // Backend returns array of wishlist items with product data
      setWishlistItems(data.map(item => item.product));
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    if (!authService.isAuthenticated()) {
      return { success: false, message: 'Please login to add items to wishlist' };
    }

    try {
      await wishlistService.addToWishlist(productId);
      await loadWishlist();
      return { success: true };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false, message: error.error || 'Failed to add to wishlist' };
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      // Find the wishlist item ID for this product
      const wishlistItem = wishlistItems.find(item => item.id === productId);
      if (!wishlistItem) {
        console.error('Product not found in wishlist:', productId);
        return;
      }

      // In the backend, we need to find the wishlist item ID, not product ID
      // Since wishlistItems contains products, we need to get the wishlist data first
      const wishlistData = await wishlistService.getWishlist();
      const item = wishlistData.find(w => w.product.id === productId);

      if (item) {
        await wishlistService.removeFromWishlist(item.id);
        await loadWishlist();
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const toggleWishlist = async (productId) => {
    if (!authService.isAuthenticated()) {
      return { success: false, message: 'Please login to use wishlist' };
    }

    try {
      const result = await wishlistService.toggleWishlist(productId);
      await loadWishlist();
      return { success: true, in_wishlist: result.in_wishlist };
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      return { success: false, message: error.error || 'Failed to update wishlist' };
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const clearWishlist = async () => {
    try {
      await wishlistService.clearWishlist();
      setWishlistItems([]);
    } catch (error) {
      console.error('Error clearing wishlist:', error);
    }
  };

  const openDrawer = () => {
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(prev => !prev);
  };

  const value = {
    wishlistItems,
    wishlistCount: wishlistItems.length,
    loading,
    isDrawerOpen,
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
