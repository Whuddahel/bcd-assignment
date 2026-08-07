-- ─────────────────────────────────────────────────────────────────────────────
-- Product view counter
--
-- `view_count` (see 20240101000000_initial_schema.sql) is read for "trending"
-- sorts and shown on seller listings, but nothing could write to it directly:
-- RLS restricts product UPDATEs to the owning seller/admin, and a visitor
-- browsing the catalog is neither. This SECURITY DEFINER RPC gives every
-- visitor (anonymous or signed in) a narrow, safe way to bump just the
-- counter — called from `incrementProductView` in src/lib/data/products.ts on
-- every product-detail page view.
--
-- Apply to a remote project with either:
--   • supabase db push              (from the repo root, once linked), or
--   • paste this file into the Supabase SQL editor
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.increment_product_view(p_id UUID)
RETURNS VOID AS $$
  UPDATE public.products SET view_count = view_count + 1 WHERE id = p_id;
$$ LANGUAGE sql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_product_view(UUID) TO anon, authenticated;
