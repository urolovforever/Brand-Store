import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService, cartService, wishlistService } from '../services';
import { useLanguage } from '../context/LanguageContext';
import './ProductDetail.css';

function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);
  const [error, setError] = useState(null);

  // Load product data from backend
  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const productData = await productService.getProduct(slug);
      setProduct(productData);

      // Set default selections
      if (productData.colors && productData.colors.length > 0) {
        setSelectedColor(productData.colors[0].name);
      }
      if (productData.sizes && productData.sizes.length > 0) {
        setSelectedSize(productData.sizes[0].name);
      }

      // Load related products
      try {
        const related = await productService.getRelatedProducts(slug);
        const relatedArray = Array.isArray(related) ? related : related.results || [];
        setRelatedProducts(relatedArray);
      } catch (err) {
        console.error('Error loading related products:', err);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!canAddToCart) return;

    try {
      const colorId = product.colors?.find(c => c.name === selectedColor)?.id;
      const sizeId = product.sizes?.find(s => s.name === selectedSize)?.id;

      await cartService.addToCart(product.id, quantity, colorId, sizeId);

      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMessage = error?.error || error?.message || 'Failed to add to cart. Please try again.';
      alert(errorMessage);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      await wishlistService.addToWishlist(product.id);
      setAddedToWishlist(true);
      setTimeout(() => setAddedToWishlist(false), 2000);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Failed to add to wishlist. Please try again.');
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>{t('loadingProducts')}</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error-page">
        <h2>{error || t('noProducts')}</h2>
        <Link to="/shop" className="back-link">← {t('shop')}</Link>
      </div>
    );
  }

  const hasDiscount = product.discount_percentage > 0;
  const finalPrice = hasDiscount ? product.price * (1 - product.discount_percentage / 100) : product.price;

  // Check if product has colors/sizes
  const hasColors = product.colors && product.colors.length > 0;
  const hasSizes = product.sizes && product.sizes.length > 0;

  // Can add to cart if:
  // - Color is selected (if product has colors)
  // - Size is selected (if product has sizes)
  const canAddToCart =
    (!hasColors || selectedColor) &&
    (!hasSizes || selectedSize) &&
    quantity > 0;

  return (
    <div className="product-detail">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">{t('home')}</Link>
        <span className="separator">›</span>
        <Link to="/shop">{t('shop')}</Link>
        {product.category && (
          <>
            <span className="separator">›</span>
            <Link to={`/shop?category=${product.category.slug}`}>{product.category.name}</Link>
          </>
        )}
        <span className="separator">›</span>
        <span className="current">{product.name}</span>
      </div>

      {/* Product Content */}
      <div className="product-content">
        {/* Image Gallery */}
        <div className="product-gallery">
          <div className="gallery-main">
            <div className="main-image">
              {product.images && product.images[selectedImage] ? (
                product.images[selectedImage].image ? (
                  <img src={product.images[selectedImage].image} alt={product.name} />
                ) : (
                  <div className="image-placeholder">{product.name}</div>
                )
              ) : (
                <div className="image-placeholder">{product.name}</div>
              )}
              {product.is_new && <span className="badge new-badge">New</span>}
              {hasDiscount && <span className="badge sale-badge">-{product.discount_percentage}%</span>}
            </div>
          </div>
          {product.images && product.images.length > 1 && (
            <div className="gallery-thumbnails">
              {product.images.map((img, index) => (
                <button
                  key={img.id || index}
                  className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  {img.image ? (
                    <img src={img.image} alt={`${product.name} ${index + 1}`} />
                  ) : (
                    <div className="thumbnail-placeholder">{index + 1}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <div className="product-header">
            <div>
              <h1 className="product-name">{product.name}</h1>
              <div className="product-meta">
                <span className="product-category">{product.category?.name || 'Uncategorized'}</span>
                <span className="separator">•</span>
                <div className="product-rating">
                  <span className="stars">★★★★★</span>
                  <span className="rating-text">({product.reviews_count || 0} {t('reviews')})</span>
                </div>
              </div>
            </div>
            <button
              className={`wishlist-btn ${addedToWishlist ? 'added' : ''}`}
              onClick={handleAddToWishlist}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill={addedToWishlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          <div className="product-price">
            {hasDiscount ? (
              <>
                <span className="price">{Math.round(finalPrice).toLocaleString()} UZS</span>
                <span className="original-price">{product.price.toLocaleString()} UZS</span>
                <span className="discount">-{product.discount_percentage}%</span>
              </>
            ) : (
              <span className="price">{product.price.toLocaleString()} UZS</span>
            )}
          </div>

          <p className="product-description">{product.description}</p>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="selection-group">
              <div className="selection-header">
                <label className="selection-label">{t('selectColor')}</label>
                <span className="selected-value">{selectedColor}</span>
              </div>
              <div className="color-options">
                {product.colors.map(color => (
                <button
                  key={color.id}
                  className={`color-swatch ${selectedColor === color.name ? 'active' : ''}`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => setSelectedColor(color.name)}
                  title={color.name}
                >
                  {selectedColor === color.name && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="selection-group">
              <div className="selection-header">
                <label className="selection-label">{t('selectSize')}</label>
                <span className="selected-value">{selectedSize}</span>
              </div>
              <div className="size-options">
                {product.sizes.map(size => (
                <button
                  key={size.id}
                  className={`size-button ${selectedSize === size.name ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size.name)}
                >
                  {size.name}
                </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="selection-group">
            <label className="selection-label">{t('quantity')}</label>
            <div className="quantity-selector">
              <button
                className="quantity-btn"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                −
              </button>
              <input
                type="number"
                className="quantity-input"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  if (val >= 1) {
                    setQuantity(val);
                  }
                }}
                min="1"
              />
              <button
                className="quantity-btn"
                onClick={() => handleQuantityChange(1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            className={`add-to-cart-btn ${addedToCart ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={!canAddToCart}
          >
            {addedToCart ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {t('addedToCart')}
              </>
            ) : (
              t('addToCart')
            )}
          </button>

          {!canAddToCart && (
            <p className="error-message">
              {hasColors && !selectedColor && `${t('selectColor')}`}
              {hasColors && !selectedColor && hasSizes && !selectedSize && ' & '}
              {hasSizes && !selectedSize && `${t('selectSize')}`}
            </p>
          )}

          {/* Product Details */}
          {product.details && product.details.length > 0 && (
            <div className="product-details">
              <h3 className="details-title">{t('productDetails')}</h3>
              <ul className="details-list">
                {product.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="related-products">
          <h2 className="section-title">{t('youMayAlsoLike')}</h2>
          <div className="related-grid">
            {relatedProducts.slice(0, 4).map(relatedProduct => (
              <Link key={relatedProduct.id} to={`/product/${relatedProduct.slug}`} className="related-card">
                <div className="related-image">
                  {relatedProduct.images?.[0]?.image ? (
                    <img src={relatedProduct.images[0].image} alt={relatedProduct.name} />
                  ) : (
                    <div className="image-placeholder">{relatedProduct.name}</div>
                  )}
                </div>
                <div className="related-info">
                  <h4 className="related-name">{relatedProduct.name}</h4>
                  <p className="related-price">{relatedProduct.price.toLocaleString()} UZS</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductDetail;
