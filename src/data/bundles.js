/**
 * bundles.js
 * 
 * The Admin Bundle Manager (Supabase `products` table, category='Bundles')
 * is the ONLY source of truth. No hardcoded bundle data exists here.
 * 
 * getDynamicBundles(allProducts) maps DB bundle records into the shape
 * consumed by BundleCard, BundleDetail, Home, and Bundles pages.
 */

/**
 * Maps a flat list of products (from ProductsContext) into bundles.
 * @param {Array} allProducts - All products including those with category='Bundles'
 * @returns {Array} - Formatted bundle objects
 */
export const getDynamicBundles = (allProducts) => {
  if (!allProducts || allProducts.length === 0) return [];

  const dbBundles = allProducts.filter(p => p.category === 'Bundles');
  const regularProducts = allProducts.filter(p => p.category !== 'Bundles');

  return dbBundles.map(p => {
    // Resolve included products from bundle_products array (array of product UUIDs)
    const rawRefs = Array.isArray(p.bundle_products) ? p.bundle_products : [];

    // Clean refs: some may be stringified JSON objects like '{"id":"...","desc":"..."}'
    const cleanIds = rawRefs.map(ref => {
      if (typeof ref === 'string' && ref.startsWith('{')) {
        try { return JSON.parse(ref).id; } catch(e) { return ref; }
      }
      return ref;
    }).filter(Boolean);

    // Deduplicate
    const uniqueIds = [...new Set(cleanIds)];

    // Match to regular products by db_id
    const includedProducts = uniqueIds
      .map(id => regularProducts.find(x => x.db_id === id || x.id === id))
      .filter(Boolean);

    // Calculate pricing from included products
    const originalPrice = includedProducts.reduce((sum, prod) => sum + (Number(prod.price) || 0), 0);
    const discountPct = Number(p.bundle_discount_percent) || 0;
    const finalPrice = discountPct > 0
      ? Math.round(originalPrice * (1 - discountPct / 100))
      : (Number(p.price) || originalPrice);

    return {
      id: p.db_id || p.id,
      db_id: p.db_id || p.id,
      slug: p.slug,
      name: p.name,
      description: p.description || '',
      imageUrl: p.image || p.image_url || (p.images && p.images[0]) || '',
      image_url: p.image || p.image_url || (p.images && p.images[0]) || '',
      gallery_images: p.gallery_images || [],
      stamp: p.stamp || null,
      active: p.active !== false,
      featured: !!p.featured,
      price: finalPrice,
      originalPrice: originalPrice || Number(p.original_price) || finalPrice,
      discountPercent: discountPct,
      bundle_products: uniqueIds,         // clean array of product UUIDs
      includedProducts: includedProducts, // resolved product objects
      bundle_product_descriptions: p.bundle_product_descriptions || {},
      productNames: includedProducts.map(x => x.name),
    };
  });
};
