/**
 * Analytics Composable
 * Centralizes tracking for marketing tools (GA4, Meta Pixel, etc.)
 */
export function useAnalytics() {
  const trackPageView = (pageName, path) => {
    // Placeholder for Google Analytics 4
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        page_path: path
      });
    }
    
    // Placeholder for Meta Pixel
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }

    console.log(`[Analytics] Page View: ${pageName} (${path})`);
  };

  const trackProductView = (product) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'view_item', {
        currency: 'EUR',
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.name_en,
          price: product.price
        }]
      });
    }

    console.log(`[Analytics] Product View: ${product.name_en}`);
  };

  const trackAddToCart = (product, quantity = 1) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'add_to_cart', {
        currency: 'EUR',
        value: product.price * quantity,
        items: [{
          item_id: product.id,
          item_name: product.name_en,
          price: product.price,
          quantity: quantity
        }]
      });
    }

    // Meta Pixel AddToCart
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'AddToCart', {
        content_ids: [product.id],
        content_type: 'product',
        value: product.price * quantity,
        currency: 'EUR'
      });
    }

    console.log(`[Analytics] Add to Cart: ${product.name_en} x${quantity}`);
  };

  const trackPurchase = (order) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'purchase', {
        transaction_id: order.id,
        value: order.total,
        currency: 'EUR',
        items: order.items.map(item => ({
          item_id: item.product_id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      });
    }

    console.log(`[Analytics] Purchase: Order #${order.id}`);
  };

  return {
    trackPageView,
    trackProductView,
    trackAddToCart,
    trackPurchase
  };
}
