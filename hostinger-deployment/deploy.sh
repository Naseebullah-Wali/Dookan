#!/bin/bash

# ============================================
# Dookan Deployment Script
# ============================================
# Deploys the latest code and restarts services
# Usage: bash deploy.sh

set -e

echo "🚀 Starting Dookan Deployment..."
echo "=================================="

REPO_PATH="/root/dookan"
BACKEND_PATH="$REPO_PATH/backend-afghan-grocery"
FRONTEND_PATH="$REPO_PATH/afghan-grocery-vue"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ============================================
# 1. Pull Latest Code
# ============================================
echo -e "${YELLOW}[1/7] Pulling latest code...${NC}"
cd "$REPO_PATH"
git pull origin main || git pull origin master

# ============================================
# 2. Build Backend
# ============================================
echo -e "${YELLOW}[2/7] Building backend...${NC}"
cd "$BACKEND_PATH"
npm install --omit=dev
npm run build

# ============================================
# 3. Build Frontend
# ============================================
echo -e "${YELLOW}[3/7] Building frontend...${NC}"
cd "$FRONTEND_PATH"
npm install --omit=dev
npm run build

# ============================================
# 4. Stop Backend Service
# ============================================
echo -e "${YELLOW}[4/7] Stopping backend service...${NC}"
pm2 stop dookan-backend || true

# ============================================
# 5. Update Environment if Needed
# ============================================
echo -e "${YELLOW}[5/7] Checking environment configuration...${NC}"
if [ ! -f "$BACKEND_PATH/.env" ]; then
    echo -e "${RED}Warning: .env file not found. Please create it from .env.example${NC}"
    exit 1
fi

# ============================================
# 6. Copy Frontend Build to Web Root
# ============================================
echo -e "${YELLOW}[6/7] Copying frontend build...${NC}"
rm -rf /var/www/dookan/*
cp -r "$FRONTEND_PATH/dist"/* /var/www/dookan/
chmod -R 755 /var/www/dookan

# ============================================
# 7. Start Backend Service
# ============================================
echo -e "${YELLOW}[7/7] Starting backend service...${NC}"
cd "$BACKEND_PATH"
pm2 restart dookan-backend
pm2 save

# ============================================
# Verify Deployment
# ============================================
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Check if services are running
echo "Service Status:"
pm2 status

echo ""
echo "Frontend: https://zmadookan.com"
echo "API Health: https://zmadookan.com/api/health"
echo ""
echo "View logs: pm2 logs dookan-backend"
