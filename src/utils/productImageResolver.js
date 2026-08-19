/**
 * Centralized Product Image Resolver
 * 
 * Priority:
 * 1. DB fields (image_url, gallery_images, images) — actual uploaded/stored data
 * 2. Manifest lookup by name (legacy filesystem images)
 * 3. Placeholder fallback
 * 
 * NOTE: Slug-based convention (/product-images/{slug}/N.webp) is NOT used
 * because that directory does not exist. All real images are either:
 *   - Supabase Storage URLs (https://...)
 *   - Local manifest paths (/assets/images/...)
 */

import { getProductImages } from '../data/productImageManifest';

const DEFAULT_PLACEHOLDER = '/assets/images/placeholder.png';

/**
 * Resolves the product gallery images.
 * @param {Object} item - Product object with at least `name` or DB image fields.
 * @returns {string[]} Array of image URLs.
 */
export function resolveProductImages(item) {
  if (!item) return [DEFAULT_PLACEHOLDER];

  // 1. DB-provided images (highest priority — these are real uploaded URLs)
  const dbImages = [];
  if (item.image_url && typeof item.image_url === 'string' && item.image_url.trim()) {
    dbImages.push(item.image_url.trim());
  }
  if (item.imageUrl && item.imageUrl !== item.image_url) {
    dbImages.push(item.imageUrl);
  }

  if (item.gallery_images) {
    if (Array.isArray(item.gallery_images)) {
      item.gallery_images.forEach(img => {
        if (img && typeof img === 'string' && img.trim()) dbImages.push(img.trim());
      });
    } else if (typeof item.gallery_images === 'string') {
      try {
        const parsed = JSON.parse(item.gallery_images);
        if (Array.isArray(parsed)) {
          parsed.forEach(img => {
            if (img && typeof img === 'string' && img.trim()) dbImages.push(img.trim());
          });
        }
      } catch {
        if (item.gallery_images.trim()) dbImages.push(item.gallery_images.trim());
      }
    }
  }

  if (item.images && Array.isArray(item.images)) {
    item.images.forEach(img => {
      if (img && typeof img === 'string' && img.trim()) dbImages.push(img.trim());
    });
  }

  const uniqueDb = [...new Set(dbImages)];
  if (uniqueDb.length > 0) return uniqueDb;

  // 2. Manifest lookup by name (legacy — /assets/images/ filesystem)
  const productName = (item.name || item.title || '').trim();
  const manifest = getProductImages(productName);
  if (manifest) return [...manifest.gallery];

  // 3. Placeholder fallback
  return [DEFAULT_PLACEHOLDER];
}

/**
 * Resolves the single primary/thumbnail image for a product.
 * @param {Object} item - Product object.
 * @returns {string} Primary image URL.
 */
export function resolveProductImage(item) {
  if (!item) return DEFAULT_PLACEHOLDER;

  // 1. DB image_url
  if (item.image_url && typeof item.image_url === 'string' && item.image_url.trim()) {
    return item.image_url.trim();
  }

  // 2. Manifest
  const productName = (item.name || item.title || '').trim();
  const manifest = getProductImages(productName);
  if (manifest) return manifest.thumbnail;

  // 3. Fallback through full resolver
  const images = resolveProductImages(item);
  return images[0] || DEFAULT_PLACEHOLDER;
}
