# Pre-Deployment Checklist for Dookan on Hostinger

Use this checklist to ensure your deployment is complete and successful.

---

## ✅ Pre-Deployment (Before Starting)

### Domain & Hosting
- [ ] Domain name purchased (zmadookan.com)
- [ ] Domain registered and accessible
- [ ] Hostinger VPS ordered and active
- [ ] VPS IP address noted
- [ ] Root SSH access credentials saved securely
- [ ] Domain DNS pointing to VPS IP (use `nslookup zmadookan.com` to verify)

### Knowledge & Preparation
- [ ] Read entire DEPLOYMENT_GUIDE.md
- [ ] Saved all required credentials in secure location
- [ ] Have access to backup storage location
- [ ] Understand basic Linux commands
- [ ] Terminal/SSH client ready (PuTTY, Terminal, etc.)

### GitHub & Repository
- [ ] Repository created on GitHub
- [ ] All code committed and pushed
- [ ] Latest version ready to deploy
- [ ] No sensitive data in repository (no `.env` files)
- [ ] GitHub SSH keys configured for deployment (optional)

---

## ✅ Step 1: Initial VPS Setup

- [ ] SSH into VPS successfully
- [ ] Root user logged in
- [ ] Internet connection stable
- [ ] Enough time available (30-60 minutes for setup)

**Command to verify:**
```bash
uname -a
```

---

## ✅ Step 2: Run Setup Script

- [ ] Setup script downloaded to VPS
- [ ] Script made executable: `chmod +x setup-vps.sh`
- [ ] Setup script executed: `sudo bash setup-vps.sh`
- [ ] Script completed without major errors
- [ ] All packages installed successfully

**Verify each component:**
```bash
node --version        # Should show v20.x.x
npm --version         # Should show 9.x.x or higher
pm2 --version         # Should show PM2 version
docker --version      # Should show Docker version
nginx -v              # Should show nginx version
```

---

## ✅ Step 3: Domain & DNS

- [ ] Domain DNS updated (if needed)
- [ ] DNS propagation verified: `nslookup zmadookan.com`
- [ ] DNS returns correct VPS IP address
- [ ] Wait 24-48 hours for global DNS propagation (optional)

---

## ✅ Step 4: SSL Certificate Setup

- [ ] Port 80 accessible (for Let's Encrypt validation)
- [ ] Certbot installed
- [ ] Certificate request sent: `sudo certbot certonly --standalone ...`
- [ ] Certificate created successfully
- [ ] Certificate files exist:
  - [ ] `/etc/letsencrypt/live/zmadookan.com/fullchain.pem`
  - [ ] `/etc/letsencrypt/live/zmadookan.com/privkey.pem`

**Verify:**
```bash
sudo certbot certificates
```

---

## ✅ Step 5: Nginx Configuration

- [ ] Nginx configuration file copied
- [ ] Config file location: `/etc/nginx/sites-available/zmadookan.com`
- [ ] Config syntax tested: `sudo nginx -t` (should show "ok")
- [ ] Symlink created: `/etc/nginx/sites-enabled/zmadookan.com`
- [ ] Default site removed (optional): `sudo rm /etc/nginx/sites-enabled/default`
- [ ] Nginx reloaded: `sudo systemctl reload nginx`
- [ ] Nginx status: `sudo systemctl status nginx` (should be active)

---

## ✅ Step 6: Repository Cloned

- [ ] Repository cloned: `git clone ... /root/dookan`
- [ ] All files present:
  - [ ] `backend-afghan-grocery/` directory exists
  - [ ] `afghan-grocery-vue/` directory exists
  - [ ] `hostinger-deployment/` directory exists
- [ ] File permissions correct
- [ ] No error messages

---

## ✅ Step 7: Backend Configuration

- [ ] Navigated to: `cd /root/dookan/backend-afghan-grocery`
- [ ] `.env` file created from `.env.example`
- [ ] Critical variables set:
  - [ ] `NODE_ENV=production`
  - [ ] `JWT_SECRET` - Generated secure key (use: `openssl rand -base64 32`)
  - [ ] `JWT_REFRESH_SECRET` - Generated secure key
  - [ ] `CORS_ORIGIN=https://zmadookan.com,https://www.zmadookan.com`
  - [ ] `PAYPAL_CLIENT_ID` (if using payments)
  - [ ] `PAYPAL_CLIENT_SECRET` (if using payments)
  - [ ] `SUPABASE_URL` (if using Supabase)
  - [ ] `SUPABASE_ANON_KEY` (if using Supabase)
- [ ] No placeholder values left in `.env`
- [ ] `.env` file not committed to Git

---

## ✅ Step 8: Backend Build

- [ ] Dependencies installed: `npm install --omit=dev`
- [ ] Installation completed without errors
- [ ] TypeScript compiled: `npm run build`
- [ ] Build directory created: `ls -la dist/`
- [ ] Build files exist in `dist/` directory

---

## ✅ Step 9: Frontend Build

- [ ] Navigated to: `cd /root/dookan/afghan-grocery-vue`
- [ ] Dependencies installed: `npm install --omit=dev`
- [ ] Installation completed without errors
- [ ] Vue.js built: `npm run build`
- [ ] Build directory created: `ls -la dist/`
- [ ] Build files exist in `dist/` directory
- [ ] Frontend copied to web root: `sudo cp -r dist/* /var/www/dookan/`

---

## ✅ Step 10: PM2 Configuration

- [ ] PM2 ecosystem config copied: `cp pm2-ecosystem.config.js .`
- [ ] Backend started: `pm2 start pm2-ecosystem.config.js`
- [ ] Backend shows "online" status: `pm2 status`
- [ ] PM2 configured for startup: `pm2 startup` and `pm2 save`
- [ ] PM2 will auto-start on reboot

---

## ✅ Step 11: Service Verification

**Nginx:**
- [ ] Status: `sudo systemctl status nginx` → "active (running)"
- [ ] Listening on 80 and 443: `sudo ss -tlnp | grep nginx`
- [ ] Config is valid: `sudo nginx -t` → "ok"

**Backend:**
- [ ] PM2 status: `pm2 status` → "online"
- [ ] Logs check: `pm2 logs dookan-backend` → no critical errors
- [ ] Port 3000 listening: `sudo ss -tlnp | grep 3000`

**Firewall:**
- [ ] Status: `sudo ufw status`
- [ ] Ports open: 22 (SSH), 80 (HTTP), 443 (HTTPS)
- [ ] Port 3000 NOT exposed externally

---

## ✅ Step 12: Testing - Frontend

- [ ] Access `https://zmadookan.com` in browser
- [ ] Page loads successfully (no 502 or timeout)
- [ ] No browser warnings about certificate
- [ ] All elements load correctly
- [ ] Images and CSS display properly
- [ ] No JavaScript console errors (check DevTools)

**Command to test:**
```bash
curl -I https://zmadookan.com
# Should show: HTTP/2 200
```

---

## ✅ Step 13: Testing - Backend API

- [ ] Access `https://zmadookan.com/api/health` in browser or via curl
- [ ] Returns 200 response
- [ ] JSON response body received

**Command to test:**
```bash
curl -v https://zmadookan.com/api/health
# Should show: HTTP/2 200
```

---

## ✅ Step 14: Automation Setup

### Backups
- [ ] Backup script made executable: `chmod +x backup.sh`
- [ ] Test backup: `bash backup.sh`
- [ ] Backup created: `ls -la /root/backups/dookan/`
- [ ] Cron job added: `(crontab -l 2>/dev/null; echo "0 2 * * * bash /root/dookan/hostinger-deployment/backup.sh") | crontab -`
- [ ] Cron verified: `crontab -l`

### Health Checks
- [ ] Health check script executable: `chmod +x health-check.sh`
- [ ] Test health check: `bash health-check.sh`
- [ ] All checks passed
- [ ] Cron job added: `(crontab -l 2>/dev/null; echo "0 */6 * * * bash /root/dookan/hostinger-deployment/health-check.sh") | crontab -`

### SSL Renewal
- [ ] SSL renewal script executable: `chmod +x ssl-renewal-cronjob.sh`
- [ ] Cron job added: `(crontab -l 2>/dev/null; echo "0 0 * * * bash /root/dookan/hostinger-deployment/ssl-renewal-cronjob.sh") | crontab -`

---

## ✅ Step 15: Security

- [ ] Firewall enabled: `sudo ufw status` → "Status: active"
- [ ] SSH key authentication configured (if using keys)
- [ ] Weak passwords changed to strong ones
- [ ] Root login limited (optional but recommended)
- [ ] Fail2ban installed: `sudo systemctl status fail2ban` → "active"
- [ ] System updated: `sudo apt-get update && sudo apt-get upgrade -y`

---

## ✅ Step 16: Monitoring & Logging

- [ ] View backend logs: `pm2 logs dookan-backend`
- [ ] View Nginx access logs: `tail -f /var/log/nginx/dookan_access.log`
- [ ] View Nginx error logs: `tail -f /var/log/nginx/dookan_error.log`
- [ ] Monitoring tools tested: `pm2 monit`

---

## ✅ Post-Deployment (After Deployment)

### First 24 Hours
- [ ] Monitor logs for errors: `pm2 logs dookan-backend`
- [ ] Check health regularly: `bash health-check.sh`
- [ ] Test application features manually
- [ ] Monitor resource usage: `free -h`, `df -h`
- [ ] Verify backups run successfully

### First Week
- [ ] Test backup restoration procedure
- [ ] Monitor SSL certificate status
- [ ] Check for any performance issues
- [ ] Verify cron jobs execute
- [ ] Document any custom configurations
- [ ] Create runbook for team members

### Ongoing
- [ ] Daily: Monitor logs and health
- [ ] Weekly: Review performance metrics
- [ ] Monthly: Update system packages
- [ ] Quarterly: Test disaster recovery
- [ ] Quarterly: Review security settings

---

## ✅ Success Indicators

All of these should be true:

- [ ] ✅ `https://zmadookan.com` loads in browser
- [ ] ✅ SSL certificate shows as valid (green lock icon)
- [ ] ✅ No certificate warnings
- [ ] ✅ API endpoint `https://zmadookan.com/api/health` returns 200
- [ ] ✅ `pm2 status` shows "online"
- [ ] ✅ `pm2 logs dookan-backend` shows no critical errors
- [ ] ✅ `sudo systemctl status nginx` shows "active"
- [ ] ✅ Firewall configured correctly
- [ ] ✅ Backups running automatically
- [ ] ✅ Health checks running automatically
- [ ] ✅ SSL auto-renewal configured

---

## 🎉 Deployment Complete!

If all checkboxes are checked ✅, your Dookan platform is successfully deployed!

---

## 📝 Documentation to Save

- [ ] VPS IP address
- [ ] SSH login credentials
- [ ] Database backup location
- [ ] JWT_SECRET and JWT_REFRESH_SECRET (CRITICAL - KEEP SAFE)
- [ ] API base URL: https://zmadookan.com/api
- [ ] Backend health check: https://zmadookan.com/api/health
- [ ] Frontend URL: https://zmadookan.com
- [ ] PM2 command reference
- [ ] Nginx configuration file location
- [ ] SSL certificate renewal date

---

**Last Updated:** December 2025

**Keep this checklist for future reference and updates!**
