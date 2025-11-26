import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>University Store</h1>
          </Link>

          <nav className="nav">
            <Link to="/shop">Shop</Link>
            <Link to="/shop?is_new=true">New Arrivals</Link>
            <Link to="/shop?on_sale=true">On Sale</Link>
            <Link to="/contact">Contact</Link>
          </nav>

          <div className="header-actions">
            <Link to="/wishlist" className="icon-btn">
              ❤️ <span className="badge">0</span>
            </Link>
            <Link to="/login" className="icon-btn">
              👤
            </Link>
            <Link to="/cart" className="icon-btn">
              🛒 <span className="badge">0</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
