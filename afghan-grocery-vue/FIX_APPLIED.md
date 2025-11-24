# Fix Applied: Vite Crypto Error

## Problem
The application was encountering a `crypto.getRandomValues is not a function` error when starting the Vite dev server. This is a known compatibility issue with Vite 5.x and certain Node.js versions.

## Solution Applied

1. **Downgraded Vite** from v5.0.0 to v4.5.0
2. **Downgraded @vitejs/plugin-vue** from v5.0.0 to v4.5.0
3. **Cleaned and reinstalled** node_modules

## Changes Made

**package.json:**
```json
"devDependencies": {
  "@vitejs/plugin-vue": "^4.5.0",  // Was: ^5.0.0
  "vite": "^4.5.0",                 // Was: ^5.0.0
  ...
}
```

## Running the Application

The dev server should now be running. If not, start it with:

```bash
npm run dev
```

Then open: **http://localhost:5173**

## Starting JSON Server (Backend)

In a **second terminal**, run:

```bash
npm run server
```

This starts the API at: **http://localhost:3001**

## Demo Login

- Email: demo@afghangrocery.com
- Password: demo123

## If You Still Have Issues

If the error persists:

1. Check your Node.js version:
   ```bash
   node --version
   ```
   Recommended: Node.js 18.x or 20.x

2. Try clearing Vite cache:
   ```bash
   Remove-Item -Recurse -Force node_modules/.vite
   ```

3. Restart the dev server

The application should now work correctly!
