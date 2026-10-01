import React from 'react';
import { Layers, Coins, Smartphone, Truck, HeadphonesIcon, CheckCircle2, Store } from 'lucide-react';
import { Link } from '../../context/RouterContext';

export const WhyCartplus: React.FC = () => {
  const benefits = [
    {
      icon: Layers,
      title: 'Wide Product Choice',
      description: 'Find essentials across tech, mobile accessories, kitchen, and everyday home items in one organized catalog.',
    },
    {
      icon: Coins,
      title: 'Genuine Everyday Value',
      description: 'Honest Nepalese Rupee pricing without arbitrary markups, coupled with real seasonal savings.',
    },
    {
      icon: Truck,
      title: 'Cash on Delivery Across Nepal',
      description: 'Order with zero prepayment risk. Inspect your package and pay our delivery courier directly.',
    },
    {
      icon: Smartphone,
      title: 'Convenient Shopping',
      description: 'Optimized for smooth browsing on phones and computers with fast search and simple checkout.',
    },
    {
      icon: Store,
      title: 'Sell on CARTPLUS (Low 5% Fee)',
      description: 'Expand your business across all 7 provinces with a transparent 5% platform commission, coordinated regional dispatch, and direct merchant bank settlements.',
      isSellerPromo: true,
    },
    {
      icon: HeadphonesIcon,
      title: 'Dedicated Customer Support',
      description: 'Need help with an order or address change? Our Kathmandu-based support desk is ready to assist.',
    },
  ];

  return (
    <section className="py-14 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            THE CARTPLUS COMMITMENT
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-brand text-white mt-1.5">
            Why Shop With CARTPLUS?
          </h2>
          <p className="text-sm text-slate-300 mt-2">
            Built from the ground up to deliver a dependable, respectful, and transparent online shopping experience for customers throughout Nepal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-700/80 text-amber-400 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700/40 flex items-center justify-between text-[11px] font-semibold text-amber-400/90">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{item.isSellerPromo ? 'Competitive 5% Fee' : 'Verified Standard'}</span>
                  </div>
                  {item.isSellerPromo && (
                    <Link to="/seller" className="text-white hover:text-amber-400 font-bold underline">
                      Learn More →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
