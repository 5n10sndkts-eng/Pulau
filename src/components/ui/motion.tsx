/**
 * Reusable Framer Motion Components
 * Pre-configured animation variants following Pulau design system
 */

import { motion, type HTMLMotionProps, MotionConfig } from 'framer-motion'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

// Animation spring physics (from PRD)
const springPhysics = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 17,
}

// Quick Add animation (150ms)
export const quickAddVariants = {
  initial: { scale: 1, opacity: 1 },
  tap: { scale: 0.95 },
  fly: {
    scale: 0.5,
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeOut' },
  },
}

// Heart pop animation (200ms)
export const heartPopVariants = {
  initial: { scale: 1 },
  tap: { scale: 0.9 },
  saved: {
    scale: [1, 1.3, 1],
    transition: { duration: 0.2, times: [0, 0.5, 1] },
  },
}

// Page transition (300ms)
export const pageTransitionVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: 'easeInOut' },
}

// Motion button with scale effect
interface MotionButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode
}

export function MotionButton({ children, ...props }: MotionButtonProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <button {...(props as React.ComponentProps<'button'>)}>{children}</button>
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={springPhysics}
      {...props}
    >
      {children}
    </motion.button>
  )
}

// Motion wrapper with reduced motion support
interface MotionWrapperProps {
  children: React.ReactNode
}

export function MotionWrapper({ children }: MotionWrapperProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? 'always' : 'never'}>
      {children}
    </MotionConfig>
  )
}

export { motion, type HTMLMotionProps }
