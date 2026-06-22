// audit_null_dbid.js
import { fetchProducts } from '../src/lib/productsService.js';
(async () => {
  try {
    // Force refetch to get latest data from Supabase
    const allProducts = await fetchProducts(true);
    const totalProductsJs = 748; // known count from file length maybe but we can compute from local file length not needed here
    const supabaseCount = allProducts.filter(p => p.db_id !== null).length;
    const totalProducts = allProducts.length;
    const nullDbIdProducts = allProducts.filter(p => p.db_id === null);
    console.log('TOTAL_PRODUCTS:', totalProducts);
    console.log('SUPABASE_PRODUCT_ROWS:', supabaseCount);
    console.log('NULL_DB_ID_COUNT:', nullDbIdProducts.length);
    console.log('NULL_DB_ID_PRODUCTS:');
    nullDbIdProducts.forEach(p => {
      console.log(`${p.id}\t${p.slug}\t${p.name}`);
    });
  } catch (e) {
    console.error('Error during audit:', e);
  }
})();
