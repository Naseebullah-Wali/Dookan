# Deployment Files Summary

## 📦 Complete Hostinger VPS Deployment Package for Dookan

All files have been created in: `hostinger-deployment/`

---

## 📄 Documentation Files (4 files)

### 1. **README.md**
   - **Purpose:** Package overview and quick reference
   - **Read First:** YES - Start here to understand what's included
   - **Contains:** Quick start, file descriptions, workflow overview
   - **Time to read:** 10 minutes

### 2. **DEPLOYMENT_GUIDE.md**
   - **Purpose:** Complete step-by-step deployment instructions
   - **Read First:** YES - This is the main guide
   - **Contains:** 11 deployment steps, testing, security, monitoring, optimization
   - **Length:** Comprehensive (detailed instructions for everything)
   - **Best for:** First-time deployment

### 3. **QUICK_REFERENCE.md**
   - **Purpose:** Quick commands and cheat sheet
   - **Read First:** After deployment
   - **Contains:** File locations, common commands, troubleshooting one-liners
   - **Best for:** Daily operations and quick lookups

### 4. **TROUBLESHOOTING.md**
   - **Purpose:** Problem solving and issue resolution
   - **Read First:** When something goes wrong
   - **Contains:** Common issues, diagnosis steps, solutions, recovery procedures
   - **Best for:** Debugging and fixing problems

### 5. **PRE_DEPLOYMENT_CHECKLIST.md**
   - **Purpose:** Verification and progress tracking
   - **Read First:** Before starting deployment
   - **Contains:** Checkboxes for each step, success indicators
   - **Best for:** Making sure nothing is missed

---

## 🔧 Configuration Files (3 files)

### 6. **nginx.conf**
   - **Purpose:** Nginx web server configuration
   - **Where to copy:** `/etc/nginx/sites-available/zmadookan.com`
   - **Contains:**
     - SSL/TLS configuration with Let's Encrypt
     - Frontend serving (Vue.js)
     - Backend API proxy (Node.js on port 3000)
     - Security headers
     - Gzip compression
     - Browser caching
     - Rate limiting
   - **Do not edit unless you know what you're doing**

### 7. **.env.production.example**
   - **Purpose:** Production environment variables template
   - **How to use:** Copy to `.env` in `backend-afghan-grocery/` folder
   - **IMPORTANT:** Edit with your actual production values
   - **Do NOT commit:** Never push the actual `.env` file to Git
   - **Contains:**
     - Database configuration
     - JWT secrets (CRITICAL)
     - CORS origins
     - Payment provider credentials
     - Email settings
     - API keys

### 8. **pm2-ecosystem.config.js**
   - **Purpose:** PM2 process manager configuration
   - **Where to copy:** `/root/dookan/backend-afghan-grocery/`
   - **Contains:**
     - Backend process configuration
     - Clustering settings (uses all CPU cores)
     - Auto-restart settings
     - Memory limits
     - Log rotation
     - Graceful shutdown
   - **Usage:** `pm2 start pm2-ecosystem.config.js`

---

## 🚀 Automation Scripts (5 files)

### 9. **setup-vps.sh**
   - **Purpose:** Initial VPS setup and package installation
   - **Run once:** YES, only the first time
   - **Run as:** Root (use `sudo bash setup-vps.sh`)
   - **What it does:**
     - Updates system packages
     - Installs Node.js 20 & npm
     - Installs PM2, Nginx, Certbot
     - Installs Docker & Docker Compose
     - Configures UFW firewall
     - Creates swap space
     - Creates necessary directories
   - **Time required:** 10-15 minutes
   - **Permissions:** Must be executable (`chmod +x`)

### 10. **deploy.sh**
   - **Purpose:** Deploy new code and restart services
   - **Run multiple times:** YES, whenever you push code
   - **Run as:** Root (use `sudo bash deploy.sh`)
   - **What it does:**
     - Pulls latest code from Git
     - Builds backend (TypeScript → JavaScript)
     - Builds frontend (Vue.js → Static files)
     - Restarts backend service
     - Copies frontend to web server
   - **Time required:** 5-10 minutes
   - **Permissions:** Must be executable (`chmod +x`)

### 11. **health-check.sh**
   - **Purpose:** Monitor application and system health
   - **Run manually:** Whenever you want to check status
   - **Run via cron:** Every 6 hours (automated)
   - **What it checks:**
     - Nginx status
     - Backend service status
     - Backend health endpoint
     - Frontend accessibility
     - SSL certificate expiration
     - Disk space
     - Memory usage
     - Recent error logs
   - **Permissions:** Must be executable (`chmod +x`)
   - **Output:** Color-coded status (✓ or ✗)

### 12. **backup.sh**
   - **Purpose:** Automatic database and file backups
   - **Run manually:** Whenever you want a backup
   - **Run via cron:** Daily at 2 AM (recommended)
   - **What it backs up:**
     - SQLite database
     - Application code
     - Uploaded files
     - Configuration files
   - **Backup location:** `/root/backups/dookan/`
   - **Retention:** 30 days (older files auto-deleted)
   - **Permissions:** Must be executable (`chmod +x`)

### 13. **ssl-renewal-cronjob.sh**
   - **Purpose:** Automatic SSL certificate renewal
   - **Run via cron:** Daily at midnight (automated)
   - **What it does:**
     - Checks if certificate needs renewal
     - Renews certificate if needed
     - Reloads Nginx after renewal
   - **Permissions:** Must be executable (`chmod +x`)
   - **Note:** Let's Encrypt certs expire after 90 days

---

## 📊 File Usage Summary

| File | Type | Usage | Frequency |
|------|------|-------|-----------|
| README.md | Docs | Read first | Once |
| DEPLOYMENT_GUIDE.md | Docs | Main guide | During deployment |
| QUICK_REFERENCE.md | Docs | Daily use | Often |
| TROUBLESHOOTING.md | Docs | Problem solving | As needed |
| PRE_DEPLOYMENT_CHECKLIST.md | Docs | Verification | Once per deployment |
| nginx.conf | Config | Copy once | Setup phase |
| .env.production.example | Config | Copy & edit | Setup phase |
| pm2-ecosystem.config.js | Config | Copy once | Setup phase |
| setup-vps.sh | Script | Run once | First time only |
| deploy.sh | Script | Run often | Every code push |
| health-check.sh | Script | Run often | Daily or per cron |
| backup.sh | Script | Run often | Daily via cron |
| ssl-renewal-cronjob.sh | Script | Run via cron | Daily via cron |

---

## 🚀 Quick Start Order

**Follow these steps in this exact order:**

1. **Read:** `README.md` (5 min)
2. **Checklist:** `PRE_DEPLOYMENT_CHECKLIST.md` (mark what you have ready)
3. **Read:** `DEPLOYMENT_GUIDE.md` (20 min)
4. **Execute:** `setup-vps.sh` (15 min)
5. **Setup:** SSL certificates (10 min)
6. **Deploy:** Use `deploy.sh` (10 min)
7. **Test:** Verify frontend and API load
8. **Reference:** Use `QUICK_REFERENCE.md` for daily tasks
9. **Bookmark:** `TROUBLESHOOTING.md` for problem solving

---

## 📋 What You Need Before Starting

- [ ] Hostinger VPS with Ubuntu 20.04 or later
- [ ] Domain name (zmadookan.com) pointing to VPS
- [ ] SSH access to VPS
- [ ] Git repository with code
- [ ] All production credentials (PayPal, Supabase, etc.)
- [ ] Secure place to store JWT secrets
- [ ] Time (60 minutes for complete setup)

---

## ✅ Success Checklist

After deployment, verify:

- [ ] `https://zmadookan.com` loads in browser (green lock icon)
- [ ] `https://zmadookan.com/api/health` returns 200
- [ ] `pm2 status` shows backend as "online"
- [ ] `sudo systemctl status nginx` shows "active"
- [ ] No critical errors in logs: `pm2 logs dookan-backend`
- [ ] Firewall configured: `sudo ufw status`
- [ ] Backups set up: `crontab -l`
- [ ] SSL auto-renewal set up: `sudo certbot certificates`

---

## 🔐 Critical Security Notes

1. **JWT_SECRET** - Generate with: `openssl rand -base64 32`
2. **JWT_REFRESH_SECRET** - Generate with: `openssl rand -base64 32`
3. **CORS_ORIGIN** - Set to your exact domain
4. **.env file** - NEVER commit to Git
5. **Backups** - Keep in secure location
6. **SSH keys** - Store securely
7. **Credentials** - Document and secure separately

---

## 📞 Support Resources

- **DEPLOYMENT_GUIDE.md** - Step-by-step instructions
- **TROUBLESHOOTING.md** - Solutions for common issues
- **QUICK_REFERENCE.md** - Command reference
- Hostinger Support: support@hostinger.com
- PM2 Docs: https://pm2.keymetrics.io/
- Nginx Docs: https://nginx.org/en/docs/

---

## 🎉 You're All Set!

All files are ready for deployment. Start by reading:

### 👉 **`hostinger-deployment/README.md`**

Then follow:

### 👉 **`hostinger-deployment/DEPLOYMENT_GUIDE.md`**

---

**Questions? Check the TROUBLESHOOTING.md file!**

**Happy deploying! 🚀**
