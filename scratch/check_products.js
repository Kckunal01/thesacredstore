// scratch/check_products.js
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data: prods, error } = await supabase
    .from('products')
    .select('id, name, slug, category');
  console.log('All DB products:', prods?.map(p => ({ id: p.id, name: p.name, slug: p.slug, category: p.category })), error);
}

main().catch(console.error);
