import React, { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverLift?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  onClick,
  hoverLift = true,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      onClick={onClick}
      className={`transition-shadow ${className}`}
      whileHover={
        !shouldReduceMotion && hoverLift
          ? { y: -3, transition: { duration: 0.18, ease: 'easeOut' as const } }
          : undefined
      }
      whileTap={
        !shouldReduceMotion && onClick ? { scale: 0.99 } : undefined
      }
    >
      {children}
    </motion.div>
  );
};
