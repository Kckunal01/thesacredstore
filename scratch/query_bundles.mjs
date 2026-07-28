import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://iaqumjcglwaephocqssq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhcXVtamNnbHdhZXBob2Nxc3NxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTEwMzgwNSwiZXhwIjoyMDk2Njc5ODA1fQ.5d7QWetSqe68zCLxydxDySNgz-93LUAgH7XaAvFiLks'
);

// Resolve all product IDs used in bundles
const ids = [
  "ef4ceeef-d8ef-4b8b-9321-d8c550b453fe",
  "92a4ee89-f03d-4bb3-9f5a-39b75b5a99fb",
  "581d008a-cd72-4a80-8cf6-9eec021a733c",
  "404f54a0-0b8c-489c-8330-50aa34c43764",
  "82f19b7a-6f2f-479f-9d7f-c6e5cd547658",
  "00088b31-9ac9-4484-8352-67bea6d4d76a",
  "73d08792-325a-43e4-b039-9072010e1784",
];

const { data, error } = await supabase
  .from('products')
  .select('id, name, price')
  .in('id', ids);

if (error) { console.error(error); process.exit(1); }

const map = {};
data.forEach(p => map[p.id] = p);

console.log('=== PRODUCT ID MAP ===');
for (const [id, p] of Object.entries(map)) {
  console.log(`${id} => ${p.name} (₹${p.price})`);
}

// Now show each bundle composition
console.log('\n=== ENERGY RESET BUNDLE ===');
for (const id of ["ef4ceeef-d8ef-4b8b-9321-d8c550b453fe","92a4ee89-f03d-4bb3-9f5a-39b75b5a99fb","581d008a-cd72-4a80-8cf6-9eec021a733c"]) {
  const p = map[id]; console.log(`  ${p?.name} (₹${p?.price})`);
}

console.log('\n=== EVERYDAY BALANCE BUNDLE ===');
for (const id of ["404f54a0-0b8c-489c-8330-50aa34c43764","82f19b7a-6f2f-479f-9d7f-c6e5cd547658","581d008a-cd72-4a80-8cf6-9eec021a733c"]) {
  const p = map[id]; console.log(`  ${p?.name} (₹${p?.price})`);
}

console.log('\n=== ABUNDANCE & GROWTH BUNDLE ===');
for (const id of ["00088b31-9ac9-4484-8352-67bea6d4d76a","404f54a0-0b8c-489c-8330-50aa34c43764","73d08792-325a-43e4-b039-9072010e1784","581d008a-cd72-4a80-8cf6-9eec021a733c"]) {
  const p = map[id]; console.log(`  ${p?.name} (₹${p?.price})`);
}

// Check if bundles table exists
const { data: tbl, error: tblErr } = await supabase.rpc('to_regclass', { name: 'public.bundles' }).maybeSingle();
console.log('\n=== BUNDLES TABLE EXISTS? ===');
console.log(tbl, tblErr);
