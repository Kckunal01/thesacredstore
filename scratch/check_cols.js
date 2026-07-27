import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);
const { data, error } = await supabase.from('products').select('*').limit(1);
if (error) { console.error(error); process.exit(1); }
if (data && data.length > 0) console.log('Columns:', Object.keys(data[0]).join(', '));
else console.log('No rows');
