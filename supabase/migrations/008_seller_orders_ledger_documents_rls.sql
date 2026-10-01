-- ============================================================================
-- CARTPLUS Database Migration 008
-- Seller Orders, Seller Documents, Persistent Seller Ledger, Order Items Linkage,
-- Strict RLS Isolation, Payment Gateways Isolation & Order Transition Validation
-- ============================================================================

-- 1. SELLER ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.seller_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
  seller_order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded')),
  subtotal NUMERIC NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  delivery_fee NUMERIC NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  discount_amount NUMERIC NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  commission_rate NUMERIC NOT NULL DEFAULT 5.0 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  commission_amount NUMERIC NOT NULL DEFAULT 0 CHECK (commission_amount >= 0),
  payout_amount NUMERIC NOT NULL DEFAULT 0 CHECK (payout_amount >= 0),
  settlement_status TEXT NOT NULL DEFAULT 'pending_hold' CHECK (settlement_status IN ('pending_hold', 'available', 'paid', 'disputed')),
  settlement_eligible_at TIMESTAMPTZ,
  tracking_number TEXT,
  courier_code TEXT,
  seller_notes TEXT,
  cancelled_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by order_id, seller_id, and status
CREATE INDEX IF NOT EXISTS idx_seller_orders_order_id ON public.seller_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_seller_orders_seller_id ON public.seller_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_orders_status ON public.seller_orders(status);
CREATE INDEX IF NOT EXISTS idx_seller_orders_created_at ON public.seller_orders(created_at DESC);

-- 2. LINK ORDER_ITEMS TO SELLER_ORDERS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name = 'seller_order_id'
  ) THEN
    ALTER TABLE public.order_items 
      ADD COLUMN seller_order_id UUID REFERENCES public.seller_orders(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_order_items_seller_order_id ON public.order_items(seller_order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_seller_id ON public.order_items(seller_id);

-- 3. SELLER DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.seller_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('citizenship_front', 'citizenship_back', 'pan_certificate', 'business_registration', 'tax_clearance', 'bank_cheque', 'other')),
  document_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  verification_status TEXT NOT NULL DEFAULT 'under_review' CHECK (verification_status IN ('format_validated', 'under_review', 'officially_verified', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_documents_seller_id ON public.seller_documents(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_documents_status ON public.seller_documents(verification_status);

-- 4. PERSISTENT SELLER LEDGER SYSTEM
CREATE TABLE IF NOT EXISTS public.seller_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('SALE', 'COMMISSION', 'REFUND', 'RETURN', 'ADJUSTMENT', 'PAYOUT', 'SHIPPING_ADJUSTMENT', 'OTHER')),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('credit', 'debit')),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  seller_order_id UUID REFERENCES public.seller_orders(id) ON DELETE SET NULL,
  reference_id TEXT,
  description TEXT NOT NULL,
  balance_after NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_ledger_seller_id ON public.seller_ledger(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_ledger_created_at ON public.seller_ledger(created_at DESC);

-- 5. PRIVATE ADMIN PAYMENT SETTINGS (SEPARATE FROM PUBLIC MARKETPLACE SETTINGS)
CREATE TABLE IF NOT EXISTS public.admin_payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_legal_name TEXT NOT NULL DEFAULT 'CARTPLUS Nepal Pvt. Ltd.',
  admin_name TEXT,
  admin_email TEXT,
  admin_phone TEXT,
  esewa_id TEXT,
  esewa_name TEXT,
  esewa_qr_url TEXT,
  khalti_id TEXT,
  khalti_name TEXT,
  khalti_qr_url TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  bank_branch TEXT,
  bank_qr_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Delete sensitive private payout settings from public marketplace_settings if present
DELETE FROM public.marketplace_settings WHERE key = 'admin_payout_settings';

-- 6. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on newly created tables
ALTER TABLE public.seller_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_payment_settings ENABLE ROW LEVEL SECURITY;

-- 6A. SELLER ORDERS POLICIES
DROP POLICY IF EXISTS "Admins can view all seller orders" ON public.seller_orders;
CREATE POLICY "Admins can view all seller orders"
  ON public.seller_orders FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update seller orders" ON public.seller_orders;
CREATE POLICY "Admins can update seller orders"
  ON public.seller_orders FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Sellers can view own seller orders" ON public.seller_orders;
CREATE POLICY "Sellers can view own seller orders"
  ON public.seller_orders FOR SELECT
  USING (seller_id = public.get_seller_id_for_user(auth.uid()));

DROP POLICY IF EXISTS "Sellers can update own seller orders" ON public.seller_orders;
CREATE POLICY "Sellers can update own seller orders"
  ON public.seller_orders FOR UPDATE
  USING (seller_id = public.get_seller_id_for_user(auth.uid()))
  WITH CHECK (seller_id = public.get_seller_id_for_user(auth.uid()));

-- 6B. ORDER ITEMS STRICT SELLER ISOLATION (Item 6: Sellers see ONLY their own items)
DROP POLICY IF EXISTS "Customer can view own order items" ON public.order_items;
CREATE POLICY "Customer can view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    ) OR
    -- Seller sees ONLY their own order items
    seller_id = public.get_seller_id_for_user(auth.uid()) OR
    public.is_admin()
  );

-- 6C. SELLER DOCUMENTS POLICIES
DROP POLICY IF EXISTS "Admins can manage seller documents" ON public.seller_documents;
CREATE POLICY "Admins can manage seller documents"
  ON public.seller_documents FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Sellers can view own documents" ON public.seller_documents;
CREATE POLICY "Sellers can view own documents"
  ON public.seller_documents FOR SELECT
  USING (seller_id = public.get_seller_id_for_user(auth.uid()));

DROP POLICY IF EXISTS "Sellers can insert own documents" ON public.seller_documents;
CREATE POLICY "Sellers can insert own documents"
  ON public.seller_documents FOR INSERT
  WITH CHECK (seller_id = public.get_seller_id_for_user(auth.uid()));

-- 6D. SELLER LEDGER POLICIES
DROP POLICY IF EXISTS "Admins can manage seller ledger" ON public.seller_ledger;
CREATE POLICY "Admins can manage seller ledger"
  ON public.seller_ledger FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Sellers can view own ledger" ON public.seller_ledger;
CREATE POLICY "Sellers can view own ledger"
  ON public.seller_ledger FOR SELECT
  USING (seller_id = public.get_seller_id_for_user(auth.uid()));

-- 6E. PRIVATE ADMIN PAYMENT SETTINGS (Item 9: Isolated from public)
DROP POLICY IF EXISTS "Admins only access admin payment settings" ON public.admin_payment_settings;
CREATE POLICY "Admins only access admin payment settings"
  ON public.admin_payment_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7. STORAGE POLICIES (Item 8: Restrict product-image uploads to approved sellers/admins)
DO $$
BEGIN
  -- Restrict product-images upload policy
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Sellers and Admins can upload product images' AND tablename = 'objects') THEN
    DROP POLICY "Sellers and Admins can upload product images" ON storage.objects;
  END IF;

  CREATE POLICY "Approved sellers and admins can upload product images"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'product-images' AND
      (
        public.is_admin() OR
        EXISTS (
          SELECT 1 FROM public.seller_profiles
          WHERE user_id = auth.uid() AND status = 'verified'
        )
      )
    );

  -- Storage policy for seller documents upload
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Sellers can upload own documents' AND tablename = 'objects') THEN
    DROP POLICY "Sellers can upload own documents" ON storage.objects;
  END IF;

  CREATE POLICY "Sellers can upload own documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'seller-documents' AND
      (
        auth.uid() = owner OR
        EXISTS (
          SELECT 1 FROM public.seller_profiles
          WHERE user_id = auth.uid()
        )
      )
    );

  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Sellers can view own documents' AND tablename = 'objects') THEN
    DROP POLICY "Sellers can view own documents" ON storage.objects;
  END IF;

  CREATE POLICY "Sellers can view own documents"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'seller-documents' AND
      (
        auth.uid() = owner OR
        public.is_admin() OR
        EXISTS (
          SELECT 1 FROM public.seller_profiles
          WHERE user_id = auth.uid()
        )
      )
    );
END $$;

-- 8. ORDER STATUS TRANSITION VALIDATION (Item 17: Server-side validation)
CREATE OR REPLACE FUNCTION public.validate_order_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If status hasn't changed, allow update
  IF OLD.order_status = NEW.order_status THEN
    RETURN NEW;
  END IF;

  -- Admin can manage or override status transitions
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Valid transition map for orders:
  -- pending -> confirmed, cancelled
  -- confirmed -> processing, cancelled
  -- processing -> shipped, cancelled
  -- shipped -> delivered, returned, cancelled
  -- delivered -> returned
  -- cancelled -> (terminal)
  -- returned -> (terminal)
  IF OLD.order_status = 'pending' AND NEW.order_status IN ('confirmed', 'cancelled', 'processing') THEN
    RETURN NEW;
  ELSIF OLD.order_status = 'confirmed' AND NEW.order_status IN ('processing', 'cancelled') THEN
    RETURN NEW;
  ELSIF OLD.order_status = 'processing' AND NEW.order_status IN ('shipped', 'cancelled') THEN
    RETURN NEW;
  ELSIF OLD.order_status = 'shipped' AND NEW.order_status IN ('delivered', 'returned', 'cancelled') THEN
    RETURN NEW;
  ELSIF OLD.order_status = 'delivered' AND NEW.order_status IN ('returned') THEN
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Invalid order status transition from % to %', OLD.order_status, NEW.order_status;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_order_status_transition ON public.orders;
CREATE TRIGGER trg_validate_order_status_transition
  BEFORE UPDATE OF order_status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_status_transition();

-- Validation for seller_orders status transitions
CREATE OR REPLACE FUNCTION public.validate_seller_order_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Valid transition map for seller_orders:
  -- pending -> processing, cancelled
  -- processing -> shipped, cancelled
  -- shipped -> delivered, returned, cancelled
  -- delivered -> returned
  -- cancelled -> terminal
  -- returned -> terminal
  -- refunded -> terminal
  IF OLD.status = 'pending' AND NEW.status IN ('processing', 'cancelled') THEN
    RETURN NEW;
  ELSIF OLD.status = 'processing' AND NEW.status IN ('shipped', 'cancelled') THEN
    RETURN NEW;
  ELSIF OLD.status = 'shipped' AND NEW.status IN ('delivered', 'returned', 'cancelled') THEN
    RETURN NEW;
  ELSIF OLD.status = 'delivered' AND NEW.status IN ('returned') THEN
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Invalid seller order status transition from % to %', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_seller_order_status_transition ON public.seller_orders;
CREATE TRIGGER trg_validate_seller_order_status_transition
  BEFORE UPDATE OF status ON public.seller_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_seller_order_status_transition();

-- 9. ATOMIC CREATE_ORDER RPC WITH SELLER SUB-ORDERS, LEDGER & COD ENFORCEMENT
CREATE OR REPLACE FUNCTION public.create_order(
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_email TEXT,
  p_delivery_address JSONB,
  p_payment_method TEXT,
  p_notes TEXT,
  p_items JSONB -- Array of objects: [{"product_id": "uuid", "quantity": 1}]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_order_id UUID;
  v_order_number TEXT;
  v_date_prefix TEXT;
  v_random_suffix TEXT;
  v_item JSONB;
  v_product RECORD;
  v_quantity INT;
  v_subtotal NUMERIC := 0;
  v_discount NUMERIC := 0;
  v_delivery_fee NUMERIC := 120;
  v_total NUMERIC := 0;
  v_settings_delivery JSONB;
  v_order_items_to_insert JSONB := '[]'::jsonb;
  v_seller_rec RECORD;
  v_seller_order_id UUID;
  v_seller_order_number TEXT;
  v_seller_subtotal NUMERIC;
  v_seller_commission_rate NUMERIC;
  v_seller_commission NUMERIC;
  v_seller_payout NUMERIC;
  v_seller_prev_balance NUMERIC;
  v_seller_new_balance NUMERIC;
  v_so_counter INT := 0;
BEGIN
  -- 1. Validate caller authentication
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to place an order.';
  END IF;

  -- 2. Validate payment method: Enforce COD only (Item 14, 15, 16)
  IF p_payment_method != 'Cash on Delivery' THEN
    RAISE EXCEPTION 'Payment method "%" is currently unavailable. Only Cash on Delivery is supported.', p_payment_method;
  END IF;

  -- 3. Validate input items
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item.';
  END IF;

  -- 4. Delivery fee from marketplace_settings
  SELECT value INTO v_settings_delivery FROM public.marketplace_settings WHERE key = 'delivery_fee';
  IF v_settings_delivery IS NOT NULL AND (v_settings_delivery->>'fee') IS NOT NULL THEN
    v_delivery_fee := (v_settings_delivery->>'fee')::NUMERIC;
  END IF;

  -- 5. Lock products & verify stock, active status, authoritative price
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_quantity := (v_item->>'quantity')::INT;
    IF v_quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid item quantity: %', v_quantity;
    END IF;

    -- Row lock FOR UPDATE on products to prevent race-condition overselling
    SELECT id, seller_id, name, sku, price, original_price, stock, is_active, status
    INTO v_product
    FROM public.products
    WHERE id = (v_item->>'product_id')::UUID
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found in catalog.', (v_item->>'product_id');
    END IF;

    IF v_product.status != 'active' OR v_product.is_active != TRUE THEN
      RAISE EXCEPTION 'Product "%" is currently unavailable.', v_product.name;
    END IF;

    IF v_product.stock < v_quantity THEN
      RAISE EXCEPTION 'Insufficient inventory for "%". Available: %, Requested: %',
        v_product.name, v_product.stock, v_quantity;
    END IF;

    -- Atomically decrement stock
    UPDATE public.products
    SET stock = stock - v_quantity,
        updated_at = NOW()
    WHERE id = v_product.id;

    -- Financial subtotal
    v_subtotal := v_subtotal + (v_product.price * v_quantity);

    -- Prepare item record
    v_order_items_to_insert := v_order_items_to_insert || jsonb_build_object(
      'product_id', v_product.id,
      'seller_id', v_product.seller_id,
      'product_name', v_product.name,
      'sku', v_product.sku,
      'price', v_product.price,
      'original_price', v_product.original_price,
      'quantity', v_quantity,
      'subtotal', (v_product.price * v_quantity)
    );
  END LOOP;

  -- Free delivery threshold check
  IF v_settings_delivery IS NOT NULL AND (v_settings_delivery->>'free_threshold') IS NOT NULL THEN
    IF v_subtotal >= (v_settings_delivery->>'free_threshold')::NUMERIC THEN
      v_delivery_fee := 0;
    END IF;
  END IF;

  v_total := v_subtotal + v_delivery_fee;

  -- 6. Generate order number: CP-YYYYMMDD-XXXXXX
  v_date_prefix := to_char(NOW(), 'YYYYMMDD');
  v_random_suffix := upper(substr(md5(gen_random_uuid()::text), 1, 6));
  v_order_number := 'CP-' || v_date_prefix || '-' || v_random_suffix;

  -- 7. Insert into public.orders
  INSERT INTO public.orders (
    order_number,
    user_id,
    customer_name,
    customer_phone,
    customer_email,
    delivery_address,
    subtotal,
    discount,
    delivery_fee,
    total,
    payment_method,
    payment_status,
    order_status,
    notes
  )
  VALUES (
    v_order_number,
    v_user_id,
    p_customer_name,
    p_customer_phone,
    p_customer_email,
    p_delivery_address,
    v_subtotal,
    v_discount,
    v_delivery_fee,
    v_total,
    'Cash on Delivery',
    'cod_pending',
    'pending',
    p_notes
  )
  RETURNING id INTO v_order_id;

  -- 8. Create SELLER_ORDERS for each distinct seller in the order (Item 1 & 5)
  -- Loop through distinct sellers present in this order
  FOR v_seller_rec IN 
    SELECT DISTINCT (item->>'seller_id')::UUID AS seller_id
    FROM jsonb_array_elements(v_order_items_to_insert) AS item
    WHERE (item->>'seller_id') IS NOT NULL
  LOOP
    v_so_counter := v_so_counter + 1;
    v_seller_order_number := 'SO-' || v_date_prefix || '-' || v_random_suffix || '-' || v_so_counter::TEXT;

    -- Calculate subtotal for this seller's items
    SELECT COALESCE(SUM((item->>'subtotal')::NUMERIC), 0)
    INTO v_seller_subtotal
    FROM jsonb_array_elements(v_order_items_to_insert) AS item
    WHERE (item->>'seller_id')::UUID = v_seller_rec.seller_id;

    -- Fetch seller commission_rate from seller_profiles
    SELECT COALESCE(commission_rate, 5.0)
    INTO v_seller_commission_rate
    FROM public.seller_profiles
    WHERE id = v_seller_rec.seller_id;

    IF v_seller_commission_rate IS NULL THEN
      v_seller_commission_rate := 5.0;
    END IF;

    v_seller_commission := ROUND((v_seller_subtotal * (v_seller_commission_rate / 100.0)), 2);
    v_seller_payout := v_seller_subtotal - v_seller_commission;

    -- Insert seller order
    INSERT INTO public.seller_orders (
      order_id,
      seller_id,
      seller_order_number,
      status,
      subtotal,
      delivery_fee,
      discount_amount,
      commission_rate,
      commission_amount,
      payout_amount,
      settlement_status
    )
    VALUES (
      v_order_id,
      v_seller_rec.seller_id,
      v_seller_order_number,
      'pending',
      v_seller_subtotal,
      0,
      0,
      v_seller_commission_rate,
      v_seller_commission,
      v_seller_payout,
      'pending_hold'
    )
    RETURNING id INTO v_seller_order_id;

    -- Update total_sales count on seller_profile
    UPDATE public.seller_profiles
    SET total_sales = total_sales + 1,
        updated_at = NOW()
    WHERE id = v_seller_rec.seller_id;

    -- Insert persistent ledger entries for this seller order (Item 4)
    -- Get current seller balance from latest ledger entry
    SELECT COALESCE(balance_after, 0)
    INTO v_seller_prev_balance
    FROM public.seller_ledger
    WHERE seller_id = v_seller_rec.seller_id
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_seller_prev_balance IS NULL THEN
      v_seller_prev_balance := 0;
    END IF;

    -- 1. Credit SALE revenue
    v_seller_new_balance := v_seller_prev_balance + v_seller_subtotal;
    INSERT INTO public.seller_ledger (
      seller_id,
      transaction_type,
      entry_type,
      amount,
      seller_order_id,
      reference_id,
      description,
      balance_after
    )
    VALUES (
      v_seller_rec.seller_id,
      'SALE',
      'credit',
      v_seller_subtotal,
      v_seller_order_id,
      v_seller_order_number,
      'Sale revenue from Order ' || v_seller_order_number,
      v_seller_new_balance
    );

    -- 2. Debit platform COMMISSION fee
    v_seller_new_balance := v_seller_new_balance - v_seller_commission;
    INSERT INTO public.seller_ledger (
      seller_id,
      transaction_type,
      entry_type,
      amount,
      seller_order_id,
      reference_id,
      description,
      balance_after
    )
    VALUES (
      v_seller_rec.seller_id,
      'COMMISSION',
      'debit',
      v_seller_commission,
      v_seller_order_id,
      v_seller_order_number,
      'Platform commission (' || v_seller_commission_rate || '%) for Order ' || v_seller_order_number,
      v_seller_new_balance
    );
  END LOOP;

  -- 9. Insert Order Items linked to seller_order_id and seller_id
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_order_items_to_insert)
  LOOP
    -- Look up the seller_order_id for this item's seller
    v_seller_order_id := NULL;
    IF (v_item->>'seller_id') IS NOT NULL THEN
      SELECT id INTO v_seller_order_id
      FROM public.seller_orders
      WHERE order_id = v_order_id AND seller_id = (v_item->>'seller_id')::UUID
      LIMIT 1;
    END IF;

    INSERT INTO public.order_items (
      order_id,
      seller_order_id,
      product_id,
      seller_id,
      product_name,
      sku,
      price,
      original_price,
      quantity,
      subtotal
    )
    VALUES (
      v_order_id,
      v_seller_order_id,
      (v_item->>'product_id')::UUID,
      (v_item->>'seller_id')::UUID,
      v_item->>'product_name',
      v_item->>'sku',
      (v_item->>'price')::NUMERIC,
      (v_item->>'original_price')::NUMERIC,
      (v_item->>'quantity')::INT,
      (v_item->>'subtotal')::NUMERIC
    );
  END LOOP;

  -- 10. Initial Tracking Event
  INSERT INTO public.order_tracking_events (
    order_id,
    status,
    title,
    description,
    location
  )
  VALUES (
    v_order_id,
    'pending',
    'Order Placed Successfully',
    'Your order has been registered and is pending verification by seller and central operations.',
    'Kathmandu Central Processing'
  );

  -- 11. Customer Notification
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    order_id
  )
  VALUES (
    v_user_id,
    'order_status',
    'Order Confirmed: ' || v_order_number,
    'Your order for NPR ' || v_total || ' has been confirmed with Cash on Delivery.',
    v_order_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'total', v_total
  );
END;
$$;

-- 10. PRIVACY-PRESERVING QR MANIFEST VERIFICATION RPC (Item 18: No customer PII exposed)
CREATE OR REPLACE FUNCTION public.verify_order_manifest(p_identifier TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_item_count INT;
BEGIN
  -- Look up order by order_number or id
  SELECT 
    id,
    order_number,
    order_status,
    payment_method,
    payment_status,
    total,
    (delivery_address->>'district') AS destination_district,
    created_at,
    courier_info
  INTO v_order
  FROM public.orders
  WHERE order_number = p_identifier OR id::TEXT = p_identifier
  LIMIT 1;

  IF NOT FOUND THEN
    -- Try checking seller_orders
    SELECT 
      so.id,
      so.seller_order_number AS order_number,
      so.status AS order_status,
      o.payment_method,
      o.payment_status,
      so.subtotal AS total,
      (o.delivery_address->>'district') AS destination_district,
      so.created_at,
      o.courier_info
    INTO v_order
    FROM public.seller_orders so
    JOIN public.orders o ON o.id = so.order_id
    WHERE so.seller_order_number = p_identifier OR so.id::TEXT = p_identifier
    LIMIT 1;
  END IF;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Manifest not found');
  END IF;

  -- Count total items without exposing product names or customer information
  SELECT COALESCE(SUM(quantity), 1)
  INTO v_item_count
  FROM public.order_items
  WHERE order_id = v_order.id OR seller_order_id = v_order.id;

  RETURN jsonb_build_object(
    'success', true,
    'order_number', v_order.order_number,
    'order_status', v_order.order_status,
    'payment_method', v_order.payment_method,
    'payment_status', v_order.payment_status,
    'total', v_order.total,
    'destination_district', COALESCE(v_order.destination_district, 'Nepal'),
    'item_count', COALESCE(v_item_count, 1),
    'created_at', v_order.created_at,
    'courier_name', (v_order.courier_info->>'provider_name'),
    'tracking_number', (v_order.courier_info->>'tracking_number')
  );
END;
$$;

-- 11. GRANTS AND SCHEMA RELOAD
GRANT SELECT ON public.seller_orders, public.seller_documents, public.seller_ledger TO authenticated;
GRANT INSERT, UPDATE ON public.seller_orders, public.seller_documents TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_order_manifest(TEXT) TO anon, authenticated;

-- Notify PostgREST schema cache
NOTIFY pgrst, 'reload schema';
