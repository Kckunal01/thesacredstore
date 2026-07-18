import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function main() {
  // Find Black Tourmaline Raw, Tiger's Eye, Selenite Charging Plate by slug/name
  const targets = [
    'black-tourmaline-raw', 
    "tiger-s-eye",
    'selenite-charging-plate',
    // inner peace targets for completeness
    'amethyst-cluster',
    'rose-quartz-cluster',
    'selenite-charging-bowl'
  ];
  
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, price, category')
    .neq('category', 'Bundles');
  
  if (error) { console.error(error); return; }
  
  console.log('Looking for protection bundle products:');
  for (const slug of targets) {
    const found = data.find(p => p.slug === slug || p.slug.includes(slug.replace(/[-]/g, '')));
    if (found) {
      console.log(`  FOUND: ${found.name} (${found.id}) - ${found.price}`);
    } else {
      // try name match
      const nameMatch = data.filter(p => {
        const s = slug.replace(/-/g, ' ');
        return p.name.toLowerCase().includes(s.toLowerCase().split(' ')[0]);
      });
      if (nameMatch.length > 0) {
        console.log(`  PARTIAL: ${slug} ->`);
        nameMatch.slice(0,3).forEach(m => console.log(`    ${m.name} (${m.id}) slug:${m.slug} price:${m.price}`));
      } else {
        console.log(`  NOT FOUND: ${slug}`);
      }
    }
  }
  
  console.log('\nAll non-bundle products:');
  for (const p of data) {
    console.log(`  ${p.name} | ${p.slug} | ${p.id} | ₹${p.price}`);
  }
}

main().catch(console.error);
