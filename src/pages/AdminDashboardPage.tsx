import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useProducts } from '../context/ProductContext';
import { useOrders } from '../context/OrderContext';
import { useReviews } from '../context/ReviewContext';
import { useSupport } from '../context/SupportContext';
import { useAuth } from '../context/AuthContext';
import { useSeller } from '../context/SellerContext';
import { useRouter, Link } from '../context/RouterContext';
import { CATEGORIES } from '../data/categories';
import { Product, Order, OrderStatus, SupportRequest, SupportStatus, OrderItem, SellerProfile } from '../types';
import { useAdminSettings } from '../context/AdminSettingsContext';
import { AnimatedNumber } from '../components/motion/AnimatedNumber';
import {
  ShieldCheck,
  Package,
  ShoppingBag,
  Star,
  Headphones,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  TrendingUp,
  Search,
  ExternalLink,
  Store,
  LogOut,
  Building2,
  Users,
  UserCheck,
  UserX,
  Shield,
  QrCode,
  Scan,
  Printer,
  FileText,
  X,
  AlertTriangle,
  Wallet,
  CreditCard,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { generateOrderQrDataUrl } from '../utils/orderQr';

export const AdminDashboardPage: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, toggleProductStatus } = useProducts();
  const { orders, updateOrderStatus, deleteOrder, deleteCancelledOrders } = useOrders();
  const { reviews, approveReview, rejectReview } = useReviews();
  const { requests, updateStatus, addMessage } = useSupport();
  const { user, users, toggleUserRole, toggleUserStatus, deleteUser, logout } = useAuth();
  const { sellers, updateSellerStatus, deleteSeller } = useSeller();
  const { payoutSettings, updatePayoutSettings, resetAdminAccount } = useAdminSettings();
  const { navigate } = useRouter();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'sellers' | 'users' | 'orders' | 'reviews' | 'support' | 'gateways'>('overview');

  // Confirmation modal states
  const [deleteSellerModal, setDeleteSellerModal] = useState<SellerProfile | null>(null);
  const [deleteOrderModal, setDeleteOrderModal] = useState<Order | null>(null);
  const [showResetAdminModal, setShowResetAdminModal] = useState(false);

  // Gateway form state
  const [gwEsewaId, setGwEsewaId] = useState(payoutSettings.esewa_id);
  const [gwEsewaName, setGwEsewaName] = useState(payoutSettings.esewa_name);
  const [gwKhaltiId, setGwKhaltiId] = useState(payoutSettings.khalti_id);
  const [gwKhaltiName, setGwKhaltiName] = useState(payoutSettings.khalti_name);
  const [gwBankName, setGwBankName] = useState(payoutSettings.bank_name);
  const [gwBankAccNum, setGwBankAccNum] = useState(payoutSettings.bank_account_number);
  const [gwBankAccName, setGwBankAccName] = useState(payoutSettings.bank_account_name);
  const [gwBankBranch, setGwBankBranch] = useState(payoutSettings.bank_branch);
  const [isSavingGateways, setIsSavingGateways] = useState(false);

  // Product modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState(CATEGORIES[0].name);
  const [pPrice, setPPrice] = useState('2499');
  const [pOriginalPrice, setPOriginalPrice] = useState('2999');
  const [pStock, setPStock] = useState('25');
  const [pBrand, setPBrand] = useState('CARTPLUS Choice');
  const [pImage, setPImage] = useState('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80');
  const [pDesc, setPDesc] = useState('');

  // Support reply state
  const [supportReplyText, setSupportReplyText] = useState<Record<string, string>>({});

  // Search & Filters
  const [productSearch, setProductSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Metric calculations
  const totalRevenue = orders
    .filter((o) => o.order_status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter((o) => o.order_status === 'pending' || o.order_status === 'confirmed').length;
  const cancelledOrders = orders.filter((o) => o.order_status === 'cancelled');
  const cancelledOrdersCount = cancelledOrders.length;
  const pendingReviews = reviews.filter((r) => !r.approved).length;
  const openTickets = requests.filter((t: SupportRequest) => t.status !== 'resolved').length;

  // Admin order slip modal state
  const [selectedAdminSlipOrder, setSelectedAdminSlipOrder] = useState<Order | null>(null);
  const [adminSlipQrUrl, setAdminSlipQrUrl] = useState('');

  const handleViewAdminSlip = async (order: Order) => {
    setSelectedAdminSlipOrder(order);
    const url = await generateOrderQrDataUrl(order);
    setAdminSlipQrUrl(url);
  };

  const handlePrintAdminSlip = (order: Order) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;
    const itemsHtml = order.items
      .map(
        (it) => `
        <tr>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${it.product_name}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${it.quantity}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">Rs. ${it.price.toLocaleString('en-NP')}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700;">Rs. ${(it.price * it.quantity).toLocaleString('en-NP')}</td>
        </tr>
      `
      )
      .join('');

    const slipContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CARTPLUS Warehouse Dispatch Slip - ${order.id}</title>
        <style>
          @page { size: auto; margin: 10mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; font-size: 13px; color: #0f172a; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
          .badge { background: #0f172a; color: #f59e0b; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          th { background: #f1f5f9; padding: 8px 10px; font-size: 11px; font-weight: 800; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
          .qr-box { display: flex; align-items: center; gap: 14px; background: #f8fafc; border: 1.5px dashed #cbd5e1; padding: 12px; border-radius: 8px; margin-bottom: 16px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h2 style="margin: 0; font-size: 22px; font-weight: 900;">CARTPLUS NEPAL</h2>
            <div style="font-size: 11px; color: #64748b;">Warehouse Fulfillment & Express Courier Dispatch Manifest</div>
          </div>
          <div style="text-align: right;">
            <span class="badge">Official Dispatch Slip</span>
            <div style="font-family: monospace; font-size: 15px; font-weight: 900; margin-top: 4px;">${order.id}</div>
          </div>
        </div>
        <div class="grid">
          <div>
            <h4 style="margin: 0 0 4px 0; font-size: 10px; text-transform: uppercase; color: #64748b;">Customer & Delivery Address</h4>
            <p style="margin: 0;"><strong>${order.customer_name}</strong></p>
            <p style="margin: 0;">${order.delivery_address.street}, ${order.delivery_address.ward}</p>
            <p style="margin: 0;">${order.delivery_address.municipality}, ${order.delivery_address.district}</p>
            <p style="margin: 0; font-family: monospace; font-weight: 700;">Tel: ${order.phone}</p>
          </div>
          <div>
            <h4 style="margin: 0 0 4px 0; font-size: 10px; text-transform: uppercase; color: #64748b;">Logistics & COD</h4>
            <p style="margin: 0;">Payment: <strong>${order.payment_method}</strong></p>
            <p style="margin: 0;">Status: <strong>${order.payment_status}</strong></p>
            <p style="margin: 0;">Courier: <strong>${order.courier_info?.provider_name || 'Nepal Express'}</strong></p>
          </div>
        </div>
        <div class="qr-box">
          ${adminSlipQrUrl ? `<img src="${adminSlipQrUrl}" width="85" height="85" style="border-radius: 4px; border: 1px solid #cbd5e1;" />` : ''}
          <div>
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase;">Warehouse 2D Scanner Code</div>
            <div style="font-size: 11px; color: #475569; margin-top: 2px;">Scan with warehouse handheld terminal or courier phone to confirm parcel dispatch.</div>
            <div style="font-family: monospace; font-size: 10px; color: #64748b; margin-top: 4px;">REF: ${order.id} • TOTAL COD: Rs. ${order.total.toLocaleString('en-NP')}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="text-align: left;">Product</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div style="text-align: right; font-size: 14px; font-weight: 900; border-top: 2px solid #0f172a; padding-top: 8px;">
          Grand Total Payable: Rs. ${order.total.toLocaleString('en-NP')}
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(slipContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  // Staff Authorization Gate
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-lg p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-black font-brand text-slate-900">
            Staff Portal Restricted
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            This administration console is exclusively accessible by authorized CARTPLUS internal operations staff and administrators.
          </p>
          <div className="pt-2">
            <Link
              to="/admin/login"
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Sign In with Staff Credentials</span>
            </Link>
          </div>
          <div className="pt-3 border-t border-slate-100">
            <Link to="/" className="text-xs text-slate-400 hover:text-slate-600">
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleOpenNewProduct = () => {
    setEditingProductId(null);
    setPName('');
    setPCategory(CATEGORIES[0].name);
    setPPrice('1999');
    setPOriginalPrice('2499');
    setPStock('30');
    setPBrand('');
    setPDesc('');
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setPName(p.name);
    setPCategory(p.category);
    setPPrice(String(p.price));
    setPOriginalPrice(String(p.original_price));
    setPStock(String(p.stock));
    setPBrand(p.brand || '');
    setPImage(p.images[0] || '');
    setPDesc(p.description);
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(pPrice) || 0;
    const origNum = Number(pOriginalPrice) || priceNum;
    const discountPct = origNum > priceNum ? Math.round(((origNum - priceNum) / origNum) * 100) : 0;
    const catObj = CATEGORIES.find((c) => c.name === pCategory) || CATEGORIES[0];
    const slug = pName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const sku = `CP-${slug.substring(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    if (editingProductId) {
      updateProduct(editingProductId, {
        name: pName,
        category: pCategory,
        categorySlug: catObj.slug,
        price: priceNum,
        original_price: origNum,
        discount: discountPct,
        stock: Number(pStock) || 0,
        brand: pBrand,
        images: [pImage],
        thumbnail: pImage,
        description: pDesc,
      });
    } else {
      addProduct({
        sku,
        slug,
        name: pName,
        category: pCategory,
        categorySlug: catObj.slug,
        price: priceNum,
        original_price: origNum,
        discount: discountPct,
        stock: Number(pStock) || 0,
        brand: pBrand,
        images: [pImage],
        thumbnail: pImage,
        description: pDesc,
        rating: 4.8,
        review_count: 1,
        is_active: true,
        is_featured: true,
        is_new: true,
      });
    }

    setShowProductModal(false);
  };

  const handleSupportReplySubmit = (requestId: string) => {
    const text = supportReplyText[requestId];
    if (!text || !text.trim()) return;

    addMessage(
      requestId,
      text.trim(),
      'support',
      user?.name || 'CARTPLUS Support Desk'
    );

    setSupportReplyText((prev) => ({ ...prev, [requestId]: '' }));
  };

  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return o.order_status === orderStatusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Banner */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Store Administrator Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-brand text-white">
            CARTPLUS Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage product catalog, Nepal COD dispatches, customer reviews, and support tickets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <span>View Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-rose-500/30 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Staff Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar pb-1 mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`relative pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer z-10 ${
            activeTab === 'overview'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Metrics Overview</span>
          {activeTab === 'overview' && (
            <motion.div
              layoutId="adminTabIndicator"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`relative pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer z-10 ${
            activeTab === 'products'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Products ({products.length})</span>
          {activeTab === 'products' && (
            <motion.div
              layoutId="adminTabIndicator"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('sellers')}
          className={`relative pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer z-10 ${
            activeTab === 'sellers'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Marketplace Sellers ({sellers.length})</span>
          {activeTab === 'sellers' && (
            <motion.div
              layoutId="adminTabIndicator"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`relative pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer z-10 ${
            activeTab === 'users'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & Customers ({users.length})</span>
          {activeTab === 'users' && (
            <motion.div
              layoutId="adminTabIndicator"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`relative pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer z-10 ${
            activeTab === 'orders'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Orders ({orders.length})</span>
          {activeTab === 'orders' && (
            <motion.div
              layoutId="adminTabIndicator"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`relative pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer z-10 ${
            activeTab === 'reviews'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Reviews ({reviews.length})</span>
          {pendingReviews > 0 && (
            <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {pendingReviews}
            </span>
          )}
          {activeTab === 'reviews' && (
            <motion.div
              layoutId="adminTabIndicator"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`relative pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer z-10 ${
            activeTab === 'support'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Support Desk ({requests.length})</span>
          {openTickets > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {openTickets}
            </span>
          )}
          {activeTab === 'support' && (
            <motion.div
              layoutId="adminTabIndicator"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('gateways')}
          className={`relative pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer z-10 ${
            activeTab === 'gateways'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4 text-emerald-600" />
          <span>Admin & Payout Gateways</span>
          {activeTab === 'gateways' && (
            <motion.div
              layoutId="adminTabIndicator"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"
            />
          )}
        </button>
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Gross Sales
              </span>
              <div className="text-2xl font-black text-slate-950 font-brand mt-1 tabular-nums flex items-baseline">
                <span>Rs.&nbsp;</span>
                <AnimatedNumber value={totalRevenue} />
              </div>
              <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <span>COD + Digital Wallets + Cards</span>
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Orders In Queue
              </span>
              <div className="text-2xl font-black text-slate-950 font-brand mt-1 tabular-nums">
                <AnimatedNumber value={pendingOrders} />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {orders.filter((o) => o.order_status === 'delivered').length} Delivered successfully
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Catalog Inventory
              </span>
              <div className="text-2xl font-black text-slate-950 font-brand mt-1 tabular-nums flex items-baseline gap-1">
                <AnimatedNumber value={products.length} />
                <span className="text-base font-semibold text-slate-600">Products</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {products.filter((p) => p.is_active).length} Active on live storefront
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Platform Customer Accounts
              </span>
              <div className="text-2xl font-black text-slate-950 font-brand mt-1 tabular-nums flex items-baseline gap-1">
                <AnimatedNumber value={users.length} />
                <span className="text-base font-semibold text-slate-600">Registered</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {users.filter((u) => u.role === 'admin').length} Staff Admins · {users.filter((u) => u.status !== 'suspended').length} Active
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Marketplace Sellers
              </span>
              <div className="text-2xl font-black text-slate-950 font-brand mt-1 tabular-nums flex items-baseline gap-1">
                <AnimatedNumber value={sellers.length} />
                <span className="text-base font-semibold text-slate-600">Merchants</span>
              </div>
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                {sellers.filter((s) => s.status === 'verified').length} Verified Partners
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Open Support Inquiries
              </span>
              <div className="text-2xl font-black text-slate-950 font-brand mt-1 tabular-nums">
                <AnimatedNumber value={openTickets} />
              </div>
              <p className="text-xs text-amber-600 font-semibold mt-1">Requires customer response</p>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Recent Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-amber-600 hover:underline cursor-pointer"
                >
                  Manage All
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {orders.slice(0, 4).map((o) => (
                  <div key={o.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold font-mono text-slate-900">{o.id}</p>
                      <p className="text-slate-500 mt-0.5">{o.customer_name} • {o.delivery_address.district}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 tabular-nums">
                        Rs. {o.total.toLocaleString('en-NP')}
                      </span>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">{o.order_status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Pending Reviews Requiring Action
                </h3>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className="text-xs font-bold text-amber-600 hover:underline cursor-pointer"
                >
                  Review Moderation
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {reviews.slice(0, 3).map((r) => (
                  <div key={r.id} className="py-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{r.user_name}</span>
                      <span className="text-amber-500 font-bold">{r.rating} ★</span>
                    </div>
                    <p className="text-slate-600 line-clamp-1 italic">&quot;{r.comment}&quot;</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by SKU or name..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              />
            </div>

            <button
              onClick={handleOpenNewProduct}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs self-start cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          <img
                            src={p.thumbnail || p.images[0]}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 max-w-xs line-clamp-1">{p.name}</p>
                          <span className="font-mono text-[10px] text-slate-400">SKU: {p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600">{p.category}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 tabular-nums">
                        Rs. {p.price.toLocaleString('en-NP')}
                      </div>
                      {p.original_price > p.price && (
                        <div className="text-[10px] text-slate-400 line-through tabular-nums">
                          Rs. {p.original_price.toLocaleString('en-NP')}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`font-semibold tabular-nums ${p.stock <= 5 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleProductStatus(p.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer ${
                          p.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {p.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SELLERS MANAGEMENT */}
      {activeTab === 'sellers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Registered Marketplace Merchants ({sellers.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review merchant PAN/VAT verification, pickup addresses, and bank accounts for weekly COD settlements.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Store & Owner</th>
                  <th className="p-3">PAN/VAT</th>
                  <th className="p-3">Pickup Location</th>
                  <th className="p-3">Bank Settlement Account</th>
                  <th className="p-3">Commission</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sellers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3">
                      <div>
                        <span className="font-bold text-slate-900 block">{s.store_name}</span>
                        <span className="text-slate-500 text-[11px]">
                          {s.owner_name} • {s.phone}
                        </span>
                        <span className="text-slate-400 text-[10px] block">{s.email}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-mono font-bold text-slate-800">{s.pan_vat_number}</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      <span>{s.city}, {s.district}</span>
                      <span className="text-slate-400 block text-[10px]">{s.address}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{s.bank_name}</span>
                      <span className="font-mono text-slate-500 text-[11px]">Acc: {s.account_number}</span>
                      <span className="text-slate-400 text-[10px] block">{s.account_holder}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-amber-600">0% Festive</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        s.status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : s.status === 'suspended'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {s.status !== 'verified' ? (
                          <button
                            onClick={() => updateSellerStatus(s.id, 'verified')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                          >
                            Approve & Verify
                          </button>
                        ) : (
                          <span className="px-2 py-1 text-emerald-700 font-bold text-[10px]">
                            Verified
                          </span>
                        )}

                        {s.status !== 'suspended' ? (
                          <button
                            onClick={() => updateSellerStatus(s.id, 'suspended')}
                            className="px-2 py-1 text-rose-600 hover:bg-rose-50 font-bold rounded-lg text-[10px] cursor-pointer"
                            title="Suspend store"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => updateSellerStatus(s.id, 'active')}
                            className="px-2 py-1 text-slate-700 hover:bg-slate-100 font-bold rounded-lg text-[10px] cursor-pointer"
                          >
                            Reactivate
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setDeleteSellerModal(s)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          title="Delete Seller Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: USERS & CUSTOMERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Platform User & Customer Directory ({users.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage registered customer profiles, staff administration privileges, and account security.
              </p>
            </div>

            {/* Search */}
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name, email, or mobile..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3">User & Name</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Member Since</th>
                  <th className="p-3">Orders Placed</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users
                  .filter((u) => {
                    if (!userSearch.trim()) return true;
                    const q = userSearch.toLowerCase();
                    return (
                      u.name.toLowerCase().includes(q) ||
                      u.email.toLowerCase().includes(q) ||
                      u.phone.toLowerCase().includes(q)
                    );
                  })
                  .map((usr) => {
                    const userOrderCount = orders.filter((o) => o.user_id === usr.id || o.email === usr.email).length;
                    return (
                      <tr key={usr.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xs">
                              {usr.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{usr.name}</p>
                              <span className="font-mono text-[10px] text-slate-400">{usr.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="text-slate-800">{usr.email}</p>
                          <p className="text-slate-400 font-mono text-[10px]">{usr.phone}</p>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            usr.role === 'admin'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {usr.role === 'admin' ? 'Store Staff (Admin)' : 'Customer'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            usr.status === 'suspended'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {usr.status || 'active'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 text-[11px]">
                          {new Date(usr.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3 font-semibold text-slate-800 tabular-nums">
                          {userOrderCount} orders
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => toggleUserRole(usr.id)}
                              className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-[10px] font-bold text-slate-700 cursor-pointer"
                              title="Toggle admin / customer permissions"
                            >
                              {usr.role === 'admin' ? 'Demote to Customer' : 'Make Admin'}
                            </button>
                            <button
                              onClick={() => toggleUserStatus(usr.id)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                                usr.status === 'suspended'
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              }`}
                            >
                              {usr.status === 'suspended' ? 'Activate' : 'Suspend'}
                            </button>
                            <button
                              onClick={() => deleteUser(usr.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS DISPATCH MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Order Status Filters & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
              {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    orderStatusFilter === st
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{st === 'all' ? 'All Orders' : st}</span>
                  {st === 'cancelled' && cancelledOrdersCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-black">
                      {cancelledOrdersCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {cancelledOrdersCount > 0 && (
              <button
                type="button"
                onClick={() => deleteCancelledOrders()}
                className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete All Cancelled Orders ({cancelledOrdersCount})</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Package className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No orders found in this view</h4>
                <p className="text-xs text-slate-500">
                  {orderStatusFilter === 'cancelled'
                    ? 'All cancelled orders have been cleared or none exist.'
                    : `No orders currently match status "${orderStatusFilter}".`}
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-slate-900">{order.id}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-semibold text-slate-700">{order.customer_name}</span>
                        <span className="text-slate-400 font-mono">({order.phone})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Destination: {order.delivery_address.street}, {order.delivery_address.district}, {order.delivery_address.province}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-black text-slate-950 tabular-nums">
                        Rs. {order.total.toLocaleString('en-NP')}
                      </span>

                      {/* Status Changer dropdown */}
                      <select
                        value={order.order_status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 focus:outline-none cursor-pointer uppercase"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      {/* Dispatch Slip & QR Code button */}
                      <button
                        type="button"
                        onClick={() => handleViewAdminSlip(order)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 border border-slate-200 hover:border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="View & Print Warehouse Dispatch Slip with QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5 text-amber-600" />
                        <span className="hidden sm:inline">Slip & QR</span>
                      </button>

                      {/* Allow admin to delete order permanently */}
                      <button
                        type="button"
                        onClick={() => setDeleteOrderModal(order)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete order permanently from database"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                {/* Items in order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {order.items.map((item: OrderItem, idx) => (
                    <div key={item.product_id || idx} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs">
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded object-cover"
                      />
                      <div className="truncate flex-1">
                        <p className="font-semibold truncate">{item.product_name}</p>
                        <p className="text-[10px] text-slate-500 tabular-nums">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )))}
          </div>
        </div>
      )}

      {/* TAB 4: REVIEWS MODERATION */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{rev.user_name}</span>
                  <span className="text-amber-500 font-bold text-xs">{rev.rating} ★</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  rev.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {rev.approved ? 'Approved & Visible' : 'Pending Moderation'}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900">{rev.title}</h4>
                <p className="text-xs text-slate-600 mt-1">{rev.comment}</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
                {!rev.approved ? (
                  <button
                    onClick={() => approveReview(rev.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Review</span>
                  </button>
                ) : (
                  <button
                    onClick={() => rejectReview(rev.id)}
                    className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Unpublish
                  </button>
                )}
                <button
                  onClick={() => rejectReview(rev.id)}
                  className="px-3 py-1.5 text-slate-500 hover:text-rose-600 font-medium cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: SUPPORT TICKETS & REPLIES */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          {requests.map((t: SupportRequest) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{t.id}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-semibold text-slate-700">{t.user_name}</span>
                    <span className="text-slate-400 font-mono">({t.user_email} / {t.user_phone || 'N/A'})</span>
                  </div>
                  {t.order_id && (
                    <span className="text-[11px] text-amber-700 font-medium mt-0.5 block">
                      Ref Order: <strong>{t.order_id}</strong>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={t.status}
                    onChange={(e) => updateStatus(t.id, e.target.value as SupportStatus)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 focus:outline-none uppercase"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">{t.subject}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {t.message}
                </p>
              </div>

              {/* Thread History */}
              {t.messages.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Message History:</span>
                  {t.messages.map((reply) => (
                    <div
                      key={reply.id}
                      className={`p-2.5 rounded-xl text-xs ${
                        reply.sender === 'support'
                          ? 'bg-amber-50 border border-amber-200 text-slate-900'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-0.5">
                        <span>{reply.sender_name}</span>
                        <span className="tabular-nums">
                          {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p>{reply.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Reply Form */}
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  placeholder="Type response to customer..."
                  value={supportReplyText[t.id] || ''}
                  onChange={(e) =>
                    setSupportReplyText((prev) => ({ ...prev, [t.id]: e.target.value }))
                  }
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handleSupportReplySubmit(t.id)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-2xs cursor-pointer"
                >
                  Send Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 font-brand mb-4">
              {editingProductId ? 'Edit Product' : 'Add New Product to Catalog'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={pBrand}
                    onChange={(e) => setPBrand(e.target.value)}
                    placeholder="e.g. Sony, Anker, CARTPLUS"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Price (NPR)</label>
                  <input
                    type="number"
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold tabular-nums"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Original Price (NPR)</label>
                  <input
                    type="number"
                    value={pOriginalPrice}
                    onChange={(e) => setPOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 tabular-nums"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={pImage}
                  onChange={(e) => setPImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-[11px]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl shadow-2xs cursor-pointer"
                >
                  {editingProductId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Order Dispatch Slip & QR Code Modal */}
      {selectedAdminSlipOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-base font-black text-slate-900 font-brand">
                    Warehouse Dispatch Slip & QR
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Official manifest for parcel packaging and courier handoff
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAdminSlipOrder(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warehouse Quick Scan QR Card */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center gap-4 border border-slate-800 shadow-sm">
              {adminSlipQrUrl ? (
                <div className="p-2 bg-white rounded-xl shadow-xs shrink-0">
                  <img
                    src={adminSlipQrUrl}
                    alt="Warehouse QR Code"
                    className="w-24 h-24 object-contain"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                  <QrCode className="w-10 h-10 animate-pulse text-slate-400" />
                </div>
              )}
              <div className="text-center sm:text-left flex-1 min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
                  <Scan className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    2D Barcode & Courier QR
                  </span>
                </div>
                <h4 className="text-sm font-black font-mono text-white truncate">
                  {selectedAdminSlipOrder.id}
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Scan via handheld warehouse terminal or rider phone to verify contents and customer call.
                </p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  COD: Rs. {selectedAdminSlipOrder.total.toLocaleString('en-NP')} • {selectedAdminSlipOrder.items.length} items
                </div>
              </div>
            </div>

            {/* Recipient & Logistics Details */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Delivery Destination
                </span>
                <p className="font-bold text-slate-900">{selectedAdminSlipOrder.customer_name}</p>
                <p className="text-slate-600 mt-0.5">
                  {selectedAdminSlipOrder.delivery_address.street}, {selectedAdminSlipOrder.delivery_address.ward}
                </p>
                <p className="text-slate-600">
                  {selectedAdminSlipOrder.delivery_address.municipality}, {selectedAdminSlipOrder.delivery_address.district}
                </p>
                <p className="font-mono text-slate-800 mt-1 font-bold">
                  Tel: {selectedAdminSlipOrder.phone}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Logistics & Courier
                </span>
                <p className="font-bold text-slate-900">
                  Courier: {selectedAdminSlipOrder.courier_info?.provider_name || 'Nepal Express'}
                </p>
                <p className="text-slate-600 mt-0.5">
                  Payment: <strong>{selectedAdminSlipOrder.payment_method}</strong>
                </p>
                <p className="text-slate-600">
                  Status:{' '}
                  <strong className="text-emerald-700 uppercase">
                    {selectedAdminSlipOrder.payment_status}
                  </strong>
                </p>
                {selectedAdminSlipOrder.notes && (
                  <p className="text-slate-500 italic mt-1">
                    Notes: &quot;{selectedAdminSlipOrder.notes}&quot;
                  </p>
                )}
              </div>
            </div>

            {/* Items Summary Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Item</th>
                    <th className="py-2 px-2 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Rate</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedAdminSlipOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-semibold text-slate-900">{it.product_name}</td>
                      <td className="py-2 px-2 text-center tabular-nums">{it.quantity}</td>
                      <td className="py-2 px-3 text-right tabular-nums">
                        Rs. {it.price.toLocaleString('en-NP')}
                      </td>
                      <td className="py-2 px-3 text-right font-bold tabular-nums">
                        Rs. {(it.price * it.quantity).toLocaleString('en-NP')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center font-bold text-slate-900">
                <span>Grand Total (COD / Paid)</span>
                <span className="text-sm font-black tabular-nums">
                  Rs. {selectedAdminSlipOrder.total.toLocaleString('en-NP')}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedAdminSlipOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handlePrintAdminSlip(selectedAdminSlipOrder)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Print Dispatch Slip (with QR)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
