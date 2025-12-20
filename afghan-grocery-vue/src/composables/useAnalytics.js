/**
 * Analytics Composable
 * Centralizes tracking for marketing tools (GA4, Meta Pixel, etc.)
 */
import { useCurrencyStore } from '@/stores/currency'

export function useAnalytics() {
  const currencyStore = useCurrencyStore()

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

  };

  const trackProductView = (product) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'view_item', {
        currency: currencyStore.currentCurrency,
        value: currencyStore.convert(product.price),
        items: [{
          item_id: product.id,
          item_name: product.name_en,
          price: currencyStore.convert(product.price)
        }]
      });
    }

  };

  const trackAddToCart = (product, quantity = 1) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'add_to_cart', {
        currency: currencyStore.currentCurrency,
        value: currencyStore.convert(product.price * quantity),
        items: [{
          item_id: product.id,
          item_name: product.name_en,
          price: currencyStore.convert(product.price),
          quantity: quantity
        }]
      });
    }

    // Meta Pixel AddToCart
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'AddToCart', {
        content_ids: [product.id],
        content_type: 'product',
        value: currencyStore.convert(product.price * quantity),
        currency: currencyStore.currentCurrency
      });
    }

  };

  const trackPurchase = (order) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'purchase', {
        transaction_id: order.id,
        value: currencyStore.convert(order.total),
        currency: currencyStore.currentCurrency,
        items: order.items.map(item => ({
          item_id: item.product_id,
          item_name: item.name,
          price: currencyStore.convert(item.price),
          quantity: item.quantity
        }))
      });
    }

  };

  return {
    trackPageView,
    trackProductView,
    trackAddToCart,
    trackPurchase
  };
}
