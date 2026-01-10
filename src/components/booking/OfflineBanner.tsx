/**
 * OfflineBanner Component
 * Story: 26.2 - Build Offline Ticket Display
 * 
 * Banner to indicate offline mode
 */

import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface OfflineBannerProps {
  isOnline: boolean
}

export function OfflineBanner({ isOnline }: OfflineBannerProps) {
  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="sticky top-0 z-50"
        >
          <Alert className="rounded-none border-none bg-orange-500 text-white">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="font-medium">
              Offline Mode - Showing cached ticket data
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
