import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useProducts } from '../../context/ProductContext';
import { ProductCard } from '../common/ProductCard';
import { Link } from '../../context/RouterContext';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Reveal } from '../motion/Reveal';

export const FeaturedProducts: React.FC = () => {
  const { activeProducts } = useProducts();
  const [activeTab, setActiveTab] = useState<'featured' | 'new' | 'recommended'>('featured');
  const shouldReduceMotion = useReducedMotion();

  const filteredProducts = activeProducts
    .filter((p) => {
      if (activeTab === 'featured') return p.is_featured;
      if (activeTab === 'new') return p.is_new;
      return p.rating >= 4.7;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (activeProducts.length === 0) return null;

  const tabs = [
    { id: 'featured', label: 'Trending & Featured' },
    { id: 'new', label: 'Just Dropped' },
    { id: 'recommended', label: 'Top Rated Picks' },
  ] as const;

  return (
    <section className="py-8 sm:py-14 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Heading & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DISCOVERY SPOTLIGHT</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-brand">
              Curated For You
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore hand-selected products verified for durability and honest everyday value.
            </p>
          </div>

          {/* Interactive Filter Tabs with animated pill */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto border border-slate-200/60">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-3 sm:px-4 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer z-10 ${
                    isActive ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFeaturedTab"
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                      className="absolute inset-0 bg-slate-900 rounded-lg -z-10 shadow-xs"
                    />
                  )}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid with Reveal */}
        <Reveal key={activeTab}>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {(filteredProducts.length > 0 ? filteredProducts : activeProducts)
              .slice(0, 8)
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        </Reveal>

        {/* Footer Link */}
        <div className="mt-8 sm:mt-10 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-xl transition-all hover:-translate-y-0.5"
          >
            <span>View All Products in Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
