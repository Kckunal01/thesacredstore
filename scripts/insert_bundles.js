import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const bundlesToInsert = [
  {
    name: 'Protection Bundle',
    slug: 'protection-bundle',
    category: 'Bundles',
    price: 2000,
    original_price: 2500,
    stamp: 'Fresh',
    featured: true,
    stock: 10,
    active: true,
    philosophy: 'The earth absorbs what we cannot carry. Black tourmaline is the physical embodiment of this exchange.',
    details: 'Includes Black Tourmaline Raw, Tiger\'s Eye, and Selenite Charging Plate.',
    usage: 'Place items strategically around your home or office space.',
    chakra: 'Root & Crown',
    effect: 'Creates an impenetrable energetic shield around your home or workspace',
    origin: 'Brazil / Morocco / South Africa',
    intentions: 'Ground scattered energy & block heavy external frequencies',
    dimensions: 'Approx 10 - 15 cm',
    cleansing_charging: 'Selenite Charging Plate',
    image_url: '/assets/images/Black Tourmaline Raw/Black Tourmaline Raw 1.webp',
    gallery_images: ['/assets/images/Black Tourmaline Raw/Black Tourmaline Raw 1.webp']
  },
  {
    name: 'Abundance Bundle',
    slug: 'abundance-bundle',
    category: 'Bundles',
    price: 3000,
    original_price: 3800,
    stamp: 'Fresh',
    featured: true,
    stock: 10,
    active: true,
    philosophy: 'Structure and discipline yield abundance. Pyrite reflects the natural law of organized effort.',
    details: 'Includes Citrine Point, Green Aventurine, and Pyrite.',
    usage: 'Keep in the wealth corner or on your active workspace desk.',
    chakra: 'Solar Plexus & Heart',
    effect: 'Aligns environmental and personal conditions to welcome new opportunities',
    origin: 'Spain / India / Peru',
    intentions: 'Cultivate solar plexus willpower, opportunity, and structured discipline',
    dimensions: 'Approx 5 - 8 cm',
    cleansing_charging: 'Citrine Charging Plate',
    image_url: '/assets/images/Citrine Point/Citrine Point 1.webp',
    gallery_images: ['/assets/images/Citrine Point/Citrine Point 1.webp']
  },
  {
    name: 'Inner Peace Bundle',
    slug: 'inner-peace-bundle',
    category: 'Bundles',
    price: 2800,
    original_price: 3500,
    stamp: 'Fresh',
    featured: true,
    stock: 10,
    active: true,
    philosophy: 'Clarity is not the absence of thought, but the observation of it without attachment.',
    details: 'Includes Amethyst Cluster, Rose Quartz Cluster, and Selenite Charging Bowl.',
    usage: 'Keep in bedroom or meditation area.',
    chakra: 'Crown & Heart',
    effect: 'Deeply calms an overactive mind and reduces stress-induced static',
    origin: 'Uruguay / Madagascar / Morocco',
    intentions: 'Quiet mental chatter and encourage radical calm',
    dimensions: 'Approx 8 - 12 cm',
    cleansing_charging: 'Selenite Charging Bowl',
    image_url: '/assets/images/Amethyst Cluster/Amethyst Cluster 1.webp',
    gallery_images: ['/assets/images/Amethyst Cluster/Amethyst Cluster 1.webp']
  }
];

async function insertBundles() {
  console.log('Inserting/upserting bundles into database...');
  for (const bundle of bundlesToInsert) {
    const { data, error } = await supabase
      .from('products')
      .upsert(bundle, { onConflict: 'slug' })
      .select();

    if (error) {
      console.error(`Error inserting ${bundle.name}:`, error.message);
    } else {
      console.log(`Successfully upserted ${bundle.name}:`, data?.[0]?.id);
    }
  }
  console.log('Done!');
}

insertBundles();
