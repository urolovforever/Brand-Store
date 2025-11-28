import React, { createContext, useState, useContext, useEffect } from 'react';
import { productService } from '../services';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Save to localStorage whenever wishlistIds changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  // Load full product data for wishlist items
  useEffect(() => {
    console.log('WishlistContext: useEffect triggered, wishlistIds:', wishlistIds);
    const loadWishlistItems = async () => {
      if (wishlistIds.length === 0) {
        console.log('WishlistContext: No items in wishlist, clearing');
        setWishlistItems([]);
        return;
      }

      setLoading(true);
      try {
        const products = await productService.getProducts();
        const productsArray = Array.isArray(products) ? products : products.results || [];
        const items = productsArray.filter(product => wishlistIds.includes(product.id));
        console.log('WishlistContext: Loaded wishlist items:', items.length, 'items');
        setWishlistItems(items);
      } catch (error) {
        console.error('Error loading wishlist items:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWishlistItems();
  }, [wishlistIds]);

  const addToWishlist = (productId) => {
    setWishlistIds(prev => {
      if (!prev.includes(productId)) {
        return [...prev, productId];
      }
      return prev;
    });
  };

  const removeFromWishlist = (productId) => {
    console.log('WishlistContext: removeFromWishlist called with productId:', productId);
    setWishlistIds(prev => {
      console.log('WishlistContext: Previous wishlistIds:', prev);
      const newIds = prev.filter(id => id !== productId);
      console.log('WishlistContext: New wishlistIds:', newIds);
      return newIds;
    });
  };

  const toggleWishlist = (productId) => {
    setWishlistIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlistIds.includes(productId);
  };

  const clearWishlist = () => {
    setWishlistIds([]);
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
    wishlistIds,
    wishlistItems,
    wishlistCount: wishlistIds.length,
    loading,
    isDrawerOpen,
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
