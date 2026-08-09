// src/lib/limitedProductsService.js
import { supabase } from './supabase.js';

let cachedLimited = null;

export async function fetchLimitedProducts(collection = null, forceRefetch = false) {
  if (cachedLimited && !forceRefetch && !collection) return cachedLimited;

  try {
    let query = supabase
      .from('limited_products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: true });

    if (collection) {
      query = query.eq('collection', collection);
    }

    const { data, error } = await query;
    if (error) throw error;

    const mapped = (data || []).map(item => ({
      ...item,
      id: item.id,
      db_id: item.id,
      title: item.name,
      price: Number(item.price) || 0,
      originalPrice: item.original_price ? Number(item.original_price) : null,
      image: item.image_url,
      images: item.gallery_images || [],
      isLimited: true,
      category: 'Limited',
    }));

    if (!collection) cachedLimited = mapped;
    return mapped;
  } catch (err) {
    console.error('Failed to fetch limited products:', err);
    return [];
  }
}

export async function fetchLimitedProductBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('limited_products')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      id: data.id,
      db_id: data.id,
      title: data.name,
      price: Number(data.price) || 0,
      originalPrice: data.original_price ? Number(data.original_price) : null,
      image: data.image_url,
      images: data.gallery_images || [],
      isLimited: true,
      category: 'Limited',
    };
  } catch (err) {
    console.error('Failed to fetch limited product by slug:', err);
    return null;
  }
}
