import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface SuccessAnimationProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  size = 'md',
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  const dimensions = {
    sm: { box: 'w-12 h-12', svg: 48, stroke: 3 },
    md: { box: 'w-16 h-16', svg: 64, stroke: 4 },
    lg: { box: 'w-24 h-24', svg: 96, stroke: 5 },
  }[size];

  if (shouldReduceMotion) {
    return (
      <div className={`rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 ${dimensions.box} ${className}`}>
        <svg
          className="w-1/2 h-1/2"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      className={`relative rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10 ${dimensions.box} ${className}`}
    >
      <svg
        width={dimensions.svg}
        height={dimensions.svg}
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-2"
      >
        <motion.circle
          cx="26"
          cy="26"
          r="23"
          stroke="currentColor"
          strokeWidth={dimensions.stroke}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
        <motion.path
          d="M14 27L22 35L38 17"
          stroke="currentColor"
          strokeWidth={dimensions.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.25, ease: 'easeOut' }}
        />
      </svg>
    </motion.div>
  );
};
