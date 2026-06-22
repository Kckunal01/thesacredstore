import { fetchProducts } from './src/lib/productsService.js';
import { supabase } from './src/lib/supabase.js';

(async () => {
  const { count: supCount, error: supError } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true });
  if (supError) console.error('Supabase count error:', supError);

  const combined = await fetchProducts(true);
  const totalCombined = combined.length;
  const nullDbIdProducts = combined.filter(p => p.db_id === null);

  console.log('TOTAL_PRODUCTS_JS:', totalCombined);
  console.log('SUPABASE_ROWS:', supCount ?? 'unknown');
  console.log('NULL_DB_ID_COUNT:', nullDbIdProducts.length);
  console.log('NULL_DB_ID_PRODUCTS:', JSON.stringify(nullDbIdProducts.map(p => ({ localId: p.id, slug: p.slug, name: p.name })), null, 2));
})();
