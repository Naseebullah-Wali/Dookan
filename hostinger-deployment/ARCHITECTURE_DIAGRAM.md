# Dookan Architecture & Deployment Diagram

## 🏗️ Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    HOSTINGER VPS (Ubuntu 20.04+)                        │
│                    IP: your-vps-ip  |  Domain: zmadookan.com            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                        INTERNET / DNS                                    │
│  zmadookan.com ─────> DNS ─────> your-vps-ip:443 (HTTPS)               │
└──────────────────────────────────────────────────────────────────────────┘
                              ↓
              ┌───────────────────────────────────┐
              │      UFW FIREWALL (Port 443)       │
              │   Allow: 22, 80, 443              │
              │   Block: Everything else          │
              └───────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────────────┐
        │           NGINX (Port 443)                      │
        │  - Reverse Proxy                                │
        │  - SSL/TLS (Let's Encrypt)                      │
        │  - Compression & Caching                        │
        └─────────────────────────────────────────────────┘
                    ↙                             ↘
        ┌─────────────────────┐       ┌─────────────────────┐
        │   FRONTEND (/)      │       │   API (/api/)       │
        │   ─────────────      │       │   ─────────────      │
        │ Vue.js App Served   │       │ Proxy to :3000      │
        │ from /var/www/      │       │ (PM2 Cluster)       │
        │ dookan/             │       │                     │
        │                     │       │                     │
        │ - index.html        │       │ HTTP/JSON           │
        │ - JavaScript        │       │ Port 3000 (Internal)│
        │ - CSS               │       │                     │
        │ - Images            │       └─────────────────────┘
        │ - Static Assets     │                ↓
        └─────────────────────┘      ┌──────────────────────────┐
                                     │   Node.js Backend        │
                                     │   (PM2 Cluster Mode)     │
                                     │                          │
                                     │ - Express.js API         │
                                     │ - TypeScript             │
                                     │ - 4 Worker Processes     │
                                     │   (auto-restart)         │
                                     │ - Rate Limiting          │
                                     │ - Error Handling         │
                                     └──────────────────────────┘
                                               ↓
                            ┌──────────────────────────────────┐
                            │      DATABASE & STORAGE          │
                            ├──────────────────────────────────┤
                            │ SQLite Database                  │
                            │ /app/db/database.sqlite          │
                            │                                  │
                            │ User Uploads                     │
                            │ /app/uploads/                    │
                            └──────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
USER BROWSER
    ↓
    │ HTTP Request to https://zmadookan.com
    ↓
INTERNET → DNS RESOLUTION → VPS IP
    ↓
FIREWALL (UFW)
    ↓
    ├─→ Port 443 (HTTPS) ✓ ALLOWED
    └─→ SSL/TLS Handshake
    ↓
NGINX (Reverse Proxy)
    ├─→ Request to "/" 
    │   └─→ Serve Frontend (Vue.js)
    │       - HTTP 200 OK
    │       - HTML + CSS + JS + Images
    │
    └─→ Request to "/api/*"
        └─→ Proxy to http://localhost:3000
            └─→ Node.js Backend (PM2)
                ├─→ Parse Request
                ├─→ Database Query
                ├─→ Process Data
                └─→ Return JSON Response
                    └─→ Nginx sends to Browser
                        ↓
                    HTTP 200 + JSON Data
                        ↓
                    Browser Renders/Updates UI
```

---

## 🔄 Deployment Process Flow

```
┌─────────────────────────────────────────────────────┐
│  STEP 1: Initial VPS Setup (One Time)               │
│  ─────────────────────────────────────────────────── │
│  $ sudo bash setup-vps.sh                           │
│                                                     │
│  ✓ Update system                                   │
│  ✓ Install Node.js, npm                            │
│  ✓ Install PM2                                     │
│  ✓ Install Nginx                                   │
│  ✓ Install Certbot                                 │
│  ✓ Install Docker                                  │
│  ✓ Configure Firewall                              │
│  ✓ Create directories                              │
│  ✓ Setup swap                                      │
│                                                     │
│  Time: 10-15 minutes                                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  STEP 2: SSL Certificate (One Time)                 │
│  ─────────────────────────────────────────────────── │
│  $ sudo certbot certonly --standalone \             │
│      -d zmadookan.com -d www.zmadookan.com          │
│                                                     │
│  ✓ Domain verification                             │
│  ✓ Certificate created                             │
│  ✓ Certificate saved at:                           │
│    /etc/letsencrypt/live/zmadookan.com/             │
│                                                     │
│  Time: 5 minutes                                    │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  STEP 3: Nginx Configuration (One Time)             │
│  ─────────────────────────────────────────────────── │
│  $ sudo cp nginx.conf \                             │
│      /etc/nginx/sites-available/zmadookan.com       │
│  $ sudo ln -s ... /etc/nginx/sites-enabled/         │
│  $ sudo nginx -t                                    │
│  $ sudo systemctl reload nginx                      │
│                                                     │
│  ✓ Config copied                                   │
│  ✓ Config validated                                │
│  ✓ Nginx reloaded                                  │
│  ✓ SSL enabled                                     │
│                                                     │
│  Time: 3 minutes                                    │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  STEP 4: Application Deployment (Multiple Times)    │
│  ─────────────────────────────────────────────────── │
│  $ bash deploy.sh                                   │
│                                                     │
│  ✓ Pull latest code from Git                       │
│  ✓ Build backend (TypeScript → JS)                 │
│  ✓ Build frontend (Vue → Static)                   │
│  ✓ Stop old backend                                │
│  ✓ Copy frontend to /var/www/dookan/               │
│  ✓ Start new backend                               │
│  ✓ Verify services                                 │
│                                                     │
│  Time: 5-10 minutes                                 │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  STEP 5: Setup Automation (One Time)                │
│  ─────────────────────────────────────────────────── │
│  Crontab entries:                                   │
│                                                     │
│  0 2 * * * bash backup.sh                          │
│  0 0 * * * bash ssl-renewal-cronjob.sh             │
│  0 */6 * * * bash health-check.sh                  │
│  0 4 * * 0 apt-get update && upgrade -y            │
│                                                     │
│  ✓ Daily backups at 2 AM                           │
│  ✓ Daily SSL check at midnight                     │
│  ✓ Health checks every 6 hours                     │
│  ✓ Weekly system updates                           │
│                                                     │
│  Time: 5 minutes                                    │
└─────────────────────────────────────────────────────┘
                        ↓
            ┌──────────────────────┐
            │  🎉 DEPLOYED! 🎉      │
            │                       │
            │ https://zmadookan.com │
            └──────────────────────┘
```

---

## 📁 File Organization During Deployment

```
BEFORE DEPLOYMENT
─────────────────
Your Computer:
  dookan/
  ├── backend-afghan-grocery/
  │   ├── src/
  │   ├── package.json
  │   └── Dockerfile
  ├── afghan-grocery-vue/
  │   ├── src/
  │   ├── package.json
  │   └── Dockerfile
  └── hostinger-deployment/  ← NEW FILES (13 files)
      ├── README.md
      ├── DEPLOYMENT_GUIDE.md
      ├── QUICK_REFERENCE.md
      ├── TROUBLESHOOTING.md
      ├── PRE_DEPLOYMENT_CHECKLIST.md
      ├── FILES_SUMMARY.md
      ├── nginx.conf
      ├── .env.production.example
      ├── pm2-ecosystem.config.js
      ├── setup-vps.sh
      ├── deploy.sh
      ├── health-check.sh
      ├── backup.sh
      ├── ssl-renewal-cronjob.sh
      └── ARCHITECTURE_DIAGRAM.md

AFTER DEPLOYMENT (VPS)
──────────────────────
/root/
  dookan/
  ├── backend-afghan-grocery/
  │   ├── dist/  ← Compiled backend
  │   ├── db/
  │   │   └── database.sqlite
  │   ├── uploads/
  │   ├── node_modules/
  │   ├── .env  ← Production config (DO NOT COMMIT)
  │   └── pm2-ecosystem.config.js
  │
  ├── afghan-grocery-vue/
  │   ├── dist/  ← NOT USED (copied elsewhere)
  │   └── node_modules/
  │
  └── hostinger-deployment/  ← Deployment tools
      ├── deploy.sh
      ├── health-check.sh
      ├── backup.sh
      └── ...

/var/www/
  dookan/  ← Web root (Nginx serves from here)
  ├── index.html
  ├── css/
  ├── js/
  ├── images/
  └── ...

/etc/nginx/
  sites-available/
    zmadookan.com  ← Nginx config

/etc/letsencrypt/
  live/
    zmadookan.com/
      ├── fullchain.pem  ← SSL Certificate
      └── privkey.pem    ← SSL Private Key

/root/backups/
  dookan/
    ├── database_TIMESTAMP.sql.gz
    ├── app-code_TIMESTAMP.tar.gz
    ├── uploads_TIMESTAMP.tar.gz
    └── ...
```

---

## 🔄 Daily Operations Cycle

```
┌──────────────────────────┐
│   DAILY OPERATIONS       │
│  ──────────────────────  │
│                          │
│  6:00 AM                 │
│  └─→ System wakes up     │
│                          │
│  00:00 (Midnight)        │
│  └─→ SSL Renewal Check   │
│      (crontab)           │
│                          │
│  2:00 AM                 │
│  └─→ Daily Backup        │
│      (crontab)           │
│                          │
│  3:00 AM                 │
│  └─→ Health Check #1     │
│      (crontab)           │
│                          │
│  9:00 AM                 │
│  └─→ Health Check #2     │
│      (crontab)           │
│                          │
│  3:00 PM                 │
│  └─→ Health Check #3     │
│      (crontab)           │
│                          │
│  9:00 PM                 │
│  └─→ Health Check #4     │
│      (crontab)           │
│                          │
│  11:00 PM                │
│  └─→ Developer deploys   │
│      code (manual)       │
│      $ bash deploy.sh    │
│                          │
└──────────────────────────┘
         ↓
    Services run continuously
    - Nginx handles requests
    - PM2 manages backend
    - Database stays available
    - Logs are recorded
```

---

## 🔐 Security Layers

```
        EXTERNAL (Internet)
                ↓
    ┌───────────────────────┐
    │  Firewall (UFW)       │
    │  Port 22 (SSH)   ✓    │
    │  Port 80  (HTTP) ✓    │
    │  Port 443 (HTTPS) ✓   │
    │  Others         ✗ Block│
    └───────────────────────┘
                ↓
    ┌───────────────────────┐
    │ SSL/TLS Encryption    │
    │ (Let's Encrypt)       │
    │ Certificate Auto-     │
    │ Renews every 90 days  │
    └───────────────────────┘
                ↓
    ┌───────────────────────┐
    │  Nginx                │
    │  - Rate Limiting      │
    │  - Security Headers   │
    │  - Compression        │
    │  - Caching            │
    └───────────────────────┘
                ↓
    ┌───────────────────────┐
    │  Backend API          │
    │  - Port 3000 (internal│
    │  - Not exposed to web │
    │  - JWT Auth           │
    │  - Input Validation   │
    │  - Rate Limiting      │
    └───────────────────────┘
                ↓
    ┌───────────────────────┐
    │  Database             │
    │  - SQLite (local)     │
    │  - No external access │
    │  - Encrypted backup   │
    │  - Regular snapshots  │
    └───────────────────────┘
```

---

## 📊 Monitoring & Automation

```
┌──────────────────────────────────────────┐
│      AUTOMATED MONITORING TASKS           │
├──────────────────────────────────────────┤
│                                          │
│ HEALTH CHECK (every 6 hours)             │
│ ✓ Nginx running                          │
│ ✓ Backend online                         │
│ ✓ Frontend accessible                    │
│ ✓ API responding                         │
│ ✓ SSL certificate valid                  │
│ ✓ Disk space available                   │
│ ✓ Memory not maxed                       │
│                                          │
│ BACKUP (daily at 2 AM)                   │
│ ✓ Database snapshot                      │
│ ✓ Application code                       │
│ ✓ Uploaded files                         │
│ ✓ Configuration files                    │
│ ✓ Old backups deleted (30+ days)         │
│                                          │
│ SSL RENEWAL (daily at midnight)          │
│ ✓ Check certificate expiration           │
│ ✓ Renew if needed (< 30 days)            │
│ ✓ Reload Nginx                           │
│ ✓ Verify renewal success                 │
│                                          │
│ SYSTEM UPDATE (weekly on Sunday)         │
│ ✓ Update package list                    │
│ ✓ Install security patches               │
│ ✓ Auto-restart if needed                 │
│                                          │
└──────────────────────────────────────────┘
       ↓                                    
    Alert on failure:                       
    - Email notification (optional)         
    - Log entry with timestamp              
    - Manual investigation required         
```

---

## 🚀 Scaling Path (Future)

```
Current Setup (Single VPS):
┌─────────────────────┐
│   Single VPS        │
│  - Nginx            │
│  - Node.js          │
│  - SQLite Database  │
│                     │
│  Capacity: ~100-500 │
│  concurrent users   │
└─────────────────────┘

Next Steps (If needed):
1. Add CDN for static assets (Cloudflare)
2. Upgrade to PostgreSQL (for larger DB)
3. Split frontend and backend to separate VPS
4. Add load balancer
5. Add database replication/backup server
6. Add Redis cache layer
7. Add monitoring/logging service (ELK stack)
```

---

## ✅ Verification Checklist

**After each deployment, verify:**

```
Frontend:
  [ ] https://zmadookan.com loads
  [ ] All pages accessible
  [ ] Images display
  [ ] No JavaScript errors
  
Backend API:
  [ ] https://zmadookan.com/api/health → 200
  [ ] /api/products responds
  [ ] /api/auth works
  [ ] Error handling works
  
Services:
  [ ] pm2 status → all online
  [ ] Nginx active
  [ ] SSL valid (green lock)
  [ ] Firewall running
  
Resources:
  [ ] CPU usage < 80%
  [ ] Memory usage < 80%
  [ ] Disk usage < 80%
  [ ] No error logs
```

---

**Diagram Version:** December 2025
**For:** Dookan on Hostinger Ubuntu VPS
**Domain:** zmadookan.com
