import React, { useState } from 'react';
import { Heart, Star, ShoppingBag, Zap, Check } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useRouter } from '../../context/RouterContext';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const { addToCart, isInCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { navigate } = useRouter();
  const [imgError, setImgError] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const inCart = isInCart(product.id);

  const handleCardClick = () => {
    navigate(`/products/${product.slug}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    navigate('/checkout');
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer overflow-hidden ${className}`}
    >
      {/* Card Image Container */}
      <div className="relative aspect-square sm:aspect-square w-full bg-slate-50 overflow-hidden">
        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 bg-amber-500 text-slate-950 text-[10px] sm:text-[11px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs uppercase tracking-tight">
            {product.discount}% OFF
          </div>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 p-1.5 sm:p-2 rounded-full backdrop-blur-xs transition-colors shadow-xs ${
            inWishlist
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-white/90 text-slate-500 hover:text-rose-500 hover:bg-white border border-slate-200/60'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Product Image with Fallback */}
        {imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-100 text-slate-400">
            <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 mb-1 sm:mb-2 stroke-1" />
            <span className="text-[11px] sm:text-xs text-center font-medium line-clamp-1">{product.name}</span>
          </div>
        ) : (
          <img
            src={product.thumbnail || product.images[0]}
            alt={product.name}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300 ease-out"
          />
        )}

        {/* Stock warning if low */}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 bg-rose-600/90 text-white text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-sm">
            Only {product.stock} left
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category kicker */}
          <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1 line-clamp-1">
            {product.category}
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 sm:gap-1.5 mt-1 sm:mt-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-800 tabular-nums">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-slate-300 text-xs">·</span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 tabular-nums">
              ({product.review_count})
            </span>
          </div>
        </div>

        {/* Price and CTA Block */}
        <div className="mt-2 pt-2 sm:mt-3 sm:pt-3 border-t border-slate-100">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-sm sm:text-lg font-extrabold text-slate-950 tabular-nums">
              Rs. {product.price.toLocaleString('en-NP')}
            </span>
            {product.original_price > product.price && (
              <span className="text-[11px] sm:text-xs text-slate-400 line-through tabular-nums">
                Rs. {product.original_price.toLocaleString('en-NP')}
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-2 sm:mt-3 grid grid-cols-2 gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`py-1.5 sm:py-2 px-1.5 sm:px-2 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-colors ${
                inCart
                  ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {inCart ? (
                <>
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Cart</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="py-1.5 sm:py-2 px-1.5 sm:px-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
            >
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
