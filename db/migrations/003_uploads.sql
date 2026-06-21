-- Persistent storage for uploaded images (product photos + payment proofs).
-- Previously these were written to public/uploads on the local filesystem,
-- which is read-only / ephemeral on serverless hosts (e.g. Vercel) — so
-- payment screenshots and product images silently failed to persist.
-- Storing the bytes in Postgres makes uploads durable on any host.

CREATE TABLE IF NOT EXISTS uploads (
  id TEXT PRIMARY KEY,
  mime TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'product' CHECK (kind IN ('product', 'payment')),
  data BYTEA NOT NULL,
  size INTEGER NOT NULL CHECK (size >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
