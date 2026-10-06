import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-3 flex flex-col justify-between shadow-2xs overflow-hidden">
      <div className="w-full aspect-square animate-shimmer rounded-lg" />
      <div className="mt-3 space-y-2">
        <div className="w-1/3 h-3 animate-shimmer rounded" />
        <div className="w-4/5 h-4 animate-shimmer rounded" />
        <div className="w-1/2 h-3 animate-shimmer rounded" />
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="w-20 h-5 animate-shimmer rounded" />
        <div className="w-16 h-8 animate-shimmer rounded-lg" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const DetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="aspect-square animate-shimmer rounded-2xl border border-slate-200/80" />
      <div className="space-y-4">
        <div className="w-1/4 h-4 animate-shimmer rounded" />
        <div className="w-3/4 h-8 animate-shimmer rounded" />
        <div className="w-1/3 h-5 animate-shimmer rounded" />
        <div className="w-1/2 h-8 animate-shimmer rounded" />
        <div className="w-full h-28 animate-shimmer rounded-xl" />
        <div className="grid grid-cols-2 gap-3 pt-4">
          <div className="h-12 animate-shimmer rounded-xl" />
          <div className="h-12 animate-shimmer rounded-xl" />
        </div>
      </div>
    </div>
  );
};
