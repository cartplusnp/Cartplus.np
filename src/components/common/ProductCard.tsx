import React, { useState } from 'react';
import { Star, ShoppingBag, Zap, Check } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useRouter } from '../../context/RouterContext';
import { useToast } from '../../context/ToastContext';
import { AnimatedHeart } from '../motion/AnimatedHeart';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const { addToCart, isInCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { navigate } = useRouter();
  const { cart: toastCart, wishlist: toastWishlist } = useToast();
  const shouldReduceMotion = useReducedMotion();

  const [imgError, setImgError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const inCart = isInCart(product.id);

  const handleCardClick = () => {
    navigate(`/products/${product.slug}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product, 1);
    setJustAdded(true);
    toastCart(`Added "${product.name}" to your shopping bag.`);

    setTimeout(() => {
      setIsAdding(false);
    }, 400);

    setTimeout(() => {
      setJustAdded(false);
    }, 2200);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    navigate('/checkout');
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
    if (!inWishlist) {
      toastWishlist(`Saved "${product.name}" to your wishlist.`);
    }
  };

  const cardMotionProps = shouldReduceMotion
    ? {}
    : {
        whileHover: { y: -3, transition: { duration: 0.18, ease: 'easeOut' as const } },
        whileTap: { scale: 0.99 },
      };

  const imageMotionProps = shouldReduceMotion
    ? {}
    : {
        whileHover: { scale: 1.03, transition: { duration: 0.35, ease: 'easeOut' as const } },
      };

  return (
    <motion.div
      onClick={handleCardClick}
      className={`group relative bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between cursor-pointer overflow-hidden ${className}`}
      {...cardMotionProps}
    >
      {/* Card Image Container */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-2.5 left-2.5 z-10 bg-amber-400 text-slate-950 text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-md shadow-xs uppercase tracking-tight">
            {product.discount}% OFF
          </div>
        )}

        {/* Wishlist Button with Heart Burst */}
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10">
          <AnimatedHeart
            isFilled={inWishlist}
            onClick={handleWishlistToggle}
            size="sm"
            ariaLabel={inWishlist ? 'Remove from saved items' : 'Save to wishlist'}
          />
        </div>

        {/* Product Image with Fallback */}
        {imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-100 text-slate-400">
            <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 mb-1 sm:mb-2 stroke-1" />
            <span className="text-[11px] sm:text-xs text-center font-medium line-clamp-1">{product.name}</span>
          </div>
        ) : (
          <motion.img
            src={product.thumbnail || product.images[0]}
            alt={product.name}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-300"
            {...imageMotionProps}
          />
        )}

        {/* Stock urgency note if low */}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute bottom-2 left-2 bg-rose-600/90 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
            Only {product.stock} left in stock
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category kicker */}
          <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1 line-clamp-1">
            {product.category}
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-800 tabular-nums">
              {product.rating > 0 ? product.rating.toFixed(1) : '5.0'}
            </span>
            <span className="text-slate-300 text-xs">·</span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 tabular-nums">
              ({product.review_count})
            </span>
          </div>
        </div>

        {/* Price and Tactile CTA Block */}
        <div className="mt-2.5 pt-2.5 sm:mt-3 sm:pt-3 border-t border-slate-100">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-sm sm:text-lg font-black text-slate-950 tabular-nums font-brand">
              Rs. {product.price.toLocaleString('en-NP')}
            </span>
            {product.original_price > product.price && (
              <span className="text-[11px] sm:text-xs text-slate-400 line-through tabular-nums">
                Rs. {product.original_price.toLocaleString('en-NP')}
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-2.5 sm:mt-3 grid grid-cols-2 gap-1.5 sm:gap-2">
            <motion.button
              type="button"
              onClick={handleAddToCart}
              whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
              className={`py-1.5 sm:py-2 px-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none ${
                justAdded || inCart
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>Added!</span>
                </>
              ) : inCart ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" />
                  <span>In Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Bag</span>
                </>
              )}
            </motion.button>

            <motion.button
              type="button"
              onClick={handleBuyNow}
              whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
              className="py-1.5 sm:py-2 px-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-colors shadow-2xs cursor-pointer select-none"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Buy Now</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
