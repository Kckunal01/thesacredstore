/**
 * Safe Meta Pixel (fbq) tracking helper.
 * Uses window.fbq initialized in index.html (Pixel ID: 1063163623070070).
 * All calls are safely guarded so they never throw or break UI/checkout flows.
 */

export function trackPixelEvent(eventName, params = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      if (Object.keys(params).length > 0) {
        window.fbq('track', eventName, params);
      } else {
        window.fbq('track', eventName);
      }
    }
  } catch (err) {
    console.warn('[Meta Pixel] Tracking error (non-fatal):', err);
  }
}

/**
 * Fires ViewContent event when viewing a product.
 * @param {Object} product - Product object
 */
export function trackViewContent(product) {
  if (!product) return;
  const contentId = String(product.id || product.slug || '');
  const contentName = product.name || product.title || '';
  const value = Number(product.price) || 0;

  trackPixelEvent('ViewContent', {
    content_name: contentName,
    content_ids: [contentId],
    content_type: 'product',
    value: value,
    currency: 'INR',
  });
}

/**
 * Fires AddToCart event.
 * @param {Object} product - Product or bundle item being added
 * @param {number} quantity - Quantity added
 */
export function trackAddToCart(product, quantity = 1) {
  if (!product) return;
  const contentId = String(product.id || product.slug || '');
  const contentName = product.name || product.title || '';
  const unitPrice = Number(product.price) || 0;
  const totalValue = unitPrice * (quantity || 1);

  trackPixelEvent('AddToCart', {
    content_name: contentName,
    content_ids: [contentId],
    content_type: 'product',
    value: totalValue,
    currency: 'INR',
  });
}

/**
 * Fires Purchase event after successful order completion.
 * @param {Object} order - { orderId, value, currency, items }
 */
export function trackPurchase({ orderId, value, currency = 'INR', items = [] }) {
  const contentIds = items
    .map((item) => String(item.id || item.slug || ''))
    .filter(Boolean);

  trackPixelEvent('Purchase', {
    content_ids: contentIds,
    content_type: 'product',
    value: Number(value) || 0,
    currency: currency,
    order_id: String(orderId || ''),
    num_items: items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0),
  });
}
