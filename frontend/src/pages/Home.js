import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services';
import './Home.css';

function Home() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [newProducts, categoriesData] = await Promise.all([
        productService.getNewArrivals(),
        productService.getCategories(),
      ]);

      // Handle paginated response (DRF returns {results: [...], count: N})
      const productsArray = Array.isArray(newProducts) ? newProducts : newProducts.results || [];
      const categoriesArray = Array.isArray(categoriesData) ? categoriesData : categoriesData.results || [];

      setNewArrivals(productsArray.slice(0, 4)); // Show first 4
      setCategories(categoriesArray.slice(0, 3)); // Show first 3
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">TIU Brand Store</h1>
          <p className="hero-subtitle">Premium university merchandise, designed for excellence</p>
          <Link to="/shop" className="cta-button">Explore Collection</Link>
        </div>
      </section>

      {/* Featured Category */}
      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title">New Arrivals</h2>
          <Link to="/shop?is_new=true" className="view-all">View All →</Link>
        </div>
        {loading ? (
          <div className="loading-grid">
            <p>Loading products...</p>
          </div>
        ) : (
          <div className="product-grid">
            {newArrivals.length > 0 ? (
              newArrivals.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p>No new arrivals yet</p>
            )}
          </div>
        )}
      </section>

      {/* Category Showcase */}
      <section className="category-showcase">
        {categories.map(category => (
          <CategoryCard
            key={category.id}
            title={category.name}
            description={category.description || `Explore our ${category.name} collection`}
            link={`/shop?category=${category.slug}`}
          />
        ))}
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="value-item">
          <div className="value-icon">✓</div>
          <h3>Premium Quality</h3>
          <p>Carefully crafted from the finest materials</p>
        </div>
        <div className="value-item">
          <div className="value-icon">✓</div>
          <h3>Fast Delivery</h3>
          <p>Quick and reliable shipping across Uzbekistan</p>
        </div>
        <div className="value-item">
          <div className="value-icon">✓</div>
          <h3>Easy Returns</h3>
          <p>30-day hassle-free return policy</p>
        </div>
      </section>
    </div>
  );
}

// Product Card Component
function ProductCard({ product }) {
  const primaryImage = product.images?.[0]?.image || product.images?.[0];
  const hasDiscount = product.discount_percentage > 0;
  const finalPrice = hasDiscount ? product.price * (1 - product.discount_percentage / 100) : product.price;

  return (
    <Link to={`/product/${product.slug}`} className="product-card">
      <div className="product-image">
        {primaryImage ? (
          <img src={primaryImage} alt={product.name} />
        ) : (
          <div className="image-placeholder">{product.name}</div>
        )}
        {product.is_new && <span className="badge-new">New</span>}
        {hasDiscount && <span className="badge-sale">-{product.discount_percentage}%</span>}
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-price">
          {hasDiscount ? (
            <>
              <span className="price-original">{product.price.toLocaleString()} UZS</span>
              <span className="price-discounted">{Math.round(finalPrice).toLocaleString()} UZS</span>
            </>
          ) : (
            `${product.price.toLocaleString()} UZS`
          )}
        </p>
      </div>
    </Link>
  );
}

// Category Card Component
function CategoryCard({ title, description, link }) {
  return (
    <Link to={link} className="category-card">
      <div className="category-content">
        <h3 className="category-title">{title}</h3>
        <p className="category-description">{description}</p>
        <span className="category-link">Shop Now →</span>
      </div>
    </Link>
  );
}

export default Home;
