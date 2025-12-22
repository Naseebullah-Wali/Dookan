# Quick Start Guide for Docker Hosting Platforms

This guide provides step-by-step instructions for deploying Dookan on popular Docker hosting platforms.

## 🚀 Railway.app (Easiest)

Railway is one of the easiest platforms for Docker deployment with automatic deployment from GitHub.

### Steps:

1. **Sign up** at [railway.app](https://railway.app)
2. **Create New Project** → Select "Deploy from GitHub repo"
3. **Connect GitHub** and select your Dookan repository
4. Railway will auto-detect `docker-compose.yml`
5. **Add Environment Variables**:
   - Click on each service
   - Go to "Variables" tab
   - Add required variables:
     - `JWT_SECRET`
     - `JWT_REFRESH_SECRET`
     - `CORS_ORIGIN` (use Railway-provided domain)
6. **Deploy** - Railway will automatically build and deploy
7. **Get Domain** - Railway provides a free `.railway.app` domain

**Note**: Railway offers $5/month free credit.

---

## 🎨 Render.com

Render provides free tier for Docker applications with automatic deployments.

### Steps:

1. **Sign up** at [render.com](https://render.com)
2. **Create New Web Service**:
   - Connect your GitHub repository
   - Choose "Docker" as the environment
3. **Configure Backend Service**:
   - Name: `dookan-backend`
   - Docker Context: `backend-afghan-grocery`
   - Docker Command: (leave default)
   - Port: `3000`
4. **Configure Frontend Service**:
   - Name: `dookan-frontend`
   - Docker Context: `afghan-grocery-vue`
   - Port: `80`
5. **Add Environment Variables** in each service
6. **Deploy** - Render will build and deploy automatically

**Free Tier**: Render offers a free tier with some limitations.

---

## 🌊 DigitalOcean App Platform

DigitalOcean App Platform supports Docker with great performance and pricing.

### Steps:

1. **Sign up** at [digitalocean.com](https://www.digitalocean.com)
2. **Create App** → Select "GitHub"
3. **Connect Repository**
4. **Configure Components**:
   - DigitalOcean will detect Dockerfiles
   - Configure each service separately
5. **Set Environment Variables**:
   - Go to each component's settings
   - Add environment variables
6. **Choose Plan** ($5/month basic)
7. **Launch App**

**Cost**: Starting at $5/month per service.

---

## ✈️ Fly.io

Fly.io is great for Docker deployments with free tier and global edge network.

### Steps:

1. **Install flyctl**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**:
   ```bash
   flyctl auth login
   ```

3. **Launch Backend**:
   ```bash
   cd backend-afghan-grocery
   flyctl launch
   # Follow prompts, select region
   # Fly.io will detect Dockerfile
   ```

4. **Set Secrets** (for backend):
   ```bash
   flyctl secrets set JWT_SECRET="your-secret-here"
   flyctl secrets set JWT_REFRESH_SECRET="your-refresh-secret"
   flyctl secrets set CORS_ORIGIN="https://your-frontend-url"
   ```

5. **Launch Frontend**:
   ```bash
   cd ../afghan-grocery-vue
   flyctl launch
   ```

6. **Deploy**:
   ```bash
   flyctl deploy
   ```

**Free Tier**: Fly.io offers generous free tier (3GB storage, 160GB bandwidth).

---

## ☁️ AWS (Amazon Web Services)

Deploy using AWS Elastic Container Service (ECS) or AWS App Runner.

### Option A: AWS App Runner (Easier)

1. **Push Images to ECR** (Elastic Container Registry):
   ```bash
   # Login to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com
   
   # Build and tag
   docker build -t dookan-backend ./backend-afghan-grocery
   docker tag dookan-backend:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/dookan-backend:latest
   
   # Push
   docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/dookan-backend:latest
   ```

2. **Create App Runner Service**:
   - Go to AWS App Runner console
   - Create service from ECR image
   - Configure environment variables
   - Deploy

### Option B: AWS ECS with Fargate

1. Create Task Definitions for backend and frontend
2. Create ECS Cluster
3. Create Services
4. Configure Load Balancer
5. Set Environment Variables

**Cost**: Pay-as-you-go, starting around $10-20/month.

---

## 🔷 Azure (Microsoft Azure)

Deploy using Azure Container Instances or Azure Container Apps.

### Steps:

1. **Login to Azure CLI**:
   ```bash
   az login
   ```

2. **Create Resource Group**:
   ```bash
   az group create --name dookan-rg --location eastus
   ```

3. **Create Container Registry**:
   ```bash
   az acr create --resource-group dookan-rg --name dookanacr --sku Basic
   ```

4. **Build and Push Images**:
   ```bash
   az acr build --registry dookanacr --image dookan-backend:latest ./backend-afghan-grocery
   az acr build --registry dookanacr --image dookan-frontend:latest ./afghan-grocery-vue
   ```

5. **Deploy Container Instances**:
   ```bash
   az container create \
     --resource-group dookan-rg \
     --name dookan-backend \
     --image dookanacr.azurecr.io/dookan-backend:latest \
     --dns-name-label dookan-backend \
     --ports 3000 \
     --environment-variables JWT_SECRET=your-secret
   ```

**Cost**: Starting around $10-15/month.

---

## 🌐 Google Cloud Platform (GCP)

Deploy using Google Cloud Run for serverless container hosting.

### Steps:

1. **Install gcloud CLI** and login:
   ```bash
   gcloud auth login
   ```

2. **Enable APIs**:
   ```bash
   gcloud services enable run.googleapis.com containerregistry.googleapis.com
   ```

3. **Build and Push to Container Registry**:
   ```bash
   # Backend
   gcloud builds submit --tag gcr.io/YOUR_PROJECT/dookan-backend ./backend-afghan-grocery
   
   # Frontend
   gcloud builds submit --tag gcr.io/YOUR_PROJECT/dookan-frontend ./afghan-grocery-vue
   ```

4. **Deploy to Cloud Run**:
   ```bash
   # Backend
   gcloud run deploy dookan-backend \
     --image gcr.io/YOUR_PROJECT/dookan-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars JWT_SECRET=your-secret
   
   # Frontend
   gcloud run deploy dookan-frontend \
     --image gcr.io/YOUR_PROJECT/dookan-frontend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

**Free Tier**: GCP offers free tier with 2 million requests/month.

---

## 🟣 Heroku

Heroku supports Docker through Container Registry.

### Steps:

1. **Install Heroku CLI** and login:
   ```bash
   heroku login
   ```

2. **Create Apps**:
   ```bash
   heroku create dookan-backend
   heroku create dookan-frontend
   ```

3. **Login to Container Registry**:
   ```bash
   heroku container:login
   ```

4. **Build and Push Backend**:
   ```bash
   cd backend-afghan-grocery
   heroku container:push web -a dookan-backend
   heroku container:release web -a dookan-backend
   ```

5. **Set Environment Variables**:
   ```bash
   heroku config:set JWT_SECRET=your-secret -a dookan-backend
   heroku config:set JWT_REFRESH_SECRET=your-refresh-secret -a dookan-backend
   ```

6. **Repeat for Frontend**:
   ```bash
   cd ../afghan-grocery-vue
   heroku container:push web -a dookan-frontend
   heroku container:release web -a dookan-frontend
   ```

**Note**: Heroku removed free tier. Starts at $5/month per dyno.

---

## 📊 Comparison Table

| Platform | Free Tier | Ease of Use | Docker Support | Auto Deploy from GitHub |
|----------|-----------|-------------|----------------|-------------------------|
| Railway | $5 credit/mo | ⭐⭐⭐⭐⭐ | ✅ Excellent | ✅ Yes |
| Render | Limited | ⭐⭐⭐⭐⭐ | ✅ Excellent | ✅ Yes |
| Fly.io | Yes | ⭐⭐⭐⭐ | ✅ Excellent | ⚠️ Partial |
| DigitalOcean | No ($5/mo) | ⭐⭐⭐⭐ | ✅ Good | ✅ Yes |
| AWS | Limited | ⭐⭐⭐ | ✅ Excellent | ⚠️ Requires setup |
| GCP | Yes | ⭐⭐⭐ | ✅ Excellent | ⚠️ Requires setup |
| Azure | Limited | ⭐⭐⭐ | ✅ Good | ⚠️ Requires setup |
| Heroku | No ($5/mo) | ⭐⭐⭐⭐⭐ | ✅ Good | ✅ Yes |

---

## 💡 Recommendations

### For Beginners:
1. **Railway** - Easiest to get started, auto-deploys from GitHub
2. **Render** - Great free tier, simple interface

### For Production:
1. **DigitalOcean** - Good balance of price and performance
2. **Fly.io** - Great for global distribution
3. **AWS/GCP** - Best for scalability and enterprise

### For Cost-Conscious:
1. **Render** - Free tier available
2. **Fly.io** - Generous free tier
3. **Railway** - $5 free credit monthly

---

## 🔒 Security Checklist

Before deploying to production:

- ✅ Change all default secrets (JWT_SECRET, etc.)
- ✅ Set proper CORS_ORIGIN
- ✅ Use HTTPS (most platforms provide this automatically)
- ✅ Enable rate limiting
- ✅ Regular backups of database
- ✅ Monitor application logs
- ✅ Keep dependencies updated
- ✅ Set up domain with SSL certificate

---

## 📞 Need Help?

If you encounter issues:

1. Check the platform's documentation
2. Review logs: `docker compose logs` or platform-specific logs
3. Verify environment variables are set correctly
4. Ensure CORS settings include your frontend domain
5. Contact support:
   - Email: info@dookan.af
   - Phone: +49 152 17735657

---

## 📚 Additional Resources

- [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) - Detailed Docker guide
- [README.md](README.md) - Project overview
- Platform-specific docs for troubleshooting
