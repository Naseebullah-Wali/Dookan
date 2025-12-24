# Troubleshooting Guide for Dookan on Hostinger VPS

## 🔴 Critical Issues

### Frontend shows "502 Bad Gateway" or "Cannot connect"

**Problem:** Nginx cannot reach the backend

**Solutions:**
```bash
# 1. Check if backend is running
pm2 status

# 2. If not running, restart it
pm2 restart dookan-backend

# 3. Check if port 3000 is open
sudo netstat -tlnp | grep 3000

# 4. Test backend directly
curl http://localhost:3000/health

# 5. Check backend logs
pm2 logs dookan-backend --lines 100

# 6. Reload Nginx
sudo systemctl reload nginx

# 7. Check Nginx syntax
sudo nginx -t

# 8. Restart Nginx if needed
sudo systemctl restart nginx
```

---

### Domain doesn't load at all (timeout or refused connection)

**Problem:** Network or firewall issue

**Solutions:**
```bash
# 1. Check if Nginx is running
sudo systemctl status nginx

# 2. Check firewall
sudo ufw status

# 3. Verify port 443 is open
sudo ss -tlnp | grep 443

# 4. Check DNS resolution
nslookup zmadookan.com

# 5. Check if server is responding
ping your-vps-ip

# 6. Restart Nginx
sudo systemctl restart nginx

# 7. Check Nginx error log
tail -50 /var/log/nginx/dookan_error.log
```

---

### SSL Certificate Error ("This connection is not secure")

**Problem:** SSL certificate misconfiguration

**Solutions:**
```bash
# 1. Check certificate validity
sudo certbot certificates

# 2. Check certificate files exist
ls -la /etc/letsencrypt/live/zmadookan.com/

# 3. Force certificate renewal
sudo certbot renew --force-renewal

# 4. Verify Nginx config has correct paths
sudo grep -n "ssl_certificate" /etc/nginx/sites-available/zmadookan.com

# 5. Test Nginx
sudo nginx -t

# 6. Reload Nginx
sudo systemctl reload nginx

# 7. Clear browser cache and reload
# Or use curl: curl -kv https://zmadookan.com/
```

---

### API returns 500 errors

**Problem:** Backend application error

**Solutions:**
```bash
# 1. Check backend logs
pm2 logs dookan-backend --lines 100

# 2. Check environment variables
cat /root/dookan/backend-afghan-grocery/.env | grep -v "^#"

# 3. Check database exists and is readable
ls -la /root/dookan/backend-afghan-grocery/db/

# 4. Check file permissions
sudo chown -R root:root /root/dookan

# 5. Restart backend
pm2 restart dookan-backend

# 6. Check system resources
free -h && df -h

# 7. Monitor in real-time
pm2 monit
```

---

### Out of Disk Space

**Problem:** VPS storage full

**Solutions:**
```bash
# 1. Check disk usage
df -h

# 2. Find what's using space
du -sh /* | sort -rh | head -10

# 3. Check specific directories
du -sh /root/dookan/*

# 4. Clean npm cache
npm cache clean --force

# 5. Remove old node_modules and rebuild
cd /root/dookan/backend-afghan-grocery
rm -rf node_modules && npm install --omit=dev

# 6. Clean old logs
pm2 logs dookan-backend --lines 0
sudo journalctl --vacuum=50M

# 7. Remove old backups
find /root/backups -type f -mtime +60 -delete

# 8. Check uploads folder
du -sh /root/dookan/backend-afghan-grocery/uploads/

# 9. Consider upgrading VPS storage through Hostinger panel
```

---

### Out of Memory / Server Crashing

**Problem:** Insufficient RAM

**Solutions:**
```bash
# 1. Check current memory usage
free -h

# 2. Check what's using memory
top -b -n 1 | head -20

# 3. Check PM2 memory limits
pm2 monit

# 4. Set memory limit for Node.js
# Edit pm2-ecosystem.config.js and add:
# max_memory_restart: '500M'
# Then restart:
pm2 restart dookan-backend

# 5. Check if swap is enabled
swapon --show

# 6. Add more swap if needed
sudo fallocate -l 2G /swapfile-extra
sudo chmod 600 /swapfile-extra
sudo mkswap /swapfile-extra
sudo swapon /swapfile-extra

# 7. Optimize database queries (reduce memory usage)
# Check backend logs for slow queries
```

---

## 🟡 Performance Issues

### Slow Loading / High Latency

**Diagnosis:**
```bash
# 1. Test frontend load time
time curl https://zmadookan.com/

# 2. Check API response time
time curl https://zmadookan.com/api/health

# 3. Check system load
uptime
top

# 4. Check network
netstat -an | grep ESTABLISHED | wc -l

# 5. Monitor in real-time
watch -n 1 'free -h; echo "---"; top -b -n 1 | head -5'
```

**Solutions:**
```bash
# 1. Enable compression (check Nginx config)
# Already enabled in nginx.conf

# 2. Increase Node.js max threads
export UV_THREADPOOL_SIZE=128

# 3. Optimize PM2 clustering
# Already configured for max cores

# 4. Restart services
pm2 restart dookan-backend
sudo systemctl restart nginx

# 5. Clear caches
pm2 restart dookan-backend

# 6. Check for database issues
# View slow queries in backend logs
pm2 logs dookan-backend --lines 200

# 7. Upgrade VPS if needed
```

---

### High CPU Usage

**Diagnosis:**
```bash
# 1. Check CPU usage
top
mpstat 1 5

# 2. Find process using CPU
ps aux --sort=-%cpu | head -10

# 3. Check if PM2 workers are maxed
pm2 monit

# 4. Check Node.js process count
ps aux | grep node | grep -v grep | wc -l
```

**Solutions:**
```bash
# 1. Restart backend to reset
pm2 restart dookan-backend

# 2. Reduce PM2 instances if needed
# Edit pm2-ecosystem.config.js, change instances from 'max' to a specific number
# instances: 2,  # instead of 'max'

# 3. Enable caching in backend
# Check if caching is configured in code

# 4. Optimize database queries
# Check backend logs for slow queries

# 5. Monitor continuously
pm2 monit
```

---

## 🟠 Deployment Issues

### Deploy Script Fails

**Problem:** Deployment automation issues

**Solutions:**
```bash
# 1. Check git status
cd /root/dookan
git status

# 2. Manually pull latest code
git pull origin main

# 3. Check branch
git branch

# 4. Build backend manually
cd backend-afghan-grocery
npm install --omit=dev
npm run build

# 5. Build frontend manually
cd ../afghan-grocery-vue
npm install --omit=dev
npm run build

# 6. Start backend
cd ../backend-afghan-grocery
pm2 start pm2-ecosystem.config.js

# 7. Copy frontend
sudo cp -r dist/* /var/www/dookan/
```

---

### SSL Certificate Renewal Fails

**Problem:** Certificate doesn't auto-renew

**Solutions:**
```bash
# 1. Check current certificate
sudo certbot certificates

# 2. Check renewal status
sudo certbot renew --dry-run

# 3. Force renewal
sudo certbot renew --force-renewal

# 4. Check cron job
crontab -l

# 5. Check SSL renewal logs
tail -50 /var/log/dookan-ssl-renewal.log

# 6. Verify port 80 is accessible (for renewal)
sudo ss -tlnp | grep 80

# 7. Manually add to crontab if missing
(crontab -l 2>/dev/null; echo "0 0 * * * bash /root/dookan/hostinger-deployment/ssl-renewal-cronjob.sh") | crontab -
```

---

## 🔵 Database Issues

### Database Locked or Corrupted

**Problem:** SQLite database issues

**Solutions:**
```bash
# 1. Check database file
ls -la /root/dookan/backend-afghan-grocery/db/database.sqlite

# 2. Check if database is locked
lsof | grep database.sqlite

# 3. Check database integrity
sqlite3 /root/dookan/backend-afghan-grocery/db/database.sqlite "PRAGMA integrity_check;"

# 4. Backup current database
cp /root/dookan/backend-afghan-grocery/db/database.sqlite /root/dookan/backend-afghan-grocery/db/database.sqlite.backup

# 5. Repair database
sqlite3 /root/dookan/backend-afghan-grocery/db/database.sqlite
# Inside sqlite3:
# PRAGMA integrity_check;
# PRAGMA repair;
# .quit

# 6. Restart backend
pm2 restart dookan-backend
```

---

## 🟢 Information & Monitoring

### Check Service Status

```bash
# All services at once
echo "=== Nginx ===" && sudo systemctl status nginx
echo "=== PM2 ===" && pm2 status
echo "=== Backend Health ===" && curl -s http://localhost:3000/health | head -c 100
echo ""

# Or create monitoring script
bash /root/dookan/hostinger-deployment/health-check.sh
```

---

### View Application Logs

```bash
# Backend logs (latest 50 lines)
pm2 logs dookan-backend --lines 50

# Nginx access log
tail -20 /var/log/nginx/dookan_access.log

# Nginx error log
tail -20 /var/log/nginx/dookan_error.log

# System journal
sudo journalctl -n 50

# All logs combined
pm2 logs && tail /var/log/nginx/dookan_error.log
```

---

### System Information

```bash
# OS and version
lsb_release -a
uname -a

# CPU info
nproc
cat /proc/cpuinfo | head -20

# Memory
free -h
vmstat 1 5

# Disk
df -h
du -sh /root/dookan

# Network
ifconfig
netstat -an | head -20

# Uptime
uptime

# Services
ps aux | grep -E "nginx|node|pm2"
```

---

## 🚀 Recovery Procedures

### Complete System Reset

```bash
# CAUTION: This stops all services

# 1. Stop backend
pm2 stop dookan-backend

# 2. Stop Nginx
sudo systemctl stop nginx

# 3. Fix issues...

# 4. Start Nginx
sudo systemctl start nginx

# 5. Start backend
pm2 start pm2-ecosystem.config.js

# 6. Verify
pm2 status
sudo systemctl status nginx
curl https://zmadookan.com
```

---

### Restore from Backup

```bash
# 1. List backups
ls -lah /root/backups/dookan/

# 2. Restore database
BACKUP_FILE="/root/backups/dookan/database_TIMESTAMP.sql.gz"
gunzip < "$BACKUP_FILE" > /tmp/restore.sql
sqlite3 /root/dookan/backend-afghan-grocery/db/database.sqlite < /tmp/restore.sql

# 3. Restore application
cd /tmp && tar -xzf /root/backups/dookan/app-code_TIMESTAMP.tar.gz
# Review files before copying
cp -r src server package.json /root/dookan/

# 4. Rebuild and restart
cd /root/dookan/backend-afghan-grocery
npm install --omit=dev && npm run build
pm2 restart dookan-backend
```

---

## 📞 When to Contact Hostinger Support

1. **VPS won't start or crashes repeatedly**
2. **Persistent network connectivity issues**
3. **Hardware problems or resource limits exceeded**
4. **Port access issues despite firewall config**
5. **Server hitting DDoS or abuse detection**

**Hostinger Support:** support@hostinger.com or Hostinger Panel Live Chat

---

## 🔍 Advanced Debugging

### Enable Verbose Logging

```bash
# Backend verbose logging
export DEBUG=*
pm2 restart dookan-backend

# Nginx debug logging
# Edit /etc/nginx/sites-available/zmadookan.com
# Change error_log to debug:
# error_log /var/log/nginx/dookan_error.log debug;
sudo systemctl reload nginx
```

---

### Network Troubleshooting

```bash
# Test connectivity to database (if remote)
telnet db-host 5432

# Test API connectivity
curl -v https://zmadookan.com/api/health

# DNS troubleshooting
dig zmadookan.com
nslookup zmadookan.com

# Trace route
traceroute zmadookan.com

# Check SSL details
openssl s_client -connect zmadookan.com:443
```

---

**Last Updated:** December 2025

**Remember:** Backup before making major changes!
