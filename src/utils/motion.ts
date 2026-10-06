import { Transition } from 'motion/react';

// Standardized UX timing constants
export const MOTION_TIMINGS = {
  micro: 0.15, // 150ms for buttons, hover, taps
  tactile: 0.2, // 200ms for cards, toggles
  modal: 0.25, // 250ms for dialogs, drawers
  page: 0.35, // 350ms for page transitions
  hero: 0.6, // 600ms for hero reveals
} as const;

// Spring curves with natural physics and zero overshoot slop
export const SPRING_PRESETS = {
  snappy: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
    mass: 0.8,
  } as Transition,
  gentle: {
    type: 'spring',
    stiffness: 260,
    damping: 24,
    mass: 1,
  } as Transition,
  bouncy: {
    type: 'spring',
    stiffness: 340,
    damping: 18,
    mass: 0.9,
  } as Transition,
  smoothEase: {
    duration: 0.25,
    ease: [0.16, 1, 0.3, 1] as const,
  } as Transition,
};

// Fade & slide variants for scroll reveal and entrance
export const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export const FADE_IN_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
};

export const STAGGER_CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const SCALE_SPRING_VARIANTS = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};
