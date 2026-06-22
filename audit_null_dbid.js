// audit_null_dbid.js
// This script counts total products, Supabase rows, context products, and lists items with null db_id.
import { fetchProducts } from './src/lib/productsService.js';
import { supabase } from './src/lib/supabase.js';

async function main() {
  // Count local products (static file length)
  const localProducts = (await import('./src/data/products.js')).products;
  const localCount = localProducts.length;

  // Supabase rows count
  const { data: supaData, error: supaErr } = await supabase.from('products').select('id', { count: 'exact', head: true });
  const supaCount = supaErr ? null : supaData?.length ?? null;
  // Alternative method to get count
  const { count: supaExactCount } = await supabase.from('products').select('id', { count: 'exact', head: true });

  // Products from context
  const contextProducts = await fetchProducts(true);
  const contextCount = contextProducts.length;

  const nullDbId = contextProducts.filter(p => !p.db_id).map(p => ({ localId: p.id, slug: p.slug, name: p.name }));
  const nullCount = nullDbId.length;

  const result = {
    localCount,
    supabaseCount: supaExactCount,
    contextCount,
    nullDbIdCount: nullCount,
    nullDbIdProducts: nullDbId,
  };
  console.log(JSON.stringify(result, null, 2));
}

main().catch(err => {
  console.error('Audit script error:', err);
  process.exit(1);
});
