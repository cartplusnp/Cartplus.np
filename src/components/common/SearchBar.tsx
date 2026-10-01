import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, ChevronRight, Tag, TrendingUp, Sparkles, Star, Layers, ArrowUpRight } from 'lucide-react';
import { useRouter } from '../../context/RouterContext';
import { useProducts } from '../../context/ProductContext';
import { CATEGORIES } from '../../data/categories';
import { Product, Category } from '../../types';

interface SearchBarProps {
  variant?: 'header' | 'mobile' | 'hero';
  className?: string;
  onSearchSubmit?: () => void;
}

const POPULAR_SEARCH_TAGS = [
  'ANC Headphones',
  'Smart Watch',
  'Wireless Mouse',
  'Hoodie',
  'Backpack',
  'Bluetooth Speaker',
  'Air Fryer',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  variant = 'header',
  className = '',
  onSearchSubmit,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const { products } = useProducts();
  const { navigate } = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Compute matched categories & products in real-time as user types
  const { matchedCategories, matchedProducts, popularProducts } = useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    // Default popular items if no search query
    const popular = [...products]
      .sort((a, b) => (b.rating || 0) * (b.review_count || 1) - (a.rating || 0) * (a.review_count || 1))
      .slice(0, 4);

    if (!trimmed) {
      return {
        matchedCategories: CATEGORIES.slice(0, 5),
        matchedProducts: [],
        popularProducts: popular,
      };
    }

    // Match categories
    const categoriesFound = CATEGORIES.filter((cat) => {
      const catMatch =
        cat.name.toLowerCase().includes(trimmed) ||
        cat.slug.toLowerCase().includes(trimmed) ||
        (cat.description && cat.description.toLowerCase().includes(trimmed));

      // Also check if any product in this category matches the query
      const productInCatMatch = products.some(
        (p) =>
          p.category.toLowerCase() === cat.name.toLowerCase() &&
          p.name.toLowerCase().includes(trimmed)
      );

      return catMatch || productInCatMatch;
    }).slice(0, 4);

    // Match products
    const productsFound = products
      .filter((p) => {
        return (
          p.name.toLowerCase().includes(trimmed) ||
          p.category.toLowerCase().includes(trimmed) ||
          (p.brand && p.brand.toLowerCase().includes(trimmed)) ||
          p.sku.toLowerCase().includes(trimmed) ||
          p.description.toLowerCase().includes(trimmed)
        );
      })
      .sort((a, b) => {
        // Prioritize exact or prefix matches in name
        const aStarts = a.name.toLowerCase().startsWith(trimmed);
        const bStarts = b.name.toLowerCase().startsWith(trimmed);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return (b.rating || 0) - (a.rating || 0);
      })
      .slice(0, 6);

    return {
      matchedCategories: categoriesFound,
      matchedProducts: productsFound,
      popularProducts: popular,
    };
  }, [query, products]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = query.trim();
    if (!clean) return;
    setIsOpen(false);
    if (onSearchSubmit) onSearchSubmit();
    navigate(`/search?q=${encodeURIComponent(clean)}`);
  };

  const handleSelectProduct = (product: Product) => {
    setIsOpen(false);
    setQuery('');
    if (onSearchSubmit) onSearchSubmit();
    navigate(`/products/${product.slug}`);
  };

  const handleSelectCategory = (cat: Category) => {
    setIsOpen(false);
    setQuery('');
    if (onSearchSubmit) onSearchSubmit();
    navigate(`/category/${cat.slug}`);
  };

  const handleSelectTag = (tag: string) => {
    setQuery(tag);
    setIsOpen(false);
    if (onSearchSubmit) onSearchSubmit();
    navigate(`/search?q=${encodeURIComponent(tag)}`);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const hasQuery = query.trim().length > 0;

  const getCategoryProductCount = (cat: Category) => {
    return products.filter(
      (p) =>
        p.is_active !== false &&
        (p.categorySlug?.toLowerCase() === cat.slug.toLowerCase() ||
         p.category?.toLowerCase() === cat.name.toLowerCase())
    ).length;
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="relative flex items-center w-full">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products, brands, categories (e.g. headphones, smart watch)..."
          className="w-full pl-10 sm:pl-11 pr-24 py-2.5 bg-slate-50 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all shadow-2xs"
          autoComplete="off"
          spellCheck={false}
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-20 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Clear search query"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          className="absolute right-1.5 px-3.5 sm:px-4 py-1.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap shadow-xs cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Real-time Live Search Suggestion Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150 divide-y divide-slate-100 max-h-[82vh] overflow-y-auto">
          {/* Section 1: When user has NOT typed yet -> Show Popular tags & Trending Categories */}
          {!hasQuery && (
            <div className="p-4 space-y-4">
              {/* Popular Searches */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                  <span>Popular Searches</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SEARCH_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleSelectTag(tag)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 text-slate-700 text-xs font-medium border border-transparent transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Search className="w-3 h-3 text-slate-400" />
                      <span>{tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Categories */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                    <span>Popular Categories</span>
                  </span>
                  <span className="text-[11px] text-slate-400">Quick explore</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {matchedCategories.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-200 cursor-pointer transition-all flex items-center gap-2 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-600 group-hover:text-amber-600">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <Tag className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate group-hover:text-amber-600">
                          {cat.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {getCategoryProductCount(cat)} {getCategoryProductCount(cat) === 1 ? 'product' : 'products'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Products Preview */}
              {popularProducts.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Trending on CARTPLUS</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {popularProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectProduct(p)}
                        className="p-2 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/40 cursor-pointer transition-all flex items-center gap-2.5 group"
                      >
                        <img
                          src={p.thumbnail || p.images[0]}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate group-hover:text-amber-600">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-black text-slate-900 tabular-nums">
                              Rs. {p.price.toLocaleString('en-NP')}
                            </span>
                            {p.rating && (
                              <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                {p.rating}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 2: When user IS typing -> Show real-time matched categories + matched products */}
          {hasQuery && (
            <div>
              {/* Category Suggestions Bar */}
              {matchedCategories.length > 0 && (
                <div className="p-3 bg-slate-50/80 border-b border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-500" />
                      Suggested Categories for &quot;{query}&quot;
                    </span>
                    <span className="text-slate-400">Direct Category Filter</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {matchedCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-500 hover:text-slate-950 border border-slate-200 text-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 group"
                      >
                        <span>{cat.name}</span>
                        <span className="text-[10px] text-slate-400 group-hover:text-slate-900 bg-slate-100 group-hover:bg-amber-400 px-1.5 py-0.5 rounded-full">
                          {getCategoryProductCount(cat)}
                        </span>
                        <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-slate-950" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Matches */}
              <div>
                <div className="px-3.5 py-2 bg-slate-100/60 text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Matching Products
                  </span>
                  <span className="text-slate-400 lowercase">{matchedProducts.length} suggestions</span>
                </div>

                {matchedProducts.length === 0 ? (
                  <div className="p-6 text-center space-y-2">
                    <p className="text-sm font-bold text-slate-800">
                      No matching products found for &quot;{query}&quot;
                    </p>
                    <p className="text-xs text-slate-500">
                      Try checking for typos or searching by general category like &quot;electronics&quot; or &quot;audio&quot;.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleSearch()}
                      className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Search All Stores Anyway</span>
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {matchedProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleSelectProduct(product)}
                        className="flex items-center gap-3 p-3 hover:bg-amber-50/60 cursor-pointer transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          <img
                            src={product.thumbnail || product.images[0]}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-amber-600">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                              <Tag className="w-3 h-3 text-slate-400" />
                              {product.category}
                            </span>
                            {product.brand && (
                              <>
                                <span className="text-slate-300">·</span>
                                <span className="text-[11px] text-slate-600 font-medium">
                                  {product.brand}
                                </span>
                              </>
                            )}
                            <span className="text-slate-300">·</span>
                            <span className="font-black text-slate-950 tabular-nums">
                              Rs. {product.price.toLocaleString('en-NP')}
                            </span>
                            {product.original_price > product.price && (
                              <span className="text-[11px] line-through text-slate-400 tabular-nums">
                                Rs. {product.original_price.toLocaleString('en-NP')}
                              </span>
                            )}
                            {product.rating && (
                              <span className="ml-auto sm:ml-0 inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                {product.rating}
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* View all button */}
              <div
                onClick={() => handleSearch()}
                className="p-3 bg-slate-900 hover:bg-slate-800 text-white text-center text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  View all results for &quot;{query}&quot;
                  {matchedProducts.length > 0 && ` (${matchedProducts.length}+ products found)`}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
