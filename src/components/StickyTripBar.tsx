import { motion, AnimatePresence } from "framer-motion"
import { useTrip } from "@/contexts/TripContext"
import { Button } from "@/components/ui/button"
import { ChevronUp, ShoppingBag } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

export function StickyTripBar() {
  const { trip, itemCount } = useTrip()
  const navigate = useNavigate()
  const [isHighlighted, setIsHighlighted] = useState(false)

  // Pulse effect on update
  useEffect(() => {
    if (itemCount > 0) {
      setIsHighlighted(true)
      const timer = setTimeout(() => setIsHighlighted(false), 300)
      return () => clearTimeout(timer)
    }
  }, [trip.total, itemCount])

  if (itemCount === 0) return null

  const handleViewTrip = () => {
    navigate('/plan')
  }

  const handleCheckout = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate('/checkout')
  }

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe pointer-events-none" 
        >
          {/* The actual interactive bar card */}
          <button 
            type="button"
            onClick={handleViewTrip}
            className={`
              text-left w-full
              pointer-events-auto 
              mx-auto max-w-md 
              bg-background/80 backdrop-blur-md 
              border border-border shadow-2xl rounded-2xl 
              flex items-center justify-between p-4
              transition-transform duration-200
              ${isHighlighted ? 'scale-105 ring-2 ring-primary/50' : 'scale-100'}
              cursor-pointer
              hover:bg-accent/50
              focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none
            `}
            aria-label={`View trip summary: ${itemCount} items for ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(trip.total)}`}
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full text-primary relative">
                <ShoppingBag size={20} />
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  Total <ChevronUp size={12} />
                </span>
                <span className="font-bold font-mono">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(trip.total)}
                </span>
              </div>
            </div>

            <div onClick={(e) => e.stopPropagation()}>
              <Button 
                onClick={handleCheckout}
                size="sm"
                className="font-bold shadow-md"
              >
                Checkout
              </Button>
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

