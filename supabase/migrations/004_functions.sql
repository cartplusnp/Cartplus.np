-- CARTPLUS Database Functions & Atomic Transactions
-- PostgreSQL Migration 004

-- 1. Automatic Profile Creation on Supabase Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    'customer',
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Secure Server-Side Atomic Order Creation
-- Eliminates client-side price tampering and prevents race-condition overselling.
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
BEGIN
  -- 1. Validate caller authentication
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to place an order.';
  END IF;

  -- 2. Validate input items
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item.';
  END IF;

  -- 3. Fetch configurable delivery fee from marketplace_settings if present
  SELECT value INTO v_settings_delivery FROM public.marketplace_settings WHERE key = 'delivery_fee';
  IF v_settings_delivery IS NOT NULL AND (v_settings_delivery->>'fee') IS NOT NULL THEN
    v_delivery_fee := (v_settings_delivery->>'fee')::NUMERIC;
  END IF;

  -- 4. Lock products & verify stock, active status, authoritative price
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

    -- Compute Authoritative Financial Totals
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

  -- Calculate Total
  v_total := v_subtotal + v_delivery_fee;

  -- 5. Generate secure, human-readable order number: CP-YYYYMMDD-XXXXXX
  v_date_prefix := to_char(NOW(), 'YYYYMMDD');
  v_random_suffix := upper(substr(md5(gen_random_uuid()::text), 1, 6));
  v_order_number := 'CP-' || v_date_prefix || '-' || v_random_suffix;

  -- 6. Insert Order
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
    p_payment_method,
    CASE WHEN p_payment_method = 'Cash on Delivery' THEN 'cod_pending' ELSE 'pending' END,
    'pending',
    p_notes
  )
  RETURNING id INTO v_order_id;

  -- 7. Insert Order Items (Immutable Snapshots)
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_order_items_to_insert)
  LOOP
    INSERT INTO public.order_items (
      order_id,
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

  -- 8. Create Initial Tracking Event
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
    'Order Placed',
    'Your order has been recorded in the CARTPLUS system and is awaiting seller fulfillment confirmation.',
    COALESCE(p_delivery_address->>'district', 'Nepal')
  );

  -- 9. Create Notification for Customer
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    order_id
  )
  VALUES (
    v_user_id,
    'order_update',
    'Order Confirmed: ' || v_order_number,
    'Thank you! Your order ' || v_order_number || ' totaling Rs. ' || v_total || ' has been successfully placed.',
    v_order_id
  );

  -- 10. Audit Log
  INSERT INTO public.audit_logs (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  VALUES (
    v_user_id,
    'order_created',
    'orders',
    v_order_id::text,
    jsonb_build_object(
      'order_number', v_order_number,
      'total', v_total,
      'payment_method', p_payment_method
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'delivery_fee', v_delivery_fee,
    'total', v_total
  );
END;
$$;

-- 3. Restore Stock on Order Cancellation
CREATE OR REPLACE FUNCTION public.restore_stock_on_cancel(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_order RECORD;
  v_item RECORD;
BEGIN
  -- Fetch order and verify caller is owner or admin
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found.';
  END IF;

  IF v_order.user_id != v_caller AND NOT public.is_admin(v_caller) THEN
    RAISE EXCEPTION 'Unauthorized to cancel this order.';
  END IF;

  IF v_order.order_status IN ('shipped', 'out_for_delivery', 'delivered', 'cancelled') THEN
    RAISE EXCEPTION 'Order cannot be cancelled in status "%".', v_order.order_status;
  END IF;

  -- Restore stock to products
  FOR v_item IN SELECT product_id, quantity FROM public.order_items WHERE order_id = p_order_id
  LOOP
    IF v_item.product_id IS NOT NULL THEN
      UPDATE public.products
      SET stock = stock + v_item.quantity,
          updated_at = NOW()
      WHERE id = v_item.product_id;
    END IF;
  END LOOP;

  -- Update order status
  UPDATE public.orders
  SET order_status = 'cancelled',
      updated_at = NOW()
  WHERE id = p_order_id;

  -- Insert tracking event
  INSERT INTO public.order_tracking_events (
    order_id,
    status,
    title,
    description,
    location
  )
  VALUES (
    p_order_id,
    'cancelled',
    'Order Cancelled',
    'Order was cancelled and inventory reserved for this order was returned to stock.',
    'System'
  );

  -- Audit log
  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  VALUES (v_caller, 'order_cancelled', 'orders', p_order_id::text, jsonb_build_object('restored_stock', true));

  RETURN TRUE;
END;
$$;

-- 4. Admin Update Order Status
CREATE OR REPLACE FUNCTION public.admin_update_order_status(
  p_order_id UUID,
  p_status TEXT,
  p_notes TEXT DEFAULT NULL,
  p_location TEXT DEFAULT 'Nepal Central Distribution Center',
  p_courier_name TEXT DEFAULT NULL,
  p_tracking_number TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator privileges required.';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found.';
  END IF;

  -- Update order
  UPDATE public.orders
  SET order_status = p_status,
      payment_status = CASE
        WHEN p_status = 'delivered' AND payment_method = 'Cash on Delivery' THEN 'paid'
        ELSE payment_status
      END,
      notes = COALESCE(p_notes, notes),
      courier_info = CASE
        WHEN p_courier_name IS NOT NULL THEN jsonb_build_object(
          'provider_name', p_courier_name,
          'tracking_number', p_tracking_number,
          'last_updated', NOW()
        )
        ELSE courier_info
      END,
      updated_at = NOW()
  WHERE id = p_order_id;

  -- Add tracking record
  INSERT INTO public.order_tracking_events (
    order_id,
    status,
    title,
    description,
    location,
    courier_name,
    tracking_number
  )
  VALUES (
    p_order_id,
    p_status,
    'Status Updated to ' || upper(p_status),
    COALESCE(p_notes, 'Shipment status updated to ' || p_status),
    p_location,
    p_courier_name,
    p_tracking_number
  );

  -- Notify customer
  IF v_order.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, order_id)
    VALUES (
      v_order.user_id,
      'order_update',
      'Order Status: ' || upper(p_status),
      'Your order ' || v_order.order_number || ' status is now ' || p_status || '.',
      p_order_id
    );
  END IF;

  -- Audit log
  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'order_status_updated', 'orders', p_order_id::text, jsonb_build_object('status', p_status));

  RETURN TRUE;
END;
$$;

-- 5. Admin Approve / Reject Seller
CREATE OR REPLACE FUNCTION public.approve_seller(
  p_seller_id UUID,
  p_commission_rate NUMERIC DEFAULT 5.0,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seller RECORD;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator privileges required.';
  END IF;

  SELECT * INTO v_seller FROM public.seller_profiles WHERE id = p_seller_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Seller profile not found.';
  END IF;

  UPDATE public.seller_profiles
  SET status = 'verified',
      commission_rate = p_commission_rate,
      reviewed_by = auth.uid(),
      reviewed_at = NOW(),
      verification_notes = p_notes,
      updated_at = NOW()
  WHERE id = p_seller_id;

  -- Promote user role to seller
  UPDATE public.profiles
  SET role = 'seller',
      updated_at = NOW()
  WHERE id = v_seller.user_id;

  -- Notify user
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (
    v_seller.user_id,
    'seller_approved',
    'Merchant Account Verified & Approved!',
    'Congratulations! Your store "' || v_seller.store_name || '" has been verified by CARTPLUS. You can now access your Seller Dashboard and list products.'
  );

  -- Audit log
  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'seller_approved', 'seller_profiles', p_seller_id::text, jsonb_build_object('commission_rate', p_commission_rate));

  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_seller(
  p_seller_id UUID,
  p_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seller RECORD;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator privileges required.';
  END IF;

  SELECT * INTO v_seller FROM public.seller_profiles WHERE id = p_seller_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Seller profile not found.';
  END IF;

  UPDATE public.seller_profiles
  SET status = 'rejected',
      reviewed_by = auth.uid(),
      reviewed_at = NOW(),
      rejection_reason = p_reason,
      updated_at = NOW()
  WHERE id = p_seller_id;

  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (
    v_seller.user_id,
    'seller_rejected',
    'Seller Application Notice',
    'Your seller application for "' || v_seller.store_name || '" was reviewed: ' || p_reason
  );

  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'seller_rejected', 'seller_profiles', p_seller_id::text, jsonb_build_object('reason', p_reason));

  RETURN TRUE;
END;
$$;

-- 6. Admin Approve / Reject Product
CREATE OR REPLACE FUNCTION public.approve_product(p_product_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator privileges required.';
  END IF;

  UPDATE public.products
  SET status = 'active',
      is_active = TRUE,
      rejection_reason = NULL,
      updated_at = NOW()
  WHERE id = p_product_id;

  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'product_approved', 'products', p_product_id::text, '{}'::jsonb);

  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_product(p_product_id UUID, p_reason TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator privileges required.';
  END IF;

  UPDATE public.products
  SET status = 'rejected',
      is_active = FALSE,
      rejection_reason = p_reason,
      updated_at = NOW()
  WHERE id = p_product_id;

  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'product_rejected', 'products', p_product_id::text, jsonb_build_object('reason', p_reason));

  RETURN TRUE;
END;
$$;
