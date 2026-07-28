const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:K42P0rHk3cRCinoRkYWLvfEt@db.iaqumjcglwaephocqssq.supabase.co:5432/postgres'
});

async function run() {
  await client.connect();
  console.log('Connected to PostgreSQL');

  const createTableSql = `
    CREATE TABLE IF NOT EXISTS public.bundles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      badge TEXT,
      description TEXT,
      tagline TEXT,
      discount_percent NUMERIC NOT NULL DEFAULT 0,
      original_price NUMERIC NOT NULL,
      final_price NUMERIC NOT NULL,
      included_products TEXT[] NOT NULL DEFAULT '{}',
      image_url TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `;
  await client.query(createTableSql);
  console.log('Table public.bundles created or verified.');

  const insertSql = `
    INSERT INTO public.bundles (id, name, slug, badge, description, tagline, discount_percent, original_price, final_price, included_products, image_url)
    VALUES
      ('b22c50d5-f6b8-4594-8ff2-8329435928d7', 'Everyday Balance Bundle', 'everyday-balance-bundle', 'Best Seller', 'A thoughtfully curated trio for creating calm, clarity, and mindful daily rituals. Perfect for first-time crystal owners or meaningful gifting.', 'Three essentials. One intentional beginning.', 10, 5299, 4769, ARRAY['404f54a0-0b8c-489c-8330-50aa34c43764', '82f19b7a-6f2f-479f-9d7f-c6e5cd547658', '581d008a-cd72-4a80-8cf6-9eec021a733c'], '/assets/images/Citrine Point/Citrine Point 1.webp'),
      ('692948fd-2e8f-4f6e-905a-9645d2a3b52f', 'Energy Reset Bundle', 'energy-reset-bundle', null, 'Designed to help create a grounded, peaceful environment through intentional rituals and everyday mindfulness.', 'Reset your energy. Reclaim your focus.', 10, 4700, 4230, ARRAY['ef4ceeef-d8ef-4b8b-9321-d8c550b453fe', '92a4ee89-f03d-4bb3-9f5a-39b75b5a99fb', '581d008a-cd72-4a80-8cf6-9eec021a733c'], '/assets/images/Amethyst Cluster/Amethyst Cluster 1.webp'),
      ('70150da7-a60f-414a-84e5-94676b60c97f', 'Abundance & Growth Bundle', 'abundance-growth-bundle', 'Premium', 'A premium collection curated for clarity, confidence, and intentional growth. Ideal for entrepreneurs, creators, and anyone building their next chapter.', 'Curated for dreamers who are building something meaningful.', 15, 7100, 6035, ARRAY['00088b31-9ac9-4484-8352-67bea6d4d76a', '404f54a0-0b8c-489c-8330-50aa34c43764', '73d08792-325a-43e4-b039-9072010e1784', '581d008a-cd72-4a80-8cf6-9eec021a733c'], '/assets/images/Black Tourmaline Raw/Black Tourmaline Raw 1.webp')
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      badge = EXCLUDED.badge,
      description = EXCLUDED.description,
      tagline = EXCLUDED.tagline,
      discount_percent = EXCLUDED.discount_percent,
      original_price = EXCLUDED.original_price,
      final_price = EXCLUDED.final_price,
      included_products = EXCLUDED.included_products,
      image_url = EXCLUDED.image_url;
  `;
  await client.query(insertSql);
  console.log('Bundle records inserted/updated in public.bundles.');

  await client.end();
}
run().catch(err => {
  console.error(err);
  process.exit(1);
});
