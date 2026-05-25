-- Ecommerce schema + product image storage bucket

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('season', 'product_type')),
  description TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL,
  original_price INTEGER,
  images TEXT[] NOT NULL DEFAULT '{}',
  category_ids TEXT[] NOT NULL DEFAULT '{}',
  brand TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_latest BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  notes TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal INTEGER NOT NULL,
  shipping INTEGER NOT NULL DEFAULT 200,
  discount INTEGER NOT NULL DEFAULT 0,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'online')),
  payment_status TEXT NOT NULL DEFAULT 'pending',
  order_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_featured ON products (featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_is_latest ON products (is_latest) WHERE is_latest = true;
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products (is_new) WHERE is_new = true;
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

-- Public storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (allow public read, service role handles uploads via API)
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Service role upload product images" ON storage.objects;
CREATE POLICY "Service role upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Service role update product images" ON storage.objects;
CREATE POLICY "Service role update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Service role delete product images" ON storage.objects;
CREATE POLICY "Service role delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images');
