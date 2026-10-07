async function run() {
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhcXVtamNnbHdhZXBob2Nxc3NxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTEwMzgwNSwiZXhwIjoyMDk2Njc5ODA1fQ.5d7QWetSqe68zCLxydxDySNgz-93LUAgH7XaAvFiLks';

  // Use the pg endpoint which accepts raw SQL for service role
  const sql = `ALTER TABLE products ADD COLUMN IF NOT EXISTS is_gift_shop boolean DEFAULT false; ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new_arrival boolean DEFAULT false; ALTER TABLE products ADD COLUMN IF NOT EXISTS is_festive_offer boolean DEFAULT false;`;
  
  // Try multiple SQL endpoints
  const endpoints = [
    { url: 'https://iaqumjcglwaephocqssq.supabase.co/rest/v1/rpc', body: { name: 'exec', args: { sql } } },
  ];
  
  // Simplest approach: use psql or pg library directly
  // But since we can't install pg, let's create an RPC function first
  
  // Step 1: Try creating an RPC function via PostgREST  
  // This won't work either...
  
  // The most reliable way without psql: use Supabase's internal SQL endpoint
  // POST https://<ref>.supabase.co/pg/query with the service role key
  
  // Actually, let's try the correct Supabase SQL API endpoint
  const res = await fetch('https://iaqumjcglwaephocqssq.supabase.co/pg', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ query: sql })
  });
  
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Body:', text.substring(0, 500));
  
  // Also try /query endpoint
  const res2 = await fetch('https://iaqumjcglwaephocqssq.supabase.co/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ query: sql })
  });
  
  console.log('Status2:', res2.status);
  const text2 = await res2.text();
  console.log('Body2:', text2.substring(0, 500));
}

run().catch(console.error);
