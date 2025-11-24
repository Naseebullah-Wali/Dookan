# Quick Start Guide

## Running the Application

### 1. Install Dependencies (if not already done)
```bash
cd afghan-grocery-vue
npm install
```

### 2. Start the Development Servers

You need to run **TWO** terminals:

**Terminal 1 - Frontend (Vue + Vite):**
```bash
npm run dev
```
This will start the Vue app at: http://localhost:5173

**Terminal 2 - Backend (JSON Server):**
```bash
npm run server
```
This will start the API at: http://localhost:3001

### 3. Open the Application

Navigate to: **http://localhost:5173**

### 4. Demo Account

Use these credentials to login:
- **Email**: demo@afghangrocery.com
- **Password**: demo123

## Features Available

✅ **Working Features:**
- User authentication (login/register)
- Browse products
- Search and filter products
- Add to cart
- View cart
- Update quantities
- Remove items
- User menu (when logged in)
- Toast notifications
- Responsive design

⚠️ **Placeholder Pages:**
- Product detail page
- Checkout flow
- Order confirmation
- Order tracking
- User profile
- Order history
- Wishlist
- About/Contact pages

## Troubleshooting

**If you get errors:**

1. Make sure both servers are running
2. Check that ports 5173 and 3001 are available
3. Try clearing browser cache
4. Restart both servers

**If JSON Server won't start:**
```bash
npx json-server --watch server/db.json --port 3001
```

## Next Steps

The application is now functional with core e-commerce features. To complete it:

1. Build out the placeholder pages
2. Add product detail page with reviews
3. Implement complete checkout flow
4. Add order tracking
5. Build user profile management
6. Add wishlist functionality

Enjoy building! 🚀
