import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showSlogan?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  size = 'md',
  showSlogan = true,
  className = '',
}) => {
  const isLight = variant === 'light'; // on dark backgrounds

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const sloganSizes = {
    sm: 'text-[9px] tracking-widest',
    md: 'text-[10px] tracking-wider',
    lg: 'text-xs tracking-wider',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon: Modern geometric Cart with embedded energetic Plus sign */}
      <div className={`relative flex items-center justify-center ${iconSizes[size]} rounded-lg ${
        isLight ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-white'
      } shadow-xs transition-transform duration-200 group-hover:scale-105 shrink-0`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5/6 h-5/6 p-0.5"
        >
          {/* Cart Basket Contour */}
          <path
            d="M4 6H7L9.5 19H25L27.5 9H8.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Wheels */}
          <circle cx="11.5" cy="24.5" r="2.2" fill={isLight ? '#0f172a' : '#f59e0b'} />
          <circle cx="23.5" cy="24.5" r="2.2" fill={isLight ? '#0f172a' : '#f59e0b'} />
          {/* Plus Mark in Cart Center */}
          <path
            d="M17 11.5V16.5M14.5 14H19.5"
            stroke={isLight ? '#0f172a' : '#f59e0b'}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-none">
        <div className={`font-extrabold tracking-tight ${textSizes[size]} ${
          isLight ? 'text-white' : 'text-slate-900'
        } font-brand flex items-center`}>
          <span>CART</span>
          <span className="text-amber-500">PLUS</span>
        </div>
        {showSlogan && (
          <span className={`font-semibold uppercase text-slate-500 ${sloganSizes[size]} mt-0.5 ${
            isLight ? 'text-slate-300' : 'text-slate-500'
          }`}>
            MORE CHOICES. MORE VALUE.
          </span>
        )}
      </div>
    </div>
  );
};
