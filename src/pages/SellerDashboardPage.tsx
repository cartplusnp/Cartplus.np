import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useSeller } from '../context/SellerContext';
import { useProducts } from '../context/ProductContext';
import { useOrders } from '../context/OrderContext';
import { useRouter, Link } from '../context/RouterContext';
import { CATEGORIES } from '../data/categories';
import { Product, SellerOrder, SellerDocument } from '../types';
import { SellerAnalyticsDashboard } from '../components/seller/SellerAnalyticsDashboard';
import { SellerDispatchSlipModal } from '../components/seller/SellerDispatchSlipModal';
import { AnimatedNumber } from '../components/motion/AnimatedNumber';
import {
  Store,
  Plus,
  ShoppingBag,
  TrendingUp,
  Package,
  CreditCard,
  Building2,
  Trash2,
  Edit2,
  CheckCircle2,
  ExternalLink,
  LogOut,
  Sparkles,
  Percent,
  Search,
  MapPin,
  Clock,
  Layers,
  BarChart3,
  ArrowUpRight,
  Upload,
  Image as ImageIcon,
  Camera,
  Smartphone,
  Laptop,
  Check,
  Printer,
  FileText,
  DollarSign,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { uploadProductImage } from '../utils/imageUpload';

export const SellerDashboardPage: React.FC = () => {
  const {
    seller,
    isAuthenticatedSeller,
    logoutSeller,
    sellerOrders,
    sellerLedger,
    sellerDocuments,
    sellerPayouts,
    updateSellerOrderStatus,
    uploadSellerDocument,
    requestPayout,
  } = useSeller();
  const { products, addProduct, updateProduct, deleteProduct, toggleProductStatus } = useProducts();
  const { orders } = useOrders();
  const { navigate } = useRouter();

  const [activeTab, setActiveTab] = useState<
    'analytics' | 'products' | 'orders' | 'ledger' | 'payouts' | 'documents' | 'profile'
  >('analytics');

  const [selectedSlipOrder, setSelectedSlipOrder] = useState<SellerOrder | null>(null);
  const [payoutAmountInput, setPayoutAmountInput] = useState('');
  const [payoutMethodInput, setPayoutMethodInput] = useState('connectIPS / Bank Transfer');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [docTypeInput, setDocTypeInput] = useState<SellerDocument['document_type']>('pan_certificate');
  const [docNameInput, setDocNameInput] = useState('');
  const [docFileInput, setDocFileInput] = useState<File | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Product modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState(CATEGORIES[0].name);
  const [pPrice, setPPrice] = useState('');
  const [pOriginalPrice, setPOriginalPrice] = useState('');
  const [pStock, setPStock] = useState('');
  const [pBrand, setPBrand] = useState('');
  const [pImage, setPImage] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [imageSourceMode, setImageSourceMode] = useState<'upload' | 'url'>('upload');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Product search filter
  const [searchQuery, setSearchQuery] = useState('');

  if (!seller) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black font-brand text-slate-900 mb-2">
          Seller Portal Access Required
        </h2>
        <p className="text-xs text-slate-600 mb-6">
          Please log in or register your business to access your merchant backoffice.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/seller/login"
            className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors"
          >
            Merchant Sign In
          </Link>
          <Link
            to="/become-seller"
            className="px-5 py-2.5 border border-slate-200 bg-white text-slate-800 font-bold rounded-xl text-xs hover:bg-slate-50 transition-colors"
          >
            Register Store
          </Link>
        </div>
      </div>
    );
  }

  // Pending Review State
  if (seller.status === 'pending' || seller.status === 'under_review') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-amber-200 shadow-md p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
              Application Under Compliance Review
            </span>
            <h2 className="text-xl font-black font-brand text-slate-900 pt-2">
              Your Seller Application is Pending CARTPLUS Admin Review
            </h2>
          </div>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
            Thank you for applying to sell on CARTPLUS! Our onboarding compliance team is currently reviewing your business credentials and tax documentation. You will be able to list products once your account has been verified.
          </p>
          <div className="bg-slate-50 rounded-2xl p-4 text-xs text-left max-w-md mx-auto space-y-2 border border-slate-200">
            <div className="flex justify-between text-slate-600">
              <span>Registered Store:</span>
              <span className="font-bold text-slate-900">{seller.store_name}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Business Owner:</span>
              <span className="font-bold text-slate-900">{seller.owner_name}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>PAN/VAT Registration:</span>
              <span className="font-bold text-slate-900">{seller.pan_vat_number}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Application Status:</span>
              <span className="font-bold text-amber-600 uppercase text-[11px]">Pending Approval</span>
            </div>
          </div>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-block px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800"
            >
              Browse Storefront While Waiting
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter products belonging to this verified seller
  const sellerProducts = products.filter((p) => p.seller_id === seller.id);

  const displayedProducts = sellerProducts.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  // Calculate seller sales metrics
  const totalSalesEstimate = seller.total_sales || 0;
  const activeCount = sellerProducts.filter((p) => p.is_active && p.status === 'active').length;

  const handleOpenAdd = () => {
    setEditingProductId(null);
    setPName('');
    setPCategory(CATEGORIES[0].name);
    setPPrice('');
    setPOriginalPrice('');
    setPStock('');
    setPBrand(seller.store_name || '');
    setPImage('');
    setPDesc('');
    setImageSourceMode('upload');
    setUploadFileName('');
    setShowProductModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProductId(p.id);
    setPName(p.name);
    setPCategory(p.category);
    setPPrice(String(p.price));
    setPOriginalPrice(String(p.original_price));
    setPStock(String(p.stock));
    setPBrand(p.brand || seller.store_name);
    const existingImg = p.thumbnail || p.images[0] || '';
    setPImage(existingImg);
    setImageSourceMode(existingImg.startsWith('data:') ? 'upload' : 'url');
    setUploadFileName('');
    setPDesc(p.description);
    setShowProductModal(true);
  };

  const handleImageFileUpload = async (file: File) => {
    if (!file) return;
    try {
      setIsUploadingImage(true);
      const res = await uploadProductImage(file, 'seller-products');
      if (res.success && res.publicUrl) {
        setPImage(res.publicUrl);
        setUploadFileName(file.name);
      }
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(pPrice) || 0;
    const origNum = Number(pOriginalPrice) || priceNum;
    const discountPct = origNum > priceNum ? Math.round(((origNum - priceNum) / origNum) * 100) : 0;
    const catObj = CATEGORIES.find((c) => c.name === pCategory) || CATEGORIES[0];
    const slug = `${pName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-4)}`;
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
        seller_id: seller.id,
        seller_store_name: seller.store_name,
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
        rating: 5.0,
        review_count: 0,
        is_active: true,
        is_featured: true,
        is_new: true,
        seller_id: seller.id,
        seller_store_name: seller.store_name,
      });
    }

    setShowProductModal(false);
  };

  const handleSignOut = () => {
    logoutSeller();
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Merchant Header Bar */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center font-brand shadow-sm shrink-0">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-brand text-white">
                {seller.store_name}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                {seller.status} Merchant
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Owner: {seller.owner_name} • PAN: <span className="font-mono text-slate-300">{seller.pan_vat_number}</span> • {seller.city}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            to="/products"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <span>Live Catalog</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleSignOut}
            className="px-3.5 py-2 bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer text-left group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Estimated Gross Sales
            </span>
            <span className="text-[10px] font-bold text-amber-600 group-hover:underline flex items-center gap-0.5">
              Analytics <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-950 font-brand mt-1 tabular-nums flex items-baseline">
            <span>Rs.&nbsp;</span>
            <AnimatedNumber value={totalSalesEstimate} />
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Cash on Delivery settled</p>
        </button>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Catalog Inventory
          </span>
          <div className="text-2xl font-black text-slate-950 font-brand mt-1 tabular-nums flex items-baseline gap-1">
            <AnimatedNumber value={sellerProducts.length} />
            <span className="text-base font-semibold text-slate-600">Products</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{activeCount} listed & active</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Marketplace Commission
          </span>
          <div className="text-2xl font-black text-amber-600 font-brand mt-1 tabular-nums">
            0% (Promotional)
          </div>
          <p className="text-[11px] text-slate-500 mt-1">100% margins retained</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Merchant Rating
          </span>
          <div className="text-2xl font-black text-slate-950 font-brand mt-1 tabular-nums">
            ★ {seller.rating} / 5.0
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Top rated Nepal seller</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar pb-1 mb-8">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`relative pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer z-10 ${
            activeTab === 'analytics'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics Dashboard</span>
          {activeTab === 'analytics' && (
            <motion.div
              layoutId="sellerTabIndicator"
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
          <span>My Products & Upload ({sellerProducts.length})</span>
          {activeTab === 'products' && (
            <motion.div
              layoutId="sellerTabIndicator"
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
          <span>Customer Orders & Pickups ({sellerOrders.length})</span>
          {activeTab === 'orders' && (
            <motion.div
              layoutId="sellerTabIndicator"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`relative pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer z-10 ${
            activeTab === 'ledger'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Financial Ledger</span>
          {activeTab === 'ledger' && (
            <motion.div
              layoutId="sellerTabIndicator"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`relative pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer z-10 ${
            activeTab === 'payouts'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Nepal Bank Payouts</span>
          {activeTab === 'payouts' && (
            <motion.div
              layoutId="sellerTabIndicator"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`relative pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer z-10 ${
            activeTab === 'documents'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Verification Documents</span>
          {activeTab === 'documents' && (
            <motion.div
              layoutId="sellerTabIndicator"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`relative pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer z-10 ${
            activeTab === 'profile'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Store & Pickup Location</span>
          {activeTab === 'profile' && (
            <motion.div
              layoutId="sellerTabIndicator"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"
            />
          )}
        </button>
      </div>

      {/* TAB 0: GRAPHICAL ANALYTICS DASHBOARD */}
      {activeTab === 'analytics' && (
        <SellerAnalyticsDashboard
          seller={seller}
          sellerProducts={sellerProducts}
          orders={orders.filter(
            (o) =>
              o.items.some(
                (i) => i.seller_id === seller.id || sellerProducts.some((sp) => sp.id === i.product_id)
              )
          )}
        />
      )}

      {/* TAB 1: PRODUCT CATALOG & UPLOAD */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your inventory by title or SKU..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              />
            </div>

            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs self-start cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload New Product</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Selling Price</th>
                  <th className="p-3">MRP / Discount</th>
                  <th className="p-3">Stock Units</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-xs text-slate-500">
                      No products found. Click <strong>Upload New Product</strong> above to add your first item to CARTPLUS!
                    </td>
                  </tr>
                ) : (
                  displayedProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
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
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-400 line-through tabular-nums">
                            Rs. {p.original_price.toLocaleString('en-NP')}
                          </span>
                          {p.discount > 0 && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                              {p.discount}% OFF
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`font-semibold tabular-nums ${p.stock <= 5 ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleProductStatus(p.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            p.is_active
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {p.is_active ? 'Active' : 'Draft / Off'}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(p)}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-VENDOR SELLER ORDERS & DISPATCHES */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Doorstep Courier Dispatch: Courier riders arrive daily for package pickup at your registered store address in {seller.city}. Print dispatch slips with 2D barcode for fast handover.
              </span>
            </div>
          </div>

          {sellerOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900">No Store Orders Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Customer orders containing items from your store will appear here for processing and courier dispatch.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sellerOrders.map((so) => (
                <div
                  key={so.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4 text-xs"
                >
                  {/* Sub-order header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {so.seller_order_number}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            so.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : so.status === 'shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : so.status === 'processing'
                              ? 'bg-amber-100 text-amber-800'
                              : so.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {so.status}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(so.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Parent Order Reference: <span className="font-mono font-semibold">{so.order_id}</span>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedSlipOrder(so)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-600" />
                        <span>Print Dispatch Slip</span>
                      </button>

                      {so.status === 'pending' && (
                        <button
                          onClick={() => updateSellerOrderStatus(so.id, 'processing')}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
                        >
                          Process Order
                        </button>
                      )}

                      {so.status === 'processing' && (
                        <button
                          onClick={() =>
                            updateSellerOrderStatus(
                              so.id,
                              'shipped',
                              `TRK-${Date.now().toString().slice(-6)}`,
                              'ncm'
                            )
                          }
                          className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors cursor-pointer shadow-2xs"
                        >
                          Handover to Courier
                        </button>
                      )}

                      {so.status === 'shipped' && (
                        <button
                          onClick={() => updateSellerOrderStatus(so.id, 'delivered')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors cursor-pointer shadow-2xs"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Items in this sub-order */}
                  <div className="divide-y divide-slate-100">
                    {(so.items || []).map((it) => (
                      <div key={it.id} className="py-2 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{it.product_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            SKU: {it.product_sku || 'N/A'} • Qty: {it.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 tabular-nums">
                            Rs. {it.total_price.toLocaleString('en-NP')}
                          </span>
                          <span className="text-[10px] text-slate-400 block tabular-nums">
                            Commission: Rs. {it.commission_amount.toLocaleString('en-NP')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Financial subtotal */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500">
                      Settlement Status:{' '}
                      <span className="text-slate-900 capitalize font-bold">
                        {so.settlement_status.replace('_', ' ')}
                      </span>
                    </span>
                    <div className="text-right">
                      <span className="text-slate-500 text-[11px] block">
                        Subtotal: Rs. {so.subtotal.toLocaleString('en-NP')} • Platform Fee: -Rs. {so.commission_amount.toLocaleString('en-NP')}
                      </span>
                      <span className="font-black text-slate-950 text-sm tabular-nums">
                        Net Seller Payable: Rs. {so.payout_amount.toLocaleString('en-NP')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FINANCIAL LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          {/* Metrics summary */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Gross Product Sales
              </span>
              <div className="text-xl font-black text-slate-950 font-brand mt-1 tabular-nums">
                Rs.{' '}
                {sellerLedger
                  .filter((l) => l.transaction_type === 'SALE')
                  .reduce((sum, l) => sum + Number(l.amount), 0)
                  .toLocaleString('en-NP')}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Authoritative order merchandise sales</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Platform Commission ({seller.commission_rate}%)
              </span>
              <div className="text-xl font-black text-rose-600 font-brand mt-1 tabular-nums">
                -Rs.{' '}
                {sellerLedger
                  .filter((l) => l.transaction_type === 'COMMISSION')
                  .reduce((sum, l) => sum + Number(l.amount), 0)
                  .toLocaleString('en-NP')}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Retained platform operations fee</p>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 shadow-2xs">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Settlement Hold (7 Days)
              </span>
              <div className="text-xl font-black text-amber-900 font-brand mt-1 tabular-nums">
                Rs.{' '}
                {sellerOrders
                  .filter((so) => so.status === 'delivered' && so.settlement_status === 'pending_hold')
                  .reduce((sum, so) => sum + Number(so.payout_amount), 0)
                  .toLocaleString('en-NP')}
              </div>
              <p className="text-[10px] text-amber-700 mt-0.5">Held during consumer return guarantee</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Available for Payout
              </span>
              <div className="text-xl font-black text-emerald-900 font-brand mt-1 tabular-nums">
                Rs.{' '}
                {Math.max(
                  0,
                  sellerLedger
                    .filter((l) => l.transaction_type === 'SALE')
                    .reduce((sum, l) => sum + Number(l.amount), 0) -
                    sellerLedger
                      .filter((l) => l.transaction_type === 'COMMISSION')
                      .reduce((sum, l) => sum + Number(l.amount), 0) -
                    sellerPayouts
                      .filter((p) => p.status === 'completed')
                      .reduce((sum, p) => sum + Number(p.amount), 0) -
                    sellerOrders
                      .filter((so) => so.status === 'delivered' && so.settlement_status === 'pending_hold')
                      .reduce((sum, so) => sum + Number(so.payout_amount), 0)
                ).toLocaleString('en-NP')}
              </div>
              <p className="text-[10px] text-emerald-700 mt-0.5">Eligible for instant connectIPS transfer</p>
            </div>
          </div>

          {/* Ledger History */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Auditable Financial Ledger Transactions
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {sellerLedger.length} Records
              </span>
            </div>

            {sellerLedger.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No ledger transactions recorded yet. Transactions are automatically created upon confirmed order placement.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Reference</th>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-right">Credit / Debit</th>
                      <th className="p-3 text-right">Running Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sellerLedger.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50">
                        <td className="p-3 text-slate-400 font-mono text-[11px]">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              tx.transaction_type === 'SALE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tx.transaction_type === 'COMMISSION'
                                ? 'bg-amber-100 text-amber-800'
                                : tx.transaction_type === 'PAYOUT'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {tx.transaction_type}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-semibold text-slate-900 text-[11px]">
                          {tx.reference_id || 'N/A'}
                        </td>
                        <td className="p-3 text-slate-600 max-w-xs truncate">
                          {tx.description}
                        </td>
                        <td className="p-3 text-right font-bold tabular-nums">
                          <span className={tx.entry_type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}>
                            {tx.entry_type === 'credit' ? '+' : '-'}Rs. {tx.amount.toLocaleString('en-NP')}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900 tabular-nums">
                          Rs. {tx.balance_after.toLocaleString('en-NP')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: NEPAL BANK PAYOUTS */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bank Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <CreditCard className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Verified Remittance Bank Account
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Bank</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">{seller.bank_name || 'Not Configured'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Account</span>
                  <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                    {seller.account_number ? `••••${seller.account_number.slice(-4)}` : 'N/A'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Beneficiary</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">{seller.account_holder || seller.owner_name}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Disbursals are processed directly into your domestic commercial bank account via NCHL connectIPS.
              </p>
            </div>

            {/* Request Payout Form */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Request Balance Disbursal
                </h3>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const amt = Number(payoutAmountInput);
                  if (!amt || amt <= 0) return;
                  setIsSubmittingPayout(true);
                  await requestPayout(amt, payoutMethodInput);
                  setPayoutAmountInput('');
                  setIsSubmittingPayout(false);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Disbursal Amount (NPR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={payoutAmountInput}
                    onChange={(e) => setPayoutAmountInput(e.target.value)}
                    placeholder="e.g. 15000"
                    min="500"
                    step="100"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Disbursal Channel</label>
                  <select
                    value={payoutMethodInput}
                    onChange={(e) => setPayoutMethodInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="connectIPS / Bank Transfer">connectIPS / Bank Transfer</option>
                    <option value="eSewa Business Remittance">eSewa Business Remittance</option>
                    <option value="Khalti Business Remittance">Khalti Business Remittance</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingPayout}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmittingPayout ? 'Submitting Disbursal Request...' : 'Submit Disbursal Request'}
                </button>
              </form>
            </div>
          </div>

          {/* Payout Records */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Payout Disbursal Requests & Remittance History
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {sellerPayouts.length} Records
              </span>
            </div>

            {sellerPayouts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No past payout requests. Payout requests will show approval, processing, and transaction reference here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Request Date</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Transfer Reference</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sellerPayouts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="p-3 text-slate-400 font-mono text-[11px]">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3 font-bold text-slate-900 tabular-nums">
                          Rs. {Number(p.amount).toLocaleString('en-NP')}
                        </td>
                        <td className="p-3 text-slate-600">{p.payout_method}</td>
                        <td className="p-3 font-mono font-bold text-slate-700">
                          {p.transfer_reference || 'Pending Processing'}
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              p.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'processing'
                                ? 'bg-blue-100 text-blue-800'
                                : p.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: SECURE VERIFICATION DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload Document Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Upload className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Submit Verification Document
                </h3>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!docFileInput || !docNameInput.trim()) return;
                  setIsUploadingDoc(true);
                  await uploadSellerDocument(docTypeInput, docNameInput.trim(), docFileInput);
                  setDocNameInput('');
                  setDocFileInput(null);
                  setIsUploadingDoc(false);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Document Category</label>
                  <select
                    value={docTypeInput}
                    onChange={(e) => setDocTypeInput(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="pan_certificate">PAN / VAT Registration Certificate</option>
                    <option value="citizenship_front">Nepali Citizenship (Front Side)</option>
                    <option value="citizenship_back">Nepali Citizenship (Back Side)</option>
                    <option value="business_registration">Company / Enterprise Registration Certificate</option>
                    <option value="bank_cheque">Bank Account Cheque Leaf (Verification)</option>
                    <option value="tax_clearance">Recent Tax Clearance Certificate</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Document Label / Title</label>
                  <input
                    type="text"
                    value={docNameInput}
                    onChange={(e) => setDocNameInput(e.target.value)}
                    placeholder="e.g. Official PAN Certificate 2081"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select File (PDF / JPG / PNG, max 10MB)</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setDocFileInput(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 cursor-pointer"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUploadingDoc}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isUploadingDoc ? 'Uploading Secure Document...' : 'Upload & Submit for Audit'}
                </button>
              </form>
            </div>

            {/* Verification Standard Info */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Verification Workflow
                </h3>
              </div>
              <div className="space-y-3 text-xs text-slate-600">
                <p>
                  To protect Nepal consumers from counterfeit items, CARTPLUS validates all business records through a two-step audit:
                </p>
                <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px]">Step 1: Format Validated</span>
                  </div>
                  <p className="text-[11px]">System confirms document format, PAN 9-digit format, and checksum integrity.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">Step 2: Officially Verified</span>
                  </div>
                  <p className="text-[11px]">CARTPLUS compliance officers review Inland Revenue Department records and authorize verified merchant badge.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Uploaded Documents List */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Submitted Verification Documents
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {sellerDocuments.length} Documents
              </span>
            </div>

            {sellerDocuments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No documents uploaded yet. Upload your PAN certificate and citizenship to activate verified merchant status.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sellerDocuments.map((doc) => (
                  <div key={doc.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{doc.document_name}</p>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5">
                        Category: {doc.document_type.replace('_', ' ')} • Submitted: {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                          doc.verification_status === 'officially_verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.verification_status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : doc.verification_status === 'format_validated'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {doc.verification_status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: STORE PROFILE & LOCATION */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Store & Courier Pickup Profile
              </h3>
            </div>
            <Link
              to={`/seller/${seller.id}`}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>View Public Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Store Name</span>
              <p className="font-bold text-slate-900 mt-0.5">{seller.store_name}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Owner / Contact Person</span>
              <p className="font-bold text-slate-900 mt-0.5">{seller.owner_name}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">PAN / VAT Number</span>
              <p className="font-mono font-bold text-slate-900 mt-0.5">{seller.pan_vat_number}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Registered Phone</span>
              <p className="font-mono font-bold text-slate-900 mt-0.5">{seller.phone}</p>
            </div>

            <div className="sm:col-span-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Courier Pickup Address</span>
              <p className="text-slate-800 mt-0.5">{seller.address}, {seller.city}, {seller.district}, {seller.province}</p>
            </div>
          </div>
        </div>
      )}

      {/* DISPATCH SLIP MODAL */}
      {selectedSlipOrder && (
        <SellerDispatchSlipModal
          sellerOrder={selectedSlipOrder}
          seller={seller}
          customerOrderNumber={selectedSlipOrder.order_id}
          onClose={() => setSelectedSlipOrder(null)}
        />
      )}

      {/* UPLOAD / EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 font-brand">
                  {editingProductId ? 'Edit Product' : 'Upload New Product to CARTPLUS'}
                </h3>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Product Name / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="e.g. Ultra Wireless ANC Earbuds Pro"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={pBrand}
                    onChange={(e) => setPBrand(e.target.value)}
                    placeholder="Brand name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Price, Original Price & Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Selling Price (Rs.) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-bold tabular-nums"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Original MRP (Rs.)
                  </label>
                  <input
                    type="number"
                    value={pOriginalPrice}
                    onChange={(e) => setPOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Stock Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 tabular-nums"
                    required
                  />
                </div>
              </div>

              {/* Image upload selection: Direct Device/Gallery Upload or URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-800">
                    Product Image <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('upload')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        imageSourceMode === 'upload'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Upload className="w-3 h-3 text-amber-500" />
                      <span>Upload from Device</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('url')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        imageSourceMode === 'url'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                      <span>Web URL</span>
                    </button>
                  </div>
                </div>

                {imageSourceMode === 'upload' ? (
                  <div className="space-y-3">
                    {/* Drag & Drop / Mobile File & Gallery Picker */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleImageFileUpload(file);
                      }}
                      className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center transition-all ${
                        isDragOver
                          ? 'border-amber-500 bg-amber-50/60'
                          : pImage && pImage.startsWith('data:')
                          ? 'border-emerald-300 bg-emerald-50/30'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-white'
                      }`}
                    >
                      <input
                        type="file"
                        id="product-file-input"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageFileUpload(file);
                        }}
                        className="hidden"
                      />

                      {pImage ? (
                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between text-left">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-2xs">
                              <img
                                src={pImage}
                                alt="Selected preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900">
                                  {uploadFileName || 'Image Ready'}
                                </span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                                  <Check className="w-2.5 h-2.5" />
                                  <span>Selected</span>
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Optimized for mobile app and web storefront
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <label
                                  htmlFor="product-file-input"
                                  className="text-[11px] font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
                                >
                                  Choose different file / photo
                                </label>
                              </div>
                            </div>
                          </div>

                          <label
                            htmlFor="product-file-input"
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer shadow-2xs whitespace-nowrap"
                          >
                            Replace Photo
                          </label>
                        </div>
                      ) : (
                        <label
                          htmlFor="product-file-input"
                          className="cursor-pointer block space-y-2"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              Click to upload photo or drag & drop here
                            </span>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              Supports desktop files, phone photo gallery, and direct camera captures (PNG, JPG, WEBP)
                            </span>
                          </div>
                          <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-slate-400 font-semibold">
                            <span className="flex items-center gap-1">
                              <Laptop className="w-3.5 h-3.5" /> Desktop
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Smartphone className="w-3.5 h-3.5" /> Phone Gallery
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Camera className="w-3.5 h-3.5" /> Camera
                            </span>
                          </div>
                        </label>
                      )}

                      {isUploadingImage && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-2xs flex items-center justify-center rounded-2xl">
                          <span className="text-xs font-bold text-slate-800 animate-pulse">
                            Processing & optimizing photo...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={pImage}
                      onChange={(e) => setPImage(e.target.value)}
                      placeholder="https://example.com/product-image.jpg"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-[11px] focus:outline-none focus:border-amber-500"
                      required
                    />

                    {pImage && (
                      <div className="mt-2 flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                        <img
                          src={pImage}
                          alt="URL preview"
                          className="w-10 h-10 rounded-lg object-cover bg-white"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="min-w-0 flex-1 text-[11px] text-slate-600 truncate font-mono">
                          {pImage}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  placeholder="Detail the specifications, package contents, and warranty details..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-2xs cursor-pointer"
                >
                  {editingProductId ? 'Update Product' : 'Upload to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
