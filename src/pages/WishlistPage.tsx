import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useRouter, Link } from '../context/RouterContext';
import { EmptyState } from '../components/common/EmptyState';
import { Heart, ShoppingBag, Trash2, ArrowRight, Zap } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { navigate } = useRouter();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<Heart className="w-10 h-10 stroke-1 text-slate-400" />}
          title="Your Wishlist is Empty"
          description="Explore our product catalog and tap the heart icon to save products you want to buy later."
          actionText="Explore Products"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-brand">
            My Wishlist ({wishlist.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Items you have saved to keep track of discounts and availability.
          </p>
        </div>

        <button
          onClick={clearWishlist}
          className="text-xs text-slate-400 hover:text-rose-600 transition-colors font-semibold"
        >
          Clear Wishlist
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {wishlist.map((product) => (
          <div
            key={product.id}
            className="group relative bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
          >
            {/* Image Box */}
            <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-white/90 hover:bg-rose-50 text-slate-400 hover:text-rose-600 shadow-2xs transition-colors"
                title="Remove from wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {product.discount > 0 && (
                <div className="absolute top-2.5 left-2.5 z-10 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                  {product.discount}% OFF
                </div>
              )}

              <img
                src={product.thumbnail || product.images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                onClick={() => navigate(`/products/${product.slug}`)}
                className="w-full h-full object-cover cursor-pointer group-hover:scale-103 transition-transform duration-300"
              />
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1 justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {product.category}
                </span>
                <h3
                  onClick={() => navigate(`/products/${product.slug}`)}
                  className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 mt-1 cursor-pointer"
                >
                  {product.name}
                </h3>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-black text-slate-950 tabular-nums">
                    Rs. {product.price.toLocaleString('en-NP')}
                  </span>
                  {product.original_price > product.price && (
                    <span className="text-xs text-slate-400 line-through tabular-nums">
                      Rs. {product.original_price.toLocaleString('en-NP')}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => addToCart(product, 1)}
                    className="py-2 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Cart</span>
                  </button>

                  <button
                    onClick={() => {
                      addToCart(product, 1);
                      navigate('/checkout');
                    }}
                    className="py-2 px-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Buy</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
