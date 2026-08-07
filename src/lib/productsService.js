import { supabase } from './supabase.js';

let cachedProducts = null;

// Dynamically discover all images in the public folder at build time
const rawImages = import.meta.glob('../../public/assets/images/**/*.{png,jpg,jpeg,webp,JPG}', { eager: true, import: 'default' });

// Build a structured image manifest: { "ProductName": ["/assets/images/ProductName/1.jpg", ...] }
const imageManifest = {};
Object.keys(rawImages).forEach(path => {
  // path is like '../../public/assets/images/7 Chakra Bracelet/7 Chakra Bracelet 1.webp'
  // Remove '../../public' to get the web-accessible URL
  const webPath = path.replace('../../public', '');
  
  // Extract folder name as the product name identifier
  const parts = path.split('/');
  // Assumes structure: ../../public/assets/images/ProductName/image.jpg
  if (parts.length >= 6) {
    const folderName = parts[parts.length - 2];
    
    // Ignore top-level images or known non-product folders if they aren't product names
    if (folderName !== 'images') {
      if (!imageManifest[folderName]) {
        imageManifest[folderName] = [];
      }
      imageManifest[folderName].push(webPath);
    }
  }
});

// Sort images so primary images (like '... 1.png') come first
Object.values(imageManifest).forEach(images => {
  images.sort((a, b) => a.localeCompare(b));
});

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

function resolveImages(item) {
  const productName = item.name;
  let images = [];
  
  // 1. Try to find images in the manifest matching the product name exactly
  if (productName && imageManifest[productName] && imageManifest[productName].length > 0) {
    images = [...imageManifest[productName]];
  }
  
  // 2. If no exact match, try case-insensitive match
  if (images.length === 0 && productName) {
    const lowerName = productName.toLowerCase();
    const match = Object.keys(imageManifest).find(k => k.toLowerCase() === lowerName);
    if (match) {
      images = [...imageManifest[match]];
    }
  }

  // 3. Fallback to DB images
  if (images.length === 0) {
    if (item.image_url) images.push(item.image_url);
    if (item.gallery_images) {
      if (Array.isArray(item.gallery_images)) {
        images.push(...item.gallery_images);
      } else {
        try {
          const parsed = JSON.parse(item.gallery_images);
          if (Array.isArray(parsed)) images.push(...parsed);
        } catch (e) {
          images.push(item.gallery_images);
        }
      }
    }
  }
  
  return [...new Set(images)];
}

function mergeRow(item) {
  const images = resolveImages(item);
  const image = images.length > 0 ? images[0] : '/assets/images/placeholder.png';

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
