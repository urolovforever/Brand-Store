import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
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
        <div className="product-grid">
          <ProductCard
            title="TIU Hoodie"
            price="89,000 UZS"
            image="/placeholder-hoodie.jpg"
          />
          <ProductCard
            title="Classic Tee"
            price="45,000 UZS"
            image="/placeholder-tee.jpg"
          />
          <ProductCard
            title="Campus Cap"
            price="35,000 UZS"
            image="/placeholder-cap.jpg"
          />
          <ProductCard
            title="Logo Tote"
            price="55,000 UZS"
            image="/placeholder-tote.jpg"
          />
        </div>
      </section>

      {/* Category Showcase */}
      <section className="category-showcase">
        <CategoryCard
          title="Apparel"
          description="Premium hoodies, tees, and outerwear"
          link="/shop?category=apparel"
        />
        <CategoryCard
          title="Accessories"
          description="Caps, bags, and essentials"
          link="/shop?category=accessories"
        />
        <CategoryCard
          title="Custom"
          description="Personalized merchandise"
          link="/shop?category=custom"
        />
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
function ProductCard({ title, price, image }) {
  return (
    <div className="product-card">
      <div className="product-image">
        <div className="image-placeholder">{title}</div>
      </div>
      <div className="product-info">
        <h3 className="product-title">{title}</h3>
        <p className="product-price">{price}</p>
      </div>
    </div>
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
