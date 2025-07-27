# KillerCoders123456789 - TuteDude Hackathon Backend

![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![Express](https://img.shields.io/badge/Express-v5.1.0-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-v6.18.0-green)
![License](https://img.shields.io/badge/License-ISC-blue)

## 🏆 About KillerCoders123456789

**KillerCoders123456789** is a passionate development team participating in the TuteDude Hackathon. We specialize in building scalable, modern web applications with cutting-edge technologies. Our team is committed to delivering high-quality solutions that solve real-world problems.

## 🚀 Project Overview

This repository contains the **backend API** for our TuteDude Hackathon submission - an **E-commerce Platform** that connects buyers and sellers in a seamless marketplace experience. The platform enables users to register as either buyers or sellers, manage products, process orders, and handle reviews.

### ✨ Key Features

- 🔐 **User Authentication & Authorization** - JWT-based secure authentication
- 👥 **Role-based Access Control** - Separate functionalities for buyers and sellers
- 🛍️ **Product Management** - CRUD operations for products with image uploads
- 📦 **Order Processing** - Complete order lifecycle management
- ⭐ **Review System** - Product rating and review functionality
- ☁️ **Cloud Storage** - Cloudinary integration for image uploads
- 🔒 **Password Security** - Bcrypt encryption for user passwords
- 🌐 **CORS Enabled** - Cross-origin resource sharing support

## 🛠️ Technology Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (v5.1.0)
- **Database:** MongoDB with Mongoose ODM (v8.16.5)
- **Authentication:** JSON Web Tokens (JWT)
- **Password Hashing:** Bcrypt (v6.0.0)
- **File Upload:** Multer (v2.0.2)
- **Cloud Storage:** Cloudinary (v2.7.0)
- **HTTP Client:** Axios (v1.11.0)
- **Development:** Nodemon (v3.1.10)
- **Code Formatting:** Prettier (v3.6.2)

## 👨‍💻 Team Members

Meet our incredible team of developers who made this project possible:

### 🎯 Core Developers

| Avatar                                                                                    | Name       | GitHub Profile                                               | Role                   | Contributions                                                                  |
| ----------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------ |
| <img src="https://avatars.githubusercontent.com/u/128579482?v=4" width="50" alt="Anurag"> | **Anurag** | [@a-nnurag](https://github.com/a-nnurag)                     | Lead Backend Developer | Backend architecture, models setup, database integration, core API development |
| <img src="https://avatars.githubusercontent.com/u/205398826?v=4" width="50" alt="Sourav"> | **Sourav** | [@morningstarxcdcode](https://github.com/morningstarxcdcode) | Backend Developer      | Controller implementations, API endpoints, code reviews                        |

## 📁 Project Structure

```
tutedudeHackathonBackend/
├── src/
│   ├── controllers/          # API endpoint controllers
│   ├── models/              # MongoDB schemas
│   │   ├── user.model.js    # User schema with authentication
│   │   ├── product.model.js # Product information schema
│   │   ├── order.model.js   # Order processing schema
│   │   ├── review.model.js  # Product review schema
│   │   ├── seller.model.js  # Seller profile schema
│   │   └── roles.model.js   # User roles definition
│   ├── routes/              # API route definitions
│   ├── middlewares/         # Custom middleware functions
│   ├── db/                  # Database connection
│   ├── utils/               # Utility functions
│   ├── seeder/              # Database seeders
│   ├── enums/               # Application constants
│   ├── app.js               # Express app configuration
│   └── index.js             # Application entry point
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.0 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

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

   Create a `.env` file in the root directory:

   ```env
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRY=7d
   CORS_ORIGIN=*
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Database Setup**

   Run the role seeder to initialize user roles:

   ```bash
   npm run seeder
   ```

5. **Start the Development Server**

   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:8000`

6. **Production Build**
   ```bash
   npm start
   ```

## 📚 API Endpoints

### Authentication

- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login
- `POST /api/user/logout` - User logout

### User Management

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Products (Coming Soon)

- `GET /api/product` - Get all products
- `POST /api/product` - Create new product
- `PUT /api/product/:id` - Update product
- `DELETE /api/product/:id` - Delete product

### Orders (Coming Soon)

- `POST /api/order` - Create new order
- `GET /api/order` - Get user orders
- `PUT /api/order/:id` - Update order status

## 🧪 Development Scripts

```bash
# Start development server with hot reload
npm run dev

# Start production server
npm start

# Run database seeder
npm run seeder

# Format code with Prettier
npx prettier --write .
```

## 🤝 Contributing

We welcome contributions from the community! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [package.json](package.json) file for details.

## 🎯 Hackathon Goals

This project was developed as part of the **TuteDude Hackathon** with the following objectives:

- ✅ Build a scalable e-commerce backend API
- ✅ Implement secure user authentication and authorization
- ✅ Create a robust database schema for e-commerce operations
- ✅ Integrate cloud services for file storage
- ✅ Follow industry best practices for code organization
- ⏳ Deploy to production environment

## 📞 Contact & Support

For questions, suggestions, or collaboration opportunities, feel free to reach out to our team:

- **Anurag** - [@a-nnurag](https://github.com/a-nnurag)
- **Sourav** - [@morningstarxcdcode](https://github.com/morningstarxcdcode)

---

<div align="center">
  <strong>Made with ❤️ by KillerCoders123456789 Team</strong>
  <br>
  <em>TuteDude Hackathon 2025</em>
</div>
