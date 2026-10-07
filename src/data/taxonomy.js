export const CANONICAL_TAXONOMY = [
  {
    name: 'Accessories',
    subcategories: ['Bracelets', 'Pendants', 'Malas', 'Jube Coin'],
  },
  {
    name: 'Tumbles',
    subcategories: [],
  },
  {
    name: 'Household',
    subcategories: ['Trees', 'Pyramids', 'Lamps'],
  },
  {
    name: 'Variety Crystals',
    subcategories: ['Clusters', 'Spheres', 'Points'],
  },
  {
    name: 'Cleaning / Charging',
    subcategories: [],
  },
];

export const taxonomy = {
  categories: CANONICAL_TAXONOMY.map(c => ({
    name: c.name,
    subcategories: c.subcategories,
  })),
};

export const getAllCategories = () => {
  return CANONICAL_TAXONOMY.map(c => c.name);
};

export const getAllSubcategories = () => {
  const subcats = new Set();
  CANONICAL_TAXONOMY.forEach(c => {
    c.subcategories.forEach(sc => subcats.add(sc));
  });
  return Array.from(subcats);
};

export const getTaxonomyFlatList = () => {
  const list = [];
  CANONICAL_TAXONOMY.forEach(c => {
    list.push(c.name);
    c.subcategories.forEach(sc => list.push(sc));
  });
  return list;
};

export function matchesTaxonomy(product, category, subcategory) {
  if (!product) return false;
  const cat = (product.category || '').trim();
  const name = (product.name || '').trim();

  // If no category specified or 'All', matches all products
  if (!category || category === 'All') return true;

  if (category === 'Accessories') {
    if (!subcategory || subcategory === 'All') {
      return (
        cat === 'Bracelets' ||
        cat === 'Pendants' ||
        cat === 'Mala' ||
        cat === 'Malas' ||
        cat === 'Accessories' ||
        name === 'Jube Coin'
      );
    }
    if (subcategory === 'Bracelets') return cat === 'Bracelets';
    if (subcategory === 'Pendants') return cat === 'Pendants';
    if (subcategory === 'Malas' || subcategory === 'Mala') return cat === 'Mala' || cat === 'Malas';
    if (subcategory === 'Jube Coin') return name === 'Jube Coin';
    return false;
  }

  if (category === 'Tumbles') {
    // Ensure Black Tourmaline Raw is NOT in Tumbles
    if (name === 'Black Tourmaline Raw') return false;
    return cat === 'Tumbles';
  }

  if (category === 'Household') {
    if (!subcategory || subcategory === 'All') {
      return (
        cat === 'Crystal Trees' ||
        cat === 'Trees' ||
        cat === 'Crystal Pyramids' ||
        cat === 'Pyramids' ||
        cat === 'Lamps'
      );
    }
    if (subcategory === 'Trees') return cat === 'Crystal Trees' || cat === 'Trees';
    if (subcategory === 'Pyramids') return cat === 'Crystal Pyramids' || cat === 'Pyramids';
    if (subcategory === 'Lamps') return cat === 'Lamps';
    return false;
  }

  if (category === 'Variety Crystals') {
    if (!subcategory || subcategory === 'All') {
      return (
        cat === 'Cluster' ||
        cat === 'Clusters' ||
        cat === 'Sphere' ||
        cat === 'Spheres' ||
        cat === 'Points' ||
        cat === 'Crystals' ||
        name === 'Black Tourmaline Raw'
      );
    }
    if (subcategory === 'Clusters') return cat === 'Cluster' || cat === 'Clusters' || name === 'Black Tourmaline Raw';
    if (subcategory === 'Spheres') return cat === 'Sphere' || cat === 'Spheres';
    if (subcategory === 'Points') return cat === 'Points';
    return false;
  }

  if (category === 'Cleaning / Charging') {
    // Jube Coin has been moved to Accessories
    if (name === 'Jube Coin') return false;
    return cat === 'Charging Items' || cat === 'Cleaning / Charging' || cat === 'Utility & Decor';
  }

  return cat.toLowerCase() === category.toLowerCase();
}
