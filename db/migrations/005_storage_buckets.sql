-- Supabase Storage buckets for uploaded images.
-- Moving image bytes out of Postgres keeps the database well under the free
-- plan's 500 MB limit and serves product photos from Supabase's CDN.
--   products: public — product photos shown on the storefront
--   payments: private — customer payment screenshots, viewed by admins only
--             through short-lived signed URLs

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('products', 'products', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('payments', 'payments', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
