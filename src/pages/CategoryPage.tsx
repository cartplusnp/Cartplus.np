import React, { useState, useMemo, useEffect } from 'react';
import { CATEGORIES } from '../data/categories';
import { useProducts } from '../context/ProductContext';
import { useBrowsingHistory } from '../context/BrowsingHistoryContext';
import { ProductCard } from '../components/common/ProductCard';
import { EmptyState } from '../components/common/EmptyState';
import { Link } from '../context/RouterContext';
import { ArrowLeft, SlidersHorizontal, Tag, Sparkles } from 'lucide-react';

interface CategoryPageProps {
  categorySlug: string;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ categorySlug }) => {
  const { activeProducts } = useProducts();
  const { recordCategoryVisit } = useBrowsingHistory();
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');

  const category = CATEGORIES.find(
    (c) => c.slug.toLowerCase() === categorySlug.toLowerCase()
  );

  useEffect(() => {
    if (category) {
      recordCategoryVisit(category.slug, category.name);
    } else if (categorySlug) {
      recordCategoryVisit(categorySlug);
    }
  }, [categorySlug, category?.name]);

  const products = useMemo(() => {
    return activeProducts
      .filter((p) => {
        return (
          p.categorySlug?.toLowerCase() === categorySlug.toLowerCase() ||
          p.category?.toLowerCase() === categorySlug.toLowerCase() ||
          p.category?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === categorySlug.toLowerCase()
        );
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      });
  }, [activeProducts, categorySlug, sortBy]);

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <EmptyState
          title="Category Not Found"
          description={`We couldn't find a category matching "${categorySlug}".`}
          actionText="Browse All Products"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
      {/* Category Banner */}
      <div className="relative rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-10 overflow-hidden mb-4 sm:mb-8 border border-slate-800 shadow-sm">
        {category.image && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: `url(${category.image})` }}
          />
        )}
        <div className="relative z-10 max-w-2xl">
          <Link
            to="/products"
            className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-300 hover:text-amber-400 mb-2 sm:mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>All Categories</span>
          </Link>
          <h1 className="text-xl sm:text-4xl font-black font-brand tracking-tight text-white">
            {category.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 sm:mt-2 leading-relaxed line-clamp-2 sm:line-clamp-none">
            {category.description}
          </p>
          <div className="mt-2.5 sm:mt-4 flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium text-amber-400">
            <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="tabular-nums">{products.length} Products Available in Nepal</span>
          </div>
        </div>
      </div>

      {/* Sorting Bar */}
      <div className="flex items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-6 border-b border-slate-200 mb-4 sm:mb-8">
        <span className="text-[11px] sm:text-xs text-slate-500">
          Showing <span className="font-bold text-slate-900">{products.length}</span> items
        </span>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <EmptyState
          title={`No Products in ${category.name} Yet`}
          description="We are currently sourcing new verified stock for this category."
          actionText="Explore Other Categories"
          actionHref="/products"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
