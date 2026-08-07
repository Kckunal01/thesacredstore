import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://iaqumjcglwaephocqssq.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.from('products').select('name, category').ilike('name', '%Tumble%');
  console.log('TUMBLES:', data);
  const { data: d2 } = await supabase.from('products').select('name, category').ilike('name', '%Pyrite%');
  console.log('PYRITE:', d2);
}

run();
