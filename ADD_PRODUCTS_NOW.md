# 🛒 Quick Fix: Add Missing Products

Your Supabase database only has **4 products** but the seed file has **27 products**!

## ✅ Follow These Steps to Add Products

### Step 1: Get the Seed SQL
1. Open this file in VS Code: **`supabase-seed.sql`**
2. Select all the code: **Ctrl+A**
3. Copy it: **Ctrl+C**

### Step 2: Run in Supabase
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click the **"+"** button to create a new query
5. Paste the code: **Ctrl+V**
6. Click **"Run"** button

### Step 3: Verify Success
You should see:
```
Success
Rows affected: 8 (categories)
Rows affected: 27 (products)
Rows affected: 3 (coupons)
```

### Step 4: Refresh Your Shop
1. Go back to the app
2. Go to the **Shop** page
3. You should now see **27 products** instead of 4!

## ✨ What You'll Get
- ✅ 27 different products across 8 categories
- ✅ Products with ratings, reviews, and stock levels
- ✅ Multi-language support (English, German, French, Pashto, Farsi)
- ✅ Proper pagination (12 products per page = 3 pages)

---

**Need help?** If you get an error, copy the exact error message and let me know!
