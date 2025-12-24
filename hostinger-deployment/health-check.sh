#!/bin/bash

# ============================================
# Dookan Health Check Script
# ============================================
# Monitors the health of your Dookan deployment
# Can be run manually or via cron

echo "🏥 Dookan Health Check"
echo "======================"
echo "Timestamp: $(date)"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

FAILED=0

# ============================================
# 1. Check Nginx Status
# ============================================
echo -n "Checking Nginx... "
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    FAILED=$((FAILED + 1))
    systemctl restart nginx
fi

# ============================================
# 2. Check Backend Service (PM2)
# ============================================
echo -n "Checking Backend (PM2)... "
if pm2 status dookan-backend | grep -q "online"; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    FAILED=$((FAILED + 1))
    pm2 restart dookan-backend
fi

# ============================================
# 3. Check Backend Health Endpoint
# ============================================
echo -n "Checking Backend Health Endpoint... "
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo "000")
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ Responding ($HEALTH_RESPONSE)${NC}"
else
    echo -e "${RED}✗ Not responding ($HEALTH_RESPONSE)${NC}"
    FAILED=$((FAILED + 1))
fi

# ============================================
# 4. Check Frontend Availability
# ============================================
echo -n "Checking Frontend... "
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://zmadookan.com/)
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ Responding ($FRONTEND_RESPONSE)${NC}"
else
    echo -e "${RED}✗ Not responding ($FRONTEND_RESPONSE)${NC}"
    FAILED=$((FAILED + 1))
fi

# ============================================
# 5. Check SSL Certificate Expiration
# ============================================
echo -n "Checking SSL Certificate... "
CERT_EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/zmadookan.com/cert.pem 2>/dev/null | cut -d= -f2)
CERT_SECONDS=$(date -d "$CERT_EXPIRY" +%s)
NOW_SECONDS=$(date +%s)
DAYS_UNTIL=$((($CERT_SECONDS - $NOW_SECONDS) / 86400))

if [ "$DAYS_UNTIL" -gt 14 ]; then
    echo -e "${GREEN}✓ Valid ($DAYS_UNTIL days remaining)${NC}"
elif [ "$DAYS_UNTIL" -gt 0 ]; then
    echo -e "${YELLOW}⚠ Expiring soon ($DAYS_UNTIL days remaining)${NC}"
else
    echo -e "${RED}✗ Expired${NC}"
    FAILED=$((FAILED + 1))
fi

# ============================================
# 6. Check Disk Space
# ============================================
echo -n "Checking Disk Space... "
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | cut -d% -f1)
if [ "$DISK_USAGE" -lt 80 ]; then
    echo -e "${GREEN}✓ Good ($DISK_USAGE% used)${NC}"
else
    echo -e "${RED}✗ Warning ($DISK_USAGE% used)${NC}"
    FAILED=$((FAILED + 1))
fi

# ============================================
# 7. Check Memory Usage
# ============================================
echo -n "Checking Memory... "
MEM_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100)}')
if [ "$MEM_USAGE" -lt 80 ]; then
    echo -e "${GREEN}✓ Good ($MEM_USAGE% used)${NC}"
else
    echo -e "${YELLOW}⚠ High ($MEM_USAGE% used)${NC}"
fi

# ============================================
# 8. Check PM2 Logs for Errors
# ============================================
echo -n "Checking Recent Errors... "
ERROR_COUNT=$(pm2 logs dookan-backend --lines 50 2>/dev/null | grep -i "error" | wc -l)
if [ "$ERROR_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓ No recent errors${NC}"
else
    echo -e "${YELLOW}⚠ Found $ERROR_COUNT error(s)${NC}"
fi

# ============================================
# Summary
# ============================================
echo ""
echo "================================"
if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
else
    echo -e "${RED}✗ $FAILED check(s) failed${NC}"
fi
echo "================================"
echo ""

# Optional: Send alert email on failure
if [ "$FAILED" -gt 0 ]; then
    HOSTNAME=$(hostname)
    echo "Alert: Health check failed on $HOSTNAME" | mail -s "Dookan Health Check Alert - $HOSTNAME" support@zmadookan.com || true
fi

exit $FAILED
