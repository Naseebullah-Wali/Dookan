# Afghan Grocery Backend API

Professional backend API for the Afghan Grocery e-commerce application built with Express.js, TypeScript, and SQLite.

## 🚀 Features

- **TypeScript**: Fully typed codebase for better development experience
- **Express.js**: Fast and minimalist web framework
- **SQLite**: Lightweight database with easy migration path to Supabase
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin and customer roles
- **Input Validation**: Request validation using express-validator
- **Security**: Helmet, CORS, rate limiting
- **Multi-language Support**: Products and categories support 5 languages (EN, PS, FA, DE, FR)
- **Professional Architecture**: Clean separation of concerns

## 📁 Project Structure

```
backend-afghan-grocery/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── core/            # Core application setup
│   ├── db/              # Database connection and schema
│   ├── middleware/      # Custom middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── main.ts          # Application entry point
├── uploads/             # File uploads directory
├── .env                 # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment variables**:
Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

3. **Start development server**:
```bash
npm run dev
```

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run clean` - Clean build directory

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3000 |
| `API_VERSION` | API version | v1 |
| `DB_PATH` | SQLite database path | ./src/db/database.sqlite |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `CORS_ORIGIN` | Allowed CORS origins | http://localhost:5173 |

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get user profile (protected)
- `PUT /api/v1/auth/profile` - Update user profile (protected)
- `POST /api/v1/auth/change-password` - Change password (protected)

### Products
- `GET /api/v1/products` - Get all products (with filters)
- `GET /api/v1/products/featured` - Get featured products
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create product (admin only)
- `PUT /api/v1/products/:id` - Update product (admin only)
- `DELETE /api/v1/products/:id` - Delete product (admin only)

### Categories
- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/:id` - Get category by ID
- `POST /api/v1/categories` - Create category (admin only)
- `PUT /api/v1/categories/:id` - Update category (admin only)
- `DELETE /api/v1/categories/:id` - Delete category (admin only)

### Orders
- `GET /api/v1/orders` - Get user orders (protected)
- `GET /api/v1/orders/:id` - Get order by ID (protected)
- `POST /api/v1/orders` - Create new order (protected)
- `PUT /api/v1/orders/:id` - Update order status (admin only)

## 🗄️ Database Schema

### Users
- id, email, password, name, phone, role, is_verified, created_at, updated_at

### Products
- id, name (multi-lang), description (multi-lang), price, original_price, stock, category_id, image, images, unit, weight, is_featured, is_active, rating, review_count, created_at, updated_at

### Categories
- id, name (multi-lang), icon, description, parent_id, is_active, created_at, updated_at

### Orders
- id, order_number, user_id, address_id, status, payment_method, payment_status, subtotal, shipping_fee, tax, discount, total, notes, tracking_number, created_at, updated_at

### Order Items
- id, order_id, product_id, product_name, product_image, quantity, price, subtotal, created_at

### Reviews
- id, product_id, user_id, order_id, rating, comment, is_verified, is_approved, created_at, updated_at

### Addresses
- id, user_id, recipient_name, phone, province, city, district, street, postal_code, is_default, created_at, updated_at

### Wishlist
- id, user_id, product_id, created_at

### Cart
- id, user_id, product_id, quantity, created_at, updated_at

## 🔄 Migration to Supabase

The codebase is designed for easy migration to Supabase:

1. Update environment variables with Supabase credentials
2. Implement Supabase client in `db/connection.ts`
3. Update models to use Supabase queries
4. No changes needed in controllers or routes

## 🔒 Security Features

- **Helmet**: Sets security HTTP headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **JWT**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password security
- **Input Validation**: Validates all user inputs
- **SQL Injection Protection**: Prepared statements

## 📦 Dependencies

- @types/* - Type definitions

## 🤝 Contributing

1. Follow TypeScript best practices
2. Maintain clean code architecture
3. Add proper error handling
4. Write meaningful commit messages
5. Test all endpoints before committing

## 📄 License

ISC

## 👨‍💻 Author

Afghan Grocery Team
