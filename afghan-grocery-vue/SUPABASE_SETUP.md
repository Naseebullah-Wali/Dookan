# 🚀 Supabase Database Setup Guide

## Step 1: Execute Schema SQL

1. **Open Supabase SQL Editor**:
   - Go to: https://supabase.com/dashboard/project/vmkicfgzgwdfpdnisarn/sql/new
   - Or click "SQL Editor" in your Supabase dashboard sidebar

2. **Copy the Schema**:
   - Open the file: `supabase-schema.sql`
   - Copy ALL contents (Ctrl+A, Ctrl+C)

3. **Paste and Run**:
   - Paste into the SQL Editor
   - Click **"Run"** button (or press Ctrl+Enter)
   - Wait for completion (should take 5-10 seconds)
   - You should see "Success. No rows returned"

## Step 2: Insert Demo Data

1. **Open a New Query**:
   - Click the "+" button to create a new query in SQL Editor

2. **Copy the Seed Data**:
   - Open the file: `supabase-seed.sql`
   - Copy ALL contents (Ctrl+A, Ctrl+C)

3. **Paste and Run**:
   - Paste into the SQL Editor
   - Click **"Run"** button
   - Wait for completion
   - You should see success messages

## Step 3: Verify the Setup

1. **Check Tables**:
   - Go to: https://supabase.com/dashboard/project/vmkicfgzgwdfpdnisarn/editor
   - You should see these tables:
     - ✅ profiles
     - ✅ categories (with 8 categories)
     - ✅ products (with 27 products)
     - ✅ addresses
     - ✅ orders
     - ✅ order_items
     - ✅ product_reviews
     - ✅ wishlists
     - ✅ cart_items
     - ✅ coupons (with 3 coupons)

2. **View Demo Data**:
   - Click on "categories" table
   - You should see 8 categories (Fresh Produce, Dairy & Eggs, etc.)
   - Click on "products" table
   - You should see 27 products with multilingual names

## What's Included

### 📊 Database Schema

- **10 Tables** with full e-commerce functionality
- **Multilingual Support** (English, German, French, Pashto, Dari/Farsi)
- **Row Level Security (RLS)** for data protection
- **Automated Triggers** for ratings, order numbers, timestamps

### 🛍️ Demo Data

- **8 Categories**: Fresh Produce, Dairy & Eggs, Meat & Seafood, Bakery, Pantry Staples, Beverages, Snacks, Frozen Foods
- **27 Products**: Each with multilingual names, descriptions, images, pricing
- **3 Coupons**: WELCOME10, SAVE5, FREESHIP

### 🔐 Security Features

- Public can view products and categories
- Users can manage their own cart, wishlist, addresses, orders
- Only admins can manage products, categories, and coupons
- Reviews are public but users can only edit their own

## Next Steps

Once you've completed the database setup, I'll:
1. ✅ Configure the Vue app to connect to Supabase
2. ✅ Migrate all services to use Supabase
3. ✅ Test the application with the demo data

**Let me know when you've completed Steps 1 & 2!** 🎉
