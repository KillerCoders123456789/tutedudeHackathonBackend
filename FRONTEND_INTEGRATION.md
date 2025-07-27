# Frontend Integration Examples

This document provides examples of how to integrate with the TuteDude Hackathon Backend API from a frontend application.

## Base Configuration

```javascript
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  // Add auth token if available
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(url, config);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
};
```

## Authentication Examples

### User Registration
```javascript
const registerUser = async (userData, avatarFile, coverImageFile) => {
  const formData = new FormData();
  formData.append('fullName', userData.fullName);
  formData.append('email', userData.email);
  formData.append('username', userData.username);
  formData.append('password', userData.password);
  formData.append('phone', userData.phone);
  
  if (avatarFile) formData.append('avatar', avatarFile);
  if (coverImageFile) formData.append('coverImage', coverImageFile);
  
  const response = await fetch(`${API_BASE_URL}/user/register`, {
    method: 'POST',
    body: formData, // Don't set Content-Type for FormData
  });
  
  return response.json();
};
```

### User Login
```javascript
const loginUser = async (email, password) => {
  const data = await apiCall('/user/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  // Store tokens
  localStorage.setItem('accessToken', data.data.accessToken);
  localStorage.setItem('refreshToken', data.data.refreshToken);
  
  return data;
};
```

### User Logout
```javascript
const logoutUser = async () => {
  await apiCall('/user/logout', { method: 'POST' });
  
  // Clear tokens
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};
```

## Product Management Examples

### Get All Products
```javascript
const getProducts = async (page = 1, limit = 10, category = null, sellerId = null) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (category) params.append('category', category);
  if (sellerId) params.append('sellerId', sellerId);
  
  return apiCall(`/product/?${params}`);
};
```

### Search Products
```javascript
const searchProducts = async (query, filters = {}) => {
  const params = new URLSearchParams({ query });
  
  if (filters.category) params.append('category', filters.category);
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  return apiCall(`/product/search?${params}`);
};
```

### Create Product (Seller)
```javascript
const createProduct = async (productData) => {
  return apiCall('/product/', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
};

// Example usage:
const newProduct = {
  name: "Fresh Apples",
  description: "Red delicious apples from Kashmir",
  price: 150,
  category: "FRUITS",
  sellerId: "seller_id_here",
  amountLeft: 50
};
```

## Order Management Examples

### Create Order
```javascript
const createOrder = async (buyerId, sellerId, productId) => {
  return apiCall('/order/', {
    method: 'POST',
    body: JSON.stringify({ buyerId, sellerId, productId }),
  });
};
```

### Get Order Details
```javascript
const getOrderDetails = async (orderId) => {
  return apiCall(`/order/${orderId}`);
};
```

### Update Order Status
```javascript
const updateOrderStatus = async (orderId, statusUpdate) => {
  return apiCall(`/order/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify(statusUpdate),
  });
};

// Example: Mark as delivered
const markAsDelivered = (orderId) => updateOrderStatus(orderId, { isDelivered: true });

// Example: Cancel order
const cancelOrder = (orderId) => updateOrderStatus(orderId, { isCancelled: true });
```

## Buyer Features Examples

### Get Buyer Profile
```javascript
const getBuyerProfile = async (buyerId) => {
  return apiCall(`/buyer/profile/${buyerId}`);
};
```

### Manage Wishlist
```javascript
const addToWishlist = async (buyerId, productId) => {
  return apiCall(`/buyer/wishlist/${buyerId}`, {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
};

const removeFromWishlist = async (buyerId, productId) => {
  return apiCall(`/buyer/wishlist/${buyerId}/${productId}`, {
    method: 'DELETE',
  });
};

const getWishlist = async (buyerId, page = 1, limit = 10) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  return apiCall(`/buyer/wishlist/${buyerId}?${params}`);
};
```

### Get Buyer Orders
```javascript
const getBuyerOrders = async (buyerId, status = null, page = 1, limit = 10) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (status) params.append('status', status);
  
  return apiCall(`/buyer/orders/${buyerId}?${params}`);
};
```

## Seller Features Examples

### Get Seller Profile
```javascript
const getSellerProfile = async (sellerId) => {
  return apiCall(`/seller/profile/${sellerId}`);
};
```

### Get Seller Products
```javascript
const getSellerProducts = async (sellerId, page = 1, limit = 10) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: page.toString(),
  });
  
  return apiCall(`/seller/products/${sellerId}?${params}`);
};
```

## Error Handling Example

```javascript
const handleApiCall = async () => {
  try {
    const data = await getProducts();
    console.log('Products:', data.data.products);
  } catch (error) {
    console.error('API Error:', error.message);
    
    // Handle specific error cases
    if (error.message.includes('Unauthorized')) {
      // Redirect to login
      window.location.href = '/login';
    }
  }
};
```

## React Hook Example

```javascript
import { useState, useEffect } from 'react';

const useProducts = (category = null) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts(1, 10, category);
        setProducts(response.data.products);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [category]);
  
  return { products, loading, error };
};

// Usage in component:
const ProductList = () => {
  const { products, loading, error } = useProducts('FRUITS');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {products.map(product => (
        <div key={product._id}>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <p>Price: ₹{product.price}</p>
        </div>
      ))}
    </div>
  );
};
```

## Categories Available

```javascript
const PRODUCT_CATEGORIES = {
  VEGGIES: 'VEGGIES',
  FRUITS: 'FRUITS',
  WATER: 'WATER',
  DAIRY: 'DAIRY',
  BAKERY: 'BAKERY',
  MEAT: 'MEAT',
  CHICKEN: 'CHICKEN',
  FISH: 'FISH',
  SNACKS: 'SNACKS',
  BEVERAGES: 'BEVERAGES',
  PUCHKA: 'PUCHKA',
  SWEETS: 'SWEETS',
  MISC: 'MISC'
};
```

## Common Headers

```javascript
const commonHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// For file uploads, don't set Content-Type (let browser set it)
const fileUploadHeaders = {
  'Accept': 'application/json',
};
```

This should provide a comprehensive guide for frontend developers to integrate with the backend API!