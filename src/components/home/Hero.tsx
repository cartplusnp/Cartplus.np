import React from 'react';
import { ArrowRight, Sparkles, Shield, Truck, Zap } from 'lucide-react';
import { Link } from '../../context/RouterContext';
import heroImg from '../../assets/images/hero_ecommerce_showcase_1790251936625.jpg';

export const Hero: React.FC = () => {
  return (
    <section className="relative bg-slate-900 text-white overflow-hidden">
      {/* Background Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-radial from-slate-800/60 to-slate-950 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-12 items-center">
          {/* Left Text & Call to Action */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[11px] sm:text-xs font-semibold">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>NEPAL&apos;S PREMIER MARKETPLACE</span>
            </div>

            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight font-brand text-white leading-tight sm:leading-none">
              MORE CHOICES. <br />
              <span className="text-amber-400">MORE VALUE.</span>
            </h1>

            <p className="text-xs sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed line-clamp-2 sm:line-clamp-none">
              Discover quality products at prices you&apos;ll love. From premium audio and smart gadgets to home living essentials, delivered straight to your doorstep.
            </p>

            {/* CTAs */}
            <div className="flex flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-4 pt-1 sm:pt-2">
              <Link
                to="/products"
                className="flex-1 sm:flex-initial sm:w-auto px-4 sm:px-8 py-2.5 sm:py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors shadow-md sm:shadow-lg shadow-amber-500/20"
              >
                <span>SHOP NOW</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>

              <Link
                to="/products?filter=deals"
                className="flex-1 sm:flex-initial sm:w-auto px-3.5 sm:px-7 py-2.5 sm:py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-1.5 sm:gap-2 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400" />
                <span>EXPLORE DEALS</span>
              </Link>
            </div>

            {/* Trust points */}
            <div className="pt-3 sm:pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-2 sm:gap-4 text-left">
              <div>
                <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold text-white">
                  <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                  <span>Cash on Delivery</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Pay after parcel arrives</p>
              </div>

              <div>
                <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold text-white">
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                  <span>Quality Assured</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Tested & inspected stock</p>
              </div>

              <div>
                <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold text-white">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                  <span>Fair Pricing</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Realistic Nepalese value</p>
              </div>
            </div>
          </div>

          {/* Right Product Showcase Hero Visual */}
          <div className="lg:col-span-5 relative mt-1 sm:mt-0">
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-slate-700/80 shadow-xl sm:shadow-2xl bg-slate-800 aspect-16/9 sm:aspect-4/3 lg:aspect-square">
              <img
                src={heroImg}
                alt="CARTPLUS Premium Electronics & Gadgets Showcase"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />

              {/* Float Badge */}
              <div className="absolute bottom-2.5 sm:bottom-4 left-2.5 sm:left-4 right-2.5 sm:right-4 bg-slate-900/90 backdrop-blur-md p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-amber-400 font-bold">
                    Featured Collection
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white">
                    Smart Audio & Wearables
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center text-[10px] sm:text-xs font-bold text-emerald-400">
                    COD Available Nationwide
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
