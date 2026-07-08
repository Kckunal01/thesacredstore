-- Migration query to support Bundles category in products table
-- You can run this in your Supabase SQL Editor to ensure there are no check constraints blocking 'Bundles' category insertion.

-- 1. Inspect existing check constraints on the category column (if any) and update them:
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.constraint_column_usage 
        WHERE table_name = 'products' AND column_name = 'category'
    ) THEN
        -- Drop any old category check constraints if present so we can add 'Bundles'
        -- (Usually Supabase tables don't enforce strict check constraints unless specified,
        -- but this ensures safety if a check constraint exists)
        ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
    END IF;
END $$;

-- 2. Populate curated bundles into the database so they can be edited dynamically in the Admin panel:
INSERT INTO products (
  name, slug, category, price, original_price, stamp, featured, stock, active, philosophy, details, usage, chakra, effect, origin, intentions, dimensions, cleansing_charging, image_url, gallery_images
) VALUES 
(
  'Protection Bundle', 
  'protection-bundle', 
  'Bundles', 
  2000, 
  2500, 
  'Fresh', 
  true, 
  10, 
  true, 
  'The earth absorbs what we cannot carry. Black tourmaline is the physical embodiment of this exchange.', 
  'Includes Black Tourmaline Raw, Tiger''s Eye, and Selenite Charging Plate.', 
  'Place items strategically around your home or office space.', 
  'Root & Crown', 
  'Creates an impenetrable energetic shield around your home or workspace', 
  'Brazil / Morocco / South Africa', 
  'Ground scattered energy & block heavy external frequencies', 
  'Approx 10 - 15 cm', 
  'Selenite Charging Plate', 
  '/assets/images/Black Tourmaline Raw/Black Tourmaline Raw 1.webp', 
  '["/assets/images/Black Tourmaline Raw/Black Tourmaline Raw 1.webp"]'
),
(
  'Abundance Bundle', 
  'abundance-bundle', 
  'Bundles', 
  3000, 
  3800, 
  'Fresh', 
  true, 
  10, 
  true, 
  'Structure and discipline yield abundance. Pyrite reflects the natural law of organized effort.', 
  'Includes Citrine Point, Green Aventurine, and Pyrite.', 
  'Keep in the wealth corner or on your active workspace desk.', 
  'Solar Plexus & Heart', 
  'Aligns environmental and personal conditions to welcome new opportunities', 
  'Spain / India / Peru', 
  'Cultivate solar plexus willpower, opportunity, and structured discipline', 
  'Approx 5 - 8 cm', 
  'Citrine Charging Plate', 
  '/assets/images/Citrine Point/Citrine Point 1.webp', 
  '["/assets/images/Citrine Point/Citrine Point 1.webp"]'
),
(
  'Inner Peace Bundle', 
  'inner-peace-bundle', 
  'Bundles', 
  2800, 
  3500, 
  'Fresh', 
  true, 
  10, 
  true, 
  'Clarity is not the absence of thought, but the observation of it without attachment.', 
  'Includes Amethyst Cluster, Rose Quartz Cluster, and Selenite Charging Bowl.', 
  'Keep in bedroom or meditation area.', 
  'Crown & Heart', 
  'Deeply calms an overactive mind and reduces stress-induced static', 
  'Uruguay / Madagascar / Morocco', 
  'Quiet mental chatter and encourage radical calm', 
  'Approx 8 - 12 cm', 
  '/assets/images/Amethyst Cluster/Amethyst Cluster 1.webp', 
  '["/assets/images/Amethyst Cluster/Amethyst Cluster 1.webp"]'
)
ON CONFLICT (slug) 
DO UPDATE SET 
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  cleansing_charging = EXCLUDED.cleansing_charging,
  intentions = EXCLUDED.intentions;
