# Quick Fix: Restart Backend Server

## The Problem
The backend server is running old code and not reflecting the changes made to:
- `src/models/Order.ts` (inline address creation support)
- `src/routes/orderRoutes.ts` (updated validation rules)

## The Solution

### Option 1: Force Restart (Recommended)

1. **Find and kill the backend process:**
```powershell
# Find the process on port 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess

# Kill it (replace XXXX with the process ID from above)
Stop-Process -Id XXXX -Force
```

2. **Navigate to backend directory:**
```powershell
cd "d:\Zendesk\New Apps from Antigravity\backend-afghan-grocery"
```

3. **Start the server:**
```powershell
npm run dev
```

4. **Wait for this output:**
```
✅ Database tables initialized successfully
✅ Database seeded successfully
🚀 Server running on port 3000
```

### Option 2: If You Have the Terminal Open

1. **In the terminal running the backend:**
   - Press `Ctrl+C` to stop the server
   - Wait for it to fully stop

2. **Restart it:**
```powershell
npm run dev
```

## Verify It's Working

Test the backend is responding:
```powershell
curl http://localhost:3000/api/v1/categories -UseBasicParsing
```

You should see JSON with categories data.

## Then Test Checkout

1. Go to http://localhost:5173/checkout
2. Make sure you're logged in (use demo account if needed)
3. Fill the form and click "Place Order"
4. Should redirect to order confirmation page

## If Still Not Working

Check for TypeScript compilation errors:
```powershell
cd "d:\Zendesk\New Apps from Antigravity\backend-afghan-grocery"
npm run build
```

If you see errors, share them and I'll help fix them.
