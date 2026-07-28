import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://iaqumjcglwaephocqssq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhcXVtamNnbHdhZXBob2Nxc3NxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTEwMzgwNSwiZXhwIjoyMDk2Njc5ODA1fQ.5d7QWetSqe68zCLxydxDySNgz-93LUAgH7XaAvFiLks'
);

async function main() {
  const { data, error } = await supabase
    .from('products')
    .update({ stamp: 'Best Seller' })
    .eq('slug', 'abundance-growth-bundle')
    .select();

  console.log('Update stamp result:', { data, error });
}
main();
