export const BUNDLE_DEFAULTS = {
  'protection-bundle': {
    id: 'bndl_protection',
    slug: 'protection-bundle',
    name: 'Protection Bundle',
    description: 'A powerful shield combination to ground scattered energy and block heavy external frequencies.',
    benefits: [
      'Creates an impenetrable energetic shield around your home or workspace',
      'Grounds frantic, overactive thoughts into steady, earth-aligned focus',
      'Purifies and maintains the integrity of surrounding energy fields'
    ],
    imageUrl: '/assets/images/Black Tourmaline Raw/Black Tourmaline Raw 1.webp', // Reuse existing image
    productNames: ['Black Tourmaline Raw', "Tiger's Eye", 'Selenite Charging Plate']
  },
  'abundance-bundle': {
    id: 'bndl_abundance',
    slug: 'abundance-bundle',
    name: 'Abundance Bundle',
    description: 'Thoughtfully paired crystals to cultivate solar plexus willpower, opportunity, and structured discipline.',
    benefits: [
      'Aligns environmental and personal conditions to welcome new opportunities',
      'Magnifies willpower and decisive actions needed for manifestation',
      'Blocks self-limiting beliefs and professional fatigue'
    ],
    imageUrl: '/assets/images/Citrine Point/Citrine Point 1.webp', // Reuse existing image
    productNames: ['Citrine Point', 'Green Aventurine', 'Pyrite']
  },
  'inner-peace-bundle': {
    id: 'bndl_inner_peace',
    slug: 'inner-peace-bundle',
    name: 'Inner Peace Bundle',
    description: 'A soothing combination of heart‑opening and crown‑centering stones to quiet mental chatter and encourage radical calm.',
    benefits: [
      'Deeply calms an overactive mind and reduces stress-induced static',
      'Fosters self-acceptance and emotional healing at the heart center',
      'Provides a dedicated vessel to reset and purify personal intentions'
    ],
    imageUrl: '/assets/images/Amethyst Cluster/Amethyst Cluster 1.webp', // Reuse existing image
    productNames: ['Amethyst Cluster', 'Rose Quartz Cluster', 'Selenite Charging Bowl']
  }
};

export const bundles = Object.values(BUNDLE_DEFAULTS);

export const getDynamicBundles = (allProducts) => {
  if (!allProducts || allProducts.length === 0) {
    return bundles;
  }
  
  // Find products with category 'Bundles'
  const dbBundles = allProducts.filter(p => p.category === 'Bundles');
  
  if (dbBundles.length === 0) {
    return bundles;
  }
  
  return dbBundles.map(p => {
    const defaults = BUNDLE_DEFAULTS[p.slug] || { benefits: [], productNames: [] };
    return {
      id: p.id || defaults.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      imageUrl: p.image_url || p.images?.[0] || defaults.imageUrl,
      active: p.active !== false,
      featured: !!p.featured,
      price: p.price,
      originalPrice: p.original_price,
      benefits: defaults.benefits,
      productNames: defaults.productNames
    };
  });
};

