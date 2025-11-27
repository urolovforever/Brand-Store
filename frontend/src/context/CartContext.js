import React, { createContext, useState, useContext, useEffect } from 'react';
import { cartService } from '../services';
import { authService } from '../services';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Load cart when user is authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      loadCart();
    }
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const data = await cartService.getCart();
      setCartItems(data.items || []);
      if (data.promo_code) {
        setAppliedPromo(data.promo_code);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1, colorId = null, sizeId = null) => {
    if (!authService.isAuthenticated()) {
      // Redirect to login or show message
      return { success: false, message: 'Please login to add items to cart' };
    }

    try {
      await cartService.addToCart(productId, quantity, colorId, sizeId);
      await loadCart();
      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, message: error.message || 'Failed to add item to cart' };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;

    try {
      await cartService.updateCartItem(itemId, quantity);
      await loadCart();
      return { success: true };
    } catch (error) {
      console.error('Error updating cart item:', error);
      return { success: false, message: error.message };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await cartService.removeFromCart(itemId);
      await loadCart();
      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, message: error.message };
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCartItems([]);
      setAppliedPromo(null);
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, message: error.message };
    }
  };

  const applyPromoCode = async (code) => {
    try {
      const response = await cartService.applyPromoCode(code);
      await loadCart();
      setAppliedPromo(response.promo_code);
      return { success: true, data: response };
    } catch (error) {
      console.error('Error applying promo code:', error);
      return {
        success: false,
        message: error.message || 'Invalid promo code'
      };
    }
  };

  const removePromoCode = async () => {
    try {
      await cartService.removePromoCode();
      await loadCart();
      setAppliedPromo(null);
      return { success: true };
    } catch (error) {
      console.error('Error removing promo code:', error);
      return { success: false, message: error.message };
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    const discount = appliedPromo ? (subtotal * appliedPromo.discount / 100) : 0;
    const shipping = subtotal > 0 ? (subtotal > 200000 ? 0 : 15000) : 0;
    const total = subtotal - discount + shipping;

    return {
      subtotal,
      discount,
      shipping,
      total,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    };
  };

  const totals = calculateTotals();

  const value = {
    cartItems,
    loading,
    appliedPromo,
    ...totals,
    loadCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyPromoCode,
    removePromoCode,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
