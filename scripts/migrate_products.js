import { createClient } from "@supabase/supabase-js";
import { products } from "../src/data/products.js";

const supabaseUrl = "https://iaqumjcglwaephocqssq.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhcXVtamNnbHdhZXBob2Nxc3NxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTEwMzgwNSwiZXhwIjoyMDk2Njc5ODA1fQ.5d7QWetSqe68zCLxydxDySNgz-93LUAgH7XaAvFiLks";
const supabase = createClient(supabaseUrl, serviceRoleKey);

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^[-]+|[-]+$/g, '');
}

const featuredIds = ['c3', 'c4', 'g6', 'b7'];

async function migrate() {
  let count = 0;
  console.log(`Starting migration of ${products.length} products...`);

  for (const prod of products) {
    const slug = slugify(prod.name);
    const featured = featuredIds.includes(prod.id);

    // Check if product already exists by slug
    const { data: existing, error: getErr } = await supabase
      .from('products')
      .select('id, stock, active')
      .eq('slug', slug)
      .maybeSingle();

    if (getErr) {
      console.error(`Error checking product existence for ${slug}:`, getErr);
      continue;
    }

    const payload = {
      slug,
      name: prod.name,
      category: prod.category,
      description: prod.description,
      price: prod.price,
      original_price: prod.originalPrice || null,
      stamp: prod.stamp || 'none',
      featured,
      image_url: (prod.images && prod.images[0]) || null,
      gallery_images: prod.images || [],
      philosophy: prod.philosophy || null,
      details: prod.details || null,
      usage: prod.usage || null,
      chakra: prod.chakra || null,
      effect: prod.effect || null,
      origin: prod.origin || null
    };

    if (existing) {
      // Record exists: preserve existing stock and active
      payload.stock = existing.stock;
      payload.active = existing.active;

      const { error: updateErr } = await supabase
        .from('products')
        .update(payload)
        .eq('id', existing.id);

      if (updateErr) {
        console.error(`Error updating product ${slug}:`, updateErr);
      } else {
        console.log(`Updated product: ${slug} (preserved stock: ${existing.stock}, active: ${existing.active})`);
        count++;
      }
    } else {
      // Record does not exist: insert new record with default stock (10) and active (true)
      payload.stock = 10;
      payload.active = true;

      const { error: insertErr } = await supabase
        .from('products')
        .insert(payload);

      if (insertErr) {
        console.error(`Error inserting product ${slug}:`, insertErr);
      } else {
        console.log(`Inserted new product: ${slug}`);
        count++;
      }
    }
  }

  console.log(`Migration completed! Migrated/Updated ${count} products.`);
}

migrate();
