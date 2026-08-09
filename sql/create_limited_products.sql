-- Migration: Create limited_products table for seasonal collections
-- Run this in Supabase Dashboard > SQL Editor

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

ALTER TABLE public.limited_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Limited Products" ON public.limited_products;
CREATE POLICY "Public Read Limited Products" ON public.limited_products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin CRUD Limited Products" ON public.limited_products;
CREATE POLICY "Admin CRUD Limited Products" ON public.limited_products
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );
