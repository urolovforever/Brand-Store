import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services';
import { useLanguage } from '../context/LanguageContext';
import './ProductGrid.css';

function NewArrivals() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getNewArrivals();
      const productsArray = Array.isArray(data) ? data : data.results || [];
      setProducts(productsArray);
    } catch (error) {
      console.error('Error loading new arrivals:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-grid-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">{t('newArrivals')}</h1>
          <p className="page-subtitle">
            {loading ? t('loadingProducts') : `${products.length} ${t('products')}`}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="page-content">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>{t('loadingProducts')}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="no-products">
            <h3>{t('noNewArrivals')}</h3>
            <p>{t('checkBackLater')}</p>
            <Link to="/shop" className="shop-link">{t('shopAll')}</Link>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product, index }) {
  const primaryImage = product.images?.[0]?.image || product.images?.[0];
  const hasDiscount = product.discount_percentage > 0;
  const finalPrice = hasDiscount ? product.price * (1 - product.discount_percentage / 100) : product.price;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="product-card"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="product-image">
        {primaryImage ? (
          <img src={primaryImage} alt={product.name} />
        ) : (
          <div className="image-placeholder">
            {product.name}
          </div>
        )}
        {product.is_new && <span className="badge new-badge">New</span>}
        {hasDiscount && <span className="badge sale-badge">-{product.discount_percentage}%</span>}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-meta">
          <span className="product-category">{product.category?.name}</span>
          {product.colors && product.colors.length > 0 && (
            <>
              <span className="product-separator">•</span>
              <span className="product-color">{product.colors[0].name}</span>
            </>
          )}
        </div>
        <div className="product-price">
          {hasDiscount ? (
            <>
              <span className="price-original">{product.price.toLocaleString()} UZS</span>
              <span className="price-discounted">{Math.round(finalPrice).toLocaleString()} UZS</span>
            </>
          ) : (
            <span>{product.price.toLocaleString()} UZS</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default NewArrivals;
