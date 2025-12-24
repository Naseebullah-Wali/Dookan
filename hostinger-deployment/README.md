# Dookan Hostinger VPS Deployment Package

Complete deployment solution for hosting Dookan Afghan Grocery E-Commerce Platform on Hostinger VPS with Ubuntu.

---

## 📦 Package Contents

### 📄 Documentation

| File | Purpose |
|------|---------|
| **DEPLOYMENT_GUIDE.md** | Complete step-by-step deployment guide (READ THIS FIRST) |
| **QUICK_REFERENCE.md** | Quick commands and common tasks cheat sheet |
| **TROUBLESHOOTING.md** | Solutions for common problems and issues |
| **PRE_DEPLOYMENT_CHECKLIST.md** | Pre-deployment verification checklist |
| **README.md** | This file - package overview |

### 🔧 Configuration Files

| File | Purpose | Destination |
|------|---------|-------------|
| **nginx.conf** | Nginx reverse proxy with SSL | `/etc/nginx/sites-available/zmadookan.com` |
| **.env.production.example** | Environment variables template | Copy to `.env` in backend folder |
| **pm2-ecosystem.config.js** | PM2 process manager config | `/root/dookan/backend-afghan-grocery/` |

### 🚀 Automation Scripts

| File | Purpose | Run As |
|------|---------|--------|
| **setup-vps.sh** | Initial VPS setup and package installation | Root (sudo) |
| **deploy.sh** | Deployment automation script | Root (sudo) |
| **health-check.sh** | System health monitoring | Any user |
| **backup.sh** | Database and file backup automation | Root (sudo) |
| **ssl-renewal-cronjob.sh** | SSL certificate auto-renewal | Root (cron) |

---

## 🚀 Quick Start (5 Steps)

### 1. **Connect to VPS**
```bash
ssh root@your-vps-ip
```

### 2. **Clone Repository**
```bash
git clone https://github.com/yourusername/dookan.git /root/dookan
cd /root/dookan
```

### 3. **Run Setup**
```bash
chmod +x hostinger-deployment/setup-vps.sh
sudo bash hostinger-deployment/setup-vps.sh
```

### 4. **Setup SSL & Nginx**
```bash
sudo certbot certonly --standalone -d zmadookan.com -d www.zmadookan.com
sudo cp hostinger-deployment/nginx.conf /etc/nginx/sites-available/zmadookan.com
sudo ln -s /etc/nginx/sites-available/zmadookan.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 5. **Deploy Application**
```bash
cd /root/dookan
bash hostinger-deployment/deploy.sh
```

✅ **Done!** Access your site at: https://zmadookan.com

---

## 📚 Documentation Guide

### For First-Time Deployment
👉 **Start here:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- Complete step-by-step instructions
- What each step does and why
- How to verify everything works
- Estimated time: 60 minutes

### For Quick Commands
👉 **Use this:** [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- Common commands in one place
- File locations and quick tasks
- Troubleshooting one-liners
- Perfect for daily operations

### For Problem Solving
👉 **Read this:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Organized by issue type
- Diagnosis and solutions
- Emergency procedures
- Recovery steps

### For Pre-Deployment Prep
👉 **Use this:** [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md)
- Verify nothing is missed
- Track your progress
- Success indicators
- Post-deployment tasks

---

## 🔧 What Each Configuration File Does

### `nginx.conf`
- **Purpose:** Web server and reverse proxy configuration
- **Serves:** Frontend (Vue.js) on `/`
- **Proxies:** Backend API on `/api/` to port 3000
- **Features:**
  - SSL/TLS with Let's Encrypt
  - Gzip compression
  - Browser caching for static assets
  - Security headers
  - Rate limiting for API
  - Automatic HTTP to HTTPS redirect

### `.env.production.example`
- **Purpose:** Environment variables template
- **Usage:** Copy to `.env` in backend directory
- **Contains:**
  - Database configuration
  - JWT secret keys
  - CORS settings
  - Payment provider credentials
  - Email configuration
  - Third-party API keys

### `pm2-ecosystem.config.js`
- **Purpose:** Process manager configuration
- **Manages:** Node.js backend application
- **Features:**
  - Cluster mode (uses all CPU cores)
  - Auto-restart on crash
  - Graceful shutdown
  - Memory limits
  - Log rotation
  - Auto-start on system reboot

---

## 🚀 What Each Script Does

### `setup-vps.sh`
**Run once at the beginning**

Installs and configures:
- Node.js 20 & npm
- PM2 process manager
- Nginx web server
- Certbot (SSL certificates)
- Docker & Docker Compose
- UFW firewall
- Swap space (2GB)

**Time required:** 10-15 minutes

### `deploy.sh`
**Run whenever you want to deploy new code**

1. Pulls latest code from Git
2. Builds backend (TypeScript → JavaScript)
3. Builds frontend (Vue.js → Static HTML/CSS/JS)
4. Restarts backend service
5. Copies frontend to web server

**Time required:** 5-10 minutes

### `health-check.sh`
**Run manually or via cron for monitoring**

Checks:
- Nginx status
- Backend service status
- Backend health endpoint
- Frontend accessibility
- SSL certificate expiration
- Disk space usage
- Memory usage
- Recent error logs

**Tip:** Add to crontab to run every 6 hours

### `backup.sh`
**Run manually or via cron for backups**

Backs up:
- SQLite database
- Application code
- Uploaded files
- Configuration files

Stores in: `/root/backups/dookan/`

**Tip:** Add to crontab to run daily at 2 AM

### `ssl-renewal-cronjob.sh`
**Add to crontab for automatic SSL renewal**

Runs: `certbot renew --quiet`

Renews certificates 30 days before expiration

Reloads Nginx after renewal

---

## 📊 Directory Structure After Deployment

```
/root/
├── dookan/                              # Application root
│   ├── backend-afghan-grocery/
│   │   ├── dist/                        # Compiled backend
│   │   ├── db/
│   │   │   └── database.sqlite          # SQLite database
│   │   ├── uploads/                     # User uploads
│   │   ├── .env                         # Production config (DO NOT COMMIT)
│   │   ├── package.json
│   │   └── pm2-ecosystem.config.js
│   ├── afghan-grocery-vue/
│   │   ├── dist/                        # Built frontend
│   │   └── package.json
│   └── hostinger-deployment/            # This package
│       ├── nginx.conf
│       ├── deploy.sh
│       ├── setup-vps.sh
│       ├── health-check.sh
│       ├── backup.sh
│       └── ssl-renewal-cronjob.sh
└── backups/
    └── dookan/                          # Daily backups (30-day retention)

/var/
├── www/
│   └── dookan/                          # Web root (frontend served from here)
└── log/
    └── nginx/
        ├── dookan_access.log
        └── dookan_error.log

/etc/
├── nginx/
│   └── sites-available/
│       └── zmadookan.com                # Nginx config
└── letsencrypt/
    └── live/
        └── zmadookan.com/
            ├── fullchain.pem            # SSL certificate
            └── privkey.pem              # SSL private key
```

---

## 🔄 Typical Workflow

### Day 1: Initial Setup
```bash
# 1. Connect and clone
ssh root@vps-ip
git clone https://github.com/you/dookan.git /root/dookan

# 2. Run setup script
cd /root/dookan
bash hostinger-deployment/setup-vps.sh

# 3. Setup SSL
sudo certbot certonly --standalone -d zmadookan.com -d www.zmadookan.com

# 4. Configure and deploy
bash hostinger-deployment/deploy.sh
```

### Day 2+: Ongoing Operations

**Deploy new code:**
```bash
cd /root/dookan
bash hostinger-deployment/deploy.sh
```

**Check health:**
```bash
bash hostinger-deployment/health-check.sh
```

**View logs:**
```bash
pm2 logs dookan-backend
tail -f /var/log/nginx/dookan_error.log
```

**Backup manually:**
```bash
bash hostinger-deployment/backup.sh
```

---

## 📋 Cron Jobs to Set Up

Add these to crontab (`crontab -e`):

```bash
# Daily backup at 2 AM
0 2 * * * bash /root/dookan/hostinger-deployment/backup.sh

# Daily health check at 3 AM
0 3 * * * bash /root/dookan/hostinger-deployment/health-check.sh

# Daily SSL renewal check at midnight
0 0 * * * bash /root/dookan/hostinger-deployment/ssl-renewal-cronjob.sh

# Weekly system update (Sunday 4 AM)
0 4 * * 0 apt-get update && apt-get upgrade -y
```

---

## 🔐 Security Checklist

Essential security steps:

- [ ] Change all default passwords
- [ ] Generate strong JWT secrets
- [ ] Configure firewall (UFW)
- [ ] Set up SSH key authentication
- [ ] Install and configure Fail2ban
- [ ] Enable SSL/TLS (Let's Encrypt)
- [ ] Set file permissions correctly
- [ ] Keep system updated
- [ ] Regular backups enabled
- [ ] SSL auto-renewal configured

👉 **See:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Security Best Practices section

---

## 🆘 Need Help?

### Issue Type | Document
---|---
Setup questions | [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
Quick commands | [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
Problems & errors | [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
Pre-deployment | [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md)

### Quick Help

```bash
# Test if everything is working
bash hostinger-deployment/health-check.sh

# View backend logs
pm2 logs dookan-backend

# Restart backend
pm2 restart dookan-backend

# Restart Nginx
sudo systemctl restart nginx
```

---

## 📞 Support Resources

- **Hostinger Support:** support@hostinger.com
- **Nginx Documentation:** https://nginx.org/en/docs/
- **PM2 Documentation:** https://pm2.keymetrics.io/
- **Let's Encrypt:** https://letsencrypt.org/docs/

---

## 🎯 Success Indicators

Your deployment is successful when:

✅ Frontend loads: https://zmadookan.com
✅ API responds: https://zmadookan.com/api/health
✅ Backend online: `pm2 status` shows "online"
✅ Nginx active: `sudo systemctl status nginx` shows "active"
✅ SSL valid: Browser shows green lock icon
✅ No errors: `pm2 logs dookan-backend` shows no critical errors

---

## 📝 Important Notes

1. **Never commit `.env` file** - It contains secrets
2. **Save JWT secrets securely** - Needed for API security
3. **Backup regularly** - Set up automated backups
4. **Monitor SSL expiry** - Certificate auto-renews but verify it works
5. **Update system regularly** - Security patches are important
6. **Keep logs** - Helpful for troubleshooting
7. **Document changes** - For future reference

---

## 🗺️ File Permissions

Recommended permissions:

```bash
# Configuration files (read-only)
chmod 600 /root/dookan/backend-afghan-grocery/.env

# Scripts (executable)
chmod +x /root/dookan/hostinger-deployment/*.sh

# Web root
chmod 755 /var/www/dookan
chmod -R 755 /var/www/dookan/*

# Uploads
chmod 775 /root/dookan/backend-afghan-grocery/uploads

# Database
chmod 666 /root/dookan/backend-afghan-grocery/db/database.sqlite
```

---

## 🔄 Update Frequency

- **System packages:** Monthly (weekly recommended)
- **Node.js dependencies:** Quarterly or when needed
- **SSL certificates:** Automatic (90-day expiration)
- **Backups:** Daily
- **Health checks:** Every 6 hours
- **Monitoring:** Continuous

---

## 💡 Pro Tips

1. **Use PM2 monit** to monitor processes: `pm2 monit`
2. **Keep SSH connections alive** with terminal multiplexer: `tmux` or `screen`
3. **Test deployment** on staging before production
4. **Document all changes** for team reference
5. **Set up monitoring alerts** (optional via email)
6. **Keep emergency contacts** in a safe place
7. **Test backup restoration** regularly
8. **Review logs weekly** for patterns and issues

---

## 📅 Version Info

- **Created:** December 2025
- **Compatible with:** Ubuntu 20.04 LTS, 22.04 LTS, 24.04 LTS
- **Node.js Version:** 20 LTS
- **Nginx Version:** Latest stable
- **PM2 Version:** Latest

---

## 🙏 Before You Deploy

1. **Read** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) completely
2. **Use** [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md) to verify preparation
3. **Have** all credentials and information ready
4. **Backup** your local code and database
5. **Test** scripts on a staging server first (if possible)

---

**Ready to deploy?** Start with [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)! 🚀

---

**Questions?** Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) first! 🔍
