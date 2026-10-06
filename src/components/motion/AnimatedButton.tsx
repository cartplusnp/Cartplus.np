import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'amber' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  loading?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  loading = false,
  onClick,
  type = 'button',
  ...rest
}) => {
  const shouldReduceMotion = useReducedMotion();

  const variantStyles = {
    primary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs',
    amber: 'bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold shadow-xs shadow-amber-500/20',
    secondary: 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2 text-xs sm:text-sm rounded-xl',
    lg: 'px-6 py-3 text-sm sm:text-base rounded-xl font-bold',
  };

  const motionProps = shouldReduceMotion
    ? {}
    : {
        whileHover: disabled || loading ? {} : { y: -1 },
        whileTap: disabled || loading ? {} : { scale: 0.97 },
        transition: { type: 'spring', stiffness: 450, damping: 25 },
      };

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...motionProps}
      {...(rest as any)}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="animate-spin h-3.5 w-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};
