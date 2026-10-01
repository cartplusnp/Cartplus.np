import React, { useState } from 'react';
import { ShoppingBag, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const activeImage = images[selectedIndex] || images[0];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="flex flex-col gap-2.5 sm:gap-4">
      {/* Main Image Container */}
      <div className="relative aspect-4/3 sm:aspect-4/3 lg:aspect-square w-full bg-white rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden group shadow-2xs">
        <img
          src={activeImage}
          alt={`${productName} view ${selectedIndex + 1}`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain p-2 sm:p-4 cursor-zoom-in group-hover:scale-103 transition-transform duration-300"
          onClick={() => setIsZoomed(true)}
        />

        {/* Zoom trigger icon */}
        <button
          onClick={() => setIsZoomed(true)}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-white/90 hover:bg-white text-slate-700 rounded-lg shadow-xs opacity-80 hover:opacity-100 transition-opacity"
          aria-label="View enlarged image"
        >
          <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Carousel controls if multi-image */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-2 no-scrollbar">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-12 h-12 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl bg-white border-2 overflow-hidden shrink-0 transition-all ${
                selectedIndex === idx
                  ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl p-4 overflow-hidden">
            <img
              src={activeImage}
              alt={productName}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[80vh] object-contain mx-auto"
            />
            <p className="text-center text-xs text-slate-500 mt-2">
              Click anywhere to close preview
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
