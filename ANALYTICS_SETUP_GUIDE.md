# Dookan Analytics & Marketing Tools Setup Guide

## 📊 Overview

Your site now has **3 powerful FREE analytics tools** integrated:

1. **Google Analytics 4 (GA4)** - Comprehensive user behavior & conversion tracking
2. **Microsoft Clarity** - Session recordings & heatmaps
3. **Hotjar** - Heatmaps, session recordings, user feedback forms

---

## 🎯 Tool Comparison & Setup

### 1. Google Analytics 4 (GA4) ✅ **Already Integrated**

**What it does:**
- User demographics (age, gender, location, device)
- Traffic sources (organic, paid, referral, direct)
- Conversion tracking (purchases, registrations)
- Custom events tracking
- E-commerce analytics (revenue, products, carts)

**Your Setup:**
```
ID: G-KRBD847CXV
Already added to: index.html
```

**Setup Next Steps:**
1. Go to [analytics.google.com](https://analytics.google.com)
2. Sign in with your Google account
3. Create property for zmadookan.com
4. Link your measurement ID (G-KRBD847CXV)

**Key Metrics to Monitor:**
- Traffic by country (identify Vodafone block by region)
- Mobile vs Desktop conversion rates
- Product page bounce rates
- Cart abandonment rate
- User acquisition cost (when you add ads)

**What You Can Sell (GDPR Compliant):**
- **Aggregate demographic data** to suppliers
- **Popular products** list
- **Seasonal trends** in purchasing

---

### 2. Microsoft Clarity ✅ **Already Integrated**

**What it does:**
- **Session recordings** - Watch how users navigate
- **Heatmaps** - See where users click
- **Scroll maps** - How far down pages users scroll
- **All FREE** with unlimited sessions

**Your Setup:**
```
ID: pga78r1n6b
Already added to: index.html
```

**Setup Next Steps:**
1. Go to [clarity.microsoft.com](https://clarity.microsoft.com)
2. Sign in with Microsoft account
3. Add your property
4. Link to measurement ID

**How to Use:**
- Watch recordings of users with Vodafone issues (see why they leave)
- Find broken checkout flows
- See which products customers hover over
- Optimize page layouts based on clicks

---

### 3. Hotjar ✅ **Already Integrated**

**What it does:**
- **Heatmaps** - Visual representation of clicks
- **Session recordings** - Watch entire user journeys
- **Feedback surveys** - Ask customers "Why did you leave?"
- **Free tier:** 35 sessions/month + 1 heatmap

**Your Setup:**
```
ID: 3868506
Already added to: index.html
```

**Setup Next Steps:**
1. Go to [hotjar.com](https://hotjar.com)
2. Sign up (free)
3. Add your site zmadookan.com
4. Link to ID: 3868506
5. **Create feedback forms:**
   - "What prevented you from buying?"
   - "Where are you from?" (to identify Vodafone regions)

**Premium Worth It?** 
- $39/month gives 500+ sessions/month
- Worth it once you have consistent traffic

---

## 📈 Additional FREE Tools (Recommended)

### 4. Google Tag Manager (GTM) - **Setup Guide Below**

**What it does:**
- Track custom events without coding (purchases, wishlist clicks, etc.)
- A/B testing
- Audience building for ads

**Setup:**
1. Create GTM account at [tagmanager.google.com](https://tagmanager.google.com)
2. Create container for Web
3. Add to your `index.html`:
```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

**Ecommerce Events to Track:**
- `view_item` - User viewed product
- `add_to_cart` - Added to cart
- `begin_checkout` - Started purchasing
- `purchase` - Completed order
- `view_item_list` - Viewed category

---

### 5. Facebook Pixel (Meta Business Suite) - For Facebook/Instagram Ads

**What it does:**
- Track conversions for Facebook ads
- Build audience for remarketing
- Free to use

**Placeholder in your HTML:**
```html
<!-- Meta Pixel (Facebook) - Replace XXXXXXXXXXXXXXX with your pixel ID -->
```

**Setup:**
1. Go to [business.facebook.com](https://business.facebook.com)
2. Create pixel
3. Get your Pixel ID
4. Replace `XXXXXXXXXXXXXXX` in index.html

---

### 6. TikTok Pixel - For TikTok Shop & Ads

**What it does:**
- Track TikTok users on your site
- Build audience for TikTok ads
- Great for reaching younger demographic

**Placeholder in your HTML:**
```html
<!-- TikTok Pixel - Replace XXXXXXXXXXXXXXX with your pixel ID -->
```

**Setup:**
1. Go to [ads.tiktok.com](https://ads.tiktok.com)
2. Create business account
3. Create pixel
4. Replace `XXXXXXXXXXXXXXX` in index.html

---

## 🛍️ E-Commerce Tracking (Implementation Guide)

### Track Key Events in Vue

Create a file: `src/services/analyticsService.js`

```javascript
// Track product view
export const trackProductView = (product) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'view_item', {
      items: [{
        item_id: product.id,
        item_name: product.name_en,
        price: product.price,
        item_category: product.category_id
      }]
    });
  }
};

// Track add to cart
export const trackAddToCart = (product, quantity) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'add_to_cart', {
      items: [{
        item_id: product.id,
        item_name: product.name_en,
        price: product.price,
        quantity: quantity
      }]
    });
  }
};

// Track purchase
export const trackPurchase = (order) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'purchase', {
      transaction_id: order.id,
      value: order.total,
      currency: 'EUR',
      items: order.items.map(item => ({
        item_id: item.product_id,
        item_name: item.product_name,
        price: item.price,
        quantity: item.quantity
      }))
    });
  }
};

// Track search
export const trackSearch = (query) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'search', {
      search_term: query
    });
  }
};
```

Then use in your components:
```javascript
import { trackProductView, trackAddToCart } from '@/services/analyticsService';

// In product page mounted hook
trackProductView(this.product);

// In add to cart button click
trackAddToCart(this.product, quantity);
```

---

## 📊 Data You Can Collect (GDPR Compliant)

### What's ALLOWED:
✅ Anonymous aggregated data
✅ Product views & purchases
✅ Device type & OS
✅ Geographic region (country/city)
✅ Traffic source
✅ Behavioral patterns (pages visited, time spent)
✅ Email address (only if user opts-in)

### What's NOT Allowed:
❌ Passwords or payment card data
❌ Personal data without consent
❌ Location without explicit permission
❌ Biometric data

### Marketing Use Cases:
- **Sell reports to suppliers:** "Top 10 trending products in Germany"
- **Geographic insights:** "35% of traffic from UK, 20% from Germany"
- **Seasonal patterns:** "Ramadan products peak March-April"
- **Device insights:** "60% mobile traffic, conversion rate 2.5%"

---

## 🎯 Quick Start Checklist

- [ ] Rebuild frontend: `npm run build` (analytics already in code)
- [ ] Deploy to VPS: `git pull && npm run build && pm2 restart`
- [ ] Verify GA4 tracking in [analytics.google.com](https://analytics.google.com)
- [ ] Verify Clarity in [clarity.microsoft.com](https://clarity.microsoft.com)
- [ ] Verify Hotjar in [hotjar.com](https://hotjar.com)
- [ ] Create Hotjar survey asking "What's your carrier?" (identify Vodafone users)
- [ ] (Optional) Set up Facebook Pixel if running ads
- [ ] (Optional) Set up TikTok Pixel for TikTok ads

---

## 📱 Vodafone Region Tracking

Since Vodafone users can't access your site, use analytics to:

1. **In Hotjar:** Create survey asking "What's your mobile network?"
2. **In GA4:** Set custom dimension for "Network Provider"
3. **In Clarity:** Check if Vodafone users bounce immediately
4. **Result:** Identify if blocks are Vodafone-only or other carriers

---

## 💰 Budget Recommendations

**FREE Setup (Current):**
- Google Analytics 4: Free
- Microsoft Clarity: Free (unlimited)
- Hotjar: Free (35 sessions/month)
- **Total: $0**

**First Growth Upgrade ($50-100/month):**
- Hotjar Pro: $39/month (500+ sessions)
- Google Ads: $50/month (start with search ads)

**Mature Business ($200+/month):**
- Hotjar: $39
- Segment.io: $120 (customer data platform)
- Facebook Ads: $30/day minimum

---

## 🔗 Quick Links

- [Google Analytics](https://analytics.google.com)
- [Microsoft Clarity](https://clarity.microsoft.com)
- [Hotjar](https://hotjar.com)
- [Google Tag Manager](https://tagmanager.google.com)
- [Facebook Business](https://business.facebook.com)
- [TikTok Ads](https://ads.tiktok.com)

---

**Need help implementing tracking events? Let me know!**
