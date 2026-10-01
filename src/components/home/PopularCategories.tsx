import React from 'react';
import { CATEGORIES } from '../../data/categories';
import { Link } from '../../context/RouterContext';
import { useBrowsingHistory } from '../../context/BrowsingHistoryContext';
import { useProducts } from '../../context/ProductContext';
import { Headphones, Smartphone, Laptop, Home, UtensilsCrossed, Shirt, Sparkles, Dumbbell, Baby, ArrowRight } from 'lucide-react';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Headphones,
  Smartphone,
  Laptop,
  Home,
  UtensilsCrossed,
  Shirt,
  Sparkles,
  Dumbbell,
  Baby,
};

export const PopularCategories: React.FC = () => {
  const { recordCategoryVisit } = useBrowsingHistory();
  const { activeProducts } = useProducts();

  return (
    <section className="py-6 sm:py-12 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-brand">
              POPULAR CATEGORIES
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1 sm:line-clamp-none">
              Explore our diverse collections across all lifestyle and tech essentials.
            </p>
          </div>

          <Link
            to="/products"
            className="text-xs font-bold text-slate-700 hover:text-amber-600 flex items-center gap-1 transition-colors shrink-0"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {CATEGORIES.map((cat) => {
            const IconComponent = iconMap[cat.iconName] || Sparkles;
            const count = activeProducts.filter(
              (p) =>
                p.categorySlug?.toLowerCase() === cat.slug.toLowerCase() ||
                p.category?.toLowerCase() === cat.name.toLowerCase()
            ).length;

            return (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                onClick={() => recordCategoryVisit(cat.slug, cat.name)}
                className="group p-2.5 sm:p-4 bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all flex flex-col items-center text-center justify-between"
              >
                {/* Icon or Thumbnail */}
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-slate-100 group-hover:bg-amber-100/60 text-slate-700 group-hover:text-amber-600 flex items-center justify-center transition-colors mb-2 sm:mb-3">
                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 tabular-nums">
                    {count} {count === 1 ? 'Product' : 'Products'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
