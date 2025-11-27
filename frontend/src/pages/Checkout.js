import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const {
    cartItems,
    loading: cartLoading,
    appliedPromo,
    subtotal,
    discount,
    shipping,
    total,
    clearCart,
  } = useCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [shippingData, setShippingData] = useState({
    full_name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    city: '',
    postal_code: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [errors, setErrors] = useState({});

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, cartLoading, navigate]);

  // Pre-fill user data when available
  useEffect(() => {
    if (user) {
      setShippingData(prev => ({
        ...prev,
        full_name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : prev.full_name,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateShipping = () => {
    const newErrors = {};

    if (!shippingData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!shippingData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{9,}$/.test(shippingData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    if (!shippingData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(shippingData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!shippingData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!shippingData.city.trim()) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPayment = () => {
    if (validateShipping()) {
      setCurrentStep(2);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setErrors({});

    try {
      // Prepare order data with cart item IDs
      const orderData = {
        ...shippingData,
        payment_method: paymentMethod,
        // Send cart item IDs and quantities (backend will fetch product details)
        items: cartItems.map(item => ({
          cart_item_id: item.id,
          product_id: item.product.id,
          quantity: item.quantity,
          color_id: item.color?.id || null,
          size_id: item.size?.id || null,
        })),
        promo_code: appliedPromo?.code || null,
      };

      const order = await orderService.createOrder(orderData);

      // Clear cart after successful order
      await clearCart();

      // Redirect based on payment method
      if (paymentMethod === 'click' || paymentMethod === 'payme') {
        // Redirect to payment gateway
        if (order.payment_url) {
          window.location.href = order.payment_url;
        } else {
          navigate(`/order-success/${order.id}`);
        }
      } else {
        // Cash on delivery - redirect to success page
        navigate(`/order-success/${order.id}`);
      }
    } catch (error) {
      console.error('Order error:', error);
      setErrors({
        general: error.detail || error.message || 'Failed to create order. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth or cart
  if (authLoading || cartLoading) {
    return (
      <div className="checkout-loading">
        <div className="spinner-large"></div>
        <p>Loading checkout...</p>
      </div>
    );
  }

  return (
    <div className="checkout">
      <div className="checkout-container">
        {/* Progress Steps */}
        <div className="checkout-steps">
          <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <span className="step-label">Shipping</span>
          </div>
          <div className="step-divider"></div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span className="step-label">Payment</span>
          </div>
        </div>

        <div className="checkout-content">
          {/* Main Content */}
          <div className="checkout-main">
            {currentStep === 1 ? (
              <div className="shipping-section">
                <h2 className="section-title">Shipping Information</h2>

                {errors.general && (
                  <div className="error-banner">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {errors.general}
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="full_name"
                      className={`form-input ${errors.full_name ? 'error' : ''}`}
                      value={shippingData.full_name}
                      onChange={handleShippingChange}
                      placeholder="John Doe"
                    />
                    {errors.full_name && <span className="form-error">{errors.full_name}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      className={`form-input ${errors.phone ? 'error' : ''}`}
                      value={shippingData.phone}
                      onChange={handleShippingChange}
                      placeholder="+998 90 123 45 67"
                    />
                    {errors.phone && <span className="form-error">{errors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      value={shippingData.email}
                      onChange={handleShippingChange}
                      placeholder="john@example.com"
                    />
                    {errors.email && <span className="form-error">{errors.email}</span>}
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Address *</label>
                    <input
                      type="text"
                      name="address"
                      className={`form-input ${errors.address ? 'error' : ''}`}
                      value={shippingData.address}
                      onChange={handleShippingChange}
                      placeholder="Street address, building number"
                    />
                    {errors.address && <span className="form-error">{errors.address}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      name="city"
                      className={`form-input ${errors.city ? 'error' : ''}`}
                      value={shippingData.city}
                      onChange={handleShippingChange}
                      placeholder="Tashkent"
                    />
                    {errors.city && <span className="form-error">{errors.city}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Postal Code</label>
                    <input
                      type="text"
                      name="postal_code"
                      className="form-input"
                      value={shippingData.postal_code}
                      onChange={handleShippingChange}
                      placeholder="100000"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Delivery Notes (Optional)</label>
                    <textarea
                      name="notes"
                      className="form-textarea"
                      value={shippingData.notes}
                      onChange={handleShippingChange}
                      placeholder="Any special instructions for delivery..."
                      rows="3"
                    />
                  </div>
                </div>

                <button className="continue-button" onClick={handleContinueToPayment}>
                  Continue to Payment
                </button>
              </div>
            ) : (
              <div className="payment-section">
                <button className="back-button" onClick={() => setCurrentStep(1)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12"/>
                    <polyline points="12 19 5 12 12 5"/>
                  </svg>
                  Back to Shipping
                </button>

                <h2 className="section-title">Payment Method</h2>

                <div className="payment-methods">
                  <label className={`payment-method ${paymentMethod === 'cash' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-info">
                      <div className="payment-icon">💵</div>
                      <div className="payment-details">
                        <h4>Cash on Delivery</h4>
                        <p>Pay when you receive your order</p>
                      </div>
                    </div>
                  </label>

                  <label className={`payment-method ${paymentMethod === 'click' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="click"
                      checked={paymentMethod === 'click'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-info">
                      <div className="payment-icon">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                          <rect width="40" height="40" rx="8" fill="#00A3FF"/>
                          <text x="20" y="26" fontFamily="Arial" fontSize="16" fontWeight="bold" fill="white" textAnchor="middle">Click</text>
                        </svg>
                      </div>
                      <div className="payment-details">
                        <h4>Click Payment</h4>
                        <p>Pay securely with Click</p>
                      </div>
                    </div>
                  </label>

                  <label className={`payment-method ${paymentMethod === 'payme' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="payme"
                      checked={paymentMethod === 'payme'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-info">
                      <div className="payment-icon">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                          <rect width="40" height="40" rx="8" fill="#14E5E4"/>
                          <text x="20" y="26" fontFamily="Arial" fontSize="14" fontWeight="bold" fill="white" textAnchor="middle">Payme</text>
                        </svg>
                      </div>
                      <div className="payment-details">
                        <h4>Payme</h4>
                        <p>Pay securely with Payme</p>
                      </div>
                    </div>
                  </label>
                </div>

                <button
                  className="place-order-button"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-small"></div>
                      Processing...
                    </>
                  ) : (
                    `Place Order - ${total.toLocaleString()} UZS`
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="order-summary-sidebar">
            <h3 className="summary-title">Order Summary</h3>

            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item">
                  <div className="item-info">
                    <span className="item-name">{item.product.name}</span>
                    <span className="item-qty">× {item.quantity}</span>
                  </div>
                  <span className="item-price">{(item.product.price * item.quantity).toLocaleString()} UZS</span>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{subtotal.toLocaleString()} UZS</span>
              </div>

              {discount > 0 && (
                <div className="summary-row discount-row">
                  <span>Discount ({appliedPromo.discount}%)</span>
                  <span className="discount">-{discount.toLocaleString()} UZS</span>
                </div>
              )}

              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="free">Free</span> : `${shipping.toLocaleString()} UZS`}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{total.toLocaleString()} UZS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
