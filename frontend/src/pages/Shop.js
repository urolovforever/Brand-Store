import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [showFilters, setShowFilters] = useState(false);

  // Sample products (will be replaced with API call)
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts([
        { id: 1, name: 'TIU Classic Hoodie', price: 89000, category: 'Apparel', color: 'Navy', size: 'M', image: null, is_new: true },
        { id: 2, name: 'University Tee', price: 45000, category: 'Apparel', color: 'White', size: 'L', image: null, on_sale: true },
        { id: 3, name: 'Campus Cap', price: 35000, category: 'Accessories', color: 'Black', size: 'One Size', image: null },
        { id: 4, name: 'Logo Tote Bag', price: 55000, category: 'Accessories', color: 'Beige', size: 'One Size', image: null },
        { id: 5, name: 'Sport Jacket', price: 125000, category: 'Apparel', color: 'Navy', size: 'XL', image: null },
        { id: 6, name: 'Cotton Polo', price: 65000, category: 'Apparel', color: 'Navy', size: 'M', image: null, is_new: true },
        { id: 7, name: 'Laptop Sleeve', price: 45000, category: 'Accessories', color: 'Black', size: 'One Size', image: null },
        { id: 8, name: 'Zip Hoodie', price: 95000, category: 'Apparel', color: 'Grey', size: 'L', image: null },
      ]);
      setCategories(['Apparel', 'Accessories', 'Custom']);
      setColors(['Navy', 'White', 'Black', 'Grey', 'Beige']);
      setSizes(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']);
      setLoading(false);
    }, 500);
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedColor) params.color = selectedColor;
    if (selectedSize) params.size = selectedSize;
    if (sortBy !== 'newest') params.sort = sortBy;
    setSearchParams(params);
  }, [searchQuery, selectedCategory, selectedColor, selectedSize, sortBy, setSearchParams]);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedCategory && product.category !== selectedCategory) return false;
      if (selectedColor && product.color !== selectedColor) return false;
      if (selectedSize && product.size !== selectedSize) return false;
      if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low': return a.price - b.price;
        case 'price_high': return b.price - a.price;
        case 'name': return a.name.localeCompare(b.name);
        default: return b.id - a.id; // newest
      }
    });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedColor('');
    setSelectedSize('');
    setPriceRange([0, 1000000]);
    setSortBy('newest');
  };

  const activeFilterCount = [searchQuery, selectedCategory, selectedColor, selectedSize].filter(Boolean).length;

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

          {/* Category Filter */}
          <div className="filter-group">
            <h4 className="filter-title">Category</h4>
            <div className="filter-options">
              {categories.map(category => (
                <label key={category} className="filter-option">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === category}
                    onChange={() => setSelectedCategory(category)}
                  />
                  <span>{category}</span>
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
                <label key={color} className="filter-option">
                  <input
                    type="radio"
                    name="color"
                    checked={selectedColor === color}
                    onChange={() => setSelectedColor(color)}
                  />
                  <span>{color}</span>
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
                  key={size}
                  className={`size-button ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                >
                  {size}
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
  return (
    <Link
      to={`/product/${product.id}`}
      className="product-card"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="product-image">
        <div className="image-placeholder">
          {product.name}
        </div>
        {product.is_new && <span className="badge new-badge">New</span>}
        {product.on_sale && <span className="badge sale-badge">Sale</span>}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-meta">
          <span className="product-category">{product.category}</span>
          <span className="product-separator">•</span>
          <span className="product-color">{product.color}</span>
        </div>
        <p className="product-price">{product.price.toLocaleString()} UZS</p>
      </div>
    </Link>
  );
}

export default Shop;
