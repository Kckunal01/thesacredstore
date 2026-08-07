/**
 * Centralized Product Image Resolver
 * 
 * Uses the deterministic manifest (productImageManifest.js) as the single
 * source of truth. Falls back to DB fields only when a product is not in
 * the manifest.
 * 
 * Every product resolves to exactly 3 gallery images when found in the
 * manifest. No filesystem scanning, no duplicate .webp/.jpg pairs.
 */

import { getProductImages } from '../data/productImageManifest';

const DEFAULT_PLACEHOLDER = '/assets/images/placeholder.png';

/**
 * Resolves the product gallery (exactly 3 images when in manifest).
 * @param {Object} item - Product object with at least `name`.
 * @returns {string[]} Array of image URLs.
 */
export function resolveProductImages(item) {
  if (!item) return [DEFAULT_PLACEHOLDER];

  const productName = (item.name || item.title || '').trim();

  // 1. Manifest lookup (preferred — deterministic, exactly 3 images)
  const manifest = getProductImages(productName);
  if (manifest) return [...manifest.gallery];

  // 2. Fallback to DB-provided images
  const images = [];
  if (item.image_url) images.push(item.image_url);
  if (item.imageUrl && item.imageUrl !== item.image_url) images.push(item.imageUrl);

  if (item.gallery_images) {
    if (Array.isArray(item.gallery_images)) {
      images.push(...item.gallery_images);
    } else {
      try {
        const parsed = JSON.parse(item.gallery_images);
        if (Array.isArray(parsed)) images.push(...parsed);
      } catch {
        images.push(item.gallery_images);
      }
    }
  }

  if (item.images && Array.isArray(item.images)) {
    images.push(...item.images);
  }

  const unique = [...new Set(images)];
  return unique.length > 0 ? unique : [DEFAULT_PLACEHOLDER];
}

/**
 * Resolves the single primary/thumbnail image for a product.
 * @param {Object} item - Product object.
 * @returns {string} Primary image URL.
 */
export function resolveProductImage(item) {
  if (!item) return DEFAULT_PLACEHOLDER;

  const productName = (item.name || item.title || '').trim();
  const manifest = getProductImages(productName);
  if (manifest) return manifest.thumbnail;

  const images = resolveProductImages(item);
  return images[0] || DEFAULT_PLACEHOLDER;
}
