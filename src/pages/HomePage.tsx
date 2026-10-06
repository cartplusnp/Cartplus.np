import React from 'react';
import { Hero } from '../components/home/Hero';
import { ReturnUserDiscovery } from '../components/home/ReturnUserDiscovery';
import { PromoBanners } from '../components/home/PromoBanners';
import { FlashDeals } from '../components/home/FlashDeals';
import { PopularCategories } from '../components/home/PopularCategories';
import { RecommendedForYou } from '../components/home/RecommendedForYou';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { WhyCartplus } from '../components/home/WhyCartplus';
import { Headphones, ArrowRight } from 'lucide-react';
import { Link } from '../context/RouterContext';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-0">
      {/* 1. Hero Section Entrance */}
      <Hero />

      {/* 2. Returning User Personalization (Recently Viewed & Saved Wishlist) */}
      <ReturnUserDiscovery />

      {/* 3. Promotional Banners */}
      <PromoBanners />

      {/* 4. Flash Deals with live countdown */}
      <FlashDeals />

      {/* 5. Popular Categories Grid */}
      <PopularCategories />

      {/* 6. Recommended for You (Based on Category Browsing History) */}
      <RecommendedForYou />

      {/* 7. Curated Featured Products & New Arrivals */}
      <FeaturedProducts />

      {/* 8. Why Shop with CARTPLUS */}
      <WhyCartplus />

      {/* 9. Customer Support CTA Banner */}
      <section className="py-12 bg-amber-400 text-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-md">
              <Headphones className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black font-brand leading-tight">
                Have a question or need order assistance?
              </h3>
              <p className="text-xs sm:text-sm text-slate-900/80 font-medium mt-1">
                Our Kathmandu support team is available via live ticket messaging and phone.
              </p>
            </div>
          </div>

          <Link
            to="/customer-service"
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 shrink-0 shadow-md"
          >
            <span>Open Support Desk</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
