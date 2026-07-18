import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function main() {
  // Get all bundles
  const { data: bundles } = await supabase
    .from('products')
    .select('id, name, slug, bundle_products, bundle_product_descriptions, bundle_discount_percent, price, original_price')
    .eq('category', 'Bundles');

  // Get all non-bundle products
  const { data: allProds } = await supabase
    .from('products')
    .select('id, name, slug, price')
    .neq('category', 'Bundles');

  const prodMap = {};
  for (const p of allProds || []) prodMap[p.id] = p;

  for (const b of bundles || []) {
    console.log(`\n=== ${b.name} (${b.slug}) ===`);
    console.log(`  Price: ${b.price}, Original: ${b.original_price}, Discount: ${b.bundle_discount_percent}%`);
    console.log(`  bundle_products raw:`, b.bundle_products);
    
    // Clean product IDs
    const cleanIds = (b.bundle_products || []).map(ref => {
      if (typeof ref === 'string' && ref.startsWith('{')) {
        try { return JSON.parse(ref).id; } catch(e) { return ref; }
      }
      return ref;
    }).filter((v, i, arr) => v && arr.indexOf(v) === i); // deduplicate
    
    console.log(`  Resolved product IDs:`, cleanIds);
    for (const id of cleanIds) {
      const p = prodMap[id];
      console.log(`    - ${p ? p.name + ' (' + p.price + ')' : 'NOT FOUND: ' + id}`);
    }
    console.log(`  Descriptions:`, b.bundle_product_descriptions);
  }
}

main().catch(console.error);
