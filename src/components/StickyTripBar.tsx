import { motion, AnimatePresence } from "framer-motion"
import { useTrip } from "@/contexts/TripContext"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer"
import { ChevronUp, ShoppingBag, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { formatCurrency } from "@/lib/helpers" // Assuming this helper exists, or I'll use Intl directly

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

  return (
    <Drawer>
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe pointer-events-none" 
            // pb-safe handles iPhone home indicator if configured in Tailwind, usually `pb-[env(safe-area-inset-bottom)]`
          >
            {/* The actual interactive bar card */}
            <DrawerTrigger asChild>
              <button 
                type="button" // Use explicit button type to prevent form submission if wrapped
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

                <div // Wrapper to stop propagation on the inner button click
                  onClick={(e) => e.stopPropagation()} 
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <Button 
                    onClick={(e) => {
                      // Prevent default just in case, though stopPropagation above handles bubbling
                      navigate('/checkout') 
                    }}
                    size="sm"
                    className="font-bold shadow-md relative z-10" // Ensure higher z-index if needed
                  >
                    Checkout
                  </Button>
                </div>
              </button>
            </DrawerTrigger>
          </motion.div>
        )}
      </AnimatePresence>

      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle>Your Trip Itinerary</DrawerTitle>
            <p className="text-sm text-muted-foreground">
              You have {itemCount} experience{itemCount !== 1 ? 's' : ''} planned.
            </p>
          </DrawerHeader>
          
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            {trip.items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Your trip is empty.
              </div>
            ) : (
              <div className="space-y-4">
                 {/* Simple List for now - could be extracted to separate component */}
                 {trip.items.map((item, idx) => (
                    <TripItemRow key={item.experienceId + idx} item={item} />
                 ))}
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(trip.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Fee (5%)</span>
                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(trip.serviceFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Total</span>
                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(trip.total)}</span>
                </div>
            </div>
          </div>

          <DrawerFooter>
            <Button onClick={() => navigate('/checkout')} size="lg" className="w-full font-bold">
              Proceed to Checkout
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Keep Browsing</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

// Internal helper for existing items list
// In a real app, we'd fetch the full experience details using ID, or pass them in context
import { getExperienceById } from "@/lib/helpers"
import { TripItem } from "@/lib/types"

function TripItemRow({ item }: { item: TripItem }) {
    const { removeFromTrip } = useTrip()
    // This is synchronous and might cause issues if helper is heavy, but fine for MVP
    const experience = getExperienceById(item.experienceId) 
    
    if (!experience) return null

    return (
        <div className="flex items-start gap-4 p-3 bg-secondary/20 rounded-lg">
            <div className="h-16 w-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                <img src={experience.images[0]} alt={experience.title} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-1">{experience.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                    {item.guests} Guest{item.guests > 1 ? 's' : ''} • {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.totalPrice)}
                </p>
            </div>
            <button 
                onClick={() => removeFromTrip(item.experienceId)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                aria-label="Remove item"
            >
                <X size={16} />
            </button>
        </div>
    )
}
