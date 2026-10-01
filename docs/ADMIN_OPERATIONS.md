# CARTPLUS Store Operations Manual: Production Admin Dashboard & Governance

Welcome to the **CARTPLUS Administration & Operations Manual**. This comprehensive documentation guides authorized store administrators, operations directors, and compliance personnel on managing platform entities inside the **CARTPLUS Control Center** (`AdminDashboardPage`).

---

## 1. Accessing the Admin Portal

### Portal URL
- **Direct Route:** `/admin`
- **Staff Sign-in Route:** `/admin/login`

### Authorization Architecture
The CARTPLUS Admin Dashboard is protected by **Supabase Row Level Security (RLS)** and database-enforced role verification. Only authenticated accounts possessing the `admin` role in the `public.profiles` database table are authorized to query or mutate backoffice records.

- **Client-Side Gate:** The frontend checks `user.role === 'admin' && user.status === 'active'`.
- **Database-Level Gate:** All sensitive API calls invoke Supabase RLS policies and database functions (`public.is_admin()`), preventing any unauthorized user or tampered client state from bypassing security.

### Setting Up the First Administrator (Initial Provisioning)
For security, CARTPLUS does NOT contain default hardcoded admin passwords or automatic email-based promotion.

Follow this production procedure to establish your primary administrator:
1. Register a standard account through the CARTPLUS registration page (`/register`) using your official administrative email address.
2. Verify your email if email confirmation is enabled in your Supabase project.
3. Open your **Supabase Dashboard** &rarr; **SQL Editor** and execute the promotion query:
   ```sql
   UPDATE public.profiles
   SET role = 'admin', status = 'active'
   WHERE email = 'your-official-email@example.com';
   ```
4. Sign in at `/admin/login` with your credentials. You now have full operational privileges.

---

## 2. Viewing Overall Sales Statistics & Metrics

The **Metrics Overview** tab (`activeTab: 'overview'`) provides live operational data queried directly from the Supabase PostgreSQL database:

1. **Total Gross Sales (NPR):**
   - Live aggregate of fulfilled and confirmed orders, filtering out cancelled orders.
2. **Orders in Queue:**
   - Real-time count of orders in `pending`, `confirmed`, and `processing` stages awaiting dispatch.
3. **Catalog Inventory:**
   - Active SKU inventory, low-stock warnings, and draft/pending items requiring compliance review.
4. **Platform Customer Accounts:**
   - Active customer accounts and customer support ticket volumes.
5. **Marketplace Sellers:**
   - Verified active partner count and pending merchant applications awaiting documentation review.

---

## 3. Approving & Verifying Marketplace Sellers

CARTPLUS operates a closed-verification marketplace. New merchants cannot list active products until approved.

### Seller Review Workflow
1. Navigate to the **Sellers** tab (`activeTab: 'sellers'`).
2. Review merchant applications listed with the **Pending** badge.
3. Inspect merchant credentials:
   - Business Store Name & Legal Owner Name.
   - Contact Mobile & Business Email.
   - Nepal Inland Revenue Department (IRD) PAN/VAT 9-digit registration.
   - Registered Business Address (Province, District, Municipality).
   - Commercial Bank details (Bank Name, Account Holder, Account Number) stored in private `seller_bank_accounts`.
4. Click **Approve & Verify**:
   - Executes `approve_seller(seller_id, commission_rate)` atomic RPC.
   - Updates status to `verified`.
   - Promotes the user's profile role to `seller`.
   - Automatically sends an in-app confirmation notification to the merchant.
5. If documentation is incomplete, click **Reject** and record the compliance rejection reason.

---

## 4. Product Catalog Approval & Moderation

Sellers can submit product listings for approval:
1. Navigate to the **Products** tab (`activeTab: 'products'`).
2. Filter by status: `pending_review`.
3. Check product specifications, thumbnail images (stored in Supabase Storage `product-images`), pricing in Nepalese Rupees, and stock count.
4. Click **Approve Product**:
   - Executes `approve_product(product_id)`.
   - Sets `status = 'active'` and `is_active = true`.
   - The product becomes publicly discoverable and purchasable across the storefront.

---

## 5. Order Management & Dispatch Slips

1. Navigate to the **Orders** tab (`activeTab: 'orders'`).
2. View incoming customer orders with verified items, authoritative prices, and delivery destination.
3. Update order lifecycle status:
   `pending` &rarr; `confirmed` &rarr; `processing` &rarr; `shipped` &rarr; `out_for_delivery` &rarr; `delivered`.
4. **Warehouse Dispatch Slip & QR Code:**
   - Click **Slip & QR** on any order card.
   - Generates an official printable A4 dispatch invoice including order manifest, delivery address, COD amount, and high-resolution 2D verification QR code.
   - The QR code contains a privacy-preserving secure URL (`/order/verify/:orderNumber`) without exposing sensitive customer personal data to third parties.

---

## 6. Review Moderation & Customer Support

- **Customer Reviews:** Newly submitted reviews remain unapproved (`is_approved = false`) until reviewed by staff to prevent spam. Approved reviews immediately publish to product pages.
- **Help Desk:** Answer incoming customer inquiries and update ticket statuses (`open`, `in_progress`, `resolved`).
