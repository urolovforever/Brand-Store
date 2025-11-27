import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '../services';
import { useWishlist } from '../context/WishlistContext';
import './Shop.css';

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  // Expandable filter groups
  const [expandedGroups, setExpandedGroups] = useState({
    category: true,
    color: true,
    price: true
  });

  // Load initial data from backend
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, colorsData] = await Promise.all([
        productService.getProducts(),
        productService.getCategories(),
        productService.getColors(),
      ]);

      // Handle paginated response (DRF returns {results: [...], count: N})
      setProducts(Array.isArray(productsData) ? productsData : productsData.results || []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : categoriesData.results || []);
      setColors(Array.isArray(colorsData) ? colorsData : colorsData.results || []);
    } catch (error) {
      console.error('Error loading shop data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update URL params when filters change
  useEffect(() => {
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (selectedColor) params.color = selectedColor;
    if (sortBy !== 'newest') params.sort = sortBy;
    setSearchParams(params);
  }, [selectedCategory, selectedColor, sortBy, setSearchParams]);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      // Category filter
      if (selectedCategory) {
        const categoryMatch = product.category?.slug === selectedCategory || product.category?.name === selectedCategory;
        if (!categoryMatch) return false;
      }

      // Color filter
      if (selectedColor) {
        const hasColor = product.colors?.some(c => c.id === parseInt(selectedColor) || c.name === selectedColor);
        if (!hasColor) return false;
      }

      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) return false;

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low': return a.price - b.price;
        case 'price_high': return b.price - a.price;
        case 'name': return a.name.localeCompare(b.name);
        default: return new Date(b.created_at) - new Date(a.created_at); // newest
      }
    });

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedColor('');
    setPriceRange([0, 1000000]);
    setSortBy('newest');
  };

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const handleToggleWishlist = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productId);
  };

  const activeFilterCount = [selectedCategory, selectedColor].filter(Boolean).length;

  return (
    <div className="shop">
      {/* Page Header */}
      <div className="shop-header">
        <div className="shop-header-left">
          <h1 className="shop-title">All Products</h1>
          <p className="shop-subtitle">{filteredProducts.length} items</p>
        </div>
        <div className="shop-header-right">
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>

      <div className="shop-content">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          {/* Category Filter - Expandable */}
          <div className="filter-group expandable">
            <button
              className="filter-group-header"
              onClick={() => toggleGroup('category')}
            >
              <span className="filter-group-title">Category</span>
              <svg
                className={`expand-icon ${expandedGroups.category ? 'expanded' : ''}`}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {expandedGroups.category && (
              <div className="filter-options">
                <button
                  className={`filter-option-btn ${!selectedCategory ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('')}
                >
                  All Categories
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`filter-option-btn ${selectedCategory === category.slug ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.slug)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Color Filter - Expandable */}
          <div className="filter-group expandable">
            <button
              className="filter-group-header"
              onClick={() => toggleGroup('color')}
            >
              <span className="filter-group-title">Color</span>
              <svg
                className={`expand-icon ${expandedGroups.color ? 'expanded' : ''}`}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {expandedGroups.color && (
              <div className="filter-options">
                <button
                  className={`filter-option-btn ${!selectedColor ? 'active' : ''}`}
                  onClick={() => setSelectedColor('')}
                >
                  All Colors
                </button>
                {colors.map(color => (
                  <button
                    key={color.id}
                    className={`filter-option-btn ${selectedColor === String(color.id) ? 'active' : ''}`}
                    onClick={() => setSelectedColor(String(color.id))}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price Range Filter - Expandable */}
          <div className="filter-group expandable">
            <button
              className="filter-group-header"
              onClick={() => toggleGroup('price')}
            >
              <span className="filter-group-title">Price</span>
              <svg
                className={`expand-icon ${expandedGroups.price ? 'expanded' : ''}`}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {expandedGroups.price && (
              <div className="filter-options">
                <div className="price-range-slider">
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  />
                  <div className="price-range-label">
                    Up to {priceRange[1].toLocaleString()} UZS
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <button className="clear-all-btn" onClick={clearFilters}>
              Clear all filters
            </button>
          )}
        </aside>

        {/* Products Grid */}
        <main className="products-section">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="no-products">
              <h3>No products found</h3>
              <p>Try adjusting your filters</p>
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  isWishlisted={isInWishlist(product.id)}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product, index, isWishlisted, onToggleWishlist }) {
  const primaryImage = product.images?.[0]?.image || product.images?.[0];
  const hasDiscount = product.discount_percentage > 0;
  const finalPrice = hasDiscount ? product.price * (1 - product.discount_percentage / 100) : product.price;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="product-card"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="product-image-wrapper">
        {primaryImage ? (
          <img src={primaryImage} alt={product.name} className="product-image" />
        ) : (
          <div className="product-image-placeholder">
            <span>{product.name}</span>
          </div>
        )}

        {/* Wishlist Heart Icon */}
        <button
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => onToggleWishlist(e, product.id)}
          aria-label="Add to wishlist"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isWishlisted ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        {/* Badges */}
        {product.is_new && <span className="product-badge new">NEW</span>}
        {hasDiscount && <span className="product-badge sale">-{product.discount_percentage}%</span>}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price">
          {hasDiscount ? (
            <>
              <span className="price-current">{Math.round(finalPrice).toLocaleString()} UZS</span>
              <span className="price-original">{product.price.toLocaleString()} UZS</span>
            </>
          ) : (
            <span className="price-current">{product.price.toLocaleString()} UZS</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default Shop;
