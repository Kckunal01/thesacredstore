import { supabase } from './supabase.js';
import { products as localProducts } from '../data/products.js';

let cachedProducts = null;

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^[-]+/g, '')
    .replace(/[-]+$/g, '');
}

function getChakraColor(chakra) {
  const colors = {
    'Root': '#C23B22',
    'Heart': '#2ECC71',
    'Third Eye & Crown': '#8E44AD',
    'Third Eye': '#8E44AD',
    'Crown': '#8E44AD',
    'Solar Plexus': '#F1C40F',
    'Throat': '#3498DB',
    'Sacral': '#E67E22',
    'All': '#D5D8DC'
  };
  return colors[chakra] || '#D5D8DC';
}

export async function fetchProducts(forceRefetch = false) {
  if (cachedProducts && !forceRefetch) {
    return cachedProducts;
  }
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    if (data && data.length > 0) {
      const dbMapped = data.map(item => {
        const localMatch = localProducts.find(lp => {
          const lpSlug = lp.slug || slugify(lp.name);
          return lpSlug === item.slug;
        });
        let images = [];
        if (item.image_url) images.push(item.image_url);
        if (item.gallery_images) {
          if (Array.isArray(item.gallery_images)) {
            images.push(...item.gallery_images);
          } else {
            try {
              const parsed = JSON.parse(item.gallery_images);
              if (Array.isArray(parsed)) {
                images.push(...parsed);
              }
            } catch (e) {
              images.push(item.gallery_images);
            }
          }
        }
        images = [...new Set(images)];
        if (images.length === 0 && localMatch) {
          images = localMatch.images || [];
        }
        return {
          id: localMatch ? localMatch.id : item.id,
          db_id: item.id,
          slug: item.slug,
          name: item.name,
          category: item.category,
          price: Number(item.price),
          originalPrice: item.original_price ? Number(item.original_price) : null,
          stamp: item.stamp === 'none' ? null : item.stamp,
          description: item.description || (localMatch ? localMatch.description : ''),
          philosophy: item.philosophy || (localMatch ? localMatch.philosophy : ''),
          details: item.details || (localMatch ? localMatch.details : ''),
          origin: item.origin || (localMatch ? localMatch.origin : ''),
          chakra: item.chakra || (localMatch ? localMatch.chakra : ''),
          chakraColor: getChakraColor(item.chakra || (localMatch ? localMatch.chakra : '')),
          effect: item.effect || (localMatch ? localMatch.effect : ''),
          usage: item.usage || (localMatch ? localMatch.usage : ''),
          stock: item.stock !== undefined ? Number(item.stock) : 10,
          active: item.active !== undefined ? item.active : true,
          featured: item.featured !== undefined ? item.featured : false,
          visible: item.visible !== undefined ? item.visible : true,
          material_integrity: item.material_integrity || (localMatch ? localMatch.material_integrity : ''),
          intentions: item.intentions || (localMatch ? localMatch.intentions : ''),
          dimensions: item.dimensions || (localMatch ? localMatch.dimensions : ''),
          cleansing_charging: item.cleansing_charging || (localMatch ? localMatch.cleansing_charging : ''),
          certification: item.certification || (localMatch ? localMatch.certification : ''),
          certification_number: item.certification_number || (localMatch ? localMatch.certification_number : ''),
          images: images,
          // Bundle-specific fields (null/empty for regular products)
          bundle_products: item.bundle_products || [],
          bundle_product_descriptions: item.bundle_product_descriptions || {},
          bundle_discount_percent: item.bundle_discount_percent || 0,
        };
      });
      // Merge: DB products + any local-only products not yet in DB
      const dbSlugs = new Set(dbMapped.map(p => p.slug));
      const localOnly = localProducts
        .filter(lp => {
          const s = lp.slug || slugify(lp.name);
          return !dbSlugs.has(s);
        })
        .map(lp => ({ ...lp, db_id: null, slug: lp.slug || slugify(lp.name), visible: true, active: true, featured: lp.featured || false }));
      cachedProducts = [...dbMapped, ...localOnly];
      return cachedProducts;
    }
    // Supabase returned 0 rows — fall back to local
    console.warn('Supabase returned 0 products. Using local product data.');
    cachedProducts = localProducts.map(lp => ({
      ...lp,
      db_id: null,
      slug: lp.slug || slugify(lp.name),
      visible: true,
      active: true,
      featured: lp.featured || false,
      stock: lp.stock !== undefined ? lp.stock : 10,
      bundle_products: [],
      bundle_product_descriptions: {},
      bundle_discount_percent: 0,
    }));
    return cachedProducts;
  } catch (err) {
    console.error('Supabase fetch failed, using local fallback:', err);
    cachedProducts = localProducts.map(lp => ({
      ...lp,
      db_id: null,
      slug: lp.slug || slugify(lp.name),
      visible: true,
      active: true,
      featured: lp.featured || false,
      stock: lp.stock !== undefined ? lp.stock : 10,
      bundle_products: [],
      bundle_product_descriptions: {},
      bundle_discount_percent: 0,
    }));
    return cachedProducts;
  }
}

// New function to fetch only featured products for customer pages
export async function fetchFeaturedProducts(forceRefetch = false) {
  if (cachedProducts && !forceRefetch) {
    return cachedProducts;
  }
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .order('name', { ascending: true });
    if (error) throw error;
    if (data && data.length > 0) {
      cachedProducts = data.map(item => {
        const localMatch = localProducts.find(lp => {
          const lpSlug = lp.slug || slugify(lp.name);
          return lpSlug === item.slug;
        });
        let images = [];
        if (item.image_url) images.push(item.image_url);
        if (item.gallery_images) {
          if (Array.isArray(item.gallery_images)) {
            images.push(...item.gallery_images);
          } else {
            try {
              const parsed = JSON.parse(item.gallery_images);
              if (Array.isArray(parsed)) {
                images.push(...parsed);
              }
            } catch (e) {
              images.push(item.gallery_images);
            }
          }
        }
        images = [...new Set(images)];
        if (images.length === 0 && localMatch) {
          images = localMatch.images || [];
        }
        return {
          id: localMatch ? localMatch.id : item.id,
          db_id: item.id,
          slug: item.slug,
          name: item.name,
          category: item.category,
          price: Number(item.price),
          originalPrice: item.original_price ? Number(item.original_price) : null,
          stamp: item.stamp === 'none' ? null : item.stamp,
          description: item.description || (localMatch ? localMatch.description : ''),
          philosophy: item.philosophy || (localMatch ? localMatch.philosophy : ''),
          details: item.details || (localMatch ? localMatch.details : ''),
          origin: item.origin || (localMatch ? localMatch.origin : ''),
          chakra: item.chakra || (localMatch ? localMatch.chakra : ''),
          chakraColor: getChakraColor(item.chakra || (localMatch ? localMatch.chakra : '')),
          effect: item.effect || (localMatch ? localMatch.effect : ''),
          usage: item.usage || (localMatch ? localMatch.usage : ''),
          stock: item.stock !== undefined ? Number(item.stock) : 10,
          active: item.active !== undefined ? item.active : true,
          featured: item.featured !== undefined ? item.featured : false,
          visible: item.visible !== undefined ? item.visible : true,
          material_integrity: item.material_integrity || (localMatch ? localMatch.material_integrity : ''),
          intentions: item.intentions || (localMatch ? localMatch.intentions : ''),
          dimensions: item.dimensions || (localMatch ? localMatch.dimensions : ''),
          cleansing_charging: item.cleansing_charging || (localMatch ? localMatch.cleansing_charging : ''),
          certification: item.certification || (localMatch ? localMatch.certification : ''),
          certification_number: item.certification_number || (localMatch ? localMatch.certification_number : ''),
          images: images,
          bundle_products: item.bundle_products || [],
          bundle_product_descriptions: item.bundle_product_descriptions || {},
          bundle_discount_percent: item.bundle_discount_percent || 0,
        };
      });
      return cachedProducts;
    }
  } catch (err) {
    console.error('Supabase fetch failed (featured):', err);
    return [];
  }
}
