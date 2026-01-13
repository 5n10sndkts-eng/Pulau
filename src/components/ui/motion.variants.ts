/**
 * Animation variants following Pulau design system
 */

// Quick Add animation (150ms)
export const quickAddVariants = {
  initial: { scale: 1, opacity: 1 },
  tap: { scale: 0.95 },
  fly: {
    scale: 0.5,
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeOut' },
  },
};

// Heart pop animation (200ms)
export const heartPopVariants = {
  initial: { scale: 1 },
  tap: { scale: 0.9 },
  saved: {
    scale: [1, 1.3, 1],
    transition: { duration: 0.2, times: [0, 0.5, 1] },
  },
};

// Page transition (300ms)
export const pageTransitionVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: 'easeInOut' },
};

// Animation spring physics (from PRD)
export const springPhysics = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
};

export const springBouncy = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 15,
  mass: 1,
};

export const springGentle = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 20,
};

// Layout Animations
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: springPhysics },
  exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: springBouncy },
};
