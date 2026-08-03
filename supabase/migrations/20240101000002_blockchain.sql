-- ─────────────────────────────────────────────────────────────────────────────
-- Phase 2 — Blockchain bridge
--
-- The off-chain (Supabase) and on-chain (Hardhat) worlds are joined by a single
-- value: the AureonAsset ERC-721 token id. We store it here so the frontend can
-- look up a product's token and then read its provenance/attestation from the
-- local chain.
--
-- Apply to a remote project with either:
--   • supabase db push              (from the repo root, once linked), or
--   • paste this file into the Supabase SQL editor
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS blockchain_token_id    TEXT,
  ADD COLUMN IF NOT EXISTS blockchain_minted_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS blockchain_attested_at TIMESTAMPTZ;

COMMENT ON COLUMN public.products.blockchain_token_id IS
  'AureonAsset ERC-721 token id (as text) — the bridge to on-chain provenance.';

-- Fast "is this product minted?" lookups.
CREATE INDEX IF NOT EXISTS idx_products_blockchain_token_id
  ON public.products (blockchain_token_id)
  WHERE blockchain_token_id IS NOT NULL;
