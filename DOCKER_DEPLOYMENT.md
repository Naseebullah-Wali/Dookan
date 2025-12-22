# Docker Deployment Guide for Dookan

This guide explains how to deploy the Dookan e-commerce application using Docker. The application consists of two main services:

- **Backend**: Node.js/Express API (Port 3000)
- **Frontend**: Vue.js application served via Nginx (Port 80)

## Prerequisites

- Docker installed on your system ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed ([Get Docker Compose](https://docs.docker.com/compose/install/))
- Git (to clone the repository)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Naseebullah-Wali/Dookan.git
cd Dookan
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.docker.example .env
```

Edit the `.env` file and update the values, especially:
- `JWT_SECRET` - Change to a secure random string
- `JWT_REFRESH_SECRET` - Change to a different secure random string
- Add PayPal credentials if using payment features
- Add Supabase credentials if using that service

### 3. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 4. Access the Application

- **Frontend**: Open your browser and navigate to `http://localhost`
- **Backend API**: Available at `http://localhost:3000`
- **API Health Check**: `http://localhost:3000/`

### 5. Stop the Application

```bash
# Stop services
docker-compose down

# Stop and remove volumes (WARNING: This deletes all data!)
docker-compose down -v
```

## Production Deployment

### Environment Configuration

For production deployment, make sure to:

1. **Update JWT Secrets**: Use strong, random secrets
   ```bash
   # Generate secure secrets
   openssl rand -base64 32
   ```

2. **Configure CORS**: Update the `CORS_ORIGIN` in `docker-compose.yml` to include your production domain
   ```yaml
   - CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
   ```

3. **Update Frontend API URL**: In `docker-compose.yml`, update the frontend build args:
   ```yaml
   - VITE_API_BASE_URL=https://api.yourdomain.com
   ```

4. **Enable HTTPS**: Use a reverse proxy like Nginx or Traefik with Let's Encrypt for SSL certificates

### Deploying to Cloud Platforms

#### Option 1: Docker Hub / Container Registry

1. **Build and Push Images**:
   ```bash
   # Tag images
   docker tag dookan-backend:latest yourusername/dookan-backend:latest
   docker tag dookan-frontend:latest yourusername/dookan-frontend:latest
   
   # Push to Docker Hub
   docker push yourusername/dookan-backend:latest
   docker push yourusername/dookan-frontend:latest
   ```

2. **Deploy on any cloud platform that supports Docker** (AWS ECS, Google Cloud Run, Azure Container Instances, DigitalOcean, Railway, Render, Fly.io, etc.)

#### Option 2: Direct Docker Compose Deployment

Many platforms support docker-compose.yml files directly:

- **Railway**: Connect your GitHub repo and Railway will auto-detect docker-compose.yml
- **Render**: Supports Docker deployments with docker-compose
- **DigitalOcean App Platform**: Supports Docker containers
- **Fly.io**: Convert docker-compose to fly.toml with `flyctl launch`
- **Heroku**: Supports Docker deployments via Container Registry

## Platform-Specific Instructions

For detailed step-by-step instructions for your specific hosting platform, see:

📖 **[HOSTING_PLATFORMS.md](HOSTING_PLATFORMS.md)** - Complete guides for:
- Railway.app
- Render.com
- DigitalOcean
- Fly.io
- AWS
- Google Cloud Platform
- Azure
- Heroku

Each guide includes specific commands, configuration examples, and platform-specific tips.

## Data Persistence

The Docker setup uses named volumes for data persistence:

- `backend-db`: SQLite database storage
- `backend-uploads`: User uploaded files (product images, etc.)

These volumes persist even when containers are stopped. To backup data:

```bash
# Backup database
docker cp dookan-backend:/app/db/database.sqlite ./backup-database.sqlite

# Backup uploads
docker cp dookan-backend:/app/uploads ./backup-uploads
```

## Customization

### Changing Ports

Edit `docker-compose.yml`:

```yaml
# Change frontend port from 80 to 8080
frontend:
  ports:
    - "8080:80"

# Change backend port from 3000 to 8000
backend:
  ports:
    - "8000:3000"
  environment:
    - PORT=3000  # Internal container port stays 3000
```

### Scaling Services

```bash
# Run multiple backend instances
docker-compose up -d --scale backend=3

# Note: You'll need a load balancer for multiple backend instances
```

### Using External Database

To use PostgreSQL or MySQL instead of SQLite, update the backend code and docker-compose.yml to add a database service.

## Troubleshooting

Having issues? Check our comprehensive troubleshooting guide:

📖 **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Solutions for:
- Container startup issues
- Frontend/Backend connection problems
- Database issues
- Build failures
- File upload problems
- Memory issues
- SSL/HTTPS configuration
- Environment variables
- Networking issues
- Data persistence

### Quick Debugging Commands

### Container Won't Start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check container status
docker-compose ps
```

### Database Connection Issues

```bash
# Verify database volume exists
docker volume ls

# Inspect backend container
docker exec -it dookan-backend sh
ls -la /app/db/
```

### Frontend Can't Connect to Backend

1. Check CORS settings in docker-compose.yml
2. Verify backend is running: `curl http://localhost:3000`
3. Check frontend environment variables
4. Verify network connectivity: `docker network inspect dookan-network`

### Port Already in Use

```bash
# Find what's using the port
sudo lsof -i :80
sudo lsof -i :3000

# Kill the process or change ports in docker-compose.yml
```

## Development vs Production

### Development Mode

For local development without Docker:

```bash
# Backend
cd backend-afghan-grocery
npm install
npm run dev

# Frontend (in another terminal)
cd afghan-grocery-vue
npm install
npm run dev
```

### Production Mode

Use Docker as described in this guide. The Dockerfiles use multi-stage builds to optimize image size and security.

## Security Notes

1. **Never commit .env files** - They contain sensitive information
2. **Change default JWT secrets** - Use strong, random values in production
3. **Enable HTTPS** - Always use SSL/TLS in production
4. **Regular updates** - Keep Docker images and dependencies updated
5. **Firewall rules** - Only expose necessary ports
6. **Database backups** - Regularly backup your data volumes

## Support

For issues or questions:
- Email: info@dookan.af
- Phone: +49 152 17735657
- WhatsApp: +49 152 17735657

## License

This project is part of the Dookan e-commerce platform.
