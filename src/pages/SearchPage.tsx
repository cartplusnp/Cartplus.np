import React, { useState, useMemo } from 'react';
import { useRouter, Link } from '../context/RouterContext';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/common/ProductCard';
import { EmptyState } from '../components/common/EmptyState';
import { Search, ArrowLeft, SlidersHorizontal } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const { queryParams } = useRouter();
  const { activeProducts } = useProducts();
  const query = queryParams.get('q') || '';
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'rating'>('relevance');

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return activeProducts
      .filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0;
      });
  }, [activeProducts, query, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Products</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-brand flex items-center gap-2">
            <span>Results for &quot;{query}&quot;</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Found <span className="font-bold text-slate-900">{searchResults.length}</span> matching products
          </p>
        </div>

        {searchResults.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        )}
      </div>

      {/* Results or Empty State */}
      <div className="mt-8">
        {searchResults.length === 0 ? (
          <EmptyState
            icon={<Search className="w-8 h-8 stroke-1 text-slate-400" />}
            title="No Products Found"
            description={`We couldn't find any products matching "${query}". Check your spelling or try broader keywords like "headphones", "smartwatch", or "mouse".`}
            actionText="Continue Shopping"
            actionHref="/products"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {searchResults.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
