-- Product videos.
-- Videos are uploaded straight from the admin's browser to Supabase Storage
-- (a signed upload URL), because serverless request bodies are capped at a
-- few MB. 50 MB is the Supabase free plan's per-file upload limit.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-videos', 'product-videos', true, 52428800, ARRAY['video/mp4', 'video/webm', 'video/quicktime'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

ALTER TABLE products ADD COLUMN IF NOT EXISTS videos TEXT[] NOT NULL DEFAULT '{}';
