-- ─────────────────────────────────────────────────────────────────────────────
-- Aureon — Initial Schema
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Enums ────────────────────────────────────────────────────────────────────

CREATE TYPE public.user_role AS ENUM ('customer', 'seller', 'admin', 'support');
CREATE TYPE public.product_status AS ENUM ('draft', 'pending_review', 'active', 'sold', 'archived');
CREATE TYPE public.product_condition AS ENUM ('mint', 'excellent', 'very_good', 'good', 'fair');
CREATE TYPE public.order_status AS ENUM (
  'pending', 'payment_processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'
);
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- ── Tables ───────────────────────────────────────────────────────────────────

-- profiles: extends auth.users, one row per user
CREATE TABLE public.profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role              public.user_role NOT NULL DEFAULT 'customer',
  full_name         TEXT,
  avatar_url        TEXT,
  bio               TEXT,
  phone             TEXT,
  stripe_customer_id TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- seller_profiles: extended seller metadata
CREATE TABLE public.seller_profiles (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name               TEXT NOT NULL,
  description                 TEXT,
  logo_url                    TEXT,
  banner_url                  TEXT,
  website_url                 TEXT,
  instagram_url               TEXT,
  total_sales                 INTEGER NOT NULL DEFAULT 0,
  total_revenue               BIGINT  NOT NULL DEFAULT 0,   -- stored in cents
  rating                      NUMERIC(3, 2),
  review_count                INTEGER NOT NULL DEFAULT 0,
  stripe_account_id           TEXT,                        -- Stripe Connect Express account ID
  stripe_onboarding_complete  BOOLEAN NOT NULL DEFAULT FALSE,
  verified                    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- categories: hierarchical product categories
CREATE TABLE public.categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  parent_id   UUID REFERENCES public.categories(id),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- products: individual listings
CREATE TABLE public.products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id        UUID NOT NULL REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
  category_id      UUID NOT NULL REFERENCES public.categories(id),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT,
  condition        public.product_condition NOT NULL DEFAULT 'excellent',
  status           public.product_status   NOT NULL DEFAULT 'draft',
  price            BIGINT NOT NULL,                -- in cents
  original_price   BIGINT,                         -- for "was" display
  currency         TEXT NOT NULL DEFAULT 'USD',
  sku              TEXT,
  attributes       JSONB NOT NULL DEFAULT '{}',    -- brand, model, year, material, size, etc.
  provenance_notes TEXT,
  certificate_url  TEXT,
  -- BLOCKCHAIN Phase 2: on_chain_token_id TEXT, provenance_record_hash TEXT, nft_contract_address TEXT
  is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
  is_trending      BOOLEAN NOT NULL DEFAULT FALSE,
  view_count       INTEGER NOT NULL DEFAULT 0,
  wishlist_count   INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- product_images: multiple images per product
CREATE TABLE public.product_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt         TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- orders: customer purchase records
CREATE TABLE public.orders (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id                 UUID NOT NULL REFERENCES public.profiles(id),
  status                   public.order_status NOT NULL DEFAULT 'pending',
  total_amount             BIGINT NOT NULL,  -- in cents
  platform_fee             BIGINT NOT NULL DEFAULT 0,
  stripe_payment_intent_id TEXT,
  stripe_payment_status    TEXT,
  -- BLOCKCHAIN Phase 2: blockchain_tx_hash TEXT (settlement transaction)
  shipping_address         JSONB,
  notes                    TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- order_items: line items within an order
CREATE TABLE public.order_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id        UUID NOT NULL REFERENCES public.products(id),
  seller_id         UUID NOT NULL REFERENCES public.seller_profiles(id),
  title             TEXT   NOT NULL,  -- snapshot at purchase time
  price             BIGINT NOT NULL,  -- in cents, snapshot
  quantity          INTEGER NOT NULL DEFAULT 1,
  stripe_transfer_id TEXT,            -- Stripe Connect transfer to seller
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- reviews: product ratings and text reviews
CREATE TABLE public.reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  reviewer_id  UUID NOT NULL REFERENCES public.profiles(id),
  order_id     UUID REFERENCES public.orders(id),
  rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title        TEXT,
  body         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, reviewer_id)
);

-- wishlist_items: user saved items
CREATE TABLE public.wishlist_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- cart_items: server-side shopping cart
CREATE TABLE public.cart_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- support_tickets: customer support requests
CREATE TABLE public.support_tickets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.profiles(id),
  order_id    UUID REFERENCES public.orders(id),
  subject     TEXT NOT NULL,
  status      public.ticket_status   NOT NULL DEFAULT 'open',
  priority    public.ticket_priority NOT NULL DEFAULT 'medium',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- support_messages: messages within a ticket thread
CREATE TABLE public.support_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES public.profiles(id),
  body        TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,  -- staff-only notes
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- notifications: in-app notification inbox
CREATE TABLE public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT,
  href       TEXT,
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- newsletter_subscribers: waitlist / email marketing
CREATE TABLE public.newsletter_subscribers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX idx_products_seller_id       ON public.products(seller_id);
CREATE INDEX idx_products_category_id     ON public.products(category_id);
CREATE INDEX idx_products_status          ON public.products(status);
CREATE INDEX idx_products_is_featured     ON public.products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_is_trending     ON public.products(is_trending) WHERE is_trending = TRUE;
CREATE INDEX idx_products_price           ON public.products(price);
CREATE INDEX idx_products_created_at      ON public.products(created_at DESC);
CREATE INDEX idx_product_images_product   ON public.product_images(product_id);
CREATE INDEX idx_orders_buyer_id          ON public.orders(buyer_id);
CREATE INDEX idx_orders_status            ON public.orders(status);
CREATE INDEX idx_order_items_order_id     ON public.order_items(order_id);
CREATE INDEX idx_order_items_seller_id    ON public.order_items(seller_id);
CREATE INDEX idx_reviews_product_id       ON public.reviews(product_id);
CREATE INDEX idx_wishlist_user_id         ON public.wishlist_items(user_id);
CREATE INDEX idx_cart_user_id             ON public.cart_items(user_id);
CREATE INDEX idx_tickets_user_id          ON public.support_tickets(user_id);
CREATE INDEX idx_tickets_assigned_to      ON public.support_tickets(assigned_to);
CREATE INDEX idx_tickets_status           ON public.support_tickets(status);
CREATE INDEX idx_notifications_user_id    ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread     ON public.notifications(user_id, read) WHERE read = FALSE;

-- Full-text search index on products
CREATE INDEX idx_products_fts ON public.products
  USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ── Functions ─────────────────────────────────────────────────────────────────

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Returns the calling user's role (SECURITY DEFINER so RLS policies can call it)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Auto-create a profile row when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recalculate seller rating + review_count after any review change
CREATE OR REPLACE FUNCTION public.refresh_seller_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_seller_id UUID;
BEGIN
  -- Determine which seller_profile to update
  SELECT seller_id INTO v_seller_id
  FROM public.products
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);

  UPDATE public.seller_profiles
  SET
    rating       = (SELECT AVG(r.rating) FROM public.reviews r
                    JOIN public.products p ON p.id = r.product_id
                    WHERE p.seller_id = v_seller_id),
    review_count = (SELECT COUNT(*) FROM public.reviews r
                    JOIN public.products p ON p.id = r.product_id
                    WHERE p.seller_id = v_seller_id)
  WHERE id = v_seller_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Keep wishlist_count on products in sync
CREATE OR REPLACE FUNCTION public.sync_wishlist_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.products SET wishlist_count = wishlist_count + 1 WHERE id = NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.products SET wishlist_count = GREATEST(wishlist_count - 1, 0) WHERE id = OLD.product_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Triggers ──────────────────────────────────────────────────────────────────

-- Auto-profile on sign-up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at maintenance
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_seller_profiles_updated_at
  BEFORE UPDATE ON public.seller_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_cart_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seller rating refresh
CREATE TRIGGER trg_reviews_refresh_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_seller_rating();

-- Wishlist count sync
CREATE TRIGGER trg_wishlist_count_insert
  AFTER INSERT ON public.wishlist_items
  FOR EACH ROW EXECUTE FUNCTION public.sync_wishlist_count();

CREATE TRIGGER trg_wishlist_count_delete
  AFTER DELETE ON public.wishlist_items
  FOR EACH ROW EXECUTE FUNCTION public.sync_wishlist_count();

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies: profiles ────────────────────────────────────────────────────

CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT USING (TRUE);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE USING (id = auth.uid());

-- ── RLS Policies: seller_profiles ────────────────────────────────────────────

CREATE POLICY "seller_profiles_select_all"
  ON public.seller_profiles FOR SELECT USING (TRUE);

CREATE POLICY "seller_profiles_insert_own"
  ON public.seller_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "seller_profiles_update_own"
  ON public.seller_profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "seller_profiles_admin_all"
  ON public.seller_profiles FOR ALL
  USING (public.get_user_role() = 'admin');

-- ── RLS Policies: categories ──────────────────────────────────────────────────

CREATE POLICY "categories_select_all"
  ON public.categories FOR SELECT USING (TRUE);

CREATE POLICY "categories_admin_all"
  ON public.categories FOR ALL
  USING (public.get_user_role() = 'admin');

-- ── RLS Policies: products ────────────────────────────────────────────────────

CREATE POLICY "products_select_active"
  ON public.products FOR SELECT
  USING (
    status = 'active'
    OR seller_id IN (SELECT id FROM public.seller_profiles WHERE user_id = auth.uid())
    OR public.get_user_role() IN ('admin', 'support')
  );

CREATE POLICY "products_insert_own_seller"
  ON public.products FOR INSERT
  WITH CHECK (
    seller_id IN (SELECT id FROM public.seller_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "products_update_own_seller"
  ON public.products FOR UPDATE
  USING (
    seller_id IN (SELECT id FROM public.seller_profiles WHERE user_id = auth.uid())
    OR public.get_user_role() = 'admin'
  );

CREATE POLICY "products_delete_own_seller"
  ON public.products FOR DELETE
  USING (
    seller_id IN (SELECT id FROM public.seller_profiles WHERE user_id = auth.uid())
    OR public.get_user_role() = 'admin'
  );

-- ── RLS Policies: product_images ──────────────────────────────────────────────

CREATE POLICY "product_images_select_all"
  ON public.product_images FOR SELECT USING (TRUE);

CREATE POLICY "product_images_manage_own"
  ON public.product_images FOR ALL
  USING (
    product_id IN (
      SELECT id FROM public.products
      WHERE seller_id IN (SELECT id FROM public.seller_profiles WHERE user_id = auth.uid())
    )
    OR public.get_user_role() = 'admin'
  );

-- ── RLS Policies: orders ──────────────────────────────────────────────────────

CREATE POLICY "orders_select_own_buyer"
  ON public.orders FOR SELECT
  USING (buyer_id = auth.uid());

CREATE POLICY "orders_select_own_seller"
  ON public.orders FOR SELECT
  USING (
    id IN (
      SELECT order_id FROM public.order_items
      WHERE seller_id IN (SELECT id FROM public.seller_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "orders_select_admin_support"
  ON public.orders FOR SELECT
  USING (public.get_user_role() IN ('admin', 'support'));

CREATE POLICY "orders_insert_authenticated"
  ON public.orders FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "orders_update_admin"
  ON public.orders FOR UPDATE
  USING (public.get_user_role() = 'admin');

-- ── RLS Policies: order_items ─────────────────────────────────────────────────

CREATE POLICY "order_items_select_buyer"
  ON public.order_items FOR SELECT
  USING (order_id IN (SELECT id FROM public.orders WHERE buyer_id = auth.uid()));

CREATE POLICY "order_items_select_seller"
  ON public.order_items FOR SELECT
  USING (seller_id IN (SELECT id FROM public.seller_profiles WHERE user_id = auth.uid()));

CREATE POLICY "order_items_select_admin"
  ON public.order_items FOR SELECT
  USING (public.get_user_role() IN ('admin', 'support'));

CREATE POLICY "order_items_insert_system"
  ON public.order_items FOR INSERT
  WITH CHECK (order_id IN (SELECT id FROM public.orders WHERE buyer_id = auth.uid()));

-- ── RLS Policies: reviews ─────────────────────────────────────────────────────

CREATE POLICY "reviews_select_all"
  ON public.reviews FOR SELECT USING (TRUE);

CREATE POLICY "reviews_insert_authenticated"
  ON public.reviews FOR INSERT
  WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "reviews_update_own"
  ON public.reviews FOR UPDATE
  USING (reviewer_id = auth.uid());

CREATE POLICY "reviews_delete_own"
  ON public.reviews FOR DELETE
  USING (reviewer_id = auth.uid() OR public.get_user_role() = 'admin');

-- ── RLS Policies: wishlist_items ──────────────────────────────────────────────

CREATE POLICY "wishlist_manage_own"
  ON public.wishlist_items FOR ALL
  USING (user_id = auth.uid());

-- ── RLS Policies: cart_items ──────────────────────────────────────────────────

CREATE POLICY "cart_manage_own"
  ON public.cart_items FOR ALL
  USING (user_id = auth.uid());

-- ── RLS Policies: support_tickets ────────────────────────────────────────────

CREATE POLICY "tickets_select_own"
  ON public.support_tickets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "tickets_select_staff"
  ON public.support_tickets FOR SELECT
  USING (public.get_user_role() IN ('admin', 'support'));

CREATE POLICY "tickets_insert_authenticated"
  ON public.support_tickets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "tickets_update_staff"
  ON public.support_tickets FOR UPDATE
  USING (public.get_user_role() IN ('admin', 'support'));

-- ── RLS Policies: support_messages ───────────────────────────────────────────

CREATE POLICY "messages_select_ticket_owner"
  ON public.support_messages FOR SELECT
  USING (
    (NOT is_internal AND ticket_id IN (SELECT id FROM public.support_tickets WHERE user_id = auth.uid()))
    OR public.get_user_role() IN ('admin', 'support')
  );

CREATE POLICY "messages_insert_ticket_owner"
  ON public.support_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND NOT is_internal
    AND ticket_id IN (SELECT id FROM public.support_tickets WHERE user_id = auth.uid())
  );

CREATE POLICY "messages_insert_staff"
  ON public.support_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND public.get_user_role() IN ('admin', 'support')
  );

-- ── RLS Policies: notifications ───────────────────────────────────────────────

CREATE POLICY "notifications_manage_own"
  ON public.notifications FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_admin"
  ON public.notifications FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

-- ── RLS Policies: newsletter_subscribers ─────────────────────────────────────

CREATE POLICY "newsletter_select_admin"
  ON public.newsletter_subscribers FOR SELECT
  USING (public.get_user_role() = 'admin');

CREATE POLICY "newsletter_insert_anon"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (TRUE);
