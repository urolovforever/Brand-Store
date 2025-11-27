import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { LanguageProvider } from './context/LanguageContext';
import { WishlistProvider, useWishlist } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import WishlistDrawer from './components/WishlistDrawer';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import NewArrivals from './pages/NewArrivals';
import OnSale from './pages/OnSale';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import OrderHistory from './pages/OrderHistory';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <div className="App">
                <Header />
                <WishlistDrawerContainer />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/new" element={<NewArrivals />} />
                    <Route path="/sale" element={<OnSale />} />
                    <Route path="/product/:slug" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/orders" element={<OrderHistory />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </Router>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

// Container for WishlistDrawer to use wishlist context
function WishlistDrawerContainer() {
  const { wishlistItems, isDrawerOpen, closeDrawer, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = async (item) => {
    const result = await addToCart(item.id, 1);
    if (result.success) {
      console.log('Added to cart:', item.name);
    } else {
      alert(result.message);
    }
  };

  const handleMoveAllToCart = async () => {
    for (const item of wishlistItems) {
      await addToCart(item.id, 1);
    }
    closeDrawer();
  };

  return (
    <WishlistDrawer
      isOpen={isDrawerOpen}
      onClose={closeDrawer}
      wishlistItems={wishlistItems}
      onRemoveItem={removeFromWishlist}
      onAddToCart={handleAddToCart}
      onMoveAllToCart={handleMoveAllToCart}
    />
  );
}

export default App;
