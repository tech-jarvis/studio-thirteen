-- Neon Postgres ecommerce schema (production)

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('season', 'product_type')),
  description TEXT,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL CHECK (price >= 0),
  original_price INTEGER CHECK (original_price IS NULL OR original_price >= price),
  images TEXT[] NOT NULL DEFAULT '{}',
  category_ids TEXT[] NOT NULL DEFAULT '{}',
  brand TEXT,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  featured BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,
  is_latest BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  shipping INTEGER NOT NULL DEFAULT 200 CHECK (shipping >= 0),
  discount INTEGER NOT NULL DEFAULT 0 CHECK (discount >= 0),
  discount_percent INTEGER NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  total INTEGER NOT NULL CHECK (total >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'online')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_type ON categories (type);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories (slug);
CREATE INDEX IF NOT EXISTS idx_products_active_created ON products (active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products (featured) WHERE featured = true AND active = true;
CREATE INDEX IF NOT EXISTS idx_products_is_latest ON products (is_latest) WHERE is_latest = true AND active = true;
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products (is_new) WHERE is_new = true AND active = true;
CREATE INDEX IF NOT EXISTS idx_products_category_ids ON products USING GIN (category_ids);
CREATE INDEX IF NOT EXISTS idx_products_sale ON products (price, original_price) WHERE original_price IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (order_status);

-- Auto-update updated_at (optional — run manually if needed)
