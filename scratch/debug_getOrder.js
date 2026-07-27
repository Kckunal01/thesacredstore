// DIAGNOSTIC ONLY — no writes, no modifications
// Run: node --experimental-vm-modules scratch/debug_getOrder.js

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('\n=== DIAGNOSTIC: getOrder() trace ===\n');
console.log('1. Supabase project URL:', SUPABASE_URL);
console.log('   Project ref (from URL):', SUPABASE_URL ? SUPABASE_URL.split('//')[1].split('.')[0] : 'MISSING');
console.log('   Anon key first 20 chars:', SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'MISSING');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TEST_VALUE = 'TSS-0007';
console.log('\n2. Table name being queried: orders');
console.log('   Schema being queried:     public (default)');
console.log('   Column:                   order_id');
console.log('   Exact value passed to .eq:', JSON.stringify(TEST_VALUE));

console.log('\n3. Exact code equivalent:\n');
console.log(`   supabase`);
console.log(`     .from('orders')`);
console.log(`     .select('id, order_id, created_at, status, payment_status, amount, tracking_id')`);
console.log(`     .eq('order_id', '${TEST_VALUE}')`);
console.log(`     .limit(1)`);

console.log('\n4. Executing query now...\n');

const { data, error, status, statusText } = await supabase
  .from('orders')
  .select('id, order_id, created_at, status, payment_status, amount, tracking_id')
  .eq('order_id', TEST_VALUE)
  .limit(1);

console.log('=== SUPABASE RESPONSE OBJECT ===');
console.log(JSON.stringify({ data, error, status, statusText }, null, 2));

console.log('\n5. Diagnosis:');
if (error) {
  console.log('   RESULT: ERROR');
  console.log('   Error message:', error.message);
  console.log('   Error code:', error.code);
  console.log('   Error details:', error.details);
  console.log('   Error hint:', error.hint);
} else if (!data || data.length === 0) {
  console.log('   RESULT: EMPTY — no rows returned (data is', JSON.stringify(data), ')');
  console.log('   POSSIBLE CAUSES:');
  console.log('   a) Row does not exist in the orders table (order_id = TSS-0007 is not in the DB)');
  console.log('   b) RLS (Row Level Security) is blocking the anon role from reading this row');
  console.log('   c) The order exists but under a different column name');
} else {
  console.log('   RESULT: FOUND', data.length, 'row(s)');
  console.log('   First row:', JSON.stringify(data[0], null, 2));
}

// Also check total row count to diagnose RLS vs missing data
console.log('\n6. Checking total visible rows in orders table (to detect RLS)...');
const { data: countData, error: countError, count } = await supabase
  .from('orders')
  .select('order_id', { count: 'exact', head: false })
  .limit(5);

console.log('   Count result:', JSON.stringify({ count, data: countData, error: countError }, null, 2));
if (!countError && countData !== null) {
  if (countData.length === 0) {
    console.log('   DIAGNOSIS: anon role sees 0 rows => RLS is blocking all reads, OR the table is empty');
  } else {
    console.log('   DIAGNOSIS: anon role can see rows. Sample order_ids:',
      countData.map(r => r.order_id));
    console.log('   If TSS-0007 is not in this list, the order simply does not exist in the DB.');
  }
}
