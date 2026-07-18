// scratch/check_functions.js
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  // Let's test calling some potential run_sql / exec_sql functions to see if they exist
  const testFunctions = ['exec_sql', 'run_sql', 'execute_sql', 'sql'];
  for (const fn of testFunctions) {
    const { data, error } = await supabase.rpc(fn, { query: 'SELECT 1;' }).single();
    console.log(`RPC ${fn} with query:`, data, error?.message);
    const { data: data2, error: error2 } = await supabase.rpc(fn, { sql: 'SELECT 1;' }).single();
    console.log(`RPC ${fn} with sql:`, data2, error2?.message);
  }
}

main().catch(console.error);
