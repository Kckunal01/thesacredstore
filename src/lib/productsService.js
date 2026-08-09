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

// ── Temporary Rakhi products (frontend-only, will be replaced by DB rows) ──
const temporaryRakhiProducts = [
  {
    id: 'rakhi-nazar',
    db_id: 'rakhi-nazar',
    slug: 'rakhi-nazar',
    title: 'Nazar — The Rakhi of Protection',
    name: 'Nazar — The Rakhi of Protection',
    category: 'Limited',
    collection: "Rakhi'26",
    price: 599,
    originalPrice: null,
    stamp: 'Fresh',
    description: 'A rakhi made for the bond that quietly protects. Black Tourmaline is paired with the Evil Eye charm as a symbol of grounding, protection and keeping negative energy at a distance.',
    crystal_constituents: 'Black Tourmaline',
    charm: 'Evil Eye',
    feeling: 'Protected, grounded and watched over.',
    reason_to_gift: 'For the sibling you instinctively want to protect — a reminder that your bond carries strength even when you are apart.',
    crystal_charm_qualities: 'Black Tourmaline — grounding, protective and traditionally associated with shielding from unwanted energy.\nEvil Eye — a timeless protective symbol traditionally worn to guard against the evil eye and negative intentions.',
    stock: 10,
    active: true,
    featured: false,
    visible: true,
    images: resolveProductImages({ name: 'Nazar — The Rakhi of Protection' }),
    image: resolveProductImage({ name: 'Nazar — The Rakhi of Protection' }),
  },
  {
    id: 'rakhi-saanjh',
    db_id: 'rakhi-saanjh',
    slug: 'rakhi-saanjh',
    title: 'Saanjh — The Rakhi of Affection',
    name: 'Saanjh — The Rakhi of Affection',
    category: 'Limited',
    collection: "Rakhi'26",
    price: 599,
    originalPrice: null,
    stamp: 'Fresh',
    description: 'A balance of protection and affection. Black Tourmaline brings grounding while Rose Quartz represents warmth, tenderness and the quiet love between siblings.',
    crystal_constituents: 'Black Tourmaline + Rose Quartz',
    charm: 'Evil Eye',
    feeling: 'Loved, safe and deeply connected.',
    reason_to_gift: 'For the sibling whose presence has always felt like home — a rakhi that carries both affection and protection.',
    crystal_charm_qualities: 'Black Tourmaline — grounding and traditionally associated with protection.\nRose Quartz — associated with love, tenderness, compassion and emotional warmth.\nEvil Eye — a timeless protective symbol representing watchfulness and protection.',
    stock: 10,
    active: true,
    featured: false,
    visible: true,
    images: resolveProductImages({ name: 'Saanjh — The Rakhi of Affection' }),
    image: resolveProductImage({ name: 'Saanjh — The Rakhi of Affection' }),
  },
  {
    id: 'rakhi-ananta',
    db_id: 'rakhi-ananta',
    slug: 'rakhi-ananta',
    title: 'Ananta — The Rakhi of Forever',
    name: 'Ananta — The Rakhi of Forever',
    category: 'Limited',
    collection: "Rakhi'26",
    price: 599,
    originalPrice: null,
    stamp: 'Fresh',
    description: 'A rakhi for a bond that keeps evolving without ever disappearing. Rose Quartz brings the language of love, while Clear Quartz represents clarity and intention.',
    crystal_constituents: 'Rose Quartz + Clear Quartz',
    charm: 'Infinity Loop',
    feeling: 'Enduring, pure and connected.',
    reason_to_gift: 'For the sibling bond that has grown through every chapter of life and still feels unchanged at its core.',
    crystal_charm_qualities: 'Rose Quartz — associated with love, tenderness and emotional connection.\nClear Quartz — traditionally associated with clarity, intention and amplification.\nInfinity Loop — represents continuity, eternity and a bond without an end.',
    stock: 10,
    active: true,
    featured: false,
    visible: true,
    images: resolveProductImages({ name: 'Ananta — The Rakhi of Forever' }),
    image: resolveProductImage({ name: 'Ananta — The Rakhi of Forever' }),
  },
  {
    id: 'rakhi-vriddhi',
    db_id: 'rakhi-vriddhi',
    slug: 'rakhi-vriddhi',
    title: 'Vriddhi — The Rakhi of Growth',
    name: 'Vriddhi — The Rakhi of Growth',
    category: 'Limited',
    collection: "Rakhi'26",
    price: 599,
    originalPrice: null,
    stamp: 'Fresh',
    description: 'A rakhi celebrating a relationship that grows with you. Rose Quartz represents the affection that holds the bond together, while Green Aventurine reflects growth, optimism and new beginnings.',
    crystal_constituents: 'Rose Quartz + Green Aventurine',
    charm: 'Infinity Loop',
    feeling: 'Hopeful, warm and growing together.',
    reason_to_gift: 'For the sibling whose journey you want to keep witnessing — through every new beginning, achievement and chapter ahead.',
    crystal_charm_qualities: 'Rose Quartz — associated with love, tenderness and emotional warmth.\nGreen Aventurine — traditionally associated with growth, optimism, opportunity and fresh beginnings.\nInfinity Loop — represents continuity, eternity and a bond that keeps going.',
    stock: 10,
    active: true,
    featured: false,
    visible: true,
    images: resolveProductImages({ name: 'Vriddhi — The Rakhi of Growth' }),
    image: resolveProductImage({ name: 'Vriddhi — The Rakhi of Growth' }),
  },
];

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
      const mergedProducts = finalSanitize(dbMapped);

      const dbLimited = mergedProducts.filter(p => p.category === 'Limited');
      const finalRakhi = temporaryRakhiProducts.map(temp => {
        const dbProd = dbLimited.find(dp => dp.slug === temp.slug);
        if (dbProd) {
          // Map DB fields back to the specific Rakhi names for the UI
          return {
            ...dbProd,
            collection: "Rakhi'26",
            feeling: dbProd.philosophy,
            reason_to_gift: dbProd.usage,
            crystal_constituents: dbProd.details,
            charm: dbProd.origin,
            crystal_charm_qualities: dbProd.effect
          };
        }
        return temp;
      });

      const finalMerged = mergedProducts.filter(p => p.category !== 'Limited');
      cachedProducts = [...finalMerged, ...finalRakhi];
      return cachedProducts;
    }
    return [...temporaryRakhiProducts];
  } catch (err) {
    console.error('Supabase fetch failed:', err);
    return [...temporaryRakhiProducts];
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
