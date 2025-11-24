# Afghan Grocery - Vue.js E-Commerce Application

A modern, professional e-commerce platform for Afghan grocery delivery built with Vue.js 3, Pinia, and JSON Server.

## Features

✅ **User Authentication**
- Register new account
- Login with email/password
- JWT token-based authentication
- Protected routes
- User profile management

✅ **E-Commerce Functionality**
- Browse products with filtering
- Product search
- Shopping cart with persistence
- Wishlist/favorites
- Multi-step checkout
- Order tracking
- Order history

✅ **User Profile**
- Personal information management
- Address book
- Order history
- Password change
- Profile settings

✅ **Modern UI/UX**
- Mobile-first responsive design
- Smooth page transitions
- Loading states & skeletons
- Toast notifications
- Animated interactions
- Professional design system

## Tech Stack

- **Frontend**: Vue 3 (Composition API), Vite
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **HTTP Client**: Axios
- **Backend**: JSON Server with Auth
- **Styling**: Custom CSS with design system

## Project Structure

```
afghan-grocery-vue/
├── public/              # Static assets
├── server/              # JSON Server backend
│   ├── db.json         # Database
│   └── auth.cjs        # Auth middleware
├── src/
│   ├── assets/         # Styles and images
│   ├── components/     # Vue components
│   ├── views/          # Page components
│   ├── stores/         # Pinia stores
│   ├── router/         # Vue Router config
│   ├── services/       # API services
│   ├── composables/    # Reusable composition functions
│   ├── utils/          # Utility functions
│   ├── App.vue         # Root component
│   └── main.js         # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm

### Install Dependencies

```bash
cd afghan-grocery-vue
npm install
```

### Run Development Servers

You need to run TWO servers:

**Terminal 1 - Vue Dev Server:**
```bash
npm run dev
```
This starts the frontend at `http://localhost:5173`

**Terminal 2 - JSON Server (Backend):**
```bash
npm run server
```
This starts the API at `http://localhost:3001`

### Demo Account

- **Email**: demo@afghangrocery.com
- **Password**: demo123

## Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run server` - Start JSON Server backend

## API Endpoints

The JSON Server provides the following endpoints:

### Authentication
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /users/:id` - Get user profile

### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `GET /products?category=:category` - Filter by category
- `GET /products?q=:search` - Search products

### Orders
- `POST /orders` - Create new order
- `GET /orders?userId=:id` - Get user orders
- `GET /orders/:id` - Get order by ID

### Reviews
- `GET /reviews?productId=:id` - Get product reviews
- `POST /reviews` - Add review

### Wishlist
- `GET /wishlist?userId=:id` - Get user wishlist
- `POST /wishlist` - Add to wishlist
- `DELETE /wishlist/:id` - Remove from wishlist

## Design System

### Colors

- **Primary (Saffron Orange)**: `#E76F1A`
- **Secondary (Fresh Green)**: `#2F9D52`
- **Background**: `#FAF9F6`
- **Text**: `#202124`
- **Trust Blue**: `#1F6FEB`

### Typography

- **Headings**: Poppins
- **Body**: Inter

## Key Features Implementation

### State Management (Pinia)

**Auth Store** (`stores/auth.js`)
- User authentication state
- Login/logout/register actions
- Token management
- Auto-login from localStorage

**Cart Store** (`stores/cart.js`)
- Shopping cart state
- Add/remove/update items
- Cart total calculation
- localStorage persistence

**Products Store** (`stores/products.js`)
- Products catalog
- Filtering and search
- Product details
- Categories

**Wishlist Store** (`stores/wishlist.js`)
- Favorite products
- Add/remove from wishlist
- Sync with backend

### Routing

Protected routes require authentication:
- `/profile` - User profile
- `/orders` - Order history
- `/checkout` - Checkout page

Public routes:
- `/` - Home
- `/shop` - Products catalog
- `/product/:id` - Product details
- `/cart` - Shopping cart
- `/login` - Login page
- `/register` - Register page

### Components

**Common Components:**
- `AppHeader` - Navigation with cart badge
- `AppFooter` - Footer links
- `LoadingSpinner` - Loading indicator
- `ToastNotification` - Toast messages
- `Modal` - Modal dialogs

**Product Components:**
- `ProductCard` - Product display card
- `ProductGrid` - Products grid layout
- `ProductFilter` - Filter sidebar
- `ProductReview` - Review display

**Cart Components:**
- `CartItem` - Cart item row
- `CartSummary` - Order summary
- `CartDrawer` - Slide-in cart

## Production Build

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Deployment

### Frontend (Vite Build)

Deploy the `dist/` folder to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting

### Backend

For production, replace JSON Server with a real backend:
- Node.js + Express
- Django REST Framework
- Laravel API
- Firebase

## Future Enhancements

- [ ] Admin dashboard
- [ ] Real-time order tracking
- [ ] Push notifications
- [ ] Multi-language (Dari, Pashto)
- [ ] PWA support
- [ ] Social login
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Product recommendations
- [ ] Advanced analytics

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## License

Private - Afghan Grocery © 2025

## Support

For questions or issues, contact: info@afghangrocery.com

---

**Made with ❤️ for Afghan families worldwide**
