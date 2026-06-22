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
          id: localMatch ? localMatch.id : item.id, // Preserve URL c1, c2, etc if matched
          db_id: item.id, // UUID for database operations
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
          images: images
        };
      });
      return cachedProducts;
    }
  } catch (err) {
    console.error('Supabase fetch failed, falling back to products.js', err);
  }

  // Fallback
  return localProducts.map(p => ({
    ...p,
    db_id: null,
    slug: p.slug || slugify(p.name),
    stock: p.stock !== undefined ? p.stock : 10,
    active: p.active !== undefined ? p.active : true,
  }));
}
