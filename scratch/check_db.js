// scratch/check_db.js
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

global.import = global.import || {};
// To mock import.meta.env:
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data: tables, error } = await supabase.from('products').select('*').limit(1);
  console.log('Products sample row:', tables?.[0]);
  
  // Let's also check if there is a bundles table
  const { data: bundlesTable, error: bundlesError } = await supabase.from('bundles').select('*').limit(1);
  console.log('Bundles table check:', { exists: !bundlesError, error: bundlesError?.message });
}

main().catch(console.error);
