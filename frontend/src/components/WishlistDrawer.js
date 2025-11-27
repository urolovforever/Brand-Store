import React from 'react';
import { Link } from 'react-router-dom';
import './WishlistDrawer.css';

function WishlistDrawer({ isOpen, onClose, wishlistItems, onRemoveItem, onAddToCart, onMoveAllToCart }) {
  const hasItems = wishlistItems && wishlistItems.length > 0;

  return (
    <>
      {/* Overlay */}
      <div
        className={`wishlist-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className={`wishlist-drawer ${isOpen ? 'open' : ''}`}>
        {/* Header - Sticky */}
        <div className="wishlist-header">
          <div className="wishlist-title-section">
            <svg
              className="wishlist-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <h2 className="wishlist-title">Wishlist</h2>
            <span className="wishlist-count">({wishlistItems.length})</span>
          </div>
          <button
            className="wishlist-close-btn"
            onClick={onClose}
            aria-label="Close wishlist"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="wishlist-content">
          {hasItems ? (
            <div className="wishlist-items">
              {wishlistItems.map((item, index) => (
                <WishlistItem
                  key={item.id}
                  item={item}
                  index={index}
                  onRemove={() => onRemoveItem(item.id)}
                  onAddToCart={() => onAddToCart(item)}
                />
              ))}
            </div>
          ) : (
            <div className="wishlist-empty">
              <div className="empty-icon">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <h3 className="empty-title">Your wishlist is empty</h3>
              <p className="empty-text">Save items you love for later</p>
              <Link to="/shop" className="continue-shopping-btn" onClick={onClose}>
                Continue Shopping
              </Link>
            </div>
          )}
        </div>

        {/* Footer - Sticky */}
        {hasItems && (
          <div className="wishlist-footer">
            <button
              className="move-all-btn"
              onClick={onMoveAllToCart}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Move All to Cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

// Wishlist Item Component
function WishlistItem({ item, index, onRemove, onAddToCart }) {
  const primaryImage = item.images?.[0]?.image || item.images?.[0];
  const hasDiscount = item.discount_percentage > 0;
  const finalPrice = hasDiscount
    ? item.price * (1 - item.discount_percentage / 100)
    : item.price;

  return (
    <div
      className="wishlist-item"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <Link
        to={`/product/${item.slug}`}
        className="wishlist-item-image-wrapper"
      >
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={item.name}
            className="wishlist-item-image"
          />
        ) : (
          <div className="wishlist-item-placeholder">
            <span>{item.name.charAt(0)}</span>
          </div>
        )}
      </Link>

      <div className="wishlist-item-details">
        <Link to={`/product/${item.slug}`}>
          <h4 className="wishlist-item-name">{item.name}</h4>
        </Link>

        <div className="wishlist-item-price">
          {hasDiscount ? (
            <>
              <span className="price-current">{Math.round(finalPrice).toLocaleString()} UZS</span>
              <span className="price-original">{item.price.toLocaleString()} UZS</span>
            </>
          ) : (
            <span className="price-current">{item.price.toLocaleString()} UZS</span>
          )}
        </div>

        <div className="wishlist-item-actions">
          <button
            className="add-to-cart-small-btn"
            onClick={onAddToCart}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Add to Cart
          </button>

          <button
            className="remove-btn"
            onClick={onRemove}
            aria-label="Remove from wishlist"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default WishlistDrawer;
