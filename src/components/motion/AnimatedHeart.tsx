import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Heart } from 'lucide-react';

interface AnimatedHeartProps {
  isFilled: boolean;
  onClick: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
}

export const AnimatedHeart: React.FC<AnimatedHeartProps> = ({
  isFilled,
  onClick,
  size = 'md',
  className = '',
  ariaLabel,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  const buttonPadding = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  }[size];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel || (isFilled ? 'Remove from wishlist' : 'Save to wishlist')}
      whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.85 }}
      className={`relative rounded-full backdrop-blur-xs transition-colors cursor-pointer select-none ${buttonPadding} ${
        isFilled
          ? 'bg-rose-50 text-rose-600 border border-rose-200'
          : 'bg-white/90 text-slate-500 hover:text-rose-500 hover:bg-white border border-slate-200/70 shadow-xs'
      } ${className}`}
    >
      <motion.div
        key={isFilled ? 'filled' : 'outline'}
        initial={shouldReduceMotion ? {} : { scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      >
        <Heart className={`${sizeClasses} ${isFilled ? 'fill-current' : ''}`} />
      </motion.div>

      {/* Subtle particle sparkle burst on fill */}
      {isFilled && !shouldReduceMotion && (
        <motion.span
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full border-2 border-rose-400 pointer-events-none"
        />
      )}
    </motion.button>
  );
};
