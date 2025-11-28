import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import './Wishlist.css';

function Wishlist() {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(null);

  const handleRemoveItem = (productId) => {
    removeFromWishlist(productId);
  };

  const handleMoveToCart = async (product) => {
    setAddingToCart(product.id);
    try {
      // Determine color and size IDs
      // If product has colors/sizes, use the first available option
      const colorId = product.colors && product.colors.length > 0 ? product.colors[0].id : null;
      const sizeId = product.sizes && product.sizes.length > 0 ? product.sizes[0].id : null;

      console.log('Adding to cart:', { productId: product.id, colorId, sizeId });

      // Add to cart
      const result = await addToCart(product.id, 1, colorId, sizeId);

      console.log('Add to cart result:', result);

      if (result.success) {
        console.log('Successfully added to cart, removing from wishlist. Product ID:', product.id, 'Type:', typeof product.id);
        // Remove from wishlist after successful cart addition
        removeFromWishlist(product.id);
        console.log('Called removeFromWishlist');
      } else {
        // Show error message if cart addition failed
        console.log('Failed to add to cart:', result.message);
        alert(result.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <div className="wishlist-empty">
        <p>Loading wishlist...</p>
      </div>
    );
  }

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
        {wishlistItems.map((product, index) => (
          <WishlistCard
            key={product.id}
            product={product}
            index={index}
            onRemove={handleRemoveItem}
            onMoveToCart={handleMoveToCart}
            isAddingToCart={addingToCart === product.id}
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
function WishlistCard({ product, index, onRemove, onMoveToCart, isAddingToCart }) {
  const primaryImage = product.primary_image || (product.images && product.images[0]?.image);

  return (
    <div className="wishlist-card" style={{ animationDelay: `${index * 0.05}s` }}>
      <button className="remove-btn" onClick={() => onRemove(product.id)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <Link to={`/product/${product.slug}`} className="card-image">
        {primaryImage ? (
          <img src={primaryImage} alt={product.name} />
        ) : (
          <div className="image-placeholder">
            {product.name}
          </div>
        )}
        {product.is_new && <span className="badge new-badge">New</span>}
        {product.is_on_sale && <span className="badge sale-badge">Sale</span>}
      </Link>

      <div className="card-content">
        <Link to={`/product/${product.slug}`} className="card-name">
          {product.name}
        </Link>
        <p className="card-category">{product.category?.name || product.category_name}</p>
        <div className="price-container">
          {product.is_on_sale && product.discounted_price ? (
            <>
              <p className="card-price discounted">{Number(product.price).toLocaleString()} UZS</p>
              <p className="card-price">{Number(product.discounted_price).toLocaleString()} UZS</p>
            </>
          ) : (
            <p className="card-price">{Number(product.price).toLocaleString()} UZS</p>
          )}
        </div>

        <button
          className="add-to-cart-btn"
          onClick={() => onMoveToCart(product)}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

export default Wishlist;
