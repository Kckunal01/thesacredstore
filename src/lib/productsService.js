import { supabase } from './supabase.js';
import { resolveProductImages, resolveProductImage } from '../utils/productImageResolver.js';

let cachedProducts = null;

function getChakraColor(chakra) {
  const colors = {
    Root: '#C23B22',
    Heart: '#2ECC71',
    'Third Eye & Crown': '#8E44AD',
    'Third Eye': '#8E44AD',
    Crown: '#8E44AD',
    'Solar Plexus': '#F1C40F',
    Throat: '#3498DB',
    Sacral: '#E67E22',
    All: '#D5D8DC',
  };
  return colors[chakra] || '#D5D8DC';
}

function cleanDbRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.filter(r => r && r.slug).map(r => ({
    ...r,
    image_url: r.image_url && r.image_url.trim() ? r.image_url.trim() : undefined,
  }));
}

function mergeRow(item) {
  const images = resolveProductImages(item);
  const image = resolveProductImage(item);

  return {
    id: item.id,
    db_id: item.id,
    slug: item.slug,
    title: item.name || '',
    name: item.name || '',
    category: item.category || '',
    price: Number(item.price) || 0,
    originalPrice: item.original_price ? Number(item.original_price) : null,
    stamp: item.stamp === 'none' ? null : item.stamp,
    description: item.description || '',
    philosophy: item.philosophy || '',
    details: item.details || '',
    origin: item.origin || '',
    chakra: item.chakra || '',
    chakraColor: getChakraColor(item.chakra || ''),
    effect: item.effect || '',
    usage: item.usage || '',
    stock: item.stock !== undefined ? Number(item.stock) : 10,
    active: item.active !== undefined ? item.active : true,
    featured: item.featured !== undefined ? item.featured : false,
    visible: item.visible !== undefined ? item.visible : true,
    material_integrity: item.material_integrity || '',
    intentions: item.intentions || '',
    dimensions: item.dimensions || '',
    cleansing_charging: item.cleansing_charging || '',
    certification: item.certification || '',
    certification_number: item.certification_number || '',
    images,
    image,
    bundle_products: item.bundle_products || [],
    bundle_product_descriptions: item.bundle_product_descriptions || {},
    bundle_discount_percent: item.bundle_discount_percent || 0,
  };
}

function finalSanitize(arr) {
  return arr.filter(Boolean).filter(p => p.id && p.slug && p.title && p.category && p.price !== undefined);
}

export async function fetchProducts(forceRefetch = false) {
  if (cachedProducts && !forceRefetch) return cachedProducts;

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;

    if (data && data.length > 0) {
      const cleanData = cleanDbRows(data);
      const dbMapped = cleanData.map(mergeRow);
      cachedProducts = finalSanitize(dbMapped);
      return cachedProducts;
    }
    return [];
  } catch (err) {
    console.error('Supabase fetch failed:', err);
    return [];
  }
}

export async function fetchFeaturedProducts(forceRefetch = false) {
  if (cachedProducts && !forceRefetch) return cachedProducts;

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .order('name', { ascending: true });
    if (error) throw error;

    if (data && data.length > 0) {
      const cleanData = cleanDbRows(data);
      const dbMapped = cleanData.map(mergeRow);
      cachedProducts = finalSanitize(dbMapped);
      return cachedProducts;
    }
    return [];
  } catch (err) {
    console.error('Supabase fetch failed (featured):', err);
    return [];
  }
}
