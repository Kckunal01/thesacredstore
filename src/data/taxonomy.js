export const taxonomy = {
  categories: [
    { name: 'Bracelets', subcategories: [] },
    { name: 'Tumbles', subcategories: [] },
    { name: 'Sphere', subcategories: [] },
    { name: 'Mala', subcategories: [] },
    { name: 'Cluster', subcategories: [] },
    { name: 'Points', subcategories: [] },
    { name: 'Pendants', subcategories: [] },
    { name: 'Crystal Trees', subcategories: [] },
    { name: 'Crystal Pyramids', subcategories: [] },
    { name: 'Charging Items', subcategories: [] },
    { name: 'Lamps', subcategories: [] },
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
