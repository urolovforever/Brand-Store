# University Store Frontend

React-based frontend for the University Store e-commerce platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend API running on http://localhost:8000

### Installation

```bash
cd frontend
npm install
# or
yarn install
```

### Run Development Server

```bash
npm start
# or
yarn start
```

Frontend will run on **http://localhost:3000**

---

## 📁 Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/       # Reusable components
│   ├── pages/            # Page components
│   ├── services/         # API service layer
│   ├── contexts/         # React contexts for state
│   ├── i18n/             # Internationalization (Uzbek/Russian)
│   ├── utils/            # Utility functions
│   ├── styles/           # Global styles
│   ├── App.js            # Main app component
│   └── index.js          # Entry point
└── package.json
```

---

## 🛠 Implementation Status

### ✅ Completed
- Basic project structure
- Dependencies configuration
- Public files (HTML, manifest)

### 🔄 To Implement

#### 1. Core Setup
**src/index.js**
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './i18n/config'; // i18n configuration

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**src/App.js**
```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
// ... other pages

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            {/* Routes */}
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

#### 2. API Services
**src/services/api.js**
```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

**src/services/productService.js**
```javascript
import api from './api';

export const productService = {
  getProducts: (params) => api.get('/products/', { params }),
  getProductBySlug: (slug) => api.get(`/products/${slug}/`),
  getFeatured: () => api.get('/products/featured/'),
  getNewArrivals: () => api.get('/products/new_arrivals/'),
  getOnSale: () => api.get('/products/on_sale/'),
  searchProducts: (query) => api.get('/products/', { params: { search: query } })
};
```

#### 3. i18n Configuration
**src/i18n/config.js**
```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uz from './locales/uz.json';
import ru from './locales/ru.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      uz: { translation: uz },
      ru: { translation: ru }
    },
    lng: 'uz',
    fallbackLng: 'uz',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

**src/i18n/locales/uz.json**
```json
{
  "nav": {
    "shop": "Do'kon",
    "new_arrivals": "Yangi mahsulotlar",
    "on_sale": "Chegirmada",
    "contact": "Aloqa"
  },
  "product": {
    "add_to_cart": "Savatchaga qo'shish",
    "add_to_wishlist": "Tanlanganlar",
    "price": "Narx",
    "in_stock": "Omborda bor"
  }
}
```

#### 4. Context Providers
**src/contexts/AuthContext.js** - User authentication state
**src/contexts/CartContext.js** - Shopping cart state
**src/contexts/WishlistContext.js** - Wishlist state

#### 5. Components to Create
- Header (navigation, search, cart icon)
- Footer
- ProductCard
- ProductFilter
- SearchBar
- LanguageSwitcher
- Loading
- ErrorBoundary

#### 6. Pages to Create
- Home (hero, featured products)
- Shop (product grid, filters)
- ProductDetail
- Cart
- Wishlist
- Checkout
- Login/Register
- Profile
- OrderHistory

---

## 🎨 Styling Approach

### Option 1: CSS Modules
```javascript
import styles from './Component.module.css';

function Component() {
  return <div className={styles.container}>...</div>;
}
```

### Option 2: Inline Styles
Simple, component-scoped styling

### Option 3: Styled Components
Install: `npm install styled-components`

---

## 📦 Dependencies

### Installed
- **react** - UI library
- **react-router-dom** - Routing
- **axios** - HTTP client
- **i18next / react-i18next** - Internationalization

### Recommended to Add
- **react-icons** - Icon library
- **react-toastify** - Notifications
- **formik + yup** - Form handling & validation
- **swiper** - Carousel for hero section

```bash
npm install react-icons react-toastify formik yup swiper
```

---

## 🔗 API Integration

All backend endpoints are documented at:
**http://localhost:8000/api/docs/**

### Example API Calls

**Get Products:**
```javascript
const { data } = await productService.getProducts({
  category: 'clothing',
  min_price: 10000,
  max_price: 50000,
  colors: '1,2,3',
  sizes: '1,2'
});
```

**Add to Cart:**
```javascript
await cartService.addItem({
  product_id: 1,
  quantity: 2,
  color_id: 1,
  size_id: 2
});
```

**Create Order:**
```javascript
await orderService.createOrder({
  email: 'user@example.com',
  phone_number: '+998901234567',
  address: '123 University St',
  payment_method: 'CLICK'
});
```

---

## 🌍 Environment Variables

Create `.env` file:

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_MEDIA_URL=http://localhost:8000/media
```

---

## 🚀 Build for Production

```bash
npm run build
# or
yarn build
```

Build files will be in `build/` directory.

### Deploy to Netlify/Vercel

1. Build the app
2. Point to `build` directory
3. Set environment variables
4. Deploy

---

## 📝 Implementation Checklist

- [ ] Create src/index.js
- [ ] Create src/App.js with routing
- [ ] Set up i18n (Uzbek/Russian)
- [ ] Create API service layer
- [ ] Implement AuthContext
- [ ] Implement CartContext
- [ ] Implement WishlistContext
- [ ] Create Header component
- [ ] Create Footer component
- [ ] Create ProductCard component
- [ ] Create ProductFilter component
- [ ] Create Home page
- [ ] Create Shop page
- [ ] Create ProductDetail page
- [ ] Create Cart page
- [ ] Create Wishlist page
- [ ] Create Checkout page
- [ ] Create Login/Register pages
- [ ] Create Profile page
- [ ] Create OrderHistory page
- [ ] Add responsive styling
- [ ] Test all features
- [ ] Handle loading states
- [ ] Handle error states
- [ ] Add form validation
- [ ] Implement search
- [ ] Add pagination
- [ ] Test payment flow

---

## 🐛 Common Issues & Solutions

### CORS Errors
Make sure backend CORS is configured to allow `http://localhost:3000`

### Proxy Not Working
Check `package.json` has `"proxy": "http://localhost:8000"`

### Images Not Loading
Use full URL: `${process.env.REACT_APP_MEDIA_URL}${image.url}`

---

## 📚 Resources

- [React Documentation](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [i18next](https://www.i18next.com/)
- [Axios](https://axios-http.com/)
- [Backend API Docs](http://localhost:8000/api/docs/)

---

**Happy Coding! 🚀**
