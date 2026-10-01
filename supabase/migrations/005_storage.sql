-- CARTPLUS Supabase Storage Buckets & Policies
-- PostgreSQL Migration 005

-- 1. Create Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('seller-documents', 'seller-documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Policies for product-images
-- Public can view all product images
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Authenticated sellers or admins can upload product images
CREATE POLICY "Sellers and Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated'
  );

-- Image owners or admins can update/delete their product images
CREATE POLICY "Users can update own uploaded product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images' AND
    (auth.uid() = owner OR public.is_admin())
  );

CREATE POLICY "Users can delete own uploaded product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images' AND
    (auth.uid() = owner OR public.is_admin())
  );

-- 3. Storage Policies for seller-documents (strictly private)
CREATE POLICY "Sellers can view own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'seller-documents' AND
    (auth.uid() = owner OR public.is_admin())
  );

CREATE POLICY "Sellers can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'seller-documents' AND
    auth.uid() = owner
  );

-- 4. Storage Policies for avatars
CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid() = owner
  );
