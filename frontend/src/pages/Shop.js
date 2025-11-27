import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '../services';
import './Shop.css';

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '');
  const [selectedSize, setSelectedSize] = useState(searchParams.get('size') || '');
  const [isNew, setIsNew] = useState(searchParams.get('is_new') === 'true');
  const [onSale, setOnSale] = useState(searchParams.get('on_sale') === 'true');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [showFilters, setShowFilters] = useState(false);

  // Load initial data from backend
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, colorsData, sizesData] = await Promise.all([
        productService.getProducts(),
        productService.getCategories(),
        productService.getColors(),
        productService.getSizes(),
      ]);

      // Handle paginated response (DRF returns {results: [...], count: N})
      setProducts(Array.isArray(productsData) ? productsData : productsData.results || []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : categoriesData.results || []);
      setColors(Array.isArray(colorsData) ? colorsData : colorsData.results || []);
      setSizes(Array.isArray(sizesData) ? sizesData : sizesData.results || []);
    } catch (error) {
      console.error('Error loading shop data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update URL params when filters change
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedColor) params.color = selectedColor;
    if (selectedSize) params.size = selectedSize;
    if (isNew) params.is_new = 'true';
    if (onSale) params.on_sale = 'true';
    if (sortBy !== 'newest') params.sort = sortBy;
    setSearchParams(params);
  }, [searchQuery, selectedCategory, selectedColor, selectedSize, isNew, onSale, sortBy, setSearchParams]);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      // Search filter
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

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

      // Size filter
      if (selectedSize) {
        const hasSize = product.sizes?.some(s => s.id === parseInt(selectedSize) || s.name === selectedSize);
        if (!hasSize) return false;
      }

      // New arrivals filter
      if (isNew && !product.is_new) return false;

      // On sale filter
      if (onSale && (!product.discount_percentage || product.discount_percentage <= 0)) return false;

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
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedColor('');
    setSelectedSize('');
    setIsNew(false);
    setOnSale(false);
    setPriceRange([0, 1000000]);
    setSortBy('newest');
  };

  const activeFilterCount = [searchQuery, selectedCategory, selectedColor, selectedSize, isNew, onSale].filter(Boolean).length;

  return (
    <div className="shop">
      {/* Page Header */}
      <div className="shop-header">
        <div className="shop-header-content">
          <h1 className="shop-title">Shop</h1>
          <p className="shop-subtitle">{filteredProducts.length} products</p>
        </div>

        {/* Search and Sort Bar */}
        <div className="shop-controls">
          <div className="search-bar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="4" y1="21" x2="4" y2="14"/>
              <line x1="4" y1="10" x2="4" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12" y2="3"/>
              <line x1="20" y1="21" x2="20" y2="16"/>
              <line x1="20" y1="12" x2="20" y2="3"/>
              <line x1="1" y1="14" x2="7" y2="14"/>
              <line x1="9" y1="8" x2="15" y2="8"/>
              <line x1="17" y1="16" x2="23" y2="16"/>
            </svg>
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

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
        <aside className={`filters-sidebar ${showFilters ? 'active' : ''}`}>
          <div className="filters-header">
            <h3>Filters</h3>
            {activeFilterCount > 0 && (
              <button className="clear-filters" onClick={clearFilters}>
                Clear All
              </button>
            )}
          </div>

          {/* Special Filters */}
          <div className="filter-group">
            <h4 className="filter-title">Special</h4>
            <div className="filter-options">
              <label className="filter-option checkbox-option">
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                />
                <span>New Arrivals</span>
              </label>
              <label className="filter-option checkbox-option">
                <input
                  type="checkbox"
                  checked={onSale}
                  onChange={(e) => setOnSale(e.target.checked)}
                />
                <span>On Sale</span>
              </label>
            </div>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <h4 className="filter-title">Category</h4>
            <div className="filter-options">
              {categories.map(category => (
                <label key={category.id} className="filter-option">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === category.slug}
                    onChange={() => setSelectedCategory(category.slug)}
                  />
                  <span>{category.name}</span>
                </label>
              ))}
              {selectedCategory && (
                <button
                  className="clear-filter"
                  onClick={() => setSelectedCategory('')}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Color Filter */}
          <div className="filter-group">
            <h4 className="filter-title">Color</h4>
            <div className="filter-options">
              {colors.map(color => (
                <label key={color.id} className="filter-option">
                  <input
                    type="radio"
                    name="color"
                    checked={selectedColor === String(color.id)}
                    onChange={() => setSelectedColor(String(color.id))}
                  />
                  <span>{color.name}</span>
                </label>
              ))}
              {selectedColor && (
                <button
                  className="clear-filter"
                  onClick={() => setSelectedColor('')}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Size Filter */}
          <div className="filter-group">
            <h4 className="filter-title">Size</h4>
            <div className="filter-options size-options">
              {sizes.map(size => (
                <button
                  key={size.id}
                  className={`size-button ${selectedSize === String(size.id) ? 'active' : ''}`}
                  onClick={() => setSelectedSize(selectedSize === String(size.id) ? '' : String(size.id))}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-group">
            <h4 className="filter-title">Price Range</h4>
            <div className="price-range">
              <input
                type="range"
                min="0"
                max="1000000"
                step="10000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
              />
              <div className="price-labels">
                <span>0 UZS</span>
                <span>{priceRange[1].toLocaleString()} UZS</span>
              </div>
            </div>
          </div>
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
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </main>
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

export default Shop;
