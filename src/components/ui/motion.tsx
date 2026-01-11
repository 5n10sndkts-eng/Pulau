/* eslint-disable react-refresh/only-export-components */
/**
 * Reusable Framer Motion Components
 * Pre-configured animation variants following Pulau design system
 */

import { motion, type HTMLMotionProps, MotionConfig } from 'framer-motion'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { springPhysics } from './motion.variants'

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

// Viewport-aware container for scroll animations
export function MotionViewport({ children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-50px" }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export { motion, type HTMLMotionProps }
