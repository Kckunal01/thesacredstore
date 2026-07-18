/**
 * migrate_bundles.js
 * 
 * Fixes all 3 bundles in the database:
 * 1. Protection Bundle  - bundle_products was empty → fill with correct products
 * 2. Inner Peace Bundle - bundle_products had wrong products → fix to correct ones
 *                       - add bundle_discount_percent, recalculate prices
 * 3. Emotional Healing Bundle - clean corrupted/duplicate entry in bundle_products
 * 
 * Also sets original_price and price correctly from sum of included products.
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const BUNDLES = {
  'protection-bundle': {
    id: '70150da7-a60f-414a-84e5-94676b60c97f',
    // Black Tourmaline Raw (1299) + Tiger's Eye (1499) + Selenite Charging Plate (699) = 3497
    bundle_products: [
      '20fa8bd7-3f11-4bcb-ab4b-3292ef3d0088', // Black Tourmaline Raw
      '292ead71-ef8b-4b32-b228-eb6447700e25', // Tiger's Eye
      '581d008a-cd72-4a80-8cf6-9eec021a733c', // Selenite Charging Plate
    ],
    bundle_discount_percent: 10,
    original_price: 3497,
    price: Math.round(3497 * 0.9), // 3147
    description: "A powerful shield combination to ground scattered energy and block heavy external frequencies. Black Tourmaline anchors, Tiger's Eye sharpens, and the Selenite Plate continuously purifies.",
    bundle_product_descriptions: {
      '20fa8bd7-3f11-4bcb-ab4b-3292ef3d0088': 'Absorbs and transmutes negative energies at the root chakra',
      '292ead71-ef8b-4b32-b228-eb6447700e25': 'Sharpens focus and guards against psychic fatigue',
      '581d008a-cd72-4a80-8cf6-9eec021a733c': 'Continuously cleanses and recharges the other stones',
    },
  },
  'inner-peace-bundle': {
    id: '692948fd-2e8f-4f6e-905a-9645d2a3b52f',
    // Amethyst Cluster (2499) + Rose Quartz Cluster (2499) + Selenite Charging Bowl (2199) = 7197
    bundle_products: [
      'cef51899-080e-4b45-8b88-2bb74b14c303', // Amethyst Cluster
      '87660f1f-573e-422d-9b5f-8031f8a0e99e', // Rose Quartz Cluster
      '21775859-211a-42a5-a7d6-3810e2ace089', // Selenite Charging Bowl
    ],
    bundle_discount_percent: 10,
    original_price: 7197,
    price: Math.round(7197 * 0.9), // 6477
    description: "A soothing combination of heart-opening and crown-centering stones to quiet mental chatter and encourage radical calm. Place in your bedroom or meditation space for continuous energetic support.",
    bundle_product_descriptions: {
      'cef51899-080e-4b45-8b88-2bb74b14c303': 'Calms an overactive mind and connects to the crown chakra',
      '87660f1f-573e-422d-9b5f-8031f8a0e99e': 'Opens the heart center and encourages self-compassion',
      '21775859-211a-42a5-a7d6-3810e2ace089': 'A sacred vessel to reset and purify personal intentions daily',
    },
  },
  'emotional-healing-bundle': {
    id: 'b22c50d5-f6b8-4594-8ff2-8329435928d7',
    // Amethyst Bracelet (999) + Rose Quartz Bracelet (999) + Selenite Charging Plate (699) = 2697
    bundle_products: [
      '92a4ee89-f03d-4bb3-9f5a-39b75b5a99fb', // Amethyst Bracelet
      'fab80ae8-737a-4484-9371-8fb6c1bfdfbd', // Rose Quartz Bracelet
      '581d008a-cd72-4a80-8cf6-9eec021a733c', // Selenite Charging Plate
    ],
    bundle_discount_percent: 10,
    original_price: 2697,
    price: Math.round(2697 * 0.9), // 2427
    bundle_product_descriptions: {
      '92a4ee89-f03d-4bb3-9f5a-39b75b5a99fb': 'Improves mental conditioning through crown chakra',
      'fab80ae8-737a-4484-9371-8fb6c1bfdfbd': 'Improves emotions through heart chakra',
      '581d008a-cd72-4a80-8cf6-9eec021a733c': 'The charging station for these bracelets',
    },
  }
};

async function migrate() {
  console.log('Starting bundle migration...\n');

  for (const [slug, config] of Object.entries(BUNDLES)) {
    const updates = {
      bundle_products: config.bundle_products,
      bundle_discount_percent: config.bundle_discount_percent,
      original_price: config.original_price,
      price: config.price,
      bundle_product_descriptions: config.bundle_product_descriptions,
    };
    if (config.description) {
      updates.description = config.description;
    }

    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', config.id);

    if (error) {
      console.error(`❌ Failed to update ${slug}:`, error.message);
    } else {
      console.log(`✅ ${slug}`);
      console.log(`   Products: ${config.bundle_products.length} items`);
      console.log(`   Original: ₹${config.original_price}  Final: ₹${config.price}  Discount: ${config.bundle_discount_percent}%`);
    }
  }

  console.log('\nMigration complete. Verifying...');
  const { data } = await supabase
    .from('products')
    .select('name, slug, bundle_products, bundle_discount_percent, price, original_price')
    .eq('category', 'Bundles');

  for (const b of data || []) {
    const ok = Array.isArray(b.bundle_products) && b.bundle_products.length > 0;
    console.log(`${ok ? '✅' : '❌'} ${b.name}: ${b.bundle_products?.length || 0} products, ₹${b.price} (was ₹${b.original_price}, ${b.bundle_discount_percent}% off)`);
  }
}

migrate().catch(console.error);
