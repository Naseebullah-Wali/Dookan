# Dookan - Afghan Grocery E-Commerce Platform

A full-stack e-commerce platform for Afghan groceries with multi-language support (English, Pashto, Dari/Farsi, German, French).

## 🚀 Quick Start

### Option 1: Docker Deployment (Recommended)

The easiest way to deploy both frontend and backend together:

```bash
# Clone the repository
git clone https://github.com/Naseebullah-Wali/Dookan.git
cd Dookan

# Copy and configure environment
cp .env.docker.example .env
# Edit .env with your configuration

# Deploy with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:3000
```

📖 **[Read the complete Docker Deployment Guide](DOCKER_DEPLOYMENT.md)** for detailed instructions, production deployment, and cloud hosting options.

### Option 2: Manual Development Setup

#### Backend Setup

```bash
cd backend-afghan-grocery
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

#### Frontend Setup

```bash
cd afghan-grocery-vue
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## 📦 Project Structure

```
Dookan/
├── backend-afghan-grocery/     # Node.js/Express/TypeScript backend
├── afghan-grocery-vue/         # Vue.js frontend
├── docker-compose.yml          # Docker compose for local development
├── docker-compose.prod.yml     # Docker compose for production
├── deploy.sh                   # Deployment helper script
├── DOCKER_DEPLOYMENT.md        # Detailed deployment guide
└── README.md                   # This file
```

## 🌟 Features

### Backend
- **Node.js/Express/TypeScript** - Professional API architecture
- **SQLite Database** - Easy to deploy and migrate
- **JWT Authentication** - Secure token-based auth
- **Role-based Access Control** - Admin and customer roles
- **Multi-language Support** - 5 languages for products/categories
- **Payment Integration** - PayPal support
- **File Upload** - Product images and media
- **RESTful API** - Clean and documented endpoints

### Frontend
- **Vue.js 3** - Modern reactive framework
- **Vite** - Lightning fast build tool
- **Bootstrap 5** - Responsive UI components
- **Multi-language UI** - i18n support for 5 languages
- **Payment Integration** - PayPal checkout
- **Responsive Design** - Mobile-first approach
- **Shopping Cart** - Full cart functionality
- **User Dashboard** - Order history and profile management

## 🐳 Docker Support

This project is fully containerized and ready for deployment on any platform that supports Docker:

- ✅ **Railway**
- ✅ **Render**
- ✅ **DigitalOcean**
- ✅ **Fly.io**
- ✅ **AWS ECS/Fargate**
- ✅ **Google Cloud Run**
- ✅ **Azure Container Instances**
- ✅ **Heroku**
- ✅ And any other Docker-compatible hosting platform

See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) for platform-specific deployment instructions.

## 🔧 Configuration

### Environment Variables

#### Backend
- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret for JWT tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `CORS_ORIGIN` - Allowed origins for CORS
- `DB_PATH` - SQLite database path
- `PAYPAL_CLIENT_ID` - PayPal client ID (optional)
- `PAYPAL_CLIENT_SECRET` - PayPal secret (optional)

#### Frontend
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_SUPPORT_EMAIL` - Support email
- `VITE_SUPPORT_PHONE` - Support phone number
- `VITE_WHATSAPP_NUMBER` - WhatsApp number

## 📡 API Documentation

The backend API is RESTful and includes endpoints for:

- **Authentication** - Register, login, profile management
- **Products** - CRUD operations with multi-language support
- **Categories** - Product categorization
- **Orders** - Order creation and management
- **Cart & Wishlist** - Shopping cart and wishlist functionality
- **Reviews** - Product reviews and ratings
- **Payments** - PayPal integration
- **Addresses** - Shipping address management
- **Testimonials** - Customer testimonials
- **News** - News and announcements

## 🔒 Security

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- JWT authentication
- Password hashing with bcrypt
- Input validation
- SQL injection protection
- XSS protection

## 📱 Multi-language Support

Supported languages:
- 🇬🇧 English (en)
- 🇦🇫 Pashto (ps)
- 🇦🇫 Dari/Farsi (fa)
- 🇩🇪 German (de)
- 🇫🇷 French (fr)

## 🚀 Deployment

### Quick Deployment with Docker

```bash
# Clone and configure
git clone https://github.com/Naseebullah-Wali/Dookan.git
cd Dookan
cp .env.docker.example .env

# Edit .env with your configuration
nano .env

# Deploy
./deploy.sh
```

### Cloud Platform Deployment

1. **Railway**: Push to GitHub and connect repository
2. **Render**: Connect GitHub and select Docker environment
3. **DigitalOcean**: Use App Platform with Docker
4. **Fly.io**: Run `flyctl launch` in project directory

See [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) for detailed instructions.

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker and Docker Compose (for containerized deployment)

### Running Tests

```bash
# Backend tests
cd backend-afghan-grocery
npm test

# Frontend tests
cd afghan-grocery-vue
npm test
```

## 📞 Support

- **Email**: info@dookan.af
- **Phone**: +49 152 17735657
- **WhatsApp**: +49 152 17735657

## 📄 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📚 Additional Documentation

- [Docker Deployment Guide](DOCKER_DEPLOYMENT.md) - Complete Docker deployment instructions
- [Backend README](backend-afghan-grocery/README.md) - Backend-specific documentation
- [Database Migration Guide](DATABASE_MIGRATION.md) - Database migration information
- [Project Summary](PROJECT_SUMMARY.md) - Detailed project overview

---

Made with ❤️ for the Afghan community
