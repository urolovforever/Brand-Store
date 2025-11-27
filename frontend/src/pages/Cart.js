import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    cartItems,
    loading,
    appliedPromo,
    subtotal,
    discount,
    shipping,
    total,
    updateQuantity,
    removeFromCart,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const result = await updateQuantity(itemId, newQuantity);
    if (!result.success) {
      alert(result.message);
    }
  };

  const handleRemoveItem = async (itemId) => {
    const result = await removeFromCart(itemId);
    if (!result.success) {
      alert(result.message);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    const result = await applyPromoCode(promoCode);
    if (result.success) {
      setPromoError('');
      setPromoCode('');
    } else {
      setPromoError(result.message);
    }
  };

  const handleRemovePromo = async () => {
    await removePromoCode();
    setPromoCode('');
    setPromoError('');
  };

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="spinner-large"></div>
        <p>Loading cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <h2>Your cart is empty</h2>
        <p>Add some products to get started</p>
        <Link to="/shop" className="shop-button">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart-header">
        <h1 className="cart-title">Shopping Cart</h1>
        <p className="cart-subtitle">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
      </div>

      <div className="cart-content">
        {/* Cart Items */}
        <div className="cart-items">
          {cartItems.map(item => (
            <CartItem
              key={item.id}
              item={item}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h2 className="summary-title">Order Summary</h2>

          {/* Promo Code */}
          <div className="promo-section">
            <label className="promo-label">Promo Code</label>
            {appliedPromo ? (
              <div className="promo-applied">
                <div className="promo-info">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>{appliedPromo.code} applied</span>
                </div>
                <button className="remove-promo" onClick={handleRemovePromo}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <div className="promo-input-group">
                  <input
                    type="text"
                    className="promo-input"
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  />
                  <button className="apply-promo-btn" onClick={handleApplyPromo}>
                    Apply
                  </button>
                </div>
                {promoError && <p className="promo-error">{promoError}</p>}
              </>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="price-breakdown">
            <div className="price-row">
              <span className="price-label">Subtotal</span>
              <span className="price-value">{subtotal.toLocaleString()} UZS</span>
            </div>

            {discount > 0 && (
              <div className="price-row discount-row">
                <span className="price-label">Discount ({appliedPromo.discount}%)</span>
                <span className="price-value discount">-{discount.toLocaleString()} UZS</span>
              </div>
            )}

            <div className="price-row">
              <span className="price-label">Shipping</span>
              <span className="price-value">
                {shipping === 0 ? (
                  <span className="free-shipping">Free</span>
                ) : (
                  `${shipping.toLocaleString()} UZS`
                )}
              </span>
            </div>

            {shipping > 0 && (
              <p className="shipping-note">
                Spend {(200000 - subtotal).toLocaleString()} UZS more for free shipping
              </p>
            )}

            <div className="price-row total-row">
              <span className="price-label">Total</span>
              <span className="price-value total">{total.toLocaleString()} UZS</span>
            </div>
          </div>

          {/* Checkout Button */}
          <Link to="/checkout" className="checkout-btn">
            Proceed to Checkout
          </Link>

          {/* Continue Shopping */}
          <Link to="/shop" className="continue-shopping">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

// Cart Item Component
function CartItem({ item, onQuantityChange, onRemove }) {
  const primaryImage = item.product?.images?.[0]?.image || item.product?.images?.[0];

  return (
    <div className="cart-item">
      <Link to={`/product/${item.product.slug}`} className="item-image">
        {primaryImage ? (
          <img src={primaryImage} alt={item.product.name} />
        ) : (
          <div className="image-placeholder">
            {item.product.name}
          </div>
        )}
      </Link>

      <div className="item-details">
        <Link to={`/product/${item.product.slug}`} className="item-name">
          {item.product.name}
        </Link>
        {(item.color || item.size) && (
          <div className="item-options">
            {item.color && <span className="item-option">Color: {item.color.name}</span>}
            {item.color && item.size && <span className="option-separator">•</span>}
            {item.size && <span className="item-option">Size: {item.size.name}</span>}
          </div>
        )}
        <p className="item-price">{item.product.price.toLocaleString()} UZS</p>
      </div>

      <div className="item-actions">
        <div className="quantity-selector">
          <button
            className="quantity-btn"
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            −
          </button>
          <span className="quantity-value">{item.quantity}</span>
          <button
            className="quantity-btn"
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
          >
            +
          </button>
        </div>

        <p className="item-total">{(item.product.price * item.quantity).toLocaleString()} UZS</p>

        <button className="remove-btn" onClick={() => onRemove(item.id)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Cart;
