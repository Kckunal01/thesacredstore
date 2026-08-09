import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: 'postgresql://postgres:K42P0rHk3cRCinoRkYWLvfEt@db.iaqumjcglwaephocqssq.supabase.co:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log('Connected to PostgreSQL');

  const createTableSql = `
    CREATE TABLE IF NOT EXISTS public.limited_products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      collection TEXT NOT NULL,
      name TEXT NOT NULL,
      subtitle TEXT,
      slug TEXT UNIQUE NOT NULL,
      short_description TEXT,
      long_story TEXT,
      crystal_constituents TEXT,
      charm TEXT,
      feeling TEXT,
      reason_to_gift TEXT,
      crystal_charm_qualities TEXT,
      care_instructions TEXT,
      whats_included TEXT,
      gifting_note TEXT,
      seo_description TEXT,
      meta_title TEXT,
      meta_description TEXT,
      price NUMERIC NOT NULL,
      original_price NUMERIC,
      stock INT NOT NULL DEFAULT 10,
      active BOOLEAN NOT NULL DEFAULT true,
      image_url TEXT,
      gallery_images TEXT[] NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `;
  await client.query(createTableSql);
  console.log('Table public.limited_products created or verified.');

  // Enable RLS
  await client.query('ALTER TABLE public.limited_products ENABLE ROW LEVEL SECURITY;');
  
  // Drop policies if exist to recreate them cleanly
  await client.query('DROP POLICY IF EXISTS "Public Read Limited Products" ON public.limited_products;');
  await client.query('DROP POLICY IF EXISTS "Admin CRUD Limited Products" ON public.limited_products;');

  // Create RLS Policies
  await client.query(`
    CREATE POLICY "Public Read Limited Products" ON public.limited_products
      FOR SELECT USING (true);
  `);
  await client.query(`
    CREATE POLICY "Admin CRUD Limited Products" ON public.limited_products
      FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
      );
  `);
  console.log('RLS policies enabled on public.limited_products.');

  const seedProducts = [
    {
      collection: "Rakhi'26",
      name: "Nazar — The Rakhi of Protection",
      subtitle: "For the sibling whose strength deserves quiet protection.",
      slug: "nazar-rakhi",
      short_description: "A protective shield hand-woven with deep black tourmaline beads and a micro-pave evil eye charm. Designed to ground energy and ward off negative intentions.",
      long_story: "Bonds aren't just celebrated; they are guarded. The Nazar Rakhi is created as a silent guardian for your sibling. Combining the intense neutralizing field of Black Tourmaline with the ancient protective vigilance of the Evil Eye charm, this thread serves as a daily blessing of security and inner stability. Each stone is carefully hand-selected for its depth and grounding qualities, ensuring your sibling carries strength wherever they walk.",
      crystal_constituents: "Black Tourmaline",
      charm: "Evil Eye",
      feeling: "Protection • Strength • Peace",
      reason_to_gift: "For the sibling you always want protected, grounded and surrounded by positive energy.",
      crystal_charm_qualities: "Black Tourmaline helps absorb unwanted negativity while the Evil Eye symbolizes protection from negative intentions.",
      care_instructions: "Avoid contact with perfumes, hand sanitizers, and water. Wipe down gently with a soft cotton cloth after wear.",
      whats_included: "1 x Nazar Rakhi, 1 x Hand-finished Sacred Gifting Box, 1 x Intention Card, 1 x Authenticity Certificate",
      gifting_note: "May you always walk with confidence, surrounded by protective light and stable ground.",
      seo_description: "Shop the premium Nazar Rakhi of Protection. Crafted with authentic Black Tourmaline and Evil Eye charm to ground energy and protect your sibling.",
      meta_title: "Nazar — The Rakhi of Protection | The Sacred Store",
      meta_description: "Celebrate Rakhi with Nazar. Handcrafted featuring Black Tourmaline & Evil Eye for protection, strength, and grounding.",
      price: 1499,
      original_price: 2199,
      stock: 50,
      active: true,
      image_url: "/assets/images/rakhi/nazar.png",
      gallery_images: ["/assets/images/rakhi/nazar.png"]
    },
    {
      collection: "Rakhi'26",
      name: "Saanjh — The Rakhi of Affection",
      subtitle: "For the moments that keep two hearts connected, no matter the distance.",
      slug: "saanjh-rakhi",
      short_description: "A tender blend of Rose Quartz and Black Tourmaline, paired with a protective Evil Eye. A physical anchor of unconditional love and emotional safety.",
      long_story: "Distance fades when love is anchored in emotional safety. The Saanjh Rakhi represents the gentle twilight of affection and shared memories. Combining the soft, healing vibration of Madagascar Rose Quartz with the protective, shielding influence of Black Tourmaline, it creates a safe space for your sibling's heart. Paired with a delicate Evil Eye charm, it is a reminder that they are loved, cared for, and guarded, regardless of the miles between you.",
      crystal_constituents: "Rose Quartz, Black Tourmaline",
      charm: "Evil Eye",
      feeling: "Affection • Care • Emotional Safety",
      reason_to_gift: "For expressing unconditional love while wishing protection and emotional harmony.",
      crystal_charm_qualities: "Rose Quartz symbolizes compassion and affection, while Black Tourmaline and the Evil Eye represent grounding and protection.",
      care_instructions: "Keep away from direct heat and water. Cleanse under moonlight or place on a Selenite Plate to recharge.",
      whats_included: "1 x Saanjh Rakhi, 1 x Hand-finished Sacred Gifting Box, 1 x Intention Card, 1 x Authenticity Certificate",
      gifting_note: "Wherever you are, may you always feel the warmth of unconditional love and the safety of family.",
      seo_description: "Discover the elegant Saanjh Rakhi of Affection. Featuring natural Rose Quartz and Black Tourmaline to symbolize deep love and emotional protection.",
      meta_title: "Saanjh — The Rakhi of Affection | The Sacred Store",
      meta_description: "Express unconditional love with the Saanjh Rakhi, handcrafted with Rose Quartz, Black Tourmaline, and a protective Evil Eye charm.",
      price: 1599,
      original_price: 2299,
      stock: 50,
      active: true,
      image_url: "/assets/images/rakhi/saanjh.png",
      gallery_images: ["/assets/images/rakhi/saanjh.png"]
    },
    {
      collection: "Rakhi'26",
      name: "Ananta — The Rakhi of Forever",
      subtitle: "A reminder that some bonds never need words to remain unbroken.",
      slug: "ananta-rakhi",
      short_description: "An eternal thread woven with Rose Quartz for warmth and Clear Quartz for clarity, finished with a silver-toned Infinity Loop.",
      long_story: "Infinite, patient, and unchanging. The Ananta Rakhi is designed to celebrate the sibling bond that outlasts time itself. By pairing the compassionate warmth of Rose Quartz with the high-frequency amplifying energy of Clear Quartz, this Rakhi clears communication and strengthens heart-centered connection. The Infinity Loop charm rests at the center, signifying an endless circle of trust, connection, and devotion.",
      crystal_constituents: "Rose Quartz, Clear Quartz",
      charm: "Infinity Loop",
      feeling: "Forever • Trust • Connection",
      reason_to_gift: "To celebrate an enduring sibling bond and lifelong connection.",
      crystal_charm_qualities: "Rose Quartz represents warmth and love, Clear Quartz symbolizes clarity, and the Infinity Loop represents an unending bond.",
      care_instructions: "Do not soak. Gently dust with a dry cloth. Can be placed with Clear Quartz clusters to cleanse.",
      whats_included: "1 x Ananta Rakhi, 1 x Hand-finished Sacred Gifting Box, 1 x Intention Card, 1 x Authenticity Certificate",
      gifting_note: "To the bond that holds firm through every season of life—unending, clear, and true.",
      seo_description: "Shop Ananta, the Rakhi of Forever. Crafted with Rose Quartz, Clear Quartz, and an Infinity Loop charm to celebrate a lifelong sibling bond.",
      meta_title: "Ananta — The Rakhi of Forever | The Sacred Store",
      meta_description: "Celebrate an unbreakable bond with the Ananta Rakhi, featuring Rose Quartz, Clear Quartz, and an elegant Infinity Loop.",
      price: 1699,
      original_price: 2499,
      stock: 50,
      active: true,
      image_url: "/assets/images/rakhi/ananta.png",
      gallery_images: ["/assets/images/rakhi/ananta.png"]
    },
    {
      collection: "Rakhi'26",
      name: "Vriddhi — The Rakhi of Growth",
      subtitle: "A wish for every new beginning to bring confidence, opportunity, and joy.",
      slug: "vriddhi-rakhi",
      short_description: "An abundance thread carrying Green Aventurine for opportunity and Rose Quartz for care, accented with an Infinity Loop.",
      long_story: "Growth is a journey best taken when backed by those who believe in us. The Vriddhi Rakhi is a positive blessing for your sibling's future endeavors, dreams, and aspirations. Woven with Green Aventurine—the stone of opportunity, confidence, and luck—and balanced by the nurturing heart energy of Rose Quartz, it wishes them prosperity and abundance. The Infinity Loop charm represents an everlasting foundation of support.",
      crystal_constituents: "Rose Quartz, Green Aventurine",
      charm: "Infinity Loop",
      feeling: "Growth • Prosperity • Support",
      reason_to_gift: "For wishing your sibling continued growth, confidence and abundance.",
      crystal_charm_qualities: "Green Aventurine symbolizes opportunity and growth, Rose Quartz represents care, and the Infinity Loop signifies a lasting relationship.",
      care_instructions: "Protect from harsh chemicals and moisture. Store in the provided gift box when not in use.",
      whats_included: "1 x Vriddhi Rakhi, 1 x Hand-finished Sacred Gifting Box, 1 x Intention Card, 1 x Authenticity Certificate",
      gifting_note: "May your path be filled with rising opportunities, abundance, and the courage to grow daily.",
      seo_description: "Celebrate growth with the Vriddhi Rakhi. Handcrafted with Green Aventurine and Rose Quartz to wish your sibling prosperity, luck, and support.",
      meta_title: "Vriddhi — The Rakhi of Growth | The Sacred Store",
      meta_description: "Wish your sibling prosperity and growth with the Vriddhi Rakhi, showcasing Green Aventurine, Rose Quartz, and an Infinity Loop charm.",
      price: 1599,
      original_price: 2399,
      stock: 50,
      active: true,
      image_url: "/assets/images/rakhi/vriddhi.png",
      gallery_images: ["/assets/images/rakhi/vriddhi.png"]
    }
  ];

  for (const p of seedProducts) {
    const checkSql = `SELECT id FROM public.limited_products WHERE slug = $1;`;
    const checkRes = await client.query(checkSql, [p.slug]);
    if (checkRes.rows.length > 0) {
      const updateSql = `
        UPDATE public.limited_products
        SET collection = $1, name = $2, subtitle = $3, short_description = $4, long_story = $5,
            crystal_constituents = $6, charm = $7, feeling = $8, reason_to_gift = $9,
            crystal_charm_qualities = $10, care_instructions = $11, whats_included = $12,
            gifting_note = $13, seo_description = $14, meta_title = $15, meta_description = $16,
            price = $17, original_price = $18, stock = $19, active = $20, image_url = $21,
            gallery_images = $22, updated_at = now()
        WHERE slug = $23;
      `;
      await client.query(updateSql, [
        p.collection, p.name, p.subtitle, p.short_description, p.long_story,
        p.crystal_constituents, p.charm, p.feeling, p.reason_to_gift,
        p.crystal_charm_qualities, p.care_instructions, p.whats_included,
        p.gifting_note, p.seo_description, p.meta_title, p.meta_description,
        p.price, p.original_price, p.stock, p.active, p.image_url,
        p.gallery_images, p.slug
      ]);
      console.log(`Updated seeded product: ${p.name}`);
    } else {
      const insertSql = `
        INSERT INTO public.limited_products (
          collection, name, subtitle, slug, short_description, long_story,
          crystal_constituents, charm, feeling, reason_to_gift, crystal_charm_qualities,
          care_instructions, whats_included, gifting_note, seo_description, meta_title,
          meta_description, price, original_price, stock, active, image_url, gallery_images
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
        );
      `;
      await client.query(insertSql, [
        p.collection, p.name, p.subtitle, p.slug, p.short_description, p.long_story,
        p.crystal_constituents, p.charm, p.feeling, p.reason_to_gift, p.crystal_charm_qualities,
        p.care_instructions, p.whats_included, p.gifting_note, p.seo_description, p.meta_title,
        p.meta_description, p.price, p.original_price, p.stock, p.active, p.image_url, p.gallery_images
      ]);
      console.log(`Inserted new seeded product: ${p.name}`);
    }
  }

  await client.end();
  console.log('Seeding completed successfully!');
}

run().catch(err => {
  console.error('Error during database seeding:', err);
  process.exit(1);
});
