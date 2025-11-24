# Deploying Dookan to Vercel

## 📋 Prerequisites
- GitHub repository with your code
- Vercel account (free)

## 🚀 Deployment Steps

### Method 1: Via Vercel Dashboard (Recommended)

1. **Visit Vercel**
   - Go to https://vercel.com
   - Click "Sign Up" or "Login" with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - Authorize Vercel to access your GitHub repositories
   - Find and select your `afghan-grocery-vue` repository

3. **Configure Project**
   Vercel should auto-detect these settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables** (if needed)
   - Click "Environment Variables"
   - Add any API keys or environment-specific variables
   - For this project, you might need:
     ```
     VITE_API_URL=your-backend-url (if you have a separate backend)
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for the build
   - You'll get a URL like: `dookan-xyz.vercel.app`

### Method 2: Via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd d:/Zendesk/New Apps from Antigravity/afghan-grocery-vue
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N** (first time)
   - Project name? **dookan** (or your preferred name)
   - Directory? **./
   - Override settings? **N**

5. **Production Deployment**
   ```bash
   vercel --prod
   ```

## ⚠️ Important Notes

### Backend API Issue
Your app currently uses `json-server` running locally on `http://localhost:3000`. This won't work on Vercel because:
- Vercel hosts static sites (frontend only)
- Your backend (`server/db.json`) needs to be hosted separately

### Solutions:

**Option A: Use a Backend Service**
1. Deploy your backend to:
   - **Render.com** (free tier available)
   - **Railway.app** (free tier available)
   - **Heroku** (paid)
   
2. Update your API URL in `src/services/api.js`:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 'https://your-backend.render.com'
   ```

**Option B: Use a Backend-as-a-Service**
1. Replace `json-server` with:
   - **Supabase** (PostgreSQL + REST API)
   - **Firebase** (Realtime Database)
   - **Appwrite** (Open source BaaS)

**Option C: Deploy Backend Separately**
1. Create a separate repository for your backend
2. Deploy to Render/Railway
3. Update the frontend API URL

## 🔧 Quick Fix for Deployment

To make it work immediately, I recommend:

1. **Deploy Backend to Render.com**:
   - Create account at render.com
   - Create new "Web Service"
   - Connect your GitHub repo
   - Set build command: `npm install -g json-server && json-server --watch server/db.json --port $PORT --host 0.0.0.0`
   - Deploy

2. **Update Frontend**:
   - Add environment variable in Vercel:
     `VITE_API_URL=https://your-backend.onrender.com`

## 📝 Post-Deployment Checklist

- [ ] Test all pages load correctly
- [ ] Test authentication (login/register)
- [ ] Test cart functionality
- [ ] Test wishlist
- [ ] Test checkout flow
- [ ] Test order tracking
- [ ] Verify images load correctly
- [ ] Test on mobile devices
- [ ] Check console for errors

## 🌐 Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Wait for SSL certificate (automatic)

## 🔄 Automatic Deployments

Once connected to GitHub:
- Every push to `main` branch = automatic production deployment
- Every pull request = preview deployment
- Rollback to previous versions anytime

## 📊 Monitoring

Vercel provides:
- Analytics (page views, performance)
- Error tracking
- Build logs
- Deployment history

---

**Need help?** Check Vercel docs: https://vercel.com/docs
