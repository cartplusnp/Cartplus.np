import React, { useMemo } from 'react';
import { History, Heart, ArrowRight, Sparkles, X } from 'lucide-react';
import { useBrowsingHistory } from '../../context/BrowsingHistoryContext';
import { useProducts } from '../../context/ProductContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { ProductCard } from '../common/ProductCard';
import { Link } from '../../context/RouterContext';
import { Reveal } from '../motion/Reveal';

export const ReturnUserDiscovery: React.FC = () => {
  const { recentProductIds, topCategories, clearHistory } = useBrowsingHistory();
  const { activeProducts, getProductById } = useProducts();
  const { wishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();

  // Resolve recently viewed products
  const recentProducts = useMemo(() => {
    return recentProductIds
      .map((id) => getProductById(id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined && p.is_active && p.status === 'active')
      .slice(0, 4);
  }, [recentProductIds, getProductById]);

  // If user has no recent products and no wishlist items, do not render this section
  if (recentProducts.length === 0 && wishlist.length === 0) {
    return null;
  }

  const firstName = user?.name ? user.name.split(' ')[0] : null;
  const topCategoryName = topCategories.length > 0 ? topCategories[0].categoryName : null;

  return (
    <section className="py-10 sm:py-14 bg-gradient-to-b from-slate-100/90 to-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header with return greeting */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{firstName ? `Welcome back, ${firstName} 👋` : 'Welcome back 👋'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-brand">
              Continue Where You Left Off
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {topCategoryName
                ? `Picked based on your interest in ${topCategoryName} and recently viewed items`
                : 'Products you previously inspected on CARTPLUS'}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {wishlist.length > 0 && (
              <Link
                to="/wishlist"
                className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-amber-600 transition-colors"
              >
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>Your Saved Items ({wishlist.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            <button
              onClick={clearHistory}
              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-[11px]"
              title="Clear recent browsing history"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {recentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};
