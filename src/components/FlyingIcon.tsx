/**
 * FlyingIcon Component
 * Story: 33.3 - Quick Add Interaction Loop
 *
 * Provides a "fly-to-cart" animation when items are added to trip.
 * Uses a portal to render above all other content.
 */

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'

interface FlyingIconProps {
  /** Starting position (from the clicked button) */
  startX: number
  startY: number
  /** Callback when animation completes */
  onComplete: () => void
}

export function FlyingIcon({ startX, startY, onComplete }: FlyingIconProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Target position: center-bottom of viewport (where StickyTripBar is)
  const targetX = window.innerWidth / 2
  const targetY = window.innerHeight - 60 // Above the safe area

  if (!mounted) return null

  return createPortal(
    <motion.div
      initial={{
        x: startX,
        y: startY,
        scale: 1,
        opacity: 1,
      }}
      animate={{
        x: targetX,
        y: targetY,
        scale: 0.5,
        opacity: 0.8,
      }}
      exit={{
        scale: 0,
        opacity: 0,
      }}
      transition={{
        duration: 0.5,
        ease: [0.32, 0.72, 0, 1], // Custom ease for natural arc
      }}
      onAnimationComplete={onComplete}
      className="fixed z-[100] pointer-events-none"
      style={{ transform: 'translate(-50%, -50%)' }}
    >
      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
        <ShoppingBag className="w-5 h-5" />
      </div>
    </motion.div>,
    document.body
  )
}

/**
 * Hook to manage flying icon animations
 * Returns a trigger function and the component to render
 */
export function useFlyingIcon() {
  const [flyingItems, setFlyingItems] = useState<{ id: string; x: number; y: number }[]>([])

  const triggerFly = (x: number, y: number) => {
    const id = `fly-${Date.now()}-${Math.random()}`
    setFlyingItems(prev => [...prev, { id, x, y }])
  }

  const handleComplete = (id: string) => {
    setFlyingItems(prev => prev.filter(item => item.id !== id))
  }

  const FlyingIcons = () => (
    <>
      {flyingItems.map(item => (
        <FlyingIcon
          key={item.id}
          startX={item.x}
          startY={item.y}
          onComplete={() => handleComplete(item.id)}
        />
      ))}
    </>
  )

  return { triggerFly, FlyingIcons }
}
