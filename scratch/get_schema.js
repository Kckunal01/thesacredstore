// scratch/get_schema.js
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  // Querying information_schema requires direct SQL. Since we don't have direct SQL client,
  // we can check what happens if we insert an object or array of objects into bundle_products.
  // Wait, let's try updating bundle_products with a JSON array or objects.
  const { data: updateData, error: updateError } = await supabase
    .from('products')
    .update({ 
      bundle_products: [
        JSON.stringify({ id: '92a4ee89-f03d-4bb3-9f5a-39b75b5a99fb', desc: 'test' })
      ]
    })
    .eq('slug', 'mental-peace-bundle')
    .select();
  console.log('Update JSON string array check:', updateData, updateError);
}

main().catch(console.error);
