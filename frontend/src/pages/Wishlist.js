import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Wishlist.css';

function Wishlist() {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      product: {
        id: 1,
        name: 'TIU Classic Hoodie',
        price: 89000,
        category: 'Apparel',
        image: null,
        slug: 'tiu-classic-hoodie',
        in_stock: true,
        is_new: true,
      },
    },
    {
      id: 2,
      product: {
        id: 2,
        name: 'University Tee',
        price: 45000,
        category: 'Apparel',
        image: null,
        slug: 'university-tee',
        in_stock: true,
        on_sale: true,
      },
    },
    {
      id: 3,
      product: {
        id: 3,
        name: 'Campus Cap',
        price: 35000,
        category: 'Accessories',
        image: null,
        slug: 'campus-cap',
        in_stock: false,
      },
    },
  ]);

  const handleRemoveItem = (itemId) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== itemId));
  };

  const handleMoveToCart = (item) => {
    // API call to add to cart
    console.log('Move to cart:', item);
    // Show success message
    alert(`${item.product.name} added to cart!`);
    // Optionally remove from wishlist
    // handleRemoveItem(item.id);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <h2>Your wishlist is empty</h2>
        <p>Save your favorite items for later</p>
        <Link to="/shop" className="shop-button">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="wishlist">
      <div className="wishlist-header">
        <h1 className="wishlist-title">Wishlist</h1>
        <p className="wishlist-subtitle">
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      <div className="wishlist-grid">
        {wishlistItems.map((item, index) => (
          <WishlistCard
            key={item.id}
            item={item}
            index={index}
            onRemove={handleRemoveItem}
            onMoveToCart={handleMoveToCart}
          />
        ))}
      </div>

      {/* Continue Shopping */}
      <div className="wishlist-footer">
        <Link to="/shop" className="continue-shopping">
          ← Continue Shopping
        </Link>
      </div>
    </div>
  );
}

// Wishlist Card Component
function WishlistCard({ item, index, onRemove, onMoveToCart }) {
  return (
    <div className="wishlist-card" style={{ animationDelay: `${index * 0.05}s` }}>
      <button className="remove-btn" onClick={() => onRemove(item.id)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <Link to={`/product/${item.product.slug}`} className="card-image">
        <div className="image-placeholder">
          {item.product.name}
        </div>
        {item.product.is_new && <span className="badge new-badge">New</span>}
        {item.product.on_sale && <span className="badge sale-badge">Sale</span>}
        {!item.product.in_stock && (
          <div className="out-of-stock-overlay">
            <span className="stock-label">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="card-content">
        <Link to={`/product/${item.product.slug}`} className="card-name">
          {item.product.name}
        </Link>
        <p className="card-category">{item.product.category}</p>
        <p className="card-price">{item.product.price.toLocaleString()} UZS</p>

        {item.product.in_stock ? (
          <button
            className="add-to-cart-btn"
            onClick={() => onMoveToCart(item)}
          >
            Add to Cart
          </button>
        ) : (
          <button className="notify-btn" disabled>
            Notify Me
          </button>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
