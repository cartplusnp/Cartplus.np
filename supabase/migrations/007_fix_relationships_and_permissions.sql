-- CARTPLUS PostgreSQL Schema & Relationship Cache Repair
-- Migration 007: Fix permissions and foreign key relationships for PostgREST

-- 1. Grant public schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Service role administrative access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- 3. Anonymous visitor least-privilege permissions
GRANT SELECT ON public.categories, public.products, public.product_images, public.product_reviews, public.seller_profiles, public.marketplace_settings, public.orders, public.order_items, public.order_tracking_events TO anon;
GRANT INSERT ON public.orders, public.order_items, public.order_tracking_events, public.support_requests, public.support_messages TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL ROUTINES IN SCHEMA public TO anon;

-- 4. Authenticated user permissions
GRANT SELECT ON public.categories, public.products, public.product_images, public.product_reviews, public.seller_profiles, public.marketplace_settings, public.profiles, public.addresses, public.wishlists, public.orders, public.order_items, public.order_tracking_events, public.notifications, public.support_requests, public.support_messages, public.seller_payouts TO authenticated;
GRANT INSERT ON public.profiles, public.addresses, public.wishlists, public.orders, public.order_items, public.order_tracking_events, public.product_reviews, public.support_requests, public.support_messages, public.notifications, public.seller_profiles, public.products, public.product_images, public.seller_payouts TO authenticated;
GRANT UPDATE ON public.profiles, public.addresses, public.wishlists, public.orders, public.order_tracking_events, public.product_reviews, public.notifications, public.seller_profiles, public.products, public.product_images, public.support_requests, public.marketplace_settings, public.seller_payouts TO authenticated;
GRANT DELETE ON public.addresses, public.wishlists, public.product_images, public.products, public.notifications, public.product_reviews TO authenticated;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL ROUTINES IN SCHEMA public TO authenticated;

-- 4. Ensure foreign key relationship between products and product_images
DO $$
BEGIN
  -- Check and ensure product_id in product_images references public.products(id)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_images'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'product_images_product_id_fkey'
    ) THEN
      ALTER TABLE public.product_images
        ADD CONSTRAINT product_images_product_id_fkey
        FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- 5. Ensure foreign key relationship between support_requests and support_messages
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'support_messages'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'support_requests'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'support_messages_request_id_fkey'
    ) THEN
      ALTER TABLE public.support_messages
        ADD CONSTRAINT support_messages_request_id_fkey
        FOREIGN KEY (request_id) REFERENCES public.support_requests(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- 6. Ensure product_reviews permissions and RLS policy
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_reviews'
  ) THEN
    -- Grant explicit permissions
    GRANT SELECT ON TABLE public.product_reviews TO anon, authenticated;
    GRANT INSERT, UPDATE, DELETE ON TABLE public.product_reviews TO authenticated;

    -- Ensure RLS is active
    ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

    -- Re-create public read policy
    DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.product_reviews;
    CREATE POLICY "Anyone can view approved reviews"
      ON public.product_reviews FOR SELECT
      TO anon, authenticated
      USING (is_approved = TRUE OR auth.uid() = user_id OR public.is_admin());
  END IF;
END $$;

-- 7. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
