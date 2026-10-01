import React from 'react';
import { Home, Grid, ShoppingBag, ShoppingCart, User, Store } from 'lucide-react';
import { Link, useRouter } from '../../context/RouterContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useSeller } from '../../context/SellerContext';

export const MobileBottomNav: React.FC = () => {
  const { path } = useRouter();
  const { getCartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const { isAuthenticatedSeller } = useSeller();

  const cartCount = getCartCount();

  const isActive = (targetPath: string) => {
    if (targetPath === '/' && path === '/') return true;
    if (targetPath !== '/' && path.startsWith(targetPath)) return true;
    return false;
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg safe-bottom"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-5 h-15 items-center px-1">
        {/* 1. Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center h-full py-1 transition-colors ${
            isActive('/') && !path.startsWith('/products') && !path.startsWith('/seller') && !path.startsWith('/cart') && !path.startsWith('/account')
              ? 'text-slate-950 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </Link>

        {/* 2. Catalog / Categories */}
        <Link
          to="/products"
          className={`flex flex-col items-center justify-center h-full py-1 transition-colors ${
            path.startsWith('/products') || path.startsWith('/category')
              ? 'text-slate-950 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Grid className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Browse</span>
        </Link>

        {/* 3. Sell on CARTPLUS */}
        <Link
          to={isAuthenticatedSeller ? '/seller/dashboard' : '/seller'}
          className={`flex flex-col items-center justify-center h-full py-1 transition-colors relative ${
            path.startsWith('/seller')
              ? 'text-amber-600 font-bold'
              : 'text-slate-600 hover:text-amber-600'
          }`}
        >
          <div className="relative">
            <Store className="w-5 h-5 mb-0.5" />
            <span className="absolute -top-1.5 -right-3 px-1 py-0.2 bg-amber-400 text-slate-950 font-black text-[8px] rounded-full uppercase tracking-tighter">
              5%
            </span>
          </div>
          <span className="text-[10px] tracking-tight">Sell</span>
        </Link>

        {/* 4. Cart with badge */}
        <Link
          to="/cart"
          className={`flex flex-col items-center justify-center h-full py-1 transition-colors relative ${
            path.startsWith('/cart') || path.startsWith('/checkout')
              ? 'text-slate-950 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 mb-0.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-slate-900 text-amber-400 text-[10px] font-black rounded-full min-w-4 h-4 px-1 flex items-center justify-center tabular-nums shadow-xs">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Cart</span>
        </Link>

        {/* 5. Account */}
        <Link
          to={isAuthenticated ? '/account' : '/login'}
          className={`flex flex-col items-center justify-center h-full py-1 transition-colors ${
            path.startsWith('/account') || path.startsWith('/login')
              ? 'text-slate-950 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Account</span>
        </Link>
      </div>
    </nav>
  );
};
