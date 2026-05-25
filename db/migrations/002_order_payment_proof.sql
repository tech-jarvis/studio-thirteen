-- Payment proof screenshot + paid order status

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_screenshot TEXT;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_order_status_check
  CHECK (order_status IN ('pending', 'paid', 'confirmed', 'shipped', 'delivered', 'cancelled'));
