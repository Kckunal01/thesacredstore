import { supabase } from '../src/lib/supabase.js';

const newProductNames = [
  'Blue Lace Agate Bracelet',
  'Carnelian Bracelet',
  'Carnelian Crystal Tree',
  'Clear Quartz Crystal Pyramid',
  'Clear Quartz Bracelet',
  'Golden Hematite Bracelet',
  'Green Aventurine Crystal Pyramid',
  'Green Aventurine Crystal Tree',
  'Green Jade Bracelet',
  'Pink Tourmaline Bracelet',
  'Pyrite Bracelet',
  'Pyrite Crystal Pyramid',
  'Pyrite Crystal Tree',
  'Red Jasper Bracelet',
  'Rutile Quartz Bracelet',
  'Selenite Bracelet',
  'Sodalite Bracelet',
  'Turquoise Bracelet'
];

async function verifyProducts() {
  console.log('Fetching products from database...');
  const { data, error } = await supabase.from('products').select('name, category, image_url, stock, active');
  if (error) {
    console.error('Database query failed:', error);
    process.exit(1);
  }
  
  const results = newProductNames.map(name => {
    const dbItem = data.find(p => p.name.toLowerCase() === name.toLowerCase());
    return {
      name,
      inDb: !!dbItem,
      category: dbItem ? dbItem.category : 'N/A',
      hasImage: dbItem ? !!dbItem.image_url : false,
      hasStock: dbItem ? dbItem.stock > 0 : false,
      active: dbItem ? dbItem.active : false
    };
  });
  
  console.log(JSON.stringify(results, null, 2));
}

verifyProducts().catch(err => {
  console.error(err);
  process.exit(1);
});
