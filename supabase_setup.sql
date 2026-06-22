-- 1. Create public.profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile, and admins to view all
CREATE POLICY "Allow view profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Allow system defined triggers or service role to manage
CREATE POLICY "Allow insert/update/delete for users" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- 2. Trigger for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (new.id, new.email, FALSE)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sync any existing users
INSERT INTO public.profiles (id, email, is_admin)
SELECT id, email, FALSE FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Set a specific user to admin (Replace with actual admin email/id if needed)
-- UPDATE public.profiles SET is_admin = TRUE WHERE email = 'admin@thesacredstore.com';

-- 3. Create Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable Storage Policies
-- Allow anyone to view images
CREATE POLICY "Public Read Product Images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Public Read Blog Images" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

-- Allow admins to insert/update/delete product images
CREATE POLICY "Admin Insert Product Images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'product-images' AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admin Update Product Images" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'product-images' AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admin Delete Product Images" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'product-images' AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );
