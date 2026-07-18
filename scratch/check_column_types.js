// scratch/check_column_types.js
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data, error } = await supabase.rpc('get_column_type');
  console.log('RPC check:', data, error);

  // Or let's just query pg_attribute or pg_type if possible via an query, or we can see if we can do an insert of an object/json to check if it's jsonb or text[].
  // Wait, let's try to update one bundle_products with an array of objects to see if it throws an error.
  const { data: updateData, error: updateError } = await supabase
    .from('products')
    .update({ bundle_products: ['92a4ee89-f03d-4bb3-9f5a-39b75b5a99fb'] })
    .eq('slug', 'mental-peace-bundle')
    .select();
  console.log('Update text array check:', updateData, updateError);
}

main().catch(console.error);
