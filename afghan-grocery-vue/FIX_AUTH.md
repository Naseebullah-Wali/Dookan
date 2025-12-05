# 🔧 Fix Authentication - Execute This SQL

## Problem
User registration creates an auth user but doesn't automatically create a profile entry, causing login issues.

## Solution
Execute this SQL in your Supabase SQL Editor to create an automatic trigger.

## Steps

1. **Go to Supabase SQL Editor**
   - https://supabase.com/dashboard/project/vmkicfgzgwdfpdnisarn/sql/new

2. **Copy and paste this SQL:**

```sql
-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'phone',
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

3. **Click "Run"**

4. **Verify it worked:**
   - You should see "Success. No rows returned"

## What This Does

- **Automatically creates a profile** whenever a new user registers
- **Extracts name and phone** from the signup metadata
- **Sets role to 'customer'** by default
- **Prevents duplicate profile errors**

## After Running This

1. Try registering a new user
2. You should be logged in immediately
3. Your profile should be created automatically

## Troubleshooting

If you still have issues:
- Check the browser console for errors
- Make sure email confirmation is disabled in Supabase Auth settings
- Try with a completely new email address
