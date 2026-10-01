import React from 'react';
import { ArrowRight, Tag, Clock, Flame, Sparkles } from 'lucide-react';
import { Link } from '../../context/RouterContext';
import bannerImg from '../../assets/images/banner_grand_opening_1790251952471.jpg';

export const PromoBanners: React.FC = () => {
  return (
    <section className="py-4 sm:py-8 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Hot Deals & Picks */}
          <div className="relative overflow-hidden rounded-xl bg-slate-900 text-white p-3.5 sm:p-5 flex flex-col justify-between min-h-[140px] sm:min-h-[220px] group border border-slate-800">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-300"
              style={{ backgroundImage: `url(${bannerImg})` }}
            />
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1 sm:mb-2">
                <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Trending Deals
              </span>
              <h3 className="text-base sm:text-xl font-bold text-white leading-tight">
                Up to 35% Off Select Gadgets
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2">
                Limited-time discounted prices across premium audio, wireless accessories & electronics.
              </p>
            </div>
            <div className="relative z-10 pt-2 sm:pt-4">
              <Link
                to="/products?filter=deals"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:text-amber-300 transition-colors"
              >
                <span>Claim Deals</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2: Limited Time Offers */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-3.5 sm:p-5 flex flex-col justify-between min-h-[140px] sm:min-h-[220px] group border border-slate-800">
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1 sm:mb-2">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Limited Time
              </span>
              <h3 className="text-base sm:text-xl font-bold text-white leading-tight">
                Everyday Tech & Accessories
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2">
                Power banks, wireless mice, and high-speed chargers ready to dispatch.
              </p>
            </div>
            <div className="relative z-10 pt-2 sm:pt-4">
              <Link
                to="/category/mobile-accessories"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:text-amber-300 transition-colors"
              >
                <span>Shop Accessories</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 3: New Arrivals */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white p-3.5 sm:p-5 flex flex-col justify-between min-h-[140px] sm:min-h-[220px] group border border-slate-800">
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1 sm:mb-2">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Fresh Stock
              </span>
              <h3 className="text-base sm:text-xl font-bold text-white leading-tight">
                New Arrivals In Catalog
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2">
                Explore newly added items for smart work and contemporary home styling.
              </p>
            </div>
            <div className="relative z-10 pt-2 sm:pt-4">
              <Link
                to="/products?filter=new"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:text-amber-300 transition-colors"
              >
                <span>View New Arrivals</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 4: Special Offers */}
          <div className="relative overflow-hidden rounded-xl bg-amber-500 text-slate-950 p-3.5 sm:p-5 flex flex-col justify-between min-h-[140px] sm:min-h-[220px] group border border-amber-600/30">
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold text-slate-900 uppercase tracking-wider mb-1 sm:mb-2">
                <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Special Offer
              </span>
              <h3 className="text-base sm:text-xl font-black text-slate-950 leading-tight">
                Free Delivery Above Rs. 2,000
              </h3>
              <p className="text-xs text-slate-900/90 mt-0.5 sm:mt-1 font-medium line-clamp-1 sm:line-clamp-2">
                No coupon needed. Automatic free shipping applied at checkout nationwide.
              </p>
            </div>
            <div className="pt-2 sm:pt-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 text-xs font-black text-slate-950 hover:underline"
              >
                <span>Browse All Products</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
