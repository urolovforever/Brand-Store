# 🎓 University Store E-Commerce Platform

A complete full-stack e-commerce solution for university branded merchandise with Django REST Framework backend and React frontend.

## 🌟 Features

### Customer Features
- ✅ **Product Catalog** - Browse products with advanced filtering (category, color, size, price)
- ✅ **Search** - Fast product search across name, description, and tags
- ✅ **Shopping Cart** - Persistent cart with quantity management
- ✅ **Wishlist** - Save favorite products for later
- ✅ **User Accounts** - Registration, login, profile management, order history
- ✅ **Checkout** - Streamlined checkout process with promo code support
- ✅ **Payment Integration** - Click, PayMe, and Cash on Delivery options
- ✅ **Product Reviews** - Rate and review products
- ✅ **Multi-language** - Uzbek and Russian language support

### Admin Features
- ✅ **Comprehensive Admin Panel** - Full-featured Django admin interface
- ✅ **Product Management** - CRUD operations, stock tracking, bulk actions
- ✅ **Order Management** - View orders, update status, track shipments
- ✅ **User Management** - Manage customer accounts
- ✅ **Promo Codes** - Create and manage discount codes
- ✅ **Review Moderation** - Approve or reject product reviews
- ✅ **Sales Analytics** - Dashboard with key metrics
- ✅ **Inventory Alerts** - Low stock warnings

### Technical Features
- ✅ **RESTful API** - Clean, well-documented API endpoints
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **API Documentation** - Swagger/OpenAPI documentation
- ✅ **Image Management** - Product image uploads and management
- ✅ **Responsive Design** - Mobile-first responsive UI
- ✅ **Security** - Password hashing, CSRF protection, input validation

---

## 📋 Table of Contents

- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Project](#-running-the-project)
- [API Documentation](#-api-documentation)
- [Payment Integration](#-payment-integration)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)

---

## 🛠 Technology Stack

### Backend
- **Framework**: Django 4.2.11
- **API**: Django REST Framework 3.14.0
- **Authentication**: JWT (djangorestframework-simplejwt, Djoser)
- **Database**: PostgreSQL (recommended) / SQLite (development)
- **Payment Gateways**: Click, PayMe
- **Documentation**: drf-spectacular (OpenAPI/Swagger)
- **Image Processing**: Pillow

### Frontend
- **Framework**: React 18
- **Routing**: React Router
- **State Management**: Context API / Redux
- **HTTP Client**: Axios
- **UI Framework**: Material-UI / Tailwind CSS
- **Internationalization**: react-i18next

---

## 📦 Prerequisites

- Python 3.11+
- Node.js 18+ & npm/yarn
- PostgreSQL 14+ (or SQLite for development)
- Git

---

## 🚀 Installation

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/yourusername/Brand-Store.git
cd Brand-Store
\`\`\`

### 2. Backend Setup

#### Create Virtual Environment

\`\`\`bash
cd backend
python -m venv venv

# Activate virtual environment
# On Windows:
venv\\Scripts\\activate
# On macOS/Linux:
source venv/bin/activate
\`\`\`

#### Install Dependencies

\`\`\`bash
pip install -r requirements.txt
\`\`\`

#### Configure Environment Variables

\`\`\`bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your configuration
nano .env  # or use your preferred editor
\`\`\`

#### Run Migrations

\`\`\`bash
python manage.py makemigrations
python manage.py migrate
\`\`\`

#### Create Superuser

\`\`\`bash
python manage.py createsuperuser
\`\`\`

#### Load Sample Data (Optional)

\`\`\`bash
# Create sample products, categories, etc.
python manage.py loaddata fixtures/sample_data.json
\`\`\`

### 3. Frontend Setup

\`\`\`bash
cd ../frontend
npm install
# or
yarn install
\`\`\`

---

## ⚙️ Configuration

### Backend Configuration

Edit \`backend/.env\` file:

\`\`\`env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (PostgreSQL recommended for production)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=university_store
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# Payment Gateways
CLICK_MERCHANT_ID=your_click_merchant_id
CLICK_SERVICE_ID=your_click_service_id
CLICK_SECRET_KEY=your_click_secret_key

PAYME_MERCHANT_ID=your_payme_merchant_id
PAYME_SECRET_KEY=your_payme_secret_key
\`\`\`

### Frontend Configuration

Create \`frontend/.env\`:

\`\`\`env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_MEDIA_URL=http://localhost:8000/media
\`\`\`

---

## 🏃 Running the Project

### Start Backend Server

\`\`\`bash
cd backend
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
python manage.py runserver
\`\`\`

Backend will run on: **http://localhost:8000**

### Start Frontend Server

\`\`\`bash
cd frontend
npm start
# or
yarn start
\`\`\`

Frontend will run on: **http://localhost:3000**

### Access Admin Panel

Navigate to: **http://localhost:8000/admin**

Login with your superuser credentials.

---

## 📚 API Documentation

### Interactive API Docs

Once the backend is running, access:

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/schema/

### API Endpoints Overview

#### Authentication
- \`POST /api/auth/users/\` - Register new user
- \`POST /api/auth/jwt/create/\` - Login (get JWT tokens)
- \`POST /api/auth/jwt/refresh/\` - Refresh access token
- \`GET /api/auth/users/me/\` - Get current user profile

#### Products
- \`GET /api/products/\` - List products (with filters)
- \`GET /api/products/{slug}/\` - Get product details
- \`GET /api/products/featured/\` - Get featured products
- \`GET /api/products/new_arrivals/\` - Get new arrivals
- \`GET /api/products/on_sale/\` - Get products on sale
- \`GET /api/categories/\` - List categories
- \`GET /api/colors/\` - List colors
- \`GET /api/sizes/\` - List sizes

#### Cart
- \`GET /api/cart/\` - Get user's cart
- \`POST /api/cart/add_item/\` - Add item to cart
- \`PATCH /api/cart/update_item/\` - Update cart item quantity
- \`DELETE /api/cart/remove_item/\` - Remove item from cart
- \`DELETE /api/cart/clear/\` - Clear cart

#### Wishlist
- \`GET /api/wishlist/\` - Get user's wishlist
- \`POST /api/wishlist/\` - Add item to wishlist
- \`DELETE /api/wishlist/{id}/\` - Remove from wishlist
- \`POST /api/wishlist/toggle/\` - Toggle product in wishlist

#### Orders
- \`GET /api/orders/\` - List user's orders
- \`POST /api/orders/\` - Create order from cart
- \`GET /api/orders/{id}/\` - Get order details
- \`POST /api/orders/{id}/cancel/\` - Cancel order

#### Payments
- \`POST /api/payments/initiate/\` - Initiate payment for order
- \`POST /api/payments/click/prepare/\` - Click prepare callback
- \`POST /api/payments/click/complete/\` - Click complete callback
- \`POST /api/payments/payme/callback/\` - PayMe JSON-RPC callback

#### Promo Codes
- \`GET /api/promo-codes/\` - List active promo codes
- \`POST /api/promo-codes/validate/\` - Validate promo code

---

## 💳 Payment Integration

### Click Payment Gateway

1. **Register**: Go to https://click.uz and register as a merchant
2. **Get Credentials**: Obtain your merchant_id, service_id, and secret_key
3. **Configure**: Add credentials to \`.env\` file
4. **Set Callback URLs**: Configure in Click merchant panel:
   - Prepare: \`https://yourdomain.com/api/payments/click/prepare/\`
   - Complete: \`https://yourdomain.com/api/payments/click/complete/\`

### PayMe Payment Gateway

1. **Register**: Go to https://payme.uz and register as a merchant
2. **Get Credentials**: Obtain your merchant_id and secret_key
3. **Configure**: Add credentials to \`.env\` file
4. **Set Callback URL**: Configure in PayMe merchant panel:
   - Callback: \`https://yourdomain.com/api/payments/payme/callback/\`

### Test Payments

For development, use test credentials provided by the payment gateways.

---

## 📁 Project Structure

\`\`\`
Brand-Store/
├── backend/
│   ├── config/              # Django project settings
│   ├── accounts/            # User authentication & profiles
│   ├── products/            # Product catalog
│   ├── orders/              # Cart & Order management
│   ├── wishlist/            # Wishlist functionality
│   ├── payments/            # Payment gateway integration
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   ├── i18n/            # Translations
│   │   └── App.js
│   ├── public/
│   ├── package.json
│   └── .env.example
└── README.md
\`\`\`

---

## 🔐 Security Notes

### Production Deployment Checklist

- [ ] Change \`SECRET_KEY\` in production
- [ ] Set \`DEBUG = False\`
- [ ] Configure proper \`ALLOWED_HOSTS\`
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS (SSL/TLS certificates)
- [ ] Set secure cookie settings
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Enable security headers
- [ ] Use environment variables for sensitive data
- [ ] Set up logging and monitoring

---

## 🧪 Testing

### Backend Tests

\`\`\`bash
cd backend
python manage.py test
\`\`\`

### Frontend Tests

\`\`\`bash
cd frontend
npm test
\`\`\`

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

---

## 📧 Contact & Support

For support or questions, please contact:
- Email: support@universitystore.com
- GitHub Issues: https://github.com/yourusername/Brand-Store/issues

---

## 🙏 Acknowledgments

- Django REST Framework documentation
- React documentation
- Click and PayMe payment gateway documentation
- All open-source contributors

---

**Built with ❤️ for university students**
