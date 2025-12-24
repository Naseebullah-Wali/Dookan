# 🚀 Dookan VPS Deployment Guide for Hostinger Ubuntu

Complete step-by-step guide to deploy Dookan on a Hostinger Ubuntu VPS with custom domain `zmadookan.com`.

---

## 📋 Prerequisites

- **Hostinger VPS** with Ubuntu 20.04+ (preferably Ubuntu 22.04)
- **Root or SSH access** to your VPS
- **Domain name** (zmadookan.com) configured and pointing to your VPS IP
- **Basic Linux knowledge**

---

## 📦 What's Included

This deployment package includes:
- ✅ Nginx configuration with SSL
- ✅ PM2 ecosystem configuration
- ✅ Automated setup scripts
- ✅ Deployment automation
- ✅ Health check monitoring
- ✅ Backup automation
- ✅ SSL auto-renewal
- ✅ Environment configuration templates

---

## 🛠️ Installation Steps

### Step 1: Connect to Your VPS

```bash
# SSH into your VPS (replace with your IP)
ssh root@your-vps-ip

# Or if you have a specific SSH key
ssh -i /path/to/key root@your-vps-ip
```

### Step 2: Verify Domain DNS

Before proceeding, ensure your domain DNS is pointing to your VPS:

```bash
# Test DNS resolution (replace with your IP)
nslookup zmadookan.com

# Should return: your-vps-ip
```

### Step 3: Clone the Repository

```bash
# Clone the Dookan repository
git clone https://github.com/yourusername/dookan.git /root/dookan

# Navigate to the project
cd /root/dookan
```

Replace `yourusername` with your actual GitHub username.

### Step 4: Run the Automated Setup Script

This script will install and configure everything you need:

```bash
# Make the script executable
chmod +x hostinger-deployment/setup-vps.sh

# Run the setup script (takes 10-15 minutes)
sudo bash hostinger-deployment/setup-vps.sh
```

**What this script does:**
- ✓ Updates system packages
- ✓ Installs Node.js 20 and npm
- ✓ Installs PM2 for process management
- ✓ Installs Nginx web server
- ✓ Installs Certbot for SSL/TLS certificates
- ✓ Installs Docker and Docker Compose
- ✓ Creates necessary directories
- ✓ Configures firewall (UFW)
- ✓ Creates 2GB swap space

**Output Example:**
```
🚀 Starting Dookan VPS Setup...
[1/10] Updating system packages...
[2/10] Installing Node.js and npm...
...
✓ VPS Setup Complete!
```

### Step 5: Configure SSL Certificate

Let's Encrypt provides free SSL certificates. Set one up for your domain:

```bash
# Create SSL certificate (interactive - follow prompts)
sudo certbot certonly --standalone -d zmadookan.com -d www.zmadookan.com

# When asked for email, use your actual email for renewal notifications
# Accept terms of service
# Choose to share your email (recommended)
```

**Output:**
```
Congratulations! Your certificate is saved at:
/etc/letsencrypt/live/zmadookan.com/fullchain.pem
```

### Step 6: Configure Nginx

Copy and enable the Nginx configuration:

```bash
# Copy Nginx configuration
sudo cp /root/dookan/hostinger-deployment/nginx.conf /etc/nginx/sites-available/zmadookan.com

# Enable the site
sudo ln -s /etc/nginx/sites-available/zmadookan.com /etc/nginx/sites-enabled/zmadookan.com

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Should output:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Reload Nginx
sudo systemctl reload nginx
```

### Step 7: Configure Environment Variables

```bash
# Navigate to backend directory
cd /root/dookan/backend-afghan-grocery

# Copy example environment file
cp .env.example .env

# Edit the environment file with your production values
nano .env
```

**Important variables to update:**

```env
NODE_ENV=production
JWT_SECRET=<generate-secure-key>
JWT_REFRESH_SECRET=<generate-secure-key>
CORS_ORIGIN=https://zmadookan.com,https://www.zmadookan.com
PAYPAL_CLIENT_ID=<your-paypal-client-id>
PAYPAL_CLIENT_SECRET=<your-paypal-client-secret>
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-key>
```

**Generate secure JWT secrets:**

```bash
# Generate random secret
openssl rand -base64 32

# Use output for JWT_SECRET and JWT_REFRESH_SECRET
```

**Save file:** Press `Ctrl+X`, then `Y`, then `Enter`

### Step 8: Build the Backend

```bash
# Navigate to backend
cd /root/dookan/backend-afghan-grocery

# Install dependencies
npm install --omit=dev

# Build TypeScript
npm run build

# Verify build
ls -la dist/
```

### Step 9: Build the Frontend

```bash
# Navigate to frontend
cd /root/dookan/afghan-grocery-vue

# Install dependencies
npm install --omit=dev

# Build Vue.js application
npm run build

# Copy built files to web root
sudo cp -r dist/* /var/www/dookan/
sudo chown -R www-data:www-data /var/www/dookan
```

### Step 10: Start Backend with PM2

```bash
# Copy PM2 ecosystem config
cp /root/dookan/hostinger-deployment/pm2-ecosystem.config.js /root/dookan/backend-afghan-grocery/

# Navigate to backend
cd /root/dookan/backend-afghan-grocery

# Start the backend
pm2 start pm2-ecosystem.config.js

# Make PM2 start on system reboot
pm2 startup
pm2 save

# View running processes
pm2 status
pm2 logs
```

### Step 11: Test Your Deployment

```bash
# Test frontend
curl -I https://zmadookan.com

# Expected: HTTP/2 200

# Test backend API
curl -I https://zmadookan.com/api/health

# Expected: HTTP/2 200

# Or visit in browser
# Frontend: https://zmadookan.com
# API Health: https://zmadookan.com/api/health
```

---

## 🔄 Daily Operations

### Deploying Updates

When you push new code to your repository:

```bash
# Make deploy script executable
chmod +x /root/dookan/hostinger-deployment/deploy.sh

# Run deployment
bash /root/dookan/hostinger-deployment/deploy.sh
```

**What this does:**
1. Pulls latest code from Git
2. Builds backend
3. Builds frontend
4. Restarts backend service
5. Copies frontend to web server

### Health Monitoring

Check the health of your application:

```bash
# Make script executable
chmod +x /root/dookan/hostinger-deployment/health-check.sh

# Run health check
bash /root/dookan/hostinger-deployment/health-check.sh
```

**Output:**
```
🏥 Dookan Health Check
Checking Nginx... ✓ Running
Checking Backend (PM2)... ✓ Running
Checking Backend Health Endpoint... ✓ Responding
Checking Frontend... ✓ Responding
...
```

### View Backend Logs

```bash
# Real-time logs
pm2 logs dookan-backend

# Last 100 lines
pm2 logs dookan-backend --lines 100

# Save logs to file
pm2 logs dookan-backend > backend-logs.txt
```

### Restart Services

```bash
# Restart backend
pm2 restart dookan-backend

# Restart Nginx
sudo systemctl restart nginx

# Check service status
sudo systemctl status nginx
pm2 status
```

---

## 🛡️ Automated Maintenance

### Backup System

Set up automatic daily backups:

```bash
# Make backup script executable
chmod +x /root/dookan/hostinger-deployment/backup.sh

# Add to crontab (runs daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * bash /root/dookan/hostinger-deployment/backup.sh") | crontab -

# Verify cron job
crontab -l
```

**Backups include:**
- Database dumps
- Application code
- Uploaded files
- Configuration files

**Backup location:** `/root/backups/dookan`

### SSL Certificate Auto-Renewal

Let's Encrypt certificates expire after 90 days. Set up auto-renewal:

```bash
# Make script executable
chmod +x /root/dookan/hostinger-deployment/ssl-renewal-cronjob.sh

# Add to crontab (runs daily at midnight)
(crontab -l 2>/dev/null; echo "0 0 * * * bash /root/dookan/hostinger-deployment/ssl-renewal-cronjob.sh") | crontab -

# Verify cron job
crontab -l

# Check certificate expiration
sudo certbot certificates
```

### Automated Health Checks

Periodically monitor your system:

```bash
# Add to crontab (runs every 6 hours)
(crontab -l 2>/dev/null; echo "0 */6 * * * bash /root/dookan/hostinger-deployment/health-check.sh") | crontab -
```

---

## 🚨 Troubleshooting

### Issue: Domain not loading

**Solution:**
```bash
# Check DNS
nslookup zmadookan.com

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check firewall
sudo ufw status
```

### Issue: Backend not responding

**Solution:**
```bash
# Check PM2 status
pm2 status
pm2 logs dookan-backend

# Check if port 3000 is listening
sudo netstat -tlnp | grep 3000

# Restart backend
pm2 restart dookan-backend
```

### Issue: SSL certificate not working

**Solution:**
```bash
# Check certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew --force-renewal

# Reload Nginx
sudo systemctl reload nginx
```

### Issue: High memory usage

**Solution:**
```bash
# Check memory
free -h

# Check top processes
top -b -n 1 | head -20

# Increase swap
sudo fallocate -l 2G /swapfile2
sudo chmod 600 /swapfile2
sudo mkswap /swapfile2
sudo swapon /swapfile2
```

### Issue: Out of disk space

**Solution:**
```bash
# Check disk usage
df -h

# Find large files
du -sh /root/dookan/*

# Clean old logs
pm2 logs dookan-backend --lines 0
sudo journalctl --vacuum=100M

# Clear npm cache
npm cache clean --force
```

---

## 📊 Monitoring Dashboard

Create a simple monitoring setup:

### Via SSH

```bash
# Monitor in real-time
while true; do clear; echo "=== Dookan Status ==="; pm2 status; echo ""; echo "=== System Stats ==="; free -h; df -h /; echo ""; sleep 5; done
```

### Via Logs

```bash
# Tail multiple logs
pm2 logs dookan-backend
# or
tail -f /var/log/nginx/dookan_access.log
tail -f /var/log/nginx/dookan_error.log
```

---

## 🔐 Security Best Practices

### 1. Update System Regularly

```bash
# Update and upgrade
sudo apt-get update && sudo apt-get upgrade -y

# Schedule monthly updates
sudo apt-get install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 2. Secure SSH

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Change:
# Port 22 -> Port 2222 (optional)
# PermitRootLogin yes -> PermitRootLogin no (if not using root)
# PasswordAuthentication yes -> PasswordAuthentication no

# Restart SSH
sudo systemctl restart ssh
```

### 3. Fail2ban (Block brute force attacks)

```bash
# Install
sudo apt-get install fail2ban

# Enable and start
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Check status
sudo fail2ban-client status
```

### 4. Regular Backups

Already covered in automated maintenance section.

---

## 📈 Performance Optimization

### 1. Enable Gzip Compression

Already enabled in nginx.conf

### 2. Enable Browser Caching

Already configured in nginx.conf for static assets

### 3. Use PM2 Clustering

Enabled in pm2-ecosystem.config.js (uses all CPU cores)

### 4. Monitor Performance

```bash
# CPU and Memory
top

# Network
netstat -an | grep ESTABLISHED | wc -l

# Disk I/O
iostat -x 1

# Application metrics
pm2 monit
```

---

## 💰 Cost Optimization Tips

1. **Use VPS efficiently**: Monitor resource usage
2. **Enable compression**: Reduces bandwidth usage
3. **Cache aggressively**: Reduces server load
4. **CDN integration**: For static assets (optional)
5. **Database optimization**: Index queries properly

---

## 📞 Support & Resources

### Documentation
- [Nginx Docs](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Let's Encrypt Guide](https://letsencrypt.org/docs/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-performance-best-practices/)

### Hostinger Support
- **Email**: support@hostinger.com
- **Live Chat**: Available 24/7 in your Hostinger panel

### Useful Commands

```bash
# Reboot VPS
sudo reboot

# Check uptime
uptime

# System information
uname -a
lsb_release -a

# List open ports
sudo ss -tlnp

# Check network connectivity
ping 8.8.8.8
traceroute google.com

# DNS testing
nslookup zmadookan.com
dig zmadookan.com
```

---

## ✅ Deployment Checklist

- [ ] VPS created on Hostinger
- [ ] Domain DNS configured
- [ ] SSH access tested
- [ ] Repository cloned
- [ ] Setup script executed
- [ ] SSL certificate installed
- [ ] Nginx configured and tested
- [ ] Environment variables set
- [ ] Backend built
- [ ] Frontend built
- [ ] PM2 started
- [ ] Tests passed (frontend and API)
- [ ] Backups configured
- [ ] SSL auto-renewal configured
- [ ] Health checks configured
- [ ] Monitoring set up
- [ ] Security hardened
- [ ] Domain accessible via HTTPS

---

## 🎉 Success!

If all tests pass and you can access:
- **https://zmadookan.com** → Frontend loads
- **https://zmadookan.com/api/health** → API responds

**Congratulations! Your Dookan platform is live! 🚀**

---

## 📝 Notes

- Save all important credentials in a secure location
- Keep backups in a separate location
- Monitor logs regularly for issues
- Update dependencies periodically
- Keep database optimized
- Document any custom configurations

---

**Last Updated:** December 2025

**Created for:** Dookan E-Commerce Platform on Hostinger Ubuntu VPS
