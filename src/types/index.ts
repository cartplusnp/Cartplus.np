export interface Product {
  id: string;
  seller_id?: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  categorySlug: string;
  subcategory?: string;
  price: number;
  original_price: number;
  discount: number;
  stock: number;
  sku: string;
  images: string[];
  thumbnail: string;
  rating: number;
  review_count: number;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_flash_deal?: boolean;
  brand?: string;
  seller_store_name?: string;
  specifications?: Record<string, string>;
  status?: 'draft' | 'pending_review' | 'active' | 'rejected' | 'inactive';
  rejection_reason?: string;
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export interface Address {
  id: string;
  user_id?: string;
  full_name: string;
  phone: string;
  province: string;
  district: string;
  municipality: string;
  ward?: string;
  street: string;
  landmark?: string;
  is_default: boolean;
  created_at?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'rejected';

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_slug: string;
  product_image: string;
  price: number;
  original_price?: number;
  quantity: number;
  seller_id?: string;
  sku?: string;
  subtotal?: number;
}

export interface TrackingEvent {
  id: string;
  status: OrderStatus | string;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  completed?: boolean;
  current?: boolean;
  courier_name?: string;
  tracking_number?: string;
}

export interface CourierInfo {
  provider_name: string;
  tracking_number: string;
  tracking_url?: string;
  driver_name?: string;
  driver_phone?: string;
  vehicle_type?: string;
  current_location?: string;
  estimated_delivery?: string;
  last_updated?: string;
}

export type PaymentMethod = 'Cash on Delivery' | 'eSewa' | 'Khalti' | 'Bank Card / Mobile Banking';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cod_pending';

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  phone: string;
  email: string;
  delivery_address: Address;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  payment_method: PaymentMethod | string;
  payment_status?: PaymentStatus;
  transaction_ref?: string;
  paid_to_account?: string;
  order_status: OrderStatus;
  notes?: string;
  courier_info?: CourierInfo;
  tracking_events?: TrackingEvent[];
  seller_orders?: SellerOrder[];
  created_at: string;
  updated_at?: string;
}

export interface AppNotification {
  id: string;
  user_id?: string;
  type: string;
  title: string;
  message: string;
  product_id?: string;
  product_slug?: string;
  product_image?: string;
  new_price?: number;
  previous_price?: number;
  order_id?: string;
  is_read: boolean;
  read?: boolean; // backwards compatibility
  created_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  review_text?: string;
  is_approved: boolean;
  approved?: boolean; // backwards compatibility
  created_at: string;
}

export type SupportCategory =
  | 'Order Help'
  | 'Delivery Help'
  | 'Return/Refund Help'
  | 'Payment Help'
  | 'Product Help'
  | 'General Support';

export type SupportStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportMessage {
  id: string;
  request_id: string;
  sender_id?: string;
  sender: 'customer' | 'support' | 'admin' | 'seller';
  sender_name?: string;
  message: string;
  created_at: string;
}

export interface SupportRequest {
  id: string;
  ticket_number?: string;
  user_id?: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  category: SupportCategory | string;
  order_id?: string;
  subject: string;
  message: string;
  status: SupportStatus;
  created_at: string;
  updated_at: string;
  messages: SupportMessage[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'seller' | 'admin';
  status?: 'active' | 'suspended' | 'blocked';
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  productCount: number;
  image?: string;
}

export interface CategoryBrowsingRecord {
  categorySlug: string;
  categoryName: string;
  viewCount: number;
  lastViewedAt: string;
}

export interface SellerProfile {
  id: string;
  user_id?: string;
  store_name: string;
  owner_name: string;
  email: string;
  phone: string;
  pan_vat_number: string;
  province: string;
  district: string;
  city: string;
  address: string;
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
  status: 'pending' | 'under_review' | 'verified' | 'active' | 'rejected' | 'suspended';
  commission_rate: number;
  rating: number;
  total_sales: number;
  rejection_reason?: string;
  verification_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  actor_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface MarketplaceSettings {
  delivery_fee: number;
  free_delivery_threshold: number;
  commission_rate: number;
  marketplace_status: boolean;
  slogan: string;
}

export interface SellerPayout {
  id: string;
  seller_id: string;
  gross_amount?: number;
  commission?: number;
  net_amount?: number;
  amount: number;
  payout_period?: string;
  payout_method: string;
  transfer_reference?: string;
  proof_url?: string;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  rejection_reason?: string;
  approved_by?: string;
  processed_by?: string;
  created_at: string;
  updated_at?: string;
  paid_at?: string;
}

export interface SellerOrder {
  id: string;
  order_id: string;
  seller_id: string;
  seller_order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'refunded';
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  commission_rate: number;
  commission_amount: number;
  payout_amount: number;
  settlement_status: 'pending_hold' | 'available' | 'paid' | 'disputed';
  settlement_eligible_at?: string;
  tracking_number?: string;
  courier_code?: string;
  seller_notes?: string;
  cancelled_reason?: string;
  items?: SellerOrderItem[];
  seller?: SellerProfile;
  created_at: string;
  updated_at?: string;
}

export interface SellerOrderItem {
  id: string;
  seller_order_id: string;
  order_id: string;
  product_id: string;
  seller_id: string;
  product_name: string;
  product_sku?: string;
  product_thumbnail?: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_price: number;
  commission_rate?: number;
  commission_amount: number;
  created_at: string;
}

export interface InventoryLedgerEntry {
  id: string;
  product_id: string;
  seller_id?: string;
  change_type: 'stock_added' | 'stock_reserved' | 'stock_sold' | 'stock_released' | 'stock_returned' | 'stock_adjusted';
  quantity_change: number;
  previous_stock: number;
  new_stock: number;
  reference_order_id?: string;
  reference_seller_order_id?: string;
  reason: string;
  created_by?: string;
  created_at: string;
}

export interface SellerLedgerEntry {
  id: string;
  seller_id: string;
  transaction_type: 'SALE' | 'COMMISSION' | 'REFUND' | 'RETURN' | 'ADJUSTMENT' | 'PAYOUT' | 'SHIPPING_ADJUSTMENT' | 'OTHER';
  entry_type: 'credit' | 'debit';
  amount: number;
  seller_order_id?: string;
  reference_id?: string;
  description: string;
  balance_after: number;
  created_at: string;
}

export interface SellerDocument {
  id: string;
  seller_id: string;
  document_type: 'citizenship_front' | 'citizenship_back' | 'pan_certificate' | 'business_registration' | 'tax_clearance' | 'bank_cheque' | 'other';
  document_name: string;
  storage_path: string;
  file_size?: number;
  mime_type?: string;
  verification_status: 'format_validated' | 'under_review' | 'officially_verified' | 'rejected';
  rejection_reason?: string;
  uploaded_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  signed_url?: string;
}

export interface ReturnItem {
  id: string;
  return_id: string;
  seller_order_item_id: string;
  product_id: string;
  quantity: number;
  refund_amount: number;
  item_condition?: string;
  created_at: string;
}

export interface ReturnRequest {
  id: string;
  return_number: string;
  order_id: string;
  seller_order_id: string;
  customer_id: string;
  seller_id: string;
  status: 'REQUESTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PICKUP_SCHEDULED' | 'RECEIVED' | 'INSPECTING' | 'APPROVED_FOR_REFUND' | 'COMPLETED' | 'CANCELLED';
  reason: string;
  description?: string;
  evidence_urls?: string[];
  decision_notes?: string;
  pickup_tracking_number?: string;
  items?: ReturnItem[];
  created_at: string;
  updated_at?: string;
}

export interface RefundRecord {
  id: string;
  refund_number: string;
  order_id: string;
  seller_order_id?: string;
  return_id?: string;
  customer_id: string;
  seller_id?: string;
  amount: number;
  refund_method: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  transfer_reference?: string;
  reason: string;
  processed_by?: string;
  created_at: string;
  completed_at?: string;
}

export interface ShipmentEvent {
  id: string;
  shipment_id: string;
  status: string;
  location?: string;
  description: string;
  occurred_at: string;
}

export interface Shipment {
  id: string;
  seller_order_id: string;
  order_id: string;
  seller_id: string;
  courier_name: string;
  tracking_number: string;
  status: 'CREATED' | 'PICKUP_SCHEDULED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED' | 'RETURNED';
  shipping_label_url?: string;
  estimated_delivery_date?: string;
  dispatched_at?: string;
  delivered_at?: string;
  events?: ShipmentEvent[];
  created_at: string;
  updated_at?: string;
}

export interface PaymentTransaction {
  id: string;
  order_id: string;
  provider: 'cod' | 'esewa' | 'khalti';
  transaction_reference: string;
  provider_reference?: string;
  amount: number;
  currency: string;
  status: 'initiated' | 'pending' | 'verified' | 'failed' | 'refunded';
  raw_response?: Record<string, unknown>;
  verified_at?: string;
  created_at: string;
}

export interface AdminPayoutSettings {
  admin_name: string;
  admin_email: string;
  admin_phone: string;
  store_legal_name: string;
  // eSewa Receiver Details
  esewa_id: string;
  esewa_name: string;
  esewa_qr_url?: string;
  // Khalti Receiver Details
  khalti_id: string;
  khalti_name: string;
  khalti_qr_url?: string;
  // Bank Receiver Details
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  bank_branch: string;
  bank_qr_url?: string;
  // Marketplace business policies
  settlement_hold_days?: number;
  return_window_days?: number;
  cod_max_limit?: number;
  cod_risk_threshold?: number;
  esewa_enabled?: boolean;
  khalti_enabled?: boolean;
  cod_enabled?: boolean;
  updated_at?: string;
}
