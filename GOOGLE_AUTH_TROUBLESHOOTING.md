# Google OAuth - "Unsupported Provider" Error Fix

## Problem
When clicking the Google sign-in/sign-up button, you get:
```
{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
```

## Solution
This error means **Google OAuth provider is not enabled in Supabase**.

### Quick Fix: Enable Google in Supabase

**Follow these exact steps:**

1. **Go to Supabase Dashboard**
   - https://app.supabase.com
   - Select your project

2. **Navigate to Authentication**
   - Left sidebar → **Authentication**

3. **Find Providers**
   - Click **Providers** in the left submenu

4. **Enable Google Provider**
   - Find **Google** in the list
   - Click to expand it
   - Look for the **Enable** toggle (should be OFF)
   - Click the toggle to turn it ON

5. **Important: Add Your Google Credentials**
   - You need a **Client ID** from Google Cloud
   - You need a **Client Secret** from Google Cloud
   - See section below for how to get these

6. **Save**
   - After filling in credentials, click **Save** button

---

## Getting Google Credentials

If you don't have Google OAuth credentials, follow these steps:

### Step 1: Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Create a new project or select existing one
- Project name: "Afghan Grocery" (or your app name)

### Step 2: Create OAuth 2.0 Credentials
1. Left sidebar → **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Choose **Web Application**
4. Name it "Afghan Grocery App"

### Step 3: Configure Redirect URIs
In the OAuth 2.0 Client ID form, add this redirect URI:
```
https://your-project.supabase.co/auth/v1/callback
```

**Replace `your-project` with your actual Supabase project name:**
- Example: `https://xyabcdefgh.supabase.co/auth/v1/callback`
- You can find your project URL in Supabase Dashboard → Home → Copy your URL

### Step 4: Get Your Credentials
After creating, you'll see:
- **Client ID**: Copy this
- **Client Secret**: Copy this

### Step 5: Add to Supabase
1. Go back to Supabase Dashboard
2. Authentication → Providers → Google
3. Paste:
   - **Client ID** field: Paste your Client ID
   - **Client Secret** field: Paste your Client Secret
4. Click **Save**

---

## Verify It's Working

### Test in Browser

1. **Go to login page**
   - http://localhost:5173/login
   - (or your production URL)

2. **Click Google button**
   - Button should say "Sign in with Google"
   - Should have Google logo

3. **You should be redirected to Google login**
   - If you get the error, Google is still not enabled
   - Check that you completed all steps above

4. **After Google approval**
   - Should redirect back to your app
   - You should be logged in

---

## Troubleshooting

### Still Getting "Unsupported Provider" Error?

**Check 1: Is Google Enabled?**
```
1. Supabase Dashboard → Authentication → Providers
2. Look for Google
3. Verify the toggle is ON (blue)
4. If OFF (gray), click it to turn ON
```

**Check 2: Are Credentials Filled In?**
```
1. Same location: Authentication → Providers → Google
2. Verify Client ID field is NOT empty
3. Verify Client Secret field is NOT empty
4. If empty, paste them from Google Cloud Console
5. Click Save button
```

**Check 3: Did You Save?**
```
1. After adding credentials
2. MUST click Save button
3. Wait for success message
4. Then test again in browser
```

**Check 4: Is Redirect URI Correct?**
```
1. Google Cloud Console → APIs & Services → Credentials
2. Find your OAuth 2.0 Client ID
3. Edit it
4. Check Redirect URIs section
5. Should include: https://your-project.supabase.co/auth/v1/callback
6. If missing, add it and save
```

**Check 5: Clear Browser Cache**
```
1. Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
2. Or clear browser cache
3. Try again
```

---

## Before and After

### Before (Google Not Enabled)
❌ Click Google button → Error message  
❌ "Unsupported provider" error  
❌ Can only login with email/password  

### After (Google Enabled)
✅ Click Google button → Redirects to Google  
✅ Login successful  
✅ Profile automatically created  
✅ Users can sign in with Google  

---

## Security Notes

**Protect Your Google Secret:**
- ✅ Safe: In Supabase (backend)
- ❌ Never: In .env file
- ❌ Never: In frontend code
- ❌ Never: In version control

Supabase handles all security automatically.

---

## Production Deployment

### Before Going Live

1. **Test Locally First**
   - Test Google Auth locally
   - Make sure it works

2. **Deploy to Production**
   - `npm run build`
   - Deploy build to your server

3. **Test in Production**
   - Visit your production URL
   - Test Google Auth again
   - May need different redirect URI if domain changes

4. **Update Google Console (if needed)**
   - If production domain is different
   - Add new redirect URI to Google Cloud Console
   - Example: `https://yourdomain.com/auth/v1/callback`

---

## Localization

Google button text is automatically translated:
- **English**: "Sign in with Google"
- **German**: "Mit Google anmelden"
- **French**: "Se connecter avec Google"
- **Dari/Farsi**: "ورود با Google"
- **Pashto**: "Google سره ننوځئ"

No additional configuration needed!

---

## Additional Resources

- [Supabase Google OAuth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Flow](https://developers.google.com/identity/protocols/oauth2)

---

**✅ Once Google is enabled in Supabase, everything should work!**

Still having issues? Double-check:
1. Google provider is ON in Supabase
2. Client ID is filled in
3. Client Secret is filled in
4. Save button was clicked
5. Redirect URI is correct
