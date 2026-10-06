import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { AnimatedModal } from '../motion/AnimatedModal';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const safeImages = images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'];
  const activeImage = safeImages[selectedIndex] || safeImages[0];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : safeImages.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < safeImages.length - 1 ? prev + 1 : 0));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4 select-none">
      {/* Main Image Container */}
      <div
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setIsZoomed(true)}
        className="relative aspect-square w-full bg-white rounded-2xl border border-slate-200 overflow-hidden group shadow-2xs cursor-zoom-in"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedIndex}
            src={activeImage}
            alt={`${productName} view ${selectedIndex + 1}`}
            referrerPolicy="no-referrer"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0.4 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0.4 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={
              isHovering && !shouldReduceMotion
                ? {
                    transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                    transform: 'scale(1.4)',
                  }
                : {
                    transform: 'scale(1)',
                  }
            }
            className="w-full h-full object-contain p-4 transition-transform duration-150 ease-out"
          />
        </AnimatePresence>

        {/* Zoom trigger icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed(true);
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-slate-700 rounded-xl shadow-xs opacity-80 hover:opacity-100 transition-all cursor-pointer"
          aria-label="View enlarged image"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Carousel controls if multi-image */}
        {safeImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {safeImages.length > 1 && (
        <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-1 no-scrollbar">
          {safeImages.map((img, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-white border-2 overflow-hidden shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-500 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeThumbOutline"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute inset-0 border-2 border-amber-500 rounded-xl pointer-events-none z-10"
                  />
                )}
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-1.5"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Zoom Modal */}
      <AnimatedModal
        isOpen={isZoomed}
        onClose={() => setIsZoomed(false)}
        maxWidth="3xl"
        title={productName}
      >
        <div className="flex flex-col items-center justify-center p-2">
          <img
            src={activeImage}
            alt={productName}
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[75vh] object-contain mx-auto"
          />
          <div className="mt-4 flex items-center justify-center gap-2">
            {safeImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  selectedIndex === i ? 'bg-amber-500 w-6' : 'bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </AnimatedModal>
    </div>
  );
};
