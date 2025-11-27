import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services';
import { useLanguage } from '../context/LanguageContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './Home.css';

function Home() {
  const { t } = useLanguage();
  const [newArrivals, setNewArrivals] = useState([]);
  const [onSaleProducts, setOnSaleProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [newProducts, onSaleData, categoriesData] = await Promise.all([
        productService.getNewArrivals(),
        productService.getSaleProducts(),
        productService.getCategories(),
      ]);

      // Handle paginated response (DRF returns {results: [...], count: N})
      const productsArray = Array.isArray(newProducts) ? newProducts : newProducts.results || [];
      const onSaleArray = Array.isArray(onSaleData) ? onSaleData : onSaleData.results || [];
      const categoriesArray = Array.isArray(categoriesData) ? categoriesData : categoriesData.results || [];

      setNewArrivals(productsArray.slice(0, 4)); // Show first 4
      setOnSaleProducts(onSaleArray.slice(0, 4)); // Show first 4
      setCategories(categoriesArray); // Show all for horizontal scroll
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Carousel */}
      <section className="hero-carousel">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: false,
          }}
          navigation={true}
          loop={true}
          className="hero-swiper"
        >
          <SwiperSlide>
            <div className="hero-slide hero-slide-1">
              <div className="hero-content">
                <h1 className="hero-title">{t('heroTitle')}</h1>
                <p className="hero-subtitle">{t('heroSubtitle')}</p>
                <Link to="/shop" className="cta-button">{t('exploreCollection')}</Link>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="hero-slide hero-slide-2">
              <div className="hero-content">
                <h1 className="hero-title">{t('newArrivals')}</h1>
                <p className="hero-subtitle">{t('premiumQualityDesc')}</p>
                <Link to="/new" className="cta-button">{t('viewAll')}</Link>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="hero-slide hero-slide-3">
              <div className="hero-content">
                <h1 className="hero-title">{t('sale')}</h1>
                <p className="hero-subtitle">{t('easyReturnsDesc')}</p>
                <Link to="/sale" className="cta-button">{t('viewAll')}</Link>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>

      {/* Horizontal Category Carousel */}
      {categories.length > 0 && (
        <section className="category-carousel-section">
          <div className="section-header-full">
            <h2 className="section-title">{t('category')}</h2>
          </div>
          <Swiper
            modules={[Navigation]}
            spaceBetween={24}
            slidesPerView="auto"
            navigation={true}
            className="category-swiper"
            breakpoints={{
              320: {
                slidesPerView: 1.5,
                spaceBetween: 16,
              },
              480: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
            }}
          >
            {categories.map(category => (
              <SwiperSlide key={category.id}>
                <CategoryCard
                  title={category.name}
                  description={category.description || `Explore our ${category.name} collection`}
                  link={`/shop?category=${category.slug}`}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      {/* New Arrivals Section */}
      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title">{t('newArrivals')}</h2>
          <Link to="/new" className="view-all">{t('viewAll')} →</Link>
        </div>
        {loading ? (
          <div className="loading-grid">
            <p>{t('loadingProducts')}</p>
          </div>
        ) : (
          <div className="product-grid">
            {newArrivals.length > 0 ? (
              newArrivals.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p>{t('noNewArrivals')}</p>
            )}
          </div>
        )}
      </section>

      {/* On Sale Section */}
      {onSaleProducts.length > 0 && (
        <section className="featured-section on-sale-section">
          <div className="section-header">
            <h2 className="section-title">{t('sale')}</h2>
            <Link to="/sale" className="view-all">{t('viewAll')} →</Link>
          </div>
          <div className="product-grid">
            {onSaleProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Values Section */}
      <section className="values-section">
        <div className="value-item">
          <div className="value-icon">✓</div>
          <h3>{t('premiumQuality')}</h3>
          <p>{t('premiumQualityDesc')}</p>
        </div>
        <div className="value-item">
          <div className="value-icon">✓</div>
          <h3>{t('fastDelivery')}</h3>
          <p>{t('fastDeliveryDesc')}</p>
        </div>
        <div className="value-item">
          <div className="value-icon">✓</div>
          <h3>{t('easyReturns')}</h3>
          <p>{t('easyReturnsDesc')}</p>
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
