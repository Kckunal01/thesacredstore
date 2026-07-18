// scratch/check_bundles_in_db.js
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data: dbBundles, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', 'Bundles');
  console.log('Bundles in products table:', dbBundles, error);
}

main().catch(console.error);
