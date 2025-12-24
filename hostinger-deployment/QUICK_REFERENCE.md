# Dookan Hostinger VPS Deployment - Quick Reference

## 🚀 Quick Start Commands

```bash
# Connect to VPS
ssh root@your-vps-ip

# Run setup (first time only)
cd /root/dookan
sudo bash hostinger-deployment/setup-vps.sh

# Create SSL certificate
sudo certbot certonly --standalone -d zmadookan.com -d www.zmadookan.com

# Setup Nginx
sudo cp hostinger-deployment/nginx.conf /etc/nginx/sites-available/zmadookan.com
sudo ln -s /etc/nginx/sites-available/zmadookan.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Build and deploy
cd /root/dookan/backend-afghan-grocery
cp .env.example .env  # Edit with production values
npm install --omit=dev && npm run build
cp pm2-ecosystem.config.js . && pm2 start pm2-ecosystem.config.js

cd /root/dookan/afghan-grocery-vue
npm install --omit=dev && npm run build
sudo cp -r dist/* /var/www/dookan/

# Test
curl -I https://zmadookan.com
curl -I https://zmadookan.com/api/health
```

## 📋 File Locations

| Component | Location | Notes |
|-----------|----------|-------|
| Frontend Build | `/var/www/dookan/` | Served by Nginx |
| Backend Code | `/root/dookan/backend-afghan-grocery/` | Running via PM2 |
| Database | `/root/dookan/backend-afghan-grocery/db/database.sqlite` | SQLite |
| Uploads | `/root/dookan/backend-afghan-grocery/uploads/` | User uploads |
| Nginx Config | `/etc/nginx/sites-available/zmadookan.com` | Virtual host config |
| SSL Certs | `/etc/letsencrypt/live/zmadookan.com/` | Let's Encrypt |
| Backend Config | `/root/dookan/backend-afghan-grocery/.env` | Environment variables |
| Logs (Nginx) | `/var/log/nginx/dookan_*.log` | Access & error logs |
| Logs (PM2) | `/var/log/pm2/` | Backend logs |
| PM2 Config | `/root/dookan/backend-afghan-grocery/pm2-ecosystem.config.js` | Process manager |

## 🔄 Common Tasks

### Deploy New Version
```bash
bash /root/dookan/hostinger-deployment/deploy.sh
```

### Check Health
```bash
bash /root/dookan/hostinger-deployment/health-check.sh
```

### View Backend Logs
```bash
pm2 logs dookan-backend
```

### Restart Backend
```bash
pm2 restart dookan-backend
```

### Restart Nginx
```bash
sudo systemctl restart nginx
```

### View Backups
```bash
ls -lah /root/backups/dookan/
```

### Check SSL Certificate
```bash
sudo certbot certificates
```

### Manual Backup
```bash
bash /root/dookan/hostinger-deployment/backup.sh
```

## 🔐 Environment Variables You MUST Change

| Variable | Default | Action |
|----------|---------|--------|
| `JWT_SECRET` | CHANGE ME | Generate: `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | CHANGE ME | Generate: `openssl rand -base64 32` |
| `CORS_ORIGIN` | Update | Set to your domain |
| `PAYPAL_CLIENT_ID` | OPTIONAL | Get from PayPal if using payments |
| `PAYPAL_CLIENT_SECRET` | OPTIONAL | Get from PayPal if using payments |
| `SUPABASE_URL` | OPTIONAL | If using Supabase |
| `SUPABASE_ANON_KEY` | OPTIONAL | If using Supabase |

## 🔧 Troubleshooting Commands

```bash
# Test Nginx syntax
sudo nginx -t

# Test DNS resolution
nslookup zmadookan.com

# Check open ports
sudo ss -tlnp

# Check process status
pm2 status

# Check system resources
free -h && df -h

# View firewall status
sudo ufw status

# Monitor system in real-time
top

# Check SSL expiration
sudo certbot certificates

# View Nginx access log
tail -f /var/log/nginx/dookan_access.log

# View Nginx error log
tail -f /var/log/nginx/dookan_error.log

# View recent backend errors
pm2 logs dookan-backend --lines 50
```

## 📅 Scheduled Tasks (Crontab)

```bash
# View current crontab
crontab -l

# Edit crontab
crontab -e

# Common entries to add:
# Daily backup at 2 AM
0 2 * * * bash /root/dookan/hostinger-deployment/backup.sh

# Daily health check at 3 AM
0 3 * * * bash /root/dookan/hostinger-deployment/health-check.sh

# SSL renewal check daily at midnight
0 0 * * * bash /root/dookan/hostinger-deployment/ssl-renewal-cronjob.sh

# Weekly system update (Sunday at 4 AM)
0 4 * * 0 apt-get update && apt-get upgrade -y
```

## 🛡️ Security Ports

| Port | Service | Access | Action |
|------|---------|--------|--------|
| 22 | SSH | Limited | Allow only trusted IPs |
| 80 | HTTP | Public | Auto-redirect to 443 |
| 443 | HTTPS | Public | Frontend & API |
| 3000 | Backend | Internal | Proxied by Nginx, NOT exposed |

## ⚡ Performance Tips

1. **Enable Compression** ✓ (Already in nginx.conf)
2. **Cache Static Assets** ✓ (Already in nginx.conf)
3. **Use PM2 Clustering** ✓ (Already in pm2-ecosystem.config.js)
4. **Monitor Resources**: `top`, `free -h`, `df -h`
5. **Clean Old Logs**: Automatically managed
6. **Optimize Database**: Index frequently queried columns
7. **Use CDN**: For static assets (optional)

## 📞 Emergency Contacts

- **Hostinger Support**: support@hostinger.com
- **Your Admin Email**: Set in .env
- **Emergency SSH**: Keep credentials safe

## 💾 Backup Recovery

```bash
# List available backups
ls -lah /root/backups/dookan/

# Restore database
gunzip /root/backups/dookan/database_TIMESTAMP.sql.gz
sqlite3 /root/dookan/backend-afghan-grocery/db/database.sqlite < /root/backups/dookan/database_TIMESTAMP.sql

# Restore application
cd /tmp && tar -xzf /root/backups/dookan/app-code_TIMESTAMP.tar.gz
cp -r * /root/dookan/
```

## 🎯 Success Indicators

- ✅ `https://zmadookan.com` loads in browser
- ✅ `https://zmadookan.com/api/health` returns 200
- ✅ `pm2 status` shows dookan-backend online
- ✅ `sudo systemctl status nginx` shows active
- ✅ `sudo certbot certificates` shows valid certificate
- ✅ Logs show no critical errors

---

**Keep this file handy for quick reference!**
