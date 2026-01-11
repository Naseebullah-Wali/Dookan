#!/bin/bash

# ============================================
# DNS and SSL Verification Script for Dookan
# ============================================
# This script verifies DNS configuration and sets up SSL properly
# Run after DNS has been configured: sudo bash dns-ssl-setup.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Dookan DNS and SSL Setup${NC}"
echo "===================================="

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}" 
   exit 1
fi

DOMAIN="zmadookan.com"
WWW_DOMAIN="www.zmadookan.com"

# ============================================
# 1. Verify DNS Configuration
# ============================================
echo -e "${YELLOW}[1/5] Checking DNS configuration...${NC}"

SERVER_IP=$(curl -s ifconfig.me)
echo "Server IP: $SERVER_IP"

# Check main domain
DOMAIN_IP=$(nslookup $DOMAIN | grep -A1 "Non-authoritative answer:" | grep "Address:" | awk '{print $2}' | head -1)
echo "Domain $DOMAIN resolves to: $DOMAIN_IP"

# Check www domain  
WWW_IP=$(nslookup $WWW_DOMAIN | grep -A1 "Non-authoritative answer:" | grep "Address:" | awk '{print $2}' | head -1)
echo "Domain $WWW_DOMAIN resolves to: $WWW_IP"

if [[ "$DOMAIN_IP" != "$SERVER_IP" ]] || [[ "$WWW_IP" != "$SERVER_IP" ]]; then
    echo -e "${RED}❌ DNS Error: Domains not pointing to this server!${NC}"
    echo -e "${YELLOW}Expected IP: $SERVER_IP${NC}"
    echo -e "${YELLOW}Domain IP: $DOMAIN_IP${NC}"
    echo -e "${YELLOW}WWW IP: $WWW_IP${NC}"
    echo ""
    echo "Fix DNS settings in your domain registrar:"
    echo "1. Set A record for @ to $SERVER_IP"
    echo "2. Set A record for www to $SERVER_IP" 
    echo "3. Wait 24-48 hours for DNS propagation"
    exit 1
else
    echo -e "${GREEN}✓ DNS correctly configured${NC}"
fi

# ============================================
# 2. Stop nginx for standalone SSL
# ============================================
echo -e "${YELLOW}[2/5] Stopping nginx for SSL certificate...${NC}"
systemctl stop nginx

# ============================================
# 3. Remove existing SSL certificate if any
# ============================================
echo -e "${YELLOW}[3/5] Cleaning existing certificates...${NC}"
if certbot certificates | grep -q "zmadookan.com"; then
    echo "Removing existing certificate..."
    certbot delete --cert-name zmadookan.com --non-interactive
fi

# ============================================
# 4. Request new SSL certificate
# ============================================
echo -e "${YELLOW}[4/5] Requesting SSL certificate for both domains...${NC}"
certbot certonly --standalone \
    -d $DOMAIN \
    -d $WWW_DOMAIN \
    --non-interactive \
    --agree-tos \
    --email admin@$DOMAIN \
    --no-eff-email

# Verify certificate
echo -e "${YELLOW}Verifying certificate...${NC}"
certbot certificates

# ============================================
# 5. Setup nginx and restart
# ============================================
echo -e "${YELLOW}[5/5] Configuring and starting nginx...${NC}"

# Copy nginx configuration
cp /root/dookan/hostinger-deployment/nginx.conf /etc/nginx/sites-available/zmadookan.com

# Create symlink
ln -sf /etc/nginx/sites-available/zmadookan.com /etc/nginx/sites-enabled/

# Remove default nginx site
rm -f /etc/nginx/sites-enabled/default

# Add rate limiting to main nginx config
if ! grep -q "limit_req_zone" /etc/nginx/nginx.conf; then
    cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup
    cat > /tmp/rate_limit.conf << 'EOF'
    # Rate limiting for Dookan
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;
EOF
    # Insert rate limiting before the first server block
    sed '/http {/r /tmp/rate_limit.conf' /etc/nginx/nginx.conf > /tmp/nginx.conf
    mv /tmp/nginx.conf /etc/nginx/nginx.conf
    rm /tmp/rate_limit.conf
fi

# Test nginx configuration
if nginx -t; then
    echo -e "${GREEN}✓ Nginx configuration valid${NC}"
    systemctl start nginx
    systemctl enable nginx
else
    echo -e "${RED}❌ Nginx configuration error${NC}"
    systemctl start nginx  # Start with backup config
    exit 1
fi

# ============================================
# 6. Setup SSL auto-renewal
# ============================================
echo -e "${YELLOW}Setting up SSL auto-renewal...${NC}"
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx") | crontab -

# ============================================
# Verification and Summary
# ============================================
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✓ DNS and SSL Setup Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Certificate Information:"
certbot certificates

echo ""
echo "Testing HTTPS connectivity:"
echo "Main domain: curl -I https://$DOMAIN"
echo "WWW domain: curl -I https://$WWW_DOMAIN"

echo ""
echo -e "${GREEN}Your site should now be accessible securely at:${NC}"
echo -e "${GREEN}• https://$DOMAIN${NC}"
echo -e "${GREEN}• https://$WWW_DOMAIN${NC}"

echo ""
echo "SSL certificate will auto-renew. Check renewal with:"
echo "sudo certbot renew --dry-run"