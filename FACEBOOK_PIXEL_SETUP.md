# Facebook Pixel Setup Guide

## ⚠️ Important: Advertising Account ID vs Pixel ID

**You provided:** Advertising Account ID: `1608786526949328`

**What you ACTUALLY need:** Meta/Facebook Pixel ID (different from Advertising Account ID)

### Why they're different:

- **Advertising Account ID** - Used for managing ad campaigns and budgets
- **Pixel ID** - Used for tracking website conversions and user behavior (what we need for your site)

---

## 📝 How to Get Your Pixel ID

### Step 1: Go to Meta Events Manager
1. Go to [business.facebook.com](https://business.facebook.com)
2. Click **"Tools"** → **"Events Manager"**
3. Click **"Connect Data Source"** → **"Web"**

### Step 2: Create/Access Your Pixel
- If you already have a pixel: Select it
- If not: Click **"Create Pixel"** 
  - Name: "Dookan Website"
  - Website URL: `zmadookan.com`

### Step 3: Find Your Pixel ID
- Look for the **Pixel ID** number (e.g., `123456789012345`)
- This is NOT your Advertising Account ID
- They look similar but are different

### Step 4: Copy Your Pixel ID
- Send me your **Pixel ID** (the number they show you)
- I'll integrate it into your site

---

## What We'll Track (with Pixel)

Once integrated, your Pixel will track:
- ✅ Page views
- ✅ Add to cart
- ✅ Begin checkout
- ✅ Purchases
- ✅ User details (email, phone, country)

---

## 🎯 Next Action

**Go to Meta Events Manager and find your Pixel ID, then send it to me!**

The code format we'll use:
```html
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'YOUR_PIXEL_ID_HERE');
  fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID_HERE&ev=PageView&noscript=1" /></noscript>
```

**Once you send me your Pixel ID, I'll integrate it and add conversion tracking for purchases! 🎯**
