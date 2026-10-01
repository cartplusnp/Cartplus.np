import React, { useState, useMemo } from 'react';
import { useProducts } from '../context/ProductContext';
import { useRouter, Link } from '../context/RouterContext';
import { ProductCard } from '../components/common/ProductCard';
import { ProductFilters, FilterState } from '../components/products/ProductFilters';
import { EmptyState } from '../components/common/EmptyState';
import { SlidersHorizontal, ArrowUpDown, X, Tag, ShoppingBag } from 'lucide-react';
import { CATEGORIES } from '../data/categories';

export const ProductsPage: React.FC = () => {
  const { activeProducts } = useProducts();
  const { queryParams } = useRouter();

  const initialCategory = queryParams.get('category') || 'all';
  const filterParam = queryParams.get('filter') || '';

  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
    minPrice: 0,
    maxPrice: 50000,
    minDiscount: filterParam === 'deals' ? 20 : 0,
    minRating: 0,
    inStockOnly: false,
  });

  const [sortBy, setSortBy] = useState<string>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const resetFilters = () => {
    setFilters({
      category: 'all',
      minPrice: 0,
      maxPrice: 50000,
      minDiscount: 0,
      minRating: 0,
      inStockOnly: false,
    });
  };

  // Filter & Sort logic
  const filteredProducts = useMemo(() => {
    return activeProducts
      .filter((p) => {
        // Category
        if (filters.category !== 'all') {
          const catLower = filters.category.toLowerCase();
          const matches =
            p.categorySlug?.toLowerCase() === catLower ||
            p.category?.toLowerCase() === catLower;
          if (!matches) return false;
        }
        // Price
        if (p.price < filters.minPrice || p.price > filters.maxPrice) {
          return false;
        }
        // Discount
        if (filters.minDiscount > 0 && p.discount < filters.minDiscount) {
          return false;
        }
        // Rating
        if (filters.minRating > 0 && p.rating < filters.minRating) {
          return false;
        }
        // Stock
        if (filters.inStockOnly && p.stock <= 0) {
          return false;
        }
        // URL filter=new
        if (filterParam === 'new' && !p.is_new) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return (
          (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) ||
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
  }, [activeProducts, filters, sortBy, filterParam]);

  const selectedCategoryName =
    CATEGORIES.find((c) => c.slug === filters.category)?.name || 'All Products';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">
            <span>Marketplace</span>
            <span aria-hidden="true">/</span>
            <span className="text-amber-600">{selectedCategoryName}</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 font-brand">
            {filterParam === 'deals'
              ? 'Flash Deals & Discounts'
              : filterParam === 'new'
              ? 'New Arrival Products'
              : selectedCategoryName}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
            Showing <span className="font-bold text-slate-900 tabular-nums">{filteredProducts.length}</span> verified items
          </p>
        </div>

        {/* Sort & Mobile Filter Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Filter trigger */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 shadow-2xs cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Filters, Right Products */}
      <div className="mt-4 sm:mt-8 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block md:col-span-3 sticky top-28">
          <ProductFilters
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
          />
        </div>

        {/* Products Grid */}
        <div className="md:col-span-9">
          {activeProducts.length === 0 ? (
            <div className="p-10 sm:p-14 bg-white rounded-3xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black font-brand text-slate-900">
                Catalog is Currently Empty
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                All demo and test items have been cleared. Verified sellers can list live products and inventory from their merchant dashboard.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/become-seller"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Register as Seller
                </Link>
                <Link
                  to="/seller/login"
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-xs transition-colors"
                >
                  Seller Login
                </Link>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              title="No Products Match Your Criteria"
              description="Try adjusting your filter sliders, lowering the minimum discount, or choosing a different category."
              actionText="Reset All Filters"
              onAction={resetFilters}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-4/5 max-w-xs h-full bg-white shadow-2xl flex flex-col z-10 overflow-y-auto p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Filter Products</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ProductFilters
              filters={filters}
              onChange={(f) => {
                setFilters(f);
              }}
              onReset={() => {
                resetFilters();
                setMobileFiltersOpen(false);
              }}
            />

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Apply Filters ({filteredProducts.length} Results)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
