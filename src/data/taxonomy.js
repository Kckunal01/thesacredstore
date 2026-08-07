export const taxonomy = {
  categories: [
    {
      name: 'Bracelets',
      subcategories: [],
    },
    {
      name: 'Crystals',
      subcategories: [
        'Tumbles',
        'Sphere',
        'Mala',
        'Cluster',
        'Points',
      ],
    },
    {
      name: 'Utility & Decor',
      subcategories: [
        'Pendants',
        'Crystal Trees',
        'Crystal Pyramids',
        'Charging Items',
        'Lamps',
      ],
    },
  ],
};

export const getAllCategories = () => {
  return taxonomy.categories.map(c => c.name);
};

export const getAllSubcategories = () => {
  const subcats = new Set();
  taxonomy.categories.forEach(c => {
    c.subcategories.forEach(sc => subcats.add(sc));
  });
  return Array.from(subcats);
};

export const getTaxonomyFlatList = () => {
  const list = [];
  taxonomy.categories.forEach(c => {
    list.push(c.name);
    c.subcategories.forEach(sc => list.push(sc));
  });
  return list;
};
