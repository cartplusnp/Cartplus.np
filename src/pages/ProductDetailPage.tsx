import React, { useState, useEffect, useMemo } from 'react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useReviews } from '../context/ReviewContext';
import { useBrowsingHistory } from '../context/BrowsingHistoryContext';
import { useRouter, Link } from '../context/RouterContext';
import { ProductGallery } from '../components/products/ProductGallery';
import { ReviewSection } from '../components/products/ReviewSection';
import { ProductCard } from '../components/common/ProductCard';
import { EmptyState } from '../components/common/EmptyState';
import {
  Star,
  ShoppingBag,
  Zap,
  Heart,
  Truck,
  ShieldCheck,
  RefreshCw,
  Clock,
  Check,
  ChevronRight,
  Minus,
  Plus,
} from 'lucide-react';

interface ProductDetailPageProps {
  slug: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug }) => {
  const { getProductBySlug, activeProducts } = useProducts();
  const { addToCart, isInCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { recordCategoryVisit } = useBrowsingHistory();
  const { navigate } = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'delivery' | 'reviews'>('description');

  const product = getProductBySlug(slug);

  useEffect(() => {
    if (product) {
      recordCategoryVisit(product.categorySlug, product.category);
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

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
      {/* Breadcrumb trail */}
      <nav className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-slate-500 mb-3 sm:mb-6 overflow-x-auto no-scrollbar">
        <Link to="/" className="hover:text-slate-900 transition-colors shrink-0">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
        <Link
          to={`/category/${product.categorySlug}`}
          className="hover:text-slate-900 transition-colors shrink-0"
        >
          {product.category}
        </Link>
        <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-medium truncate">{product.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 sticky top-28">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-6 space-y-3.5 sm:space-y-6">
          <div>
            {/* Category & SKU */}
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mb-1 sm:mb-2">
              <span className="font-semibold text-amber-600 uppercase tracking-wider">
                {product.category}
              </span>
              <span className="tabular-nums font-mono text-slate-400">SKU: {product.sku}</span>
            </div>

            {/* Product Title */}
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 font-brand leading-tight">
              {product.name}
            </h1>

            {/* Rating and Reviews header */}
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-3">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                      star <= Math.round(product.rating) ? 'fill-current' : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-slate-300">·</span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-[11px] sm:text-xs font-semibold text-slate-500 hover:text-amber-600 transition-colors underline"
              >
                {product.review_count} Customer Reviews
              </button>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl font-black text-slate-950 font-brand tabular-nums">
                  Rs. {product.price.toLocaleString('en-NP')}
                </span>
                {product.original_price > product.price && (
                  <span className="text-xs sm:text-base text-slate-400 line-through tabular-nums">
                    Rs. {product.original_price.toLocaleString('en-NP')}
                  </span>
                )}
              </div>
              {product.original_price > product.price && (
                <p className="text-[11px] sm:text-xs font-bold text-emerald-600 mt-0.5 sm:mt-1">
                  You Save: Rs. {(product.original_price - product.price).toLocaleString('en-NP')} ({product.discount}% OFF)
                </p>
              )}
            </div>

            {/* Stock Status Badge */}
            <div className="text-right">
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-emerald-200">
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>In Stock ({product.stock})</span>
                </span>
              ) : (
                <span className="text-[11px] sm:text-xs font-bold text-rose-700 bg-rose-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-rose-200">
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
          <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2">
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">Quantity</span>
              <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1.5 sm:p-2 text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
                <span className="w-10 sm:w-12 text-center text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-1.5 sm:p-2 text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
              <span className="text-[11px] sm:text-xs text-slate-400">Total: Rs. {(product.price * quantity).toLocaleString('en-NP')}</span>
            </div>

            {/* Buttons Row */}
            <div className="grid grid-cols-12 gap-2 sm:gap-3 pt-1 sm:pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`col-span-5 sm:col-span-5 py-2.5 sm:py-3.5 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-colors shadow-2xs ${
                  inCart
                    ? 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{inCart ? 'In Cart' : 'Add to Cart'}</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="col-span-5 sm:col-span-5 py-2.5 sm:py-3.5 px-2 sm:px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors shadow-md shadow-amber-400/20"
              >
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                <span>BUY NOW</span>
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                className={`col-span-2 sm:col-span-2 py-2.5 sm:py-3.5 px-2 sm:px-3 rounded-xl border flex items-center justify-center transition-colors ${
                  inWishlist
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-white text-slate-700 hover:text-rose-600 border-slate-200'
                }`}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Delivery & Trust Highlights */}
          <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80 divide-y divide-slate-200/60 text-[11px] sm:text-xs text-slate-600">
            <div className="flex items-center gap-2.5 sm:gap-3 pb-2 sm:pb-3">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-900">Cash on Delivery Available</span>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                  Inspect your parcel on delivery and pay cash across all 7 provinces of Nepal.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 py-2 sm:py-3">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-900">Delivery in 2 - 4 Business Days</span>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                  1-2 days within Kathmandu Valley; 2-4 days nationwide.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 pt-2 sm:pt-3">
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-900">7-Day Return / Replacement Guarantee</span>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                  Easy return if defective or not as described.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Description, Specifications, Delivery, Reviews */}
      <div className="mt-8 sm:mt-14 pt-4 sm:pt-8 border-t border-slate-200">
        <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-2 sm:pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'description'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('specifications')}
            className={`pb-2 sm:pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'specifications'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`pb-2 sm:pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'delivery'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Delivery & COD Terms
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 sm:pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Reviews ({product.review_count})
          </button>
        </div>

        <div className="py-6">
          {activeTab === 'description' && (
            <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700 space-y-4">
              <p>{product.description}</p>
              <p>
                All products on CARTPLUS are procured from authorized distributor networks and verified before shipment. We provide authentic items with clear warranties and straightforward after-sales customer service.
              </p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="max-w-2xl bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-xs text-left">
                <tbody>
                  {product.specifications &&
                    Object.entries(product.specifications).map(([key, val], idx) => (
                      <tr
                        key={key}
                        className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}
                      >
                        <td className="p-3 font-bold text-slate-700 w-1/3 border-b border-slate-100">
                          {key}
                        </td>
                        <td className="p-3 text-slate-600 border-b border-slate-100">
                          {val}
                        </td>
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
                <li><strong>Kathmandu Valley:</strong> 1 - 2 business days. Express same-day or next-day delivery option.</li>
                <li><strong>Major Hubs (Pokhara, Biratnagar, Butwal, Birgunj, Dharan, Chitwan):</strong> 2 - 3 business days.</li>
                <li><strong>Rest of Nepal (Hilly & Terai districts):</strong> 3 - 5 business days.</li>
              </ul>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <strong>Cash on Delivery:</strong> No advance payment required. You will only pay the delivery rider after you verify your sealed package.
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

      {/* Frequently Bought Together / Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-200">
          <h3 className="text-xl font-black text-slate-900 font-brand mb-6">
            Related Products You May Like
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
