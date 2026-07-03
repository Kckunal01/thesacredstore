-- Migration: Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (subscribing from footer)
CREATE POLICY "Allow anonymous newsletter subscription" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Allow authenticated reads (optional/admin)
CREATE POLICY "Allow authenticated read" ON newsletter_subscribers
  FOR SELECT TO authenticated USING (true);
