import React, { useState, useEffect, useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useBrowsingHistory } from '../context/BrowsingHistoryContext';
import { useToast } from '../context/ToastContext';
import { useRouter, Link } from '../context/RouterContext';
import { ProductGallery } from '../components/products/ProductGallery';
import { ReviewSection } from '../components/products/ReviewSection';
import { ProductCard } from '../components/common/ProductCard';
import { EmptyState } from '../components/common/EmptyState';
import { AnimatedHeart } from '../components/motion/AnimatedHeart';
import { Reveal } from '../components/motion/Reveal';
import {
  Star,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  Check,
  ChevronRight,
  Minus,
  Plus,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

interface ProductDetailPageProps {
  slug: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug }) => {
  const { getProductBySlug, getProductById, activeProducts } = useProducts();
  const { addToCart, isInCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { recordCategoryVisit, recordProductVisit, recentProductIds } = useBrowsingHistory();
  const { cart: toastCart, wishlist: toastWishlist } = useToast();
  const { navigate } = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'delivery' | 'reviews'>('description');
  const [justAdded, setJustAdded] = useState(false);

  const product = getProductBySlug(slug);

  useEffect(() => {
    if (product) {
      recordCategoryVisit(product.categorySlug, product.category);
      recordProductVisit(product.id);
    }
  }, [product?.id, product?.categorySlug]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <EmptyState
          title="Product Not Found"
          description="The product you are looking for may have been moved, renamed, or is currently out of stock."
          actionText="Browse All Products"
          actionHref="/products"
        />
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const inCart = isInCart(product.id);

  // Related products from same category
  const relatedProducts = activeProducts
    .filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug)
    .slice(0, 4);

  // Other recently viewed products
  const otherRecentProducts = recentProductIds
    .filter((id) => id !== product.id)
    .map((id) => getProductById(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined && p.is_active && p.status === 'active')
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setJustAdded(true);
    toastCart(`Added ${quantity}x "${product.name}" to your bag.`);
    setTimeout(() => setJustAdded(false), 2200);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
    if (!inWishlist) {
      toastWishlist(`Saved "${product.name}" to your wishlist.`);
    }
  };

  const tabs = [
    { id: 'description', label: 'Overview' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'delivery', label: 'Delivery & COD' },
    { id: 'reviews', label: `Reviews (${product.review_count})` },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-24 lg:pb-12">
      {/* Breadcrumb trail */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 sm:mb-6 overflow-x-auto no-scrollbar">
        <Link to="/" className="hover:text-slate-900 transition-colors shrink-0">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link
          to={`/category/${product.categorySlug}`}
          className="hover:text-slate-900 transition-colors shrink-0"
        >
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-medium truncate">{product.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 sticky top-28">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-6">
          <div>
            {/* Category & SKU */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span className="font-bold text-amber-600 uppercase tracking-wider">
                {product.category}
              </span>
              <span className="tabular-nums font-mono text-slate-400">SKU: {product.sku}</span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-brand leading-tight">
              {product.name}
            </h1>

            {/* Rating and Reviews header */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(product.rating) ? 'fill-current' : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-900 tabular-nums">
                {product.rating > 0 ? product.rating.toFixed(1) : '5.0'}
              </span>
              <span className="text-slate-300">·</span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-xs font-semibold text-slate-500 hover:text-amber-600 transition-colors underline cursor-pointer"
              >
                {product.review_count} Customer Reviews
              </button>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-center justify-between shadow-2xs">
            <div>
              <div className="flex items-baseline gap-2.5 sm:gap-3">
                <span className="text-2xl sm:text-3xl font-black text-slate-950 font-brand tabular-nums">
                  Rs. {product.price.toLocaleString('en-NP')}
                </span>
                {product.original_price > product.price && (
                  <span className="text-sm sm:text-base text-slate-400 line-through tabular-nums">
                    Rs. {product.original_price.toLocaleString('en-NP')}
                  </span>
                )}
              </div>
              {product.original_price > product.price && (
                <p className="text-xs font-bold text-emerald-600 mt-1">
                  You Save: Rs. {(product.original_price - product.price).toLocaleString('en-NP')} ({product.discount}% OFF)
                </p>
              )}
            </div>

            {/* Stock Status Badge */}
            <div className="text-right">
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-300/60">
                  <Check className="w-3.5 h-3.5" />
                  <span>In Stock ({product.stock})</span>
                </span>
              ) : (
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity Stepper & Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Quantity</span>
              <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                <motion.button
                  type="button"
                  whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </motion.button>
                <span className="w-12 text-center text-sm font-bold text-slate-900 tabular-nums">
                  {quantity}
                </span>
                <motion.button
                  type="button"
                  whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-2 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </motion.button>
              </div>
              <span className="text-xs text-slate-500 tabular-nums font-mono">
                Total: Rs. {(product.price * quantity).toLocaleString('en-NP')}
              </span>
            </div>

            {/* Desktop Buttons Row */}
            <div className="grid grid-cols-12 gap-3 pt-2">
              <motion.button
                type="button"
                onClick={handleAddToCart}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                className={`col-span-5 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer select-none shadow-2xs ${
                  justAdded || inCart
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                    <span>Added to Bag!</span>
                  </>
                ) : inCart ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 stroke-[2]" />
                    <span>In Shopping Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </>
                )}
              </motion.button>

              <motion.button
                type="button"
                onClick={handleBuyNow}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                className="col-span-5 py-3.5 px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-md shadow-amber-500/20 cursor-pointer select-none"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>BUY NOW</span>
              </motion.button>

              <div className="col-span-2 flex items-center justify-center">
                <AnimatedHeart
                  isFilled={inWishlist}
                  onClick={handleWishlistToggle}
                  size="lg"
                  ariaLabel={inWishlist ? 'Remove from saved items' : 'Save to wishlist'}
                />
              </div>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700">
              <Truck className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Cash on Delivery across Nepal</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Quality inspected stock</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700">
              <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
              <span>7-Day Return Guarantee</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Direct Manufacturer Value</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-12 sm:mt-16 bg-white rounded-2xl border border-slate-200 p-4 sm:p-8">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                  isActive ? 'text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activePdpTab"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    className="absolute inset-0 bg-slate-900 rounded-xl -z-10 shadow-xs"
                  />
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="pt-6">
          {activeTab === 'description' && (
            <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
              <p>{product.description}</p>
              <h4 className="text-sm font-bold text-slate-900 pt-2">Product Highlights</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Authentic inventory dispatched directly through verified merchant centers.</li>
                <li>Comprehensive packaging suited for transit across Nepal&apos;s geographical terrain.</li>
                <li>Pre-inspected before dispatch to ensure zero manufacturing flaws.</li>
              </ul>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="max-w-2xl">
              <table className="w-full text-xs text-left border-collapse">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="p-3 font-bold text-slate-700 w-1/3 bg-slate-50">Brand</td>
                    <td className="p-3 text-slate-600">{product.brand || 'CARTPLUS Certified'}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="p-3 font-bold text-slate-700 w-1/3 bg-slate-50">Category</td>
                    <td className="p-3 text-slate-600">{product.category}</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="p-3 font-bold text-slate-700 w-1/3 bg-slate-50">SKU Reference</td>
                    <td className="p-3 text-slate-600 font-mono">{product.sku}</td>
                  </tr>
                  {product.specifications &&
                    Object.entries(product.specifications).map(([key, val], idx) => (
                      <tr key={key} className="border-b border-slate-100">
                        <td className="p-3 font-bold text-slate-700 w-1/3 bg-slate-50 capitalize">
                          {key.replace(/_/g, ' ')}
                        </td>
                        <td className="p-3 text-slate-600">{val}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-4 max-w-2xl text-xs text-slate-700 leading-relaxed">
              <h4 className="text-sm font-bold text-slate-900">Nepal Delivery Coverage</h4>
              <p>
                CARTPLUS partners with leading national courier networks to ensure prompt delivery across all seven provinces of Nepal:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li><strong>Kathmandu Valley:</strong> 1 - 2 business days. Express next-day delivery.</li>
                <li><strong>Major Commercial Centers:</strong> (Pokhara, Biratnagar, Butwal, Birgunj, Dharan, Chitwan) 2 - 3 business days.</li>
                <li><strong>All Other Districts:</strong> 3 - 5 business days.</li>
              </ul>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 font-medium">
                <strong>Cash on Delivery:</strong> No prepayment necessary. Pay our courier driver after inspecting your parcel tag.
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <ReviewSection
              productId={product.id}
              productName={product.name}
              rating={product.rating}
              reviewCount={product.review_count}
            />
          )}
        </div>
      </div>

      {/* DISCOVERY LOOP 1: Related Products in this category */}
      {relatedProducts.length > 0 && (
        <Reveal className="mt-14 pt-10 border-t border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-brand">
                Similar In {product.category}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Explore alternate choices with similar features</p>
            </div>
            <Link
              to={`/category/${product.categorySlug}`}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Reveal>
      )}

      {/* DISCOVERY LOOP 2: Recently Viewed Items */}
      {otherRecentProducts.length > 0 && (
        <Reveal className="mt-14 pt-10 border-t border-slate-200">
          <div className="mb-6">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-brand">
              Recently Viewed By You
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Products you checked earlier during this session</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {otherRecentProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Reveal>
      )}

      {/* Sticky Mobile Purchase Bar (Always within reach on phone) */}
      <div className="lg:hidden fixed bottom-15 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 z-30 shadow-xl flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Price</div>
          <div className="text-base font-black text-slate-950 tabular-nums font-brand leading-none">
            Rs. {(product.price * quantity).toLocaleString('en-NP')}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className="px-3.5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{justAdded ? 'Added!' : inCart ? 'In Bag' : 'Add'}</span>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={handleBuyNow}
            className="px-4 py-2.5 bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-md shadow-amber-400/20"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>BUY NOW</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};
