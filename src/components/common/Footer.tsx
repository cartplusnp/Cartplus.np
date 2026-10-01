import React from 'react';
import { Logo } from './Logo';
import { Link } from '../../context/RouterContext';
import {
  ShieldCheck,
  Truck,
  Clock,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Store,
  Headphones,
  ArrowRight,
  Shield,
  HelpCircle,
  Package,
} from 'lucide-react';
import { CATEGORIES } from '../../data/categories';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* 1. Value Badges Row */}
      <div className="border-b border-slate-800 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Cash on Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">Inspect & pay safely upon receipt</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Verified Products</h4>
              <p className="text-xs text-slate-400 mt-0.5">Quality inspected merchandise</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">7-Day Easy Return</h4>
              <p className="text-xs text-slate-400 mt-0.5">Hassle-free replacement policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Dedicated Support</h4>
              <p className="text-xs text-slate-400 mt-0.5">Fast assistance for all queries</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Highlight Cards: Customer Support & Sell on CARTPLUS */}
      <div className="border-b border-slate-800 py-8 px-4 sm:px-6 bg-slate-950/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A: Sell on CARTPLUS */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-amber-500/30 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-400/10 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Store className="w-4 h-4" />
                  <span>Sell on CARTPLUS</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
                  Low 5% Fee
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black font-brand text-white">
                Expand Your Retail Store Across Nepal
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Connect directly with online shoppers nationwide. Benefit from coordinated courier delivery across all 7 provinces, on-demand merchant bank settlements, and a competitive 5% platform fee.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-700/60 flex flex-wrap items-center gap-3">
              <Link
                to="/seller/register"
                className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>Register Store</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/seller/login"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs border border-slate-700 transition-colors"
              >
                <span>Seller Hub Login</span>
              </Link>
              <Link
                to="/seller"
                className="text-xs text-slate-400 hover:text-amber-400 underline font-medium ml-auto"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Card B: Customer Support */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-700/60 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Headphones className="w-4 h-4" />
                  <span>Customer Support Desk</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  Kathmandu Office
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black font-brand text-white">
                We're Here to Help You Every Step
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Have questions regarding your order, delivery timeline, or return request? Our dedicated Nepal support team is available via live ticket messaging and phone.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-700/60 flex flex-wrap items-center gap-3">
              <Link
                to="/customer-service"
                className="px-4 py-2 bg-slate-100 hover:bg-white text-slate-900 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Help Center</span>
              </Link>
              <Link
                to="/customer-service/requests"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs border border-slate-700 transition-colors"
              >
                <span>Track Support Ticket</span>
              </Link>
              <Link
                to="/account/orders"
                className="text-xs text-slate-400 hover:text-amber-400 underline font-medium ml-auto"
              >
                Track Order
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Footer Links Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand & Address Column */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="light" size="lg" />
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              CARTPLUS is Nepal&apos;s modern ecommerce marketplace connecting shoppers with quality products across electronics, fashion, home essentials, and lifestyle goods at genuine value.
            </p>

            <div className="pt-2 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Kathmandu, Nepal (Serving all 7 Provinces)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>cartplus.np@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Sell on CARTPLUS Column */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-1.5">
              <Store className="w-4 h-4" />
              <span>Sell on CARTPLUS</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/seller" className="text-white hover:text-amber-400 font-semibold transition-colors">
                  Why Sell on CARTPLUS
                </Link>
              </li>
              <li>
                <Link to="/seller/register" className="hover:text-amber-400 transition-colors">
                  Open Store (Register)
                </Link>
              </li>
              <li>
                <Link to="/seller/login" className="hover:text-amber-400 transition-colors">
                  Seller Hub Login
                </Link>
              </li>
              <li>
                <Link to="/seller/dashboard" className="hover:text-amber-400 transition-colors">
                  Seller Dashboard & Upload
                </Link>
              </li>
              <li>
                <Link to="/seller" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Courier Pickup Coverage
                </Link>
              </li>
              <li>
                <Link to="/seller" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Bank Payout Settlement
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support Column */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-1.5">
              <Headphones className="w-4 h-4" />
              <span>Customer Support</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/customer-service" className="text-white hover:text-amber-400 font-semibold transition-colors">
                  Help Center & FAQs
                </Link>
              </li>
              <li>
                <Link to="/customer-service/requests" className="hover:text-amber-400 transition-colors">
                  Track Support Requests
                </Link>
              </li>
              <li>
                <Link to="/account/orders" className="hover:text-amber-400 transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/customer-service" className="hover:text-amber-400 transition-colors">
                  Cash on Delivery Info
                </Link>
              </li>
              <li>
                <Link to="/customer-service" className="hover:text-amber-400 transition-colors">
                  Returns & Refunds Policy
                </Link>
              </li>
              <li>
                <Link to="/customer-service" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Shipping & Courier Timelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Explore & Account Column */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">
              Explore Catalog
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/products" className="hover:text-amber-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?filter=deals" className="text-amber-400 hover:underline font-medium">
                  ⚡ Flash Deals
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-amber-400 transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/account/orders" className="hover:text-amber-400 transition-colors">
                  Order History
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-amber-400 transition-colors">
                  My Wishlist
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 4. Bottom Copyright Bar */}
      <div className="border-t border-slate-800 py-6 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} CARTPLUS Nepal. All rights reserved. MORE CHOICES. MORE VALUE.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Flat Courier Delivery</span>
            <span aria-hidden="true">·</span>
            <span>Nepal Nationwide COD</span>
            <span aria-hidden="true">·</span>
            <Link to="/admin/login" className="text-slate-600 hover:text-slate-400 flex items-center gap-1 transition-colors">
              <Shield className="w-3 h-3" />
              <span>Staff Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
