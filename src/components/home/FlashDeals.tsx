import React, { useState, useEffect } from 'react';
import { Flame, Clock, ArrowRight } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { ProductCard } from '../common/ProductCard';
import { Link } from '../../context/RouterContext';

export const FlashDeals: React.FC = () => {
  const { activeProducts } = useProducts();
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const dealProducts = activeProducts
    .filter((p) => p.discount >= 25 || p.is_flash_deal)
    .slice(0, 4);

  if (dealProducts.length === 0) return null;

  return (
    <section className="py-6 sm:py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Header with Title and Countdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-brand">
                  FLASH DEALS
                </h2>
                <span className="bg-rose-100 text-rose-700 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase">
                  Limited Time
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1 sm:line-clamp-none">
                Hand-picked discounts on genuine quality items with limited inventory.
              </p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2.5 sm:gap-3 self-start sm:self-auto">
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-slate-500">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              <span>Ends in:</span>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 text-xs font-bold tabular-nums">
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[11px] sm:text-xs">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-slate-400 font-bold">:</span>
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[11px] sm:text-xs">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-slate-400 font-bold">:</span>
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[11px] sm:text-xs">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>

            <Link
              to="/products?filter=deals"
              className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 ml-4"
            >
              <span>View All Deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="mt-4 sm:mt-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {dealProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-6 text-center md:hidden">
          <Link
            to="/products?filter=deals"
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700"
          >
            <span>View All Deals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
