# Google Authentication Setup Guide

## Quick Setup

Follow these steps to enable Google OAuth authentication in your Afghan Grocery application.

## Prerequisites

- Supabase project (must be created)
- Google Cloud Console project
- Admin access to Supabase

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Project name: "Afghan Grocery"

### 1.2 Create OAuth 2.0 Credentials
1. Go to **Credentials** (left menu)
2. Click **Create Credentials → OAuth 2.0 Client ID**
3. Choose **Web application**

### 1.3 Configure OAuth Consent Screen
1. Click **OAuth consent screen** (left menu)
2. Choose **External** user type
3. Fill in required fields:
   - App name: Afghan Grocery
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
4. Click **Save and Continue**
5. Add required scopes (Google will suggest)
6. Save

### 1.4 Set Authorized Redirect URIs

In the OAuth 2.0 Client ID form:

**Redirect URIs:**
```
https://your-project.supabase.co/auth/v1/callback
```

Replace `your-project` with your actual Supabase project name.

Example:
```
https://xyabcdefgh.supabase.co/auth/v1/callback
```

### 1.5 Get Credentials
After creating, you'll see:
- **Client ID**: (save this)
- **Client Secret**: (save this)

## Step 2: Configure Supabase

### 2.1 Go to Supabase Dashboard
1. Open your Supabase project
2. Go to **Authentication → Providers**

### 2.2 Enable Google Provider
1. Find **Google** in the provider list
2. Click to expand
3. Enable the toggle

### 2.3 Add Credentials
1. **Client ID**: Paste the Google Client ID from Step 1.5
2. **Client Secret**: Paste the Google Client Secret from Step 1.5
3. Click **Save**

## Step 3: Configure Application

### 3.1 Environment Variables
Your `.env` file should already have:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

No additional environment variables needed for Google Auth (handled by Supabase).

### 3.2 Verify Files Are Updated
Check these files are modified:
- ✅ `src/services/authService.js` (has `signInWithGoogle()`)
- ✅ `src/stores/auth.js` (has Google auth actions)
- ✅ `src/views/LoginPage.vue` (has Google button)
- ✅ `src/views/RegisterPage.vue` (has Google button)

## Step 4: Test Google Authentication

### 4.1 Start Development Server
```bash
npm run dev
```

### 4.2 Test Sign In
1. Open http://localhost:5173/login
2. Click **"Sign in with Google"** button
3. You should be redirected to Google login
4. Login with your Google account
5. Accept permissions
6. Should redirect back to home page (logged in)

### 4.3 Test Sign Up
1. Open http://localhost:5173/register
2. Click **"Sign up with Google"** button
3. Same process as Sign In
4. New user profile created in Supabase

### 4.4 Verify in Supabase
1. Go to Supabase Dashboard
2. **Authentication → Users**
3. You should see new user with Google account

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution**: Check the redirect URI matches exactly in:
- Google Cloud Console
- Supabase Provider settings

Format must be:
```
https://your-project.supabase.co/auth/v1/callback
```

### Error: "No client configured for provider"
**Solution**: 
1. Go to Supabase → Authentication → Providers
2. Verify Google is enabled
3. Verify Client ID and Secret are filled in

### Redirect to Google not happening
**Solution**:
1. Check browser console for errors
2. Verify Supabase credentials are correct
3. Clear browser cache and try again

### User profile not created
**Solution**:
1. Supabase should auto-create profile via trigger
2. Check `profiles` table in Supabase
3. If not created, check database triggers in SQL editor

## Advanced Configuration

### Custom Redirect URL
To redirect users to a specific page after login:

In `src/views/LoginPage.vue`:
```javascript
async function handleGoogleSignIn() {
  const success = await authStore.signInWithGoogle(
    `${window.location.origin}/shop`  // Redirect to shop page
  )
  // ...
}
```

### Additional Scopes
To request additional permissions from Google:

In `src/services/authService.js`:
```javascript
async signInWithGoogle(options = {}) {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: options.redirectTo || `${window.location.origin}/`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
                // Add custom scopes here if needed
                scope: 'openid email profile'
            }
        }
    })
    // ...
}
```

## Database Trigger (Auto Profile Creation)

Supabase automatically creates user profiles via a trigger. Verify it exists:

1. Go to **SQL Editor** in Supabase
2. Run:
```sql
SELECT * FROM pg_trigger 
WHERE tgname LIKE '%profile%';
```

If trigger doesn't exist, create it:

```sql
-- Create trigger function
CREATE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email, new.raw_user_meta_data->>'picture');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Testing Checklist

- [ ] Google credentials created in Google Cloud Console
- [ ] Redirect URI added to Google Console
- [ ] Google provider enabled in Supabase
- [ ] Client ID and Secret added to Supabase
- [ ] Login page shows Google button
- [ ] Register page shows Google button
- [ ] Click Google button → Redirects to Google login
- [ ] After approval → Returns to app logged in
- [ ] User appears in Supabase Users table
- [ ] Profile created in profiles table

## Localization

The Google button text uses i18n keys:
```javascript
$t('login.signInWithGoogle')  // Login page
$t('login.signUpWithGoogle')  // Register page
```

Add translations to your i18n files:
```javascript
// en.json
{
  "login": {
    "signInWithGoogle": "Sign in with Google",
    "signUpWithGoogle": "Sign up with Google"
  }
}

// Any other language
{
  "login": {
    "signInWithGoogle": "[Translation]",
    "signUpWithGoogle": "[Translation]"
  }
}
```

## Security Notes

1. **Client Secret** - Keep secret, never expose in frontend
   - ✅ Safe: In Supabase (backend)
   - ❌ Don't: In .env file

2. **CORS** - Supabase handles CORS automatically

3. **Tokens** - Supabase manages token refresh automatically

4. **Rate Limiting** - Google OAuth has built-in rate limiting

## Support

For issues:
1. Check browser console for error messages
2. Check Supabase logs: **Dashboard → Logs**
3. Verify Google OAuth credentials
4. Clear browser cookies/cache

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google Provider Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)

---

**✅ Google Authentication is now ready to use!**
