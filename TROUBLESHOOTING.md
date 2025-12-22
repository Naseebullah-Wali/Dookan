# Docker Deployment Troubleshooting Guide

This guide helps you resolve common issues when deploying Dookan with Docker.

## 🔍 Common Issues and Solutions

### 1. Container Won't Start

**Symptoms:**
- Container exits immediately after starting
- `docker compose ps` shows container as "Exited"

**Solutions:**

```bash
# Check logs for error messages
docker compose logs backend
docker compose logs frontend

# Common issues:
# - Missing environment variables
# - Port already in use
# - Build errors
```

**Fix for missing environment variables:**
```bash
# Ensure .env file exists
cp .env.docker.example .env

# Edit .env and add required values
nano .env
```

**Fix for port conflicts:**
```bash
# Check what's using the port
sudo lsof -i :3000  # Backend
sudo lsof -i :80    # Frontend

# Either kill the process or change ports in docker-compose.yml
```

---

### 2. Frontend Can't Connect to Backend

**Symptoms:**
- Frontend loads but API calls fail
- Network errors in browser console
- CORS errors

**Solutions:**

1. **Check CORS Configuration**:
   
   In `docker-compose.yml`, ensure CORS_ORIGIN includes your frontend URL:
   ```yaml
   environment:
     - CORS_ORIGIN=http://localhost:80,http://localhost:5173,http://frontend
   ```

2. **Verify Backend is Running**:
   ```bash
   # Test backend health
   curl http://localhost:3000/
   
   # Should return: {"message":"Welcome to Afghan Grocery API",...}
   ```

3. **Check Frontend Environment**:
   
   In `docker-compose.yml`, verify:
   ```yaml
   args:
     - VITE_API_BASE_URL=http://localhost:3000
   ```

4. **Rebuild Frontend** (if you changed VITE variables):
   ```bash
   docker compose down
   docker compose up -d --build frontend
   ```

---

### 3. Database Issues

**Symptoms:**
- "Database locked" errors
- "Unable to open database" errors
- Data not persisting

**Solutions:**

1. **Check Database Volume**:
   ```bash
   # List volumes
   docker volume ls | grep backend-db
   
   # Inspect volume
   docker volume inspect dookan_backend-db
   ```

2. **Verify Database File Permissions**:
   ```bash
   # Access backend container
   docker exec -it dookan-backend sh
   
   # Check database directory
   ls -la /app/db/
   
   # Should see database.sqlite file
   ```

3. **Reset Database** (WARNING: Deletes all data):
   ```bash
   docker compose down -v
   docker compose up -d
   ```

---

### 4. Build Fails

**Symptoms:**
- `docker compose up` fails during build
- "npm install" errors
- TypeScript compilation errors

**Solutions:**

1. **Clear Docker Cache**:
   ```bash
   # Remove old images
   docker compose down
   docker system prune -a
   
   # Rebuild from scratch
   docker compose up -d --build
   ```

2. **Check Node Version**:
   
   Dockerfiles use `node:18-alpine`. If there are compatibility issues:
   ```dockerfile
   # In Dockerfile, change:
   FROM node:18-alpine
   # To:
   FROM node:20-alpine
   ```

3. **npm Install Fails**:
   ```bash
   # Try building individually
   cd backend-afghan-grocery
   docker build -t test-backend .
   
   # Check logs for specific error
   ```

---

### 5. File Upload Issues

**Symptoms:**
- Cannot upload product images
- "Permission denied" errors
- Uploads not persisting

**Solutions:**

1. **Check Uploads Volume**:
   ```bash
   docker volume ls | grep uploads
   docker volume inspect dookan_backend-uploads
   ```

2. **Verify Directory Permissions**:
   ```bash
   docker exec -it dookan-backend sh
   ls -la /app/uploads
   
   # Should be writable by the app
   ```

3. **Test File Upload**:
   ```bash
   # Use API to test upload
   curl -X POST http://localhost:3000/api/v1/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@test-image.jpg"
   ```

---

### 6. Memory Issues

**Symptoms:**
- Container gets killed unexpectedly
- "Out of memory" errors
- Slow performance

**Solutions:**

1. **Increase Docker Memory**:
   ```bash
   # Check Docker resources
   docker stats
   
   # In Docker Desktop: Settings → Resources → Memory
   # Increase to at least 4GB
   ```

2. **Add Memory Limits to docker-compose.yml**:
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             memory: 512M
           reservations:
             memory: 256M
   ```

---

### 7. SSL/HTTPS Issues

**Symptoms:**
- "Not secure" warning in browser
- Cannot access via HTTPS
- Mixed content errors

**Solutions:**

1. **For Production**: Use a reverse proxy with SSL:
   
   Option A: Use platform's built-in SSL (Railway, Render, etc.)
   
   Option B: Add Nginx reverse proxy with Let's Encrypt:
   ```yaml
   # Add to docker-compose.yml
   nginx:
     image: nginx:alpine
     ports:
       - "443:443"
     volumes:
       - ./nginx-ssl.conf:/etc/nginx/nginx.conf
       - /etc/letsencrypt:/etc/letsencrypt
   ```

2. **Update CORS for HTTPS**:
   ```yaml
   environment:
     - CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
   ```

---

### 8. Environment Variables Not Working

**Symptoms:**
- App uses default values instead of your .env values
- "Variable not set" warnings

**Solutions:**

1. **Check .env File Location**:
   ```bash
   # Must be in project root
   ls -la .env
   
   # Should show .env file
   ```

2. **Verify docker-compose.yml Reads .env**:
   ```bash
   # Test configuration
   docker compose config
   
   # Should show your actual values, not defaults
   ```

3. **Explicitly Set Variables**:
   ```yaml
   # In docker-compose.yml
   environment:
     - JWT_SECRET=${JWT_SECRET:-default-value}
   ```

4. **For Production (.env.prod)**:
   ```bash
   # Specify env file
   docker compose --env-file .env.prod up -d
   ```

---

### 9. Networking Issues Between Containers

**Symptoms:**
- Containers can't communicate
- "Connection refused" errors

**Solutions:**

1. **Verify Network**:
   ```bash
   docker network ls
   docker network inspect dookan-network
   ```

2. **Use Service Names**:
   ```yaml
   # Frontend should reference backend as:
   - VITE_API_BASE_URL=http://backend:3000
   
   # Not localhost or 127.0.0.1
   ```

3. **Check depends_on**:
   ```yaml
   frontend:
     depends_on:
       - backend
   ```

---

### 10. Data Not Persisting

**Symptoms:**
- Database resets after restart
- Uploaded files disappear

**Solutions:**

1. **Check Volume Mounts**:
   ```yaml
   volumes:
     - backend-db:/app/db
     - backend-uploads:/app/uploads
   
   volumes:
     backend-db:
       driver: local
     backend-uploads:
       driver: local
   ```

2. **Backup Data**:
   ```bash
   # Backup database
   docker cp dookan-backend:/app/db/database.sqlite ./backup.sqlite
   
   # Backup uploads
   docker cp dookan-backend:/app/uploads ./backup-uploads
   ```

3. **Restore Data**:
   ```bash
   # Restore database
   docker cp ./backup.sqlite dookan-backend:/app/db/database.sqlite
   
   # Restart to apply
   docker compose restart backend
   ```

---

## 🔧 Debugging Commands

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend

# Last 100 lines
docker compose logs --tail=100 backend
```

### Container Status
```bash
# List running containers
docker compose ps

# Detailed container info
docker inspect dookan-backend
```

### Execute Commands in Container
```bash
# Access backend shell
docker exec -it dookan-backend sh

# Run commands
docker exec dookan-backend ls -la /app
docker exec dookan-backend cat /app/db/database.sqlite
```

### Resource Usage
```bash
# Monitor resource usage
docker stats

# Check disk usage
docker system df
```

### Clean Up
```bash
# Remove stopped containers
docker compose down

# Remove volumes (WARNING: Deletes data!)
docker compose down -v

# Remove all unused Docker resources
docker system prune -a
```

---

## 📊 Health Checks

### Backend Health Check
```bash
# Should return 200 OK
curl -I http://localhost:3000/

# Test API endpoint
curl http://localhost:3000/api/v1/products
```

### Frontend Health Check
```bash
# Should return 200 OK
curl -I http://localhost/

# Check if HTML is served
curl http://localhost/
```

### Database Health Check
```bash
# Access database
docker exec -it dookan-backend sh
cd /app/db
ls -lh database.sqlite

# Check if file exists and has size > 0
```

---

## 🆘 Emergency Recovery

### If Everything Breaks

1. **Stop and Remove Everything**:
   ```bash
   docker compose down
   docker system prune -a -f
   ```

2. **Backup Data First** (if possible):
   ```bash
   docker cp dookan-backend:/app/db ./backup-db
   docker cp dookan-backend:/app/uploads ./backup-uploads
   ```

3. **Start Fresh**:
   ```bash
   # Remove volumes
   docker compose down -v
   
   # Rebuild and start
   docker compose up -d --build
   ```

4. **Restore Data**:
   ```bash
   docker cp ./backup-db/database.sqlite dookan-backend:/app/db/
   docker cp ./backup-uploads dookan-backend:/app/
   docker compose restart backend
   ```

---

## 📞 Getting Help

If you're still stuck:

1. **Check Logs**: Always start with `docker compose logs`
2. **Search Issues**: GitHub repository issues
3. **Platform Docs**: Check your hosting platform's documentation
4. **Contact Support**:
   - Email: info@dookan.af
   - Phone: +49 152 17735657
   - WhatsApp: +49 152 17735657

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) - Main deployment guide
- [HOSTING_PLATFORMS.md](HOSTING_PLATFORMS.md) - Platform-specific guides
