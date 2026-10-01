import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { ProductCard } from '../common/ProductCard';
import { Link } from '../../context/RouterContext';
import { ArrowRight } from 'lucide-react';

export const FeaturedProducts: React.FC = () => {
  const { activeProducts } = useProducts();
  const [activeTab, setActiveTab] = useState<'featured' | 'new' | 'recommended'>('featured');

  const filteredProducts = activeProducts
    .filter((p) => {
      if (activeTab === 'featured') return p.is_featured;
      if (activeTab === 'new') return p.is_new;
      return p.rating >= 4.7;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (activeProducts.length === 0) return null;

  return (
    <section className="py-6 sm:py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Section Heading & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-brand">
              CURATED COLLECTIONS
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Explore hand-selected products verified for durability and real value.
            </p>
          </div>

          {/* Interactive Filter Tabs */}
          <div className="flex items-center gap-1 p-0.5 sm:p-1 bg-slate-100 rounded-lg sm:rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-md sm:rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'featured'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Featured
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-md sm:rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'new'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New Arrivals
            </button>
            <button
              onClick={() => setActiveTab('recommended')}
              className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-md sm:rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'recommended'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Top Rated
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {filteredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-xl transition-colors"
          >
            <span>View All {activeProducts.length} Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
