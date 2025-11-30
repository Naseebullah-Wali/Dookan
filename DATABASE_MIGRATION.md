# Database Migration Guide

## Issue: Badges Not Showing

The badge fields (`is_new` and `sale_percentage`) were added to the schema, but your existing database doesn't have these columns.

## Solution: Reset Database

You need to delete and recreate the database to apply the new schema:

### Windows (PowerShell):

```powershell
cd backend-afghan-grocery
Remove-Item database.sqlite -Force
npm run dev
```

### Alternative (if file is locked):

1. Stop the backend server (Ctrl+C)
2. Manually delete `backend-afghan-grocery/database.sqlite`
3. Restart: `npm run dev`

## After Reset

The database will be recreated with:
- ✅ `is_new` field (0 or 1)
- ✅ `sale_percentage` field (0-100)

## Testing Badges

After resetting, you can test badges by updating products:

```sql
-- Add sale badge (20% off)
UPDATE products SET sale_percentage = 20 WHERE id = 1;

-- Add NEW badge
UPDATE products SET is_new = 1 WHERE id = 2;

-- Add both badges
UPDATE products SET sale_percentage = 15, is_new = 1 WHERE id = 3;
```

Then refresh the shop page to see the badges!

## Cart Stock Issue

If you have old cart items without stock info:
1. Clear your cart (click "Clear All" button)
2. Re-add products from the shop

This will ensure all cart items have proper stock tracking.
