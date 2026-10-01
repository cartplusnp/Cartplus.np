import React, { useState } from 'react';
import { Menu, X, ShoppingCart, Heart, User, Sparkles, Headphones, ShieldCheck, ChevronRight, LogOut, Package, Store, Shield, Bell, Tag } from 'lucide-react';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';
import { Link, useRouter } from '../../context/RouterContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useProducts } from '../../context/ProductContext';
import { CATEGORIES } from '../../data/categories';

export const MobileHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { getCartCount } = useCart();
  const { wishlist } = useWishlist();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { activeProducts } = useProducts();
  const { path, navigate } = useRouter();

  const cartCount = getCartCount();
  const wishlistCount = wishlist.length;

  return (
    <div className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Top Mobile Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Left: Hamburger Button */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-2 -ml-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Center: Logo */}
        <Link to="/" className="flex items-center">
          <Logo size="sm" showSlogan={false} />
        </Link>

        {/* Right: Alerts, Wishlist & Cart */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative p-2 text-slate-700 hover:text-slate-950 rounded-lg"
            aria-label="Alerts"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center tabular-nums animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <Link
            to="/wishlist"
            className="relative p-2 text-slate-700 hover:text-slate-950 rounded-lg"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center tabular-nums">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            className="relative p-2 text-slate-700 hover:text-slate-950 rounded-lg"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center tabular-nums">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Notification Modal */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full mx-auto space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <span>Wishlist & Price Alerts</span>
                </h3>
                <p className="text-[11px] text-slate-400">Price drops and restock alerts</p>
              </div>
              <button
                onClick={() => setIsNotifOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No alerts right now.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markAsRead(n.id);
                      if (n.product_slug) {
                        navigate(`/products/${n.product_slug}`);
                        setIsNotifOpen(false);
                      }
                    }}
                    className="py-3 flex gap-3 cursor-pointer"
                  >
                    {n.product_image ? (
                      <img src={n.product_image} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Tag className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                        {n.type === 'price_drop' ? 'Price Drop' : 'Restock'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 truncate">{n.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{n.message}</p>
                      {n.new_price && (
                        <p className="text-xs font-black text-slate-900 mt-1">
                          Rs. {n.new_price.toLocaleString('en-NP')}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Large Mobile Search Bar */}
      <div className="px-4 pb-2.5">
        <SearchBar variant="mobile" />
      </div>

      {/* Horizontal Scrollable Categories */}
      <div className="flex items-center gap-1.5 px-4 pb-2.5 overflow-x-auto no-scrollbar border-t border-slate-100 pt-2 text-xs">
        <Link
          to="/"
          className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium transition-colors ${
            path === '/' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          All
        </Link>
        <Link
          to="/products?filter=deals"
          className="px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium bg-amber-100 text-amber-900 font-semibold"
        >
          ⚡ Deals
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            to={`/category/${cat.slug}`}
            className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium transition-colors ${
              path === `/category/${cat.slug}` ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <Logo variant="light" size="sm" />
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 text-slate-300 hover:text-white"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Account Quick Card */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              {isAuthenticated ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-800">
                      {user?.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-slate-900">Welcome to CARTPLUS</p>
                  <p className="text-xs text-slate-500 mt-0.5">Sign in to enjoy easy ordering & tracking</p>
                  <div className="mt-3 flex gap-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex-1 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg text-center"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex-1 py-2 bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg text-center"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Nav Items */}
            <div className="p-4 space-y-1 divide-y divide-slate-100 flex-1">
              <div className="pb-3 space-y-1">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 text-slate-800 font-medium"
                >
                  <span>Home</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
                <Link
                  to="/products"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 text-slate-800 font-medium"
                >
                  <span>All Products</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
                <Link
                  to="/products?filter=deals"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-amber-50 text-amber-900 font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Flash Deals
                  </span>
                  <ChevronRight className="w-4 h-4 text-amber-500" />
                </Link>
              </div>

              {/* Account Section */}
              <div className="py-3 space-y-1">
                <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Account & Orders</p>
                <Link
                  to="/account"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-50 text-slate-800 text-sm"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Account</span>
                </Link>
                <Link
                  to="/account/orders"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-50 text-slate-800 text-sm"
                >
                  <Package className="w-4 h-4 text-slate-400" />
                  <span>My Orders</span>
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 text-slate-800 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-slate-400" />
                    <span>My Wishlist</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/customer-service"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-50 text-slate-800 text-sm"
                >
                  <Headphones className="w-4 h-4 text-slate-400" />
                  <span>Customer Support</span>
                </Link>
              </div>

              {/* Categories list in mobile menu */}
              <div className="py-3 space-y-1">
                <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Categories</p>
                {CATEGORIES.map((cat) => {
                  const count = activeProducts.filter(
                    (p) =>
                      p.categorySlug?.toLowerCase() === cat.slug.toLowerCase() ||
                      p.category?.toLowerCase() === cat.name.toLowerCase()
                  ).length;
                  return (
                    <Link
                      key={cat.slug}
                      to={`/category/${cat.slug}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 text-slate-700 text-sm"
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-slate-400 tabular-nums">({count})</span>
                    </Link>
                  );
                })}
              </div>

              {/* Sell on CARTPLUS Promo Section */}
              <div className="py-3 px-3">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <Store className="w-4 h-4 text-amber-600" />
                    <span>Sell on CARTPLUS (Low 5% Fee)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Expand your retail store nationwide with integrated courier delivery.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Link
                      to="/seller/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex-1 py-1.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-lg text-center shadow-2xs"
                    >
                      Open Store
                    </Link>
                    <Link
                      to="/seller/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex-1 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-lg text-center"
                    >
                      Seller Hub
                    </Link>
                  </div>
                </div>
              </div>

              {/* Admin Portal link if logged in as staff */}
              {isAdmin && (
                <div className="py-2 px-3">
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 py-2 px-3 rounded-lg bg-slate-900 text-amber-400 font-bold text-xs"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Operations Staff Console</span>
                  </Link>
                </div>
              )}

              {/* Discrete Staff Link */}
              {!isAdmin && (
                <div className="py-2 px-3 text-center">
                  <Link
                    to="/admin/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 inline-flex items-center gap-1"
                  >
                    <Shield className="w-3 h-3" />
                    <span>Staff Portal</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Logout button if authenticated */}
            {isAuthenticated && (
              <div className="p-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
