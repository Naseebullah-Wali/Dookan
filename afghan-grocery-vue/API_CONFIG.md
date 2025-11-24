# API Configuration Guide

## 📍 Single Point of Configuration

All API endpoints are configured in **ONE FILE**:
```
src/services/api.js
```

## 🔧 How It Works

The app uses environment variables to determine the API URL:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
```

**Priority:**
1. Environment variable `VITE_API_URL` (if set)
2. Fallback to `http://localhost:3001` (local development)

## 🚀 Setup Instructions

### For Local Development:

1. **Create `.env.local` file** in the project root:
   ```bash
   VITE_API_URL=http://localhost:3001
   ```

2. **Start your local backend**:
   ```bash
   npm run server
   ```

3. **Start the frontend**:
   ```bash
   npm run dev
   ```

### For Production (Vercel):

1. **Deploy your backend** to Render/Railway/etc.
   - You'll get a URL like: `https://dookan-api.onrender.com`

2. **Add environment variable in Vercel**:
   - Go to your project settings
   - Click "Environment Variables"
   - Add:
     - **Name**: `VITE_API_URL`
     - **Value**: `https://dookan-api.onrender.com`
   - Click "Save"

3. **Redeploy**:
   - Vercel will automatically redeploy with the new variable
   - OR manually trigger a redeploy

## 📝 Environment Variable Files

### `.env.example` (Template - committed to Git)
```bash
VITE_API_URL=http://localhost:3001
```
This is a template showing what variables are needed.

### `.env.local` (Your local config - NOT in Git)
```bash
VITE_API_URL=http://localhost:3001
```
Create this file locally. It's ignored by Git (for security).

### `.env.production` (Optional)
```bash
VITE_API_URL=https://your-backend.onrender.com
```
Only needed if you want to test production build locally.

## 🌍 Different Environments

### Development (Local)
```bash
# .env.local
VITE_API_URL=http://localhost:3001
```

### Staging (Optional)
```bash
# Vercel Environment Variables
VITE_API_URL=https://dookan-api-staging.onrender.com
```

### Production
```bash
# Vercel Environment Variables
VITE_API_URL=https://dookan-api.onrender.com
```

## ✅ Benefits

1. **Single Source of Truth**: Change API URL in ONE place
2. **Environment Specific**: Different URLs for dev/staging/prod
3. **Secure**: Sensitive URLs not committed to Git
4. **Easy Deployment**: Just set environment variable in Vercel

## 🔍 How to Check Current API URL

Add this to any component to see the current API URL:
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:3001')
```

## 🚨 Important Notes

1. **Restart dev server** after changing `.env.local`
2. **Redeploy** after changing Vercel environment variables
3. **Never commit** `.env.local` to Git
4. **Always use** `VITE_` prefix for Vite environment variables

## 📋 Quick Reference

| Environment | File/Location | URL |
|-------------|---------------|-----|
| Local Dev | `.env.local` | `http://localhost:3001` |
| Vercel Production | Vercel Dashboard | `https://your-backend.onrender.com` |
| Vercel Preview | Vercel Dashboard | `https://your-backend-staging.onrender.com` |

## 🔗 All API Calls Use This Configuration

Every API call in your app automatically uses this configuration:
- `src/stores/auth.js` → Login, Register, Logout
- `src/stores/products.js` → Fetch products, categories
- `src/stores/cart.js` → Cart operations
- `src/stores/wishlist.js` → Wishlist operations
- All other API calls

**You only need to change the URL in ONE place!** ✨
