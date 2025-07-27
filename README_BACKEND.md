# TuteDude Hackathon Backend

A complete Node.js backend API for a vendor-supplier platform, designed to work with the frontend at [https://github.com/morningstarxcdcode/F](https://github.com/morningstarxcdcode/F).

## 🚀 Features

### ✅ Complete API Implementation
- **User Authentication** - Registration, login, profile management with JWT
- **Product/Inventory Management** - CRUD operations for products with categories and stock
- **Order Management** - Order creation, tracking, status updates (pending/delivered/cancelled)
- **Supplier/Seller Management** - Seller profiles, reviews, and business management
- **Buyer Features** - Wishlist, order history, recommendations, statistics

### 🎯 Frontend Compatibility
- **Authentication Endpoints** - `/api/auth/*` for login/register
- **Inventory Endpoints** - `/api/inventory/*` for product management
- **Order Endpoints** - `/api/orders/*` for order operations
- **Supplier Endpoints** - `/api/suppliers/*` for supplier management

### 🔧 Technical Stack
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** authentication with refresh tokens
- **Bcrypt** for password hashing
- **Cloudinary** integration for file uploads
- **CORS** enabled for frontend integration

## 📁 Project Structure

```
src/
├── controllers/          # Business logic controllers
│   ├── user.controller.js
│   ├── product.controller.js
│   ├── order.controller.js
│   ├── seller.controller.js
│   └── buyer.controller.js
├── models/              # MongoDB schemas
│   ├── user.model.js
│   ├── product.model.js
│   ├── order.model.js
│   ├── seller.model.js
│   └── review.model.js
├── routes/              # API route definitions
│   ├── user.routes.js
│   ├── product.routes.js
│   ├── order.routes.js
│   ├── seller.routes.js
│   └── buyer.routes.js
├── middlewares/         # Custom middleware
├── utils/               # Utility functions
├── enums/               # Enumerations and constants
├── db/                  # Database connection
└── app.js               # Express app configuration
```

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/KillerCoders123456789/tutedudeHackathonBackend.git
   cd tutedudeHackathonBackend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Environment Variables**
   ```env
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017
   CORS_ORIGIN=*
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=10d
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run start
   ```

## 📋 API Endpoints

### Authentication (`/api/auth` or `/api/user`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/update` - Update user details
- `POST /api/auth/refreshaccesstoken` - Refresh access token

### Inventory Management (`/api/inventory` or `/api/product`)
- `GET /api/inventory` - Get all products (with pagination, filtering)
- `POST /api/inventory` - Create new product
- `GET /api/inventory/:productId` - Get product by ID
- `PUT /api/inventory/:productId` - Update product
- `DELETE /api/inventory/:productId` - Delete product
- `GET /api/inventory/search` - Search products
- `PUT /api/inventory/:productId/stock` - Update stock levels

### Order Management (`/api/orders` or `/api/order`)
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:orderId` - Get order by ID
- `PUT /api/orders/:orderId` - Update order status
- `PUT /api/orders/:orderId/cancel` - Cancel order
- `PUT /api/orders/:orderId/deliver` - Mark as delivered
- `GET /api/orders/buyer/:buyerId` - Get orders by buyer
- `GET /api/orders/seller/:sellerId` - Get orders by seller
- `GET /api/orders/stats` - Get order statistics

### Supplier Management (`/api/suppliers` or `/api/seller`)
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create new supplier
- `GET /api/suppliers/:sellerId` - Get supplier by ID
- `PUT /api/suppliers/:sellerId` - Update supplier
- `DELETE /api/suppliers/:sellerId` - Delete supplier
- `GET /api/suppliers/search` - Search suppliers
- `GET /api/suppliers/:sellerId/stats` - Get supplier statistics

### Buyer Features (`/api/buyer`)
- `GET /api/buyer/:buyerId/profile` - Get buyer profile
- `GET /api/buyer/:buyerId/orders` - Get buyer orders
- `GET /api/buyer/:buyerId/wishlist` - Get wishlist
- `POST /api/buyer/:buyerId/wishlist` - Add to wishlist
- `DELETE /api/buyer/:buyerId/wishlist/:productId` - Remove from wishlist
- `GET /api/buyer/:buyerId/stats` - Get buyer statistics
- `GET /api/buyer/:buyerId/recommendations` - Get product recommendations

## 🔐 Authentication

The API uses JWT-based authentication:
1. Register or login to receive access and refresh tokens
2. Include the access token in the `Authorization` header: `Bearer <token>`
3. Use refresh token to get new access tokens when expired

## 📊 Data Models

### User/Buyer
- Shop name, role (SELLER/BUYER), phone, email, full name
- Profile images (avatar, cover) via Cloudinary
- Encrypted passwords with bcrypt

### Product
- Name, description, price, category, stock amount
- Associated with seller, timestamps

### Order
- Buyer, seller, product references
- Status tracking (cancelled, delivered)
- Automatic stock management

### Seller/Supplier
- Shop details, owner information
- Contact details, address
- Review count and ratings

## 🧪 Testing

The server includes health check endpoints:
- `GET /` - API information and available endpoints
- `GET /api/health` - Server status check

Example test:
```bash
curl http://localhost:8000/api/health
# Response: {"status":"OK","timestamp":"2025-07-27T08:10:54.932Z"}
```

## 🌐 Frontend Integration

This backend is designed to work seamlessly with the frontend available at:
[https://github.com/morningstarxcdcode/F](https://github.com/morningstarxcdcode/F)

The frontend expects these exact endpoint patterns, which are all implemented:
- Authentication routes for login/register
- Inventory management for products
- Order management for tracking
- Supplier network management

## 🚀 Production Deployment

1. Set up MongoDB database (local or cloud)
2. Configure environment variables
3. Set up Cloudinary for file uploads
4. Configure CORS for your frontend domain
5. Use PM2 or similar for process management
6. Set up reverse proxy (nginx)
7. Configure SSL certificates

## 📝 Development Notes

- Server can start without database connection for development
- All routes are protected except registration and login
- Comprehensive error handling and validation
- Pagination and filtering support on list endpoints
- Automatic stock management on orders

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with proper testing
4. Submit pull request

## 📄 License

ISC License - see package.json for details.

---

**TuteDude Hackathon Backend** - Complete vendor-supplier platform API ready for frontend integration.