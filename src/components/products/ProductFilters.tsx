import React from 'react';
import { CATEGORIES } from '../../data/categories';
import { useProducts } from '../../context/ProductContext';
import { RotateCcw, Check, Star } from 'lucide-react';

export interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  minDiscount: number;
  minRating: number;
  inStockOnly: boolean;
}

interface ProductFiltersProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const { activeProducts } = useProducts();

  return (
    <div className="space-y-6 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          Filter Catalog
        </h3>
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-amber-600 flex items-center gap-1 transition-colors font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
          Category
        </h4>
        <div className="space-y-1 max-h-56 overflow-y-auto no-scrollbar pr-1">
          <button
            onClick={() => onChange({ ...filters, category: 'all' })}
            className={`w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs transition-colors text-left ${
              filters.category === 'all'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>All Categories</span>
            <span className={`text-[10px] tabular-nums ${filters.category === 'all' ? 'text-amber-300' : 'text-slate-400'}`}>
              {activeProducts.length}
            </span>
          </button>
          {CATEGORIES.map((cat) => {
            const isSelected = filters.category === cat.slug;
            const count = activeProducts.filter(
              (p) =>
                p.categorySlug?.toLowerCase() === cat.slug.toLowerCase() ||
                p.category?.toLowerCase() === cat.name.toLowerCase()
            ).length;

            return (
              <button
                key={cat.slug}
                onClick={() => onChange({ ...filters, category: cat.slug })}
                className={`w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs transition-colors text-left ${
                  isSelected
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <span className={`text-[10px] tabular-nums ${isSelected ? 'text-amber-300' : 'text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
          Price Range (NPR)
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 tabular-nums">
            <span>Rs. {filters.minPrice.toLocaleString('en-NP')}</span>
            <span>Rs. {filters.maxPrice.toLocaleString('en-NP')}</span>
          </div>
          <input
            type="range"
            min={500}
            max={50000}
            step={500}
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              onClick={() => onChange({ ...filters, minPrice: 0, maxPrice: 2000 })}
              className="py-1 px-2 border border-slate-200 rounded text-[11px] text-slate-600 hover:border-slate-400 text-center"
            >
              Under Rs. 2,000
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...filters, minPrice: 2000, maxPrice: 5000 })}
              className="py-1 px-2 border border-slate-200 rounded text-[11px] text-slate-600 hover:border-slate-400 text-center"
            >
              Rs. 2,000 - 5,000
            </button>
          </div>
        </div>
      </div>

      {/* Discount Minimum */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
          Discounts & Offers
        </h4>
        <div className="space-y-1.5">
          {[0, 10, 20, 30].map((disc) => (
            <label
              key={disc}
              className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer select-none"
            >
              <input
                type="radio"
                name="discountFilter"
                checked={filters.minDiscount === disc}
                onChange={() => onChange({ ...filters, minDiscount: disc })}
                className="accent-slate-900"
              />
              <span>{disc === 0 ? 'All Items' : `${disc}% or more off`}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Customer Rating */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
          Customer Rating
        </h4>
        <div className="space-y-1.5">
          {[4, 3].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() =>
                onChange({
                  ...filters,
                  minRating: filters.minRating === rating ? 0 : rating,
                })
              }
              className={`w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-xs transition-colors ${
                filters.minRating === rating
                  ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <div className="flex items-center text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
                <span>{rating} Stars & Up</span>
              </div>
              {filters.minRating === rating && <Check className="w-3.5 h-3.5 text-amber-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* In Stock Only */}
      <div className="pt-4 border-t border-slate-100">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 text-slate-900 accent-slate-900"
          />
          <span>In Stock Only</span>
        </label>
      </div>
    </div>
  );
};
