-- CARTPLUS Row Level Security (RLS) Policies
-- PostgreSQL Migration 003

-- 1. Helper function to check admin role without recursive policies
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = check_user_id AND role = 'admin' AND status = 'active'
  );
$$;

-- 2. Helper function to get seller_id for a user
CREATE OR REPLACE FUNCTION public.get_seller_id_for_user(check_user_id UUID DEFAULT auth.uid())
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id FROM public.seller_profiles
  WHERE user_id = check_user_id
  LIMIT 1;
$$;

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_payouts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 1. PROFILES POLICIES
-- ============================================================
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Users can update own profile name, phone (cannot change role or status)
CREATE POLICY "Users can update own basic profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND
    status = (SELECT status FROM public.profiles WHERE id = auth.uid())
  );

-- Admins have full access to profiles
CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- ============================================================
-- 2. SELLER PROFILES POLICIES
-- ============================================================
-- Public can view active/verified seller store details
CREATE POLICY "Public can view active sellers"
  ON public.seller_profiles FOR SELECT
  USING (status IN ('active', 'verified') OR auth.uid() = user_id OR public.is_admin());

-- Authenticated user can create a seller profile (starts as pending)
CREATE POLICY "Users can register as seller"
  ON public.seller_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Seller can update own business info (cannot self-verify or change commission)
CREATE POLICY "Seller can update own business info"
  ON public.seller_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    status = (SELECT status FROM public.seller_profiles WHERE user_id = auth.uid()) AND
    commission_rate = (SELECT commission_rate FROM public.seller_profiles WHERE user_id = auth.uid())
  );

-- Admin can manage all seller profiles
CREATE POLICY "Admins can manage seller profiles"
  ON public.seller_profiles FOR ALL
  USING (public.is_admin());

-- ============================================================
-- 3. SELLER BANK ACCOUNTS POLICIES (STRICT PRIVACY)
-- ============================================================
-- Only seller owner can view own bank details
CREATE POLICY "Sellers can view own bank account"
  ON public.seller_bank_accounts FOR SELECT
  USING (
    seller_id = public.get_seller_id_for_user(auth.uid()) OR
    public.is_admin()
  );

-- Sellers can insert/update own bank account
CREATE POLICY "Sellers can manage own bank account"
  ON public.seller_bank_accounts FOR ALL
  USING (
    seller_id = public.get_seller_id_for_user(auth.uid()) OR
    public.is_admin()
  );

-- ============================================================
-- 4. CATEGORIES POLICIES
-- ============================================================
CREATE POLICY "Anyone can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin());

-- ============================================================
-- 5. PRODUCTS POLICIES
-- ============================================================
-- Public can only view approved active products
CREATE POLICY "Public can view active products"
  ON public.products FOR SELECT
  USING (
    (status = 'active' AND is_active = TRUE) OR
    seller_id = public.get_seller_id_for_user(auth.uid()) OR
    public.is_admin()
  );

-- Approved seller can insert new product as draft or pending_review
CREATE POLICY "Sellers can insert own products"
  ON public.products FOR INSERT
  WITH CHECK (
    seller_id = public.get_seller_id_for_user(auth.uid()) AND
    status IN ('draft', 'pending_review')
  );

-- Seller can update own products (cannot approve own product)
CREATE POLICY "Sellers can update own products"
  ON public.products FOR UPDATE
  USING (seller_id = public.get_seller_id_for_user(auth.uid()))
  WITH CHECK (
    seller_id = public.get_seller_id_for_user(auth.uid()) AND
    (
      -- If updating, cannot self-approve from pending/draft to active directly without admin
      status IN ('draft', 'pending_review') OR
      status = (SELECT status FROM public.products WHERE id = products.id)
    )
  );

-- Seller can delete own draft or pending products
CREATE POLICY "Sellers can delete own draft products"
  ON public.products FOR DELETE
  USING (
    seller_id = public.get_seller_id_for_user(auth.uid()) AND
    status IN ('draft', 'pending_review', 'rejected')
  );

-- Admins can manage all products
CREATE POLICY "Admins can manage all products"
  ON public.products FOR ALL
  USING (public.is_admin());

-- ============================================================
-- 6. PRODUCT IMAGES POLICIES
-- ============================================================
CREATE POLICY "Anyone can view product images"
  ON public.product_images FOR SELECT
  USING (TRUE);

CREATE POLICY "Sellers can manage images for own products"
  ON public.product_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_images.product_id
      AND products.seller_id = public.get_seller_id_for_user(auth.uid())
    ) OR public.is_admin()
  );

-- ============================================================
-- 7. ADDRESSES POLICIES
-- ============================================================
CREATE POLICY "Users can manage own addresses"
  ON public.addresses FOR ALL
  USING (auth.uid() = user_id OR public.is_admin());

-- ============================================================
-- 8. ORDERS POLICIES
-- ============================================================
-- Customer can read own orders
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Authenticated customer can create orders for themselves (validated via create_order RPC)
CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Customer cannot modify orders after placement; Admins have full access
CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

-- ============================================================
-- 9. ORDER ITEMS POLICIES
-- ============================================================
-- Customer can view items for their own orders
CREATE POLICY "Customer can view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    ) OR
    -- Seller can view ONLY their own items
    seller_id = public.get_seller_id_for_user(auth.uid()) OR
    public.is_admin()
  );

CREATE POLICY "Admins can manage order items"
  ON public.order_items FOR ALL
  USING (public.is_admin());

-- ============================================================
-- 10. ORDER TRACKING POLICIES
-- ============================================================
CREATE POLICY "Users can view tracking for own orders"
  ON public.order_tracking_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_tracking_events.order_id
      AND orders.user_id = auth.uid()
    ) OR public.is_admin()
  );

CREATE POLICY "Admins can manage tracking events"
  ON public.order_tracking_events FOR ALL
  USING (public.is_admin());

-- ============================================================
-- 11. PRODUCT REVIEWS POLICIES
-- ============================================================
CREATE POLICY "Anyone can view approved reviews"
  ON public.product_reviews FOR SELECT
  USING (is_approved = TRUE OR auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can submit reviews for moderation"
  ON public.product_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_approved = FALSE);

CREATE POLICY "Users can update own unapproved reviews"
  ON public.product_reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND is_approved = FALSE);

CREATE POLICY "Admins can moderate reviews"
  ON public.product_reviews FOR ALL
  USING (public.is_admin());

-- ============================================================
-- 12. WISHLISTS POLICIES
-- ============================================================
CREATE POLICY "Users can manage own wishlist"
  ON public.wishlists FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- 13. SUPPORT REQUESTS & MESSAGES POLICIES
-- ============================================================
CREATE POLICY "Users can manage own support requests"
  ON public.support_requests FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create support requests"
  ON public.support_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all support requests"
  ON public.support_requests FOR ALL
  USING (public.is_admin());

CREATE POLICY "Users can view messages for own tickets"
  ON public.support_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_requests
      WHERE support_requests.id = support_messages.request_id
      AND support_requests.user_id = auth.uid()
    ) OR public.is_admin()
  );

CREATE POLICY "Users can send messages on own tickets"
  ON public.support_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_requests
      WHERE support_requests.id = support_messages.request_id
      AND support_requests.user_id = auth.uid()
    ) OR public.is_admin()
  );

-- ============================================================
-- 14. NOTIFICATIONS POLICIES
-- ============================================================
CREATE POLICY "Users can view and update own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- 15. AUDIT LOGS POLICIES
-- ============================================================
CREATE POLICY "Only admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

-- ============================================================
-- 16. MARKETPLACE SETTINGS POLICIES
-- ============================================================
CREATE POLICY "Anyone can view marketplace settings"
  ON public.marketplace_settings FOR SELECT
  USING (TRUE);

CREATE POLICY "Only admins can update marketplace settings"
  ON public.marketplace_settings FOR ALL
  USING (public.is_admin());

-- ============================================================
-- 17. SELLER PAYOUTS POLICIES
-- ============================================================
CREATE POLICY "Sellers can view own payouts"
  ON public.seller_payouts FOR SELECT
  USING (seller_id = public.get_seller_id_for_user(auth.uid()) OR public.is_admin());

CREATE POLICY "Only admins can manage payouts"
  ON public.seller_payouts FOR ALL
  USING (public.is_admin());

-- ============================================================
-- 18. ROLE PRIVILEGES & SCHEMA CACHE
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Full administrative access for service_role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- Anonymous visitor least-privilege permissions
GRANT SELECT ON public.categories, public.products, public.product_images, public.product_reviews, public.seller_profiles, public.marketplace_settings, public.orders, public.order_items, public.order_tracking_events TO anon;
GRANT INSERT ON public.orders, public.order_items, public.order_tracking_events, public.support_requests, public.support_messages TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL ROUTINES IN SCHEMA public TO anon;

-- Authenticated user permissions (further restricted by RLS policies)
GRANT SELECT ON public.categories, public.products, public.product_images, public.product_reviews, public.seller_profiles, public.marketplace_settings, public.profiles, public.addresses, public.wishlists, public.orders, public.order_items, public.order_tracking_events, public.notifications, public.support_requests, public.support_messages, public.seller_payouts TO authenticated;
GRANT INSERT ON public.profiles, public.addresses, public.wishlists, public.orders, public.order_items, public.order_tracking_events, public.product_reviews, public.support_requests, public.support_messages, public.notifications, public.seller_profiles, public.products, public.product_images, public.seller_payouts TO authenticated;
GRANT UPDATE ON public.profiles, public.addresses, public.wishlists, public.orders, public.order_tracking_events, public.product_reviews, public.notifications, public.seller_profiles, public.products, public.product_images, public.support_requests, public.marketplace_settings, public.seller_payouts TO authenticated;
GRANT DELETE ON public.addresses, public.wishlists, public.product_images, public.products, public.notifications, public.product_reviews TO authenticated;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL ROUTINES IN SCHEMA public TO authenticated;

NOTIFY pgrst, 'reload schema';

