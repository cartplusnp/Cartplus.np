import React from 'react';
import { Home, Grid, ShoppingCart, User, Store } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Link, useRouter } from '../../context/RouterContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useSeller } from '../../context/SellerContext';

export const MobileBottomNav: React.FC = () => {
  const { path } = useRouter();
  const { getCartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const { isAuthenticatedSeller } = useSeller();
  const shouldReduceMotion = useReducedMotion();

  const cartCount = getCartCount();

  const isActive = (targetPath: string) => {
    if (targetPath === '/' && path === '/') return true;
    if (targetPath !== '/' && path.startsWith(targetPath)) return true;
    return false;
  };

  const navItems = [
    {
      to: '/',
      label: 'Home',
      icon: Home,
      active: isActive('/') && !path.startsWith('/products') && !path.startsWith('/seller') && !path.startsWith('/cart') && !path.startsWith('/account'),
    },
    {
      to: '/products',
      label: 'Browse',
      icon: Grid,
      active: path.startsWith('/products') || path.startsWith('/category'),
    },
    {
      to: isAuthenticatedSeller ? '/seller/dashboard' : '/seller',
      label: 'Sell',
      icon: Store,
      badge: '5%',
      active: path.startsWith('/seller'),
    },
    {
      to: '/cart',
      label: 'Cart',
      icon: ShoppingCart,
      isCart: true,
      active: path.startsWith('/cart') || path.startsWith('/checkout'),
    },
    {
      to: isAuthenticated ? '/account' : '/login',
      label: 'Account',
      icon: User,
      active: path.startsWith('/account') || path.startsWith('/login') || path.startsWith('/register'),
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg safe-bottom"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-5 h-15 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`relative flex flex-col items-center justify-center h-full py-1 transition-colors select-none ${
                item.active ? 'text-slate-950 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {item.active && (
                <motion.div
                  layoutId="mobileNavActiveIndicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute top-0 w-8 h-1 bg-amber-500 rounded-b-full"
                />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 mb-0.5 ${item.active ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />

                {item.isCart && cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={shouldReduceMotion ? {} : { scale: 0.5 }}
                    animate={{ scale: [1.3, 1] }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="absolute -top-1.5 -right-2.5 bg-slate-900 text-amber-400 text-[10px] font-black rounded-full min-w-4 h-4 px-1 flex items-center justify-center tabular-nums shadow-xs"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}

                {item.badge && (
                  <span className="absolute -top-1.5 -right-3 px-1 py-0.2 bg-amber-400 text-slate-950 font-black text-[8px] rounded-full uppercase tracking-tighter">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
