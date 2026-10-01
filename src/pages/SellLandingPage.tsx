import React from 'react';
import { useRouter, Link } from '../context/RouterContext';
import { useSeller } from '../context/SellerContext';
import {
  Store,
  TrendingUp,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  DollarSign,
  Package,
  Layers,
  ChevronRight,
  Headphones,
} from 'lucide-react';

export const SellLandingPage: React.FC = () => {
  const { isAuthenticatedSeller, seller } = useSeller();
  const { navigate } = useRouter();

  const benefits = [
    {
      icon: DollarSign,
      title: 'Low 5% Marketplace Commission',
      desc: 'List and sell across Nepal with a transparent 5% platform commission. Retain full visibility into your retail margins.',
    },
    {
      icon: Truck,
      title: 'Integrated Courier Dispatch',
      desc: 'Coordinate order handover and regional dispatch via leading courier partners across Kathmandu Valley, Pokhara, and major commercial hubs.',
    },
    {
      icon: ShieldCheck,
      title: 'Reliable Cash on Delivery',
      desc: 'Nepal shoppers love COD. Couriers collect exact cash from buyers at delivery, credited to your ledger for on-demand bank payout requests.',
    },
    {
      icon: TrendingUp,
      title: 'Instant Nepal-Wide Reach',
      desc: 'Put your brand and inventory in front of shoppers across all 7 provinces of Nepal without spending heavily on individual marketing.',
    },
    {
      icon: Package,
      title: 'Powerful Seller Dashboard',
      desc: 'Upload products in minutes, set prices and festive discounts, update real-time stock, track dispatch stages, and monitor your earnings.',
    },
    {
      icon: Headphones,
      title: 'Dedicated Merchant Help Desk',
      desc: 'Receive dedicated support from our merchant relations specialists to assist with listing optimization, inventory, and logistics.',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Register Your Merchant Account',
      desc: 'Provide your store name, PAN/VAT or registration, pickup address, and Nepal bank account details in 2 minutes.',
    },
    {
      num: '02',
      title: 'Upload Products & Set Discounts',
      desc: 'List your items with photos, specs, prices, and promotional discount badges through the seller dashboard.',
    },
    {
      num: '03',
      title: 'Receive Orders & Pack',
      desc: 'Get notified of customer Cash on Delivery orders. Simply pack the items using CARTPLUS delivery tags.',
    },
    {
      num: '04',
      title: 'Courier Delivers & You Request Payout',
      desc: 'Our delivery partners transport parcels safely across Nepal, and your earnings are credited for direct bank payout requests.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-16 sm:py-24 border-b border-slate-800">
        <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent opacity-50" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Store className="w-4 h-4" />
              <span>CARTPLUS Merchant Partner Network</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-brand tracking-tight text-white leading-tight">
              Sell on CARTPLUS. <br />
              <span className="text-amber-400">Expand Your Sales Across Nepal.</span>
            </h1>

            <p className="mt-5 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Connect directly with customers across Kathmandu Valley and all 7 provinces. Benefit from a transparent 5% platform fee, seamless Cash on Delivery order handling, and on-demand direct bank settlements.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {isAuthenticatedSeller ? (
                <Link
                  to="/seller/dashboard"
                  className="px-6 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Store className="w-4 h-4" />
                  <span>Go to Seller Dashboard ({seller?.store_name})</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/seller/register"
                    className="px-7 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <span>Register as Seller</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/seller/login"
                    className="px-7 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <span>Merchant Sign In</span>
                  </Link>
                </>
              )}
            </div>

            {/* Micro stats banner */}
            <div className="mt-10 pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="block text-xl font-black font-brand text-amber-400">5.0%</span>
                <span className="text-slate-400">Standard Platform Fee</span>
              </div>
              <div>
                <span className="block text-xl font-black font-brand text-amber-400">77</span>
                <span className="text-slate-400">Districts Delivery Coverage</span>
              </div>
              <div>
                <span className="block text-xl font-black font-brand text-amber-400">Prompt</span>
                <span className="text-slate-400">Merchant Bank Payouts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Sell On CARTPLUS */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
            MERCHANT ADVANTAGES
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-brand text-slate-900 mt-1.5">
            Everything You Need to Scale in Nepal
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            We handle consumer traffic, reliable logistics, and COD remittance so you can focus on stocking great products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
              SIMPLE 4-STEP ONBOARDING
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-brand text-slate-900 mt-1.5">
              How Selling Works on CARTPLUS
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st, i) => (
              <div
                key={i}
                className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xl font-black font-brand text-amber-500 block mb-3">
                    {st.num}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{st.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Seller Policy & Requirements Guide */}
          <div className="mt-16 pt-12 border-t border-slate-200">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                COMPLIANCE & STANDARDS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-brand text-slate-900 mt-1">
                Seller Policy & Requirements to Join CARTPLUS
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                To guarantee consumer trust and fast delivery across Nepal, all merchant partners must comply with our seller governance policies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  01
                </div>
                <h3 className="text-sm font-bold text-slate-900">Legal Documentation & PAN/VAT</h3>
                <ul className="text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>Valid 9-digit PAN or VAT registration issued by the Inland Revenue Department (IRD).</li>
                  <li>Company registration certificate (OCR) or Ward Trade License.</li>
                  <li>Citizenship Certificate or National ID card of the store owner.</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  02
                </div>
                <h3 className="text-sm font-bold text-slate-900">Bank Account & COD Payouts</h3>
                <ul className="text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>Active commercial or development bank account in Nepal.</li>
                  <li>Bank account holder name must match PAN/business registration.</li>
                  <li>Direct on-demand bank payouts for all delivered Cash on Delivery parcels.</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  03
                </div>
                <h3 className="text-sm font-bold text-slate-900">Product Authenticity & Quality</h3>
                <ul className="text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>100% genuine and original goods only. Counterfeits result in immediate blacklisting.</li>
                  <li>Accurate product specifications, MRP, and real warranty terms.</li>
                  <li>Prohibition of hazardous, expired, or contraband merchandise.</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  04
                </div>
                <h3 className="text-sm font-bold text-slate-900">Fulfillment SLA & Packaging</h3>
                <ul className="text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>Orders must be prepared and packed within 24 hours of notification.</li>
                  <li>Tamper-evident, protective packaging for delicate and fragile items.</li>
                  <li>Handover verification via CARTPLUS Courier airway bill tags.</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  05
                </div>
                <h3 className="text-sm font-bold text-slate-900">7-Day Customer Return Policy</h3>
                <ul className="text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>Accept customer returns for defective, broken, or misdescribed products within 7 days.</li>
                  <li>Prompt replacement or refund credit processed through our merchant desk.</li>
                  <li>Low defect rate maintains &apos;Verified Merchant Partner&apos; status.</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                  06
                </div>
                <h3 className="text-sm font-bold text-slate-900">Transparent 5% Commission</h3>
                <ul className="text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>Predictable 5.0% standard platform commission with zero hidden charges.</li>
                  <li>Transparent billing statement with detailed ledger tracking.</li>
                  <li>Dedicated merchant desk support for seller account onboarding.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Registration CTA */}
          <div className="mt-12 p-8 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div>
              <h3 className="text-xl sm:text-2xl font-black font-brand text-white">
                Ready to start selling your products today?
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                No upfront charges. Quick setup takes under 3 minutes.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/seller/register"
                className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>Register Store Now</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
