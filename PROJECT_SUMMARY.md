# Afghan Grocery Project Summary

## 🚀 Project Overview
A full-stack e-commerce application for Afghan Grocery, built with **Vue.js 3** (Frontend) and **Express.js/TypeScript** (Backend). The application features a modern, responsive design, full product catalog, shopping cart, user authentication, order management, and a comprehensive admin panel.

## 🛠️ Technology Stack
- **Frontend**: Vue.js 3, Pinia (State Management), Vue Router, Bootstrap 5, Axios
- **Backend**: Node.js, Express.js, TypeScript, SQLite
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Local file system (uploads directory)

## ✨ Key Features

### Customer Features
- **Browse & Search**: Filter products by category, price, and search terms.
- **Product Details**: View product images, descriptions, reviews, and related items.
- **Shopping Cart**: Add items, update quantities, and view total.
- **Checkout**: Secure checkout process with address management and COD payment.
- **User Account**:
  - **Profile**: Update personal information.
  - **Address Book**: Manage multiple delivery addresses.
  - **Order History**: View past orders and status.
  - **Wishlist**: Save favorite items.
  - **Order Tracking**: Track order status by ID.

### Admin Features
- **Dashboard**: Quick access to key metrics and actions.
- **Product Management**: Create, edit, and delete products with image upload.
- **Category Management**: Create, edit, and delete product categories.
- **User Management**: View users and manage roles (promote to Admin).
- **Order Management**: View all orders and update their status.

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@afghangrocery.com` | `admin123` |
| **Customer** | `customer@test.com` | `customer123` |

## 📅 Recent Updates (Session: 2025-11-28)

1.  **Fixed Login Issues**: Resolved CORS network error by updating backend configuration.
2.  **Admin Panel Enhancements**:
    - Added **User Management** (Role editing).
    - Added **Category Management** (CRUD).
    - Implemented **Image Upload** for products (replaced URL input).
3.  **Address Management**:
    - Implemented full backend API for addresses.
    - Updated frontend `AddressBook` to use the new API.
4.  **404 Page**: Created a custom "Page Not Found" experience.
5.  **Bug Fixes**: Fixed server crash due to incorrect middleware import.

## 🏃 How to Run

### Backend
```bash
cd "d:\Zendesk\New Apps from Antigravity\backend-afghan-grocery"
npm install # If not installed
npm run dev
```
*Server runs on `http://localhost:3000`*

### Frontend
```bash
cd "d:\Zendesk\New Apps from Antigravity\afghan-grocery-vue"
npm install # If not installed
npm run dev
```
*App runs on `http://localhost:5173`*

## ⚠️ Important Note
**You must restart the backend server** for the latest changes (CORS fix, Address API) to take effect.

## 🔜 Next Steps
- Verify end-to-end flow for Address Management.
- Test Wishlist and Reviews functionality.
- Consider adding email notifications for orders.
