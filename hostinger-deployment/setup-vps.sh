#!/bin/bash

# ============================================
# Dookan VPS Setup Script for Hostinger Ubuntu
# ============================================
# This script automates the initial setup of your VPS
# Run as root: sudo bash setup-vps.sh

set -e  # Exit on error

echo "🚀 Starting Dookan VPS Setup..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}" 
   exit 1
fi

# ============================================
# 1. Update System
# ============================================
echo -e "${YELLOW}[1/10] Updating system packages...${NC}"
apt-get update
apt-get upgrade -y
apt-get install -y curl wget git build-essential

# ============================================
# 2. Install Node.js and npm
# ============================================
echo -e "${YELLOW}[2/10] Installing Node.js and npm...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node --version
npm --version

# ============================================
# 3. Install PM2 Globally
# ============================================
echo -e "${YELLOW}[3/10] Installing PM2...${NC}"
npm install -g pm2
pm2 install pm2-logrotate
pm2 startup
pm2 save

# ============================================
# 4. Install Nginx
# ============================================
echo -e "${YELLOW}[4/10] Installing Nginx...${NC}"
apt-get install -y nginx
systemctl enable nginx
systemctl start nginx

# ============================================
# 5. Install Certbot for SSL/TLS
# ============================================
echo -e "${YELLOW}[5/10] Installing Certbot (Let's Encrypt)...${NC}"
apt-get install -y certbot python3-certbot-nginx

# ============================================
# 6. Install Docker (optional, for future use)
# ============================================
echo -e "${YELLOW}[6/10] Installing Docker...${NC}"
curl -fsSL https://get.docker.com -o get-docker.sh
bash get-docker.sh
usermod -aG docker root
rm get-docker.sh

# ============================================
# 7. Install Docker Compose
# ============================================
echo -e "${YELLOW}[7/10] Installing Docker Compose...${NC}"
curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# ============================================
# 8. Create Application Directory Structure
# ============================================
echo -e "${YELLOW}[8/10] Creating application directories...${NC}"
mkdir -p /root/dookan
mkdir -p /var/www/dookan
mkdir -p /var/log/pm2
mkdir -p /var/www/certbot
chmod 755 /var/www/certbot

# ============================================
# 9. Configure Firewall
# ============================================
echo -e "${YELLOW}[9/10] Configuring UFW firewall...${NC}"
apt-get install -y ufw
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw allow 3000/tcp    # Backend (internal)

echo -e "${GREEN}✓ Firewall configured${NC}"

# ============================================
# 10. Create Swap (for systems with low RAM)
# ============================================
echo -e "${YELLOW}[10/10] Setting up 2GB swap space...${NC}"
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
    echo -e "${GREEN}✓ Swap created${NC}"
else
    echo -e "${YELLOW}Swap file already exists${NC}"
fi

# ============================================
# Summary
# ============================================
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ VPS Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next Steps:"
echo "1. Clone your repository: git clone https://github.com/yourusername/dookan.git /root/dookan"
echo "2. Configure SSL: sudo certbot certonly --standalone -d zmadookan.com -d www.zmadookan.com"
echo "3. Copy Nginx config: sudo cp hostinger-deployment/nginx.conf /etc/nginx/sites-available/zmadookan.com"
echo "4. Enable Nginx site: sudo ln -s /etc/nginx/sites-available/zmadookan.com /etc/nginx/sites-enabled/"
echo "5. Test Nginx: sudo nginx -t"
echo "6. Reload Nginx: sudo systemctl reload nginx"
echo "7. Set up backend environment: cd /root/dookan/backend-afghan-grocery && cp .env.example .env"
echo "8. Build and start: npm install && npm run build && pm2 start pm2-ecosystem.config.js"
echo ""
echo "System Information:"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "PM2: $(pm2 --version)"
echo "Docker: $(docker --version)"
echo "Nginx: $(nginx -v 2>&1)"
echo ""
