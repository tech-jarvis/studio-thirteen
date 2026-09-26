-- Supabase exposes tables in the public schema through its REST (PostgREST) API.
-- Enable RLS with no policies so that API cannot read or write these tables.
-- The app connects as the postgres role, which bypasses RLS, so it is unaffected.

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
