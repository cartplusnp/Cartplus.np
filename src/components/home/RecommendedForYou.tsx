import React, { useState, useMemo } from 'react';
import { useProducts } from '../../context/ProductContext';
import { useBrowsingHistory } from '../../context/BrowsingHistoryContext';
import { ProductCard } from '../common/ProductCard';
import { Link } from '../../context/RouterContext';
import { CATEGORIES } from '../../data/categories';
import { Product } from '../../types';
import {
  Sparkles,
  RotateCcw,
  ArrowRight,
  Eye,
  SlidersHorizontal,
  Compass,
  X,
  Plus,
} from 'lucide-react';

export const RecommendedForYou: React.FC = () => {
  const { activeProducts } = useProducts();
  const {
    history,
    topCategories,
    clearHistory,
    removeCategory,
    addCategoryInterest,
    hasHistory,
  } = useBrowsingHistory();

  // Active filter tab: 'all' or specific categorySlug
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPreferenceDrawer, setShowPreferenceDrawer] = useState<boolean>(false);

  // If the active filter is no longer in history, reset to 'all'
  const isSelectedValid =
    selectedCategory === 'all' ||
    history.some((h) => h.categorySlug.toLowerCase() === selectedCategory.toLowerCase());

  const currentFilter = isSelectedValid ? selectedCategory : 'all';

  // Recommendation Scoring Engine
  const recommendedProducts = useMemo(() => {
    if (!hasHistory) {
      // Fallback: top rated / trending featured products across catalog
      return activeProducts
        .slice()
        .sort((a, b) => b.rating * b.review_count - a.rating * a.review_count)
        .slice(0, 8);
    }

    // Create a map of category affinity scores
    const categoryScores: Record<string, number> = {};
    const maxViews = Math.max(...history.map((h) => h.viewCount), 1);

    history.forEach((h, index) => {
      // Rank penalty: earlier items in topCategories get higher weight
      const rankMultiplier = Math.max(1, 4 - index);
      const viewScore = (h.viewCount / maxViews) * 50;
      categoryScores[h.categorySlug.toLowerCase()] = viewScore + rankMultiplier * 20;
    });

    // Score all active products
    const scored = activeProducts.map((product) => {
      const productCat = product.categorySlug.toLowerCase();
      const affinity = categoryScores[productCat] || 0;

      // Base quality score
      const qualityScore =
        product.rating * 5 +
        (product.is_featured ? 15 : 0) +
        (product.discount > 0 ? 10 : 0) +
        (product.is_new ? 5 : 0);

      // Total score: affinity is heavily weighted so browsed categories strongly dominate
      const totalScore = affinity > 0 ? affinity * 2 + qualityScore : qualityScore * 0.1;

      return { product, totalScore, affinity };
    });

    if (currentFilter !== 'all') {
      // Specific category tab selected
      return scored
        .filter((item) => item.product.categorySlug.toLowerCase() === currentFilter.toLowerCase())
        .sort((a, b) => b.totalScore - a.totalScore)
        .map((item) => item.product)
        .slice(0, 8);
    }

    // Blended recommendations: prioritize products from browsed categories
    const fromBrowsedCategories = scored
      .filter((item) => item.affinity > 0)
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((item) => item.product);

    if (fromBrowsedCategories.length >= 8) {
      return fromBrowsedCategories.slice(0, 8);
    }

    // Fill remainder with top active products if browsed categories have few items
    const existingIds = new Set(fromBrowsedCategories.map((p) => p.id));
    const remainder = scored
      .filter((item) => !existingIds.has(item.product.id))
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((item) => item.product);

    return [...fromBrowsedCategories, ...remainder].slice(0, 8);
  }, [activeProducts, history, hasHistory, currentFilter]);

  // Categories not yet browsed (for quick sampling / simulation)
  const unvisitedCategories = useMemo(() => {
    const visitedSlugs = new Set(history.map((h) => h.categorySlug.toLowerCase()));
    return CATEGORIES.filter((c) => !visitedSlugs.has(c.slug.toLowerCase()));
  }, [history]);

  if (activeProducts.length === 0) return null;

  return (
    <section className="py-6 sm:py-12 bg-slate-50/70 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1 sm:gap-1.5">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Personalized Algorithm
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-brand">
              RECOMMENDED FOR YOU
            </h2>

            {/* Unboxed Metadata Discipline - no static pills */}
            {hasHistory ? (
              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
                <span>Based on your recent interest in</span>
                {topCategories.slice(0, 3).map((cat, idx) => (
                  <React.Fragment key={cat.categorySlug}>
                    <span className="font-semibold text-slate-800">
                      {cat.categoryName} ({cat.viewCount})
                    </span>
                    {idx < Math.min(topCategories.length, 3) - 1 && (
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
                Personalized suggestions tailored to your shopping journey.
              </p>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setShowPreferenceDrawer(!showPreferenceDrawer)}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-[11px] sm:text-xs font-bold rounded-lg border border-slate-200/90 flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <SlidersHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500" />
              <span>{showPreferenceDrawer ? 'Hide Profile' : 'Browsing Profile'}</span>
            </button>

            {hasHistory && (
              <button
                type="button"
                onClick={clearHistory}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-[11px] sm:text-xs font-medium rounded-lg border border-slate-200/90 flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Clear your browsing history"
              >
                <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Expandable Browsing History Profile Drawer */}
        {showPreferenceDrawer && (
          <div className="mb-6 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Your Category Browsing Profile
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferenceDrawer(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Recommendations update automatically as you explore products and category collections across CARTPLUS.
            </p>

            {/* Current Browsed Categories List */}
            {hasHistory ? (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Tracked Category Views ({history.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {history.map((record) => (
                    <div
                      key={record.categorySlug}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      <span className="font-semibold text-slate-900">{record.categoryName}</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {record.viewCount} view{record.viewCount > 1 ? 's' : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCategory(record.categorySlug)}
                        className="text-slate-400 hover:text-rose-600 ml-1 transition-colors cursor-pointer"
                        title={`Remove ${record.categoryName} from recommendations`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <span>Your browsing history is currently empty.</span>
              </div>
            )}

            {/* Explore More Categories */}
            {unvisitedCategories.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Add category interest to your feed:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {unvisitedCategories.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => addCategoryInterest(cat.slug)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-slate-500" />
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interactive Segmented Filter Tabs */}
        {hasHistory && history.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-2 mb-3 sm:mb-6">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                currentFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              All Personalized
            </button>

            {topCategories.map((cat) => {
              const isActive = currentFilter === cat.categorySlug;
              return (
                <button
                  key={cat.categorySlug}
                  type="button"
                  onClick={() => setSelectedCategory(cat.categorySlug)}
                  className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
                  }`}
                >
                  <span>{cat.categoryName}</span>
                  <span
                    className={`text-[9px] sm:text-[10px] font-mono ${
                      isActive ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    ({cat.viewCount})
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Products Grid */}
        {recommendedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-8 bg-white rounded-2xl border border-slate-200/90 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Products Found for this Category</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              We couldn't find matching stock in this category right now. Browse our full catalog to discover more.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Section Footer Link */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200/70 text-xs">
          <div className="text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Curated recommendations tailored to your store visits</span>
          </div>

          {currentFilter !== 'all' ? (
            <Link
              to={`/category/${currentFilter}`}
              className="font-bold text-slate-900 hover:text-amber-600 flex items-center gap-1 transition-colors"
            >
              <span>View all in {topCategories.find((c) => c.categorySlug === currentFilter)?.categoryName || currentFilter}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              to="/products"
              className="font-bold text-slate-900 hover:text-amber-600 flex items-center gap-1 transition-colors"
            >
              <span>Browse All Collections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};
