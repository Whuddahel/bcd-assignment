-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: infinite recursion between the orders and order_items RLS policies
--
--   orders_select_own_seller     subqueries order_items
--   order_items_select_buyer     subqueries orders
--
-- Evaluating either policy triggers the other, forever. Postgres detects the
-- cycle and aborts with 42P17, so *every* read of public.orders fails — not
-- just the seller case. This blocks the whole seller order view.
--
-- The fix routes the orders → order_items lookup through a SECURITY DEFINER
-- function. It runs as the function owner, so RLS on order_items is not
-- re-evaluated and the cycle is broken. It stays safe because the function
-- only ever answers "does the calling user sell something in this order?" for
-- the caller's own auth.uid().
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.user_sells_in_order(p_order_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.seller_profiles sp ON sp.id = oi.seller_id
    WHERE oi.order_id = p_order_id
      AND sp.user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Lock the search_path so the definer-rights function cannot be redirected at
-- objects in a caller-controlled schema.
ALTER FUNCTION public.user_sells_in_order(UUID) SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.user_sells_in_order(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.user_sells_in_order(UUID)
  TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "orders_select_own_seller" ON public.orders;

CREATE POLICY "orders_select_own_seller"
  ON public.orders FOR SELECT
  USING (public.user_sells_in_order(id));
