import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Heart, User, Sparkles, ChevronDown, Package, ShieldCheck, Headphones, LogOut, ExternalLink, Store, Bell, Tag, RefreshCw, Check } from 'lucide-react';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';
import { Link, useRouter } from '../../context/RouterContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { CATEGORIES } from '../../data/categories';

export const Header: React.FC = () => {
  const { getCartCount, getCartTotal } = useCart();
  const { wishlist } = useWishlist();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { path, navigate } = useRouter();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const cartCount = getCartCount();
  const wishlistCount = wishlist.length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setNotifMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'All Products', href: '/products' },
    ...CATEGORIES.map((cat) => ({ name: cat.name, href: `/category/${cat.slug}` })),
    { name: 'Deals', href: '/products?filter=deals', isSpecial: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Promotion Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              Special Deals
            </span>
            <span className="hidden sm:inline text-slate-400" aria-hidden="true">·</span>
            <span className="hidden sm:inline text-slate-300">
              Everyday Low Prices • Nationwide Express Cash on Delivery Across Nepal
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <Link
              to="/seller"
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Sell on CARTPLUS</span>
              <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1 rounded uppercase">
                5% Fee
              </span>
            </Link>

            <span className="text-slate-700 hidden sm:inline" aria-hidden="true">|</span>

            <Link to="/customer-service" className="hover:text-amber-400 transition-colors flex items-center gap-1">
              <Headphones className="w-3 h-3" />
              <span>Customer Service</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 lg:gap-8">
        {/* Left: CARTPLUS Logo */}
        <Link to="/" className="shrink-0 flex items-center">
          <Logo size="md" />
        </Link>

        {/* Center: Large Search Bar */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-auto">
          <SearchBar variant="header" />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="relative flex items-center gap-1.5 p-2 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors"
            title="Wishlist"
          >
            <div className="relative">
              <Heart className="w-5 h-5 text-slate-700" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center tabular-nums">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="hidden lg:inline text-xs font-semibold text-slate-700">Wishlist</span>
          </Link>

          {/* Notifications (Wishlist Price Drops & Restock Alerts) */}
          <div ref={notifMenuRef} className="relative">
            <button
              onClick={() => setNotifMenuOpen(!notifMenuOpen)}
              className="relative flex items-center gap-1.5 p-2 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifications & Wishlist Alerts"
              aria-label="Notifications"
            >
              <div className="relative">
                <Bell className="w-5 h-5 text-slate-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center tabular-nums animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline text-xs font-semibold text-slate-700">Alerts</span>
            </button>

            {notifMenuOpen && (
              <div className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 text-slate-900 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-amber-500" />
                      <span>Wishlist & Price Alerts</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Real-time alerts for saved items</p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 px-2 py-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center px-4">
                      <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">No new alerts yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Add products to your wishlist to get notified on price drops and restocks!
                      </p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.product_slug) {
                            navigate(`/products/${n.product_slug}`);
                            setNotifMenuOpen(false);
                          }
                        }}
                        className={`p-3 rounded-xl transition-colors cursor-pointer flex gap-3 ${
                          n.read ? 'hover:bg-slate-50' : 'bg-amber-50/50 hover:bg-amber-50'
                        }`}
                      >
                        {n.product_image ? (
                          <img
                            src={n.product_image}
                            alt=""
                            className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                            <Tag className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              n.type === 'price_drop'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {n.type === 'price_drop' ? 'Price Drop' : 'Back in Stock'}
                            </span>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                            {n.title}
                          </h4>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-tight">
                            {n.message}
                          </p>
                          {n.new_price && (
                            <div className="mt-1 flex items-center gap-2 text-xs">
                              <span className="font-extrabold text-slate-950 tabular-nums">
                                Rs. {n.new_price.toLocaleString('en-NP')}
                              </span>
                              {n.previous_price && (
                                <span className="text-[10px] text-slate-400 line-through tabular-nums">
                                  Rs. {n.previous_price.toLocaleString('en-NP')}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex items-center gap-2 p-2 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors group"
            title="Cart"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-slate-700 group-hover:text-amber-600 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center tabular-nums shadow-xs">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden lg:flex flex-col text-left leading-none">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Cart</span>
              <span className="text-xs font-bold text-slate-900 tabular-nums mt-0.5">
                Rs. {getCartTotal().toLocaleString('en-NP')}
              </span>
            </div>
          </Link>

          {/* Account Dropdown */}
          <div ref={accountMenuRef} className="relative">
            <button
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
              aria-label="Account menu"
            >
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="text-[10px] text-slate-400 font-medium">
                  {isAuthenticated ? 'Welcome' : 'Sign in'}
                </span>
                <span className="text-xs font-semibold text-slate-900 truncate max-w-[90px]">
                  {isAuthenticated ? user?.name.split(' ')[0] : 'Account'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {accountMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 divide-y divide-slate-100 text-sm">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 bg-slate-50">
                      <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isAdmin ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {isAdmin ? 'Administrator' : 'Customer Account'}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/account"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-950"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>My Account & Profile</span>
                      </Link>
                      <Link
                        to="/account/orders"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-950"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        to="/customer-service"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-950"
                      >
                        <Headphones className="w-4 h-4 text-slate-400" />
                        <span>Support Requests</span>
                      </Link>
                    </div>

                    {isAdmin && (
                      <div className="py-1 bg-amber-50/50">
                        <Link
                          to="/admin"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center justify-between px-4 py-2 hover:bg-amber-100/50 text-amber-900 font-semibold"
                        >
                          <div className="flex items-center gap-2.5">
                            <ShieldCheck className="w-4 h-4 text-amber-600" />
                            <span>Admin Dashboard</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                        </Link>
                      </div>
                    )}

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setAccountMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-rose-50 text-rose-600 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-600">
                      Sign in to track orders, save multiple addresses, and view your personalized wishlist.
                    </p>
                    <button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        navigate('/login');
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg text-center transition-colors"
                    >
                      Sign In
                    </button>
                    <div className="text-center">
                      <Link
                        to="/register"
                        onClick={() => setAccountMenuOpen(false)}
                        className="text-xs font-medium text-amber-600 hover:underline"
                      >
                        New customer? Register here
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <nav className="bg-slate-100/80 border-t border-slate-200/80 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center space-x-1 overflow-x-auto py-1.5 no-scrollbar text-xs font-medium text-slate-700">
            {navLinks.map((link) => {
              const isActive = path === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : link.isSpecial
                      ? 'text-amber-600 hover:bg-amber-100/60 font-semibold'
                      : 'hover:text-slate-950 hover:bg-white/80'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
};
